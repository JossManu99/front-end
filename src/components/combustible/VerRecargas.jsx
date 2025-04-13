import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx"; // Para exportar a Excel
import html2canvas from "html2canvas"; // Aseguramos que html2canvas esté importado
import jsPDF from "jspdf";
import { getRecargas } from "../../services/recargaService";
import Menu from "../../components/header/DashboardHeader";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

import styles from "./verrecarga.module.css";

const VerRecargas = () => {
  const [recargas, setRecargas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecarga, setSelectedRecarga] = useState(null);

  // Filtros
  const [filterDate, setFilterDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Colores para el gráfico
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#8dd1e1",
  ];

  // Cargar la lista de recargas
  useEffect(() => {
    const fetchRecargas = async () => {
      try {
        const response = await getRecargas();
        setRecargas(response.data || []);
        // Seleccionamos la primera recarga por defecto, si existe
        if (response.data && response.data.length > 0) {
          setSelectedRecarga(response.data[0]);
        }
      } catch (err) {
        console.error("Error fetching recargas:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecargas();
  }, []);

  // Manejadores de filtros
  const handleDateFilter = (e) => {
    setFilterDate(e.target.value);
  };
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filtrado (por fecha y buscador)
  const filteredRecargas = recargas.filter((recarga) => {
    const dateMatch = filterDate ? recarga.fecha.includes(filterDate) : true;
    const searchMatch = searchTerm
      ? Object.values(recarga)
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      : true;
    return dateMatch && searchMatch;
  });

  const handleRecargaSelect = (recarga) => {
    setSelectedRecarga(recarga);
  };

  // Armar datos del gráfico (usando la información de distribuciones)
  const prepararDatosGrafico = () => {
    if (!selectedRecarga || !selectedRecarga.distribuciones) return [];
    return selectedRecarga.distribuciones.map((dist, index) => ({
      name: dist.nombrePropietario,
      value: parseFloat(dist.cantidadrepartirlitros) || 0,
      fill: COLORS[index % COLORS.length],
    }));
  };

  // Calcular totales de costo y cantidad
  const calcularTotal = (recargasArray) => {
    return recargasArray.reduce(
      (total, recarga) => ({
        costo: total.costo + parseFloat(recarga.costo || 0),
        cantidad: total.cantidad + parseFloat(recarga.cantidad || 0),
      }),
      { costo: 0, cantidad: 0 }
    );
  };
  const totales = calcularTotal(filteredRecargas);
  const chartData = prepararDatosGrafico();

  // Formatear fecha (se suma 1 día para corregir desfase de zona horaria)
  const formatDate = (dateString) => {
    const fecha = new Date(dateString);
    fecha.setDate(fecha.getDate() + 1);
    const options = { year: "numeric", month: "long", day: "numeric" };
    return fecha.toLocaleDateString("es-ES", options);
  };

  // Determinar si mostrar la columna de "Litros Restantes" en la distribución
  const showLitrosRestantes =
    selectedRecarga &&
    selectedRecarga.distribuciones &&
    selectedRecarga.distribuciones.some(
      (dist) =>
        dist.cantidadrepartirlitrosrestantes !== undefined &&
        dist.cantidadrepartirlitrosrestantes !== null
    );

  // Función auxiliar para aplanar la información de las distribuciones
  const flattenDistribuciones = (distribuciones) => {
    if (!distribuciones || !Array.isArray(distribuciones)) return "";
    return distribuciones
      .map((dist) => {
        const historialStr =
          dist.historial && dist.historial.length > 0
            ? dist.historial
                .map((h) =>
                  `(${h.quienRecargo}, Anterior: ${h.cantidadAnterior}, Cargada: ${Math.abs(
                    h.cantidadCargada
                  )}, Restante: ${h.cantidadRestante}, Fecha: ${h.fecha}, Hora: ${h.hora}, Núm Económico: ${h.numeroEconomico}, Obs: ${h.observacion})`
                )
                .join("; ")
            : "Sin historial";
        return `Propietario: ${dist.nombrePropietario}, Litros: ${dist.cantidadrepartirlitros}, Restantes: ${dist.cantidadrepartirlitrosrestantes}, Historial: ${historialStr}`;
      })
      .join(" | ");
  };

  // Exportar a Excel: Se exporta la información principal y aplanamos la información de distribuciones
  const exportToExcel = () => {
    const wsData = filteredRecargas.map((a) => ({
      Fecha: formatDate(a.fecha),
      Proveedor: a.proveedor,
      "Cantidad (L)": parseFloat(a.cantidad).toFixed(2),
      "Costo ($)": parseFloat(a.costo).toFixed(2),
      Distribuciones: flattenDistribuciones(a.distribuciones),
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Recargas");
    XLSX.writeFile(wb, "ListaRecargas.xlsx");
  };

  // Función para generar PDF sin requerir zoom manual. Se ajusta temporalmente el estilo del contenedor.
  const handleDownloadPDF = async () => {
    try {
      const input = document.getElementById("pdfContent");
      if (!input) return;
      // Guarda los estilos originales
      const originalHeight = input.style.height;
      const originalOverflow = input.style.overflow;
      // Ajusta temporalmente para mostrar todo el contenido
      input.style.height = "auto";
      input.style.overflow = "visible";
      const canvas = await html2canvas(input, {
        scale: 2,
        scrollY: -window.scrollY,
        windowWidth: input.scrollWidth,
        windowHeight: input.scrollHeight,
        ignoreElements: (element) => element.id === "menuContainer",
      });
      // Restaura estilos originales
      input.style.height = originalHeight;
      input.style.overflow = originalOverflow;
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "pt", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      pdf.save("Recargas.pdf");
    } catch (error) {
      console.error("Error generando el PDF:", error);
    }
  };

  if (loading) {
    return (
      <div className={styles.mainContainer}>
        <p className={styles.loading}>Cargando recargas...</p>
      </div>
    );
  }

  if (recargas.length === 0) {
    return (
      <div className={styles.mainContainer}>
        <p className={styles.noData}>No hay registros de recargas disponibles.</p>
      </div>
    );
  }

  return (
    // Se asigna id="pdfContent" al contenedor que queremos capturar en el PDF.
    <div className={styles.mainContainer} id="pdfContent">
      {/* Contenedor del menú: se le asigna id para poder ignorarlo en la captura */}
      <div className={styles.menuContainer} id="menuContainer">
        <Menu />
      </div>

      <div className={styles.Container}>
        {/* Header (Título y filtro por fecha) */}
        <div className={styles.headerContainer}>
          <h2>Historial de Recargas de Combustible</h2>
          <div className={styles.filterContainer}>
            <label>Filtrar por fecha:</label>
            <input
              type="date"
              value={filterDate}
              onChange={handleDateFilter}
              className={styles.formControl}
            />
          </div>
        </div>

        {/* Toolbar: Buscador, botón para Excel y PDF */}
        <div className={styles.toolbarBuscar}>
          <input
            type="text"
            placeholder="Buscador..."
            value={searchTerm}
            onChange={handleSearch}
            className={styles.searchInput}
          />
          <button className={styles.btnExport} onClick={exportToExcel}>
            Exportar a Excel
          </button>
          <button className={styles.btnExport} onClick={handleDownloadPDF}>
            Descargar PDF
          </button>
        </div>

        {/* Sección de resumen */}
        <div className={styles.summaryContainer}>
          <div className={styles.summaryCard}>
            <h3>Resumen</h3>
            <div className={styles.summaryItem}>
              <span>Total de recargas:</span>
              <span>{filteredRecargas.length}</span>
            </div>
            <div className={styles.summaryItem}>
              <span>Costo total:</span>
              <span>${totales.costo.toFixed(2)}</span>
            </div>
            <div className={styles.summaryItem}>
              <span>Litros totales:</span>
              <span>{totales.cantidad.toFixed(2)} L</span>
            </div>
          </div>
        </div>

        {/* Lista de recargas y detalle */}
        <div className={styles.contentContainer}>
          {/* Lista de recargas */}
          <div className={styles.recargasListContainer}>
            <h3>Lista de Recargas</h3>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Proveedor</th>
                  <th>Cantidad (L)</th>
                  <th>Costo ($)</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecargas.map((recarga) => (
                  <tr
                    key={recarga._id}
                    className={
                      selectedRecarga && selectedRecarga._id === recarga._id
                        ? styles.selectedRow
                        : ""
                    }
                  >
                    <td>{formatDate(recarga.fecha)}</td>
                    <td>{recarga.proveedor}</td>
                    <td>{parseFloat(recarga.cantidad).toFixed(2)}</td>
                    <td>${parseFloat(recarga.costo).toFixed(2)}</td>
                    <td>
                      <button
                        onClick={() => handleRecargaSelect(recarga)}
                        className={styles.viewButton}
                      >
                        Ver detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Detalle de la recarga seleccionada */}
          {selectedRecarga && (
            <div className={styles.recargaDetailContainer}>
              <h3>Detalles de la Recarga</h3>
              <div className={styles.detailCard}>
                <div className={styles.detailHeader}>
                  <div>
                    <strong>Fecha:</strong> {formatDate(selectedRecarga.fecha)}
                  </div>
                  <div>
                    <strong>Proveedor:</strong> {selectedRecarga.proveedor}
                  </div>
                </div>
                <div className={styles.detailRow}>
                  <div>
                    <strong>Cantidad total:</strong>{" "}
                    {parseFloat(selectedRecarga.cantidad).toFixed(2)} L
                  </div>
                  <div>
                    <strong>Costo total:</strong>{" "}
                    ${parseFloat(selectedRecarga.costo).toFixed(2)}
                  </div>
                  <div>
                    <strong>Precio por litro:</strong>{" "}
                    {(selectedRecarga.costo / selectedRecarga.cantidad).toFixed(2)}
                  </div>
                </div>

                {/* Tabla de distribución */}
                <h4>Distribución</h4>
                <table className={styles.tableDetail}>
                  <thead>
                    <tr>
                      <th>Propietario</th>
                      <th>Litros</th>
                      {showLitrosRestantes && <th>Litros Restantes</th>}
                      <th>Porcentaje</th>
                      <th>Costo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRecarga.distribuciones.map((dist, index) => {
                      const litros = parseFloat(dist.cantidadrepartirlitros) || 0;
                      const porcentaje = (litros / selectedRecarga.cantidad) * 100;
                      const costoProporcional = (litros / selectedRecarga.cantidad) * selectedRecarga.costo;
                      const litrosRestantes = dist.cantidadrepartirlitrosrestantes !== undefined ? parseFloat(dist.cantidadrepartirlitrosrestantes) : null;
                      return (
                        <React.Fragment key={index}>
                          <tr>
                            <td>{dist.nombrePropietario}</td>
                            <td>{litros.toFixed(2)}</td>
                            {showLitrosRestantes && (
                              <td>{litrosRestantes !== null ? litrosRestantes.toFixed(2) : ""}</td>
                            )}
                            <td>{porcentaje.toFixed(2)}%</td>
                            <td>${costoProporcional.toFixed(2)}</td>
                          </tr>
                          {dist.historial && dist.historial.length > 0 && (
                            <tr>
                              <td colSpan={showLitrosRestantes ? 5 : 4} style={{ backgroundColor: "#f9f9f9" }}>
                                <div style={{ marginTop: "1rem" }}>
                                  <strong>
                                    Historial de recargas para {dist.nombrePropietario}:
                                  </strong>
                                  <table className={styles.tableDetail} style={{ marginTop: "0.5rem", width: "100%" }}>
                                    <thead>
                                      <tr>
                                        <th>Quién Recargó</th>
                                        <th>Cant. Anterior</th>
                                        <th>Cant. Cargada</th>
                                        <th>Cant. Restante</th>
                                        <th>Fecha</th>
                                        <th>Hora</th>
                                        <th>Núm. Económico</th>
                                        <th>Observación</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {dist.historial.map((h, idx) => (
                                        <tr key={idx}>
                                          <td>{h.quienRecargo}</td>
                                          <td>{h.cantidadAnterior}</td>
                                          <td>{Math.abs(h.cantidadCargada)}</td>
                                          <td>{h.cantidadRestante}</td>
                                          <td>{h.fecha}</td>
                                          <td>{h.hora}</td>
                                          <td>{h.numeroEconomico}</td>
                                          <td>{h.observacion || ""}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>

                {/* Gráfico de distribución */}
                {chartData.length > 0 && (
                  <div className={styles.chartContainer}>
                    <h4>Gráfico de Distribución</h4>
                    <div style={{ width: "100%", height: 300 }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            dataKey="value"
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `${value} litros`} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerRecargas;

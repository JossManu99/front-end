import React, { useState, useEffect } from "react";
import { getRecargas } from "../../services/recargaService";
import Menu from '../../components/header/DashboardHeader';
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
  const [filterDate, setFilterDate] = useState("");

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
        // Ajusta según la forma de tu respuesta
        // Ej: response = { success: true, found: 1, data: [ ... ] }
        setRecargas(response.data || []);

        // Seleccionamos la primera recarga por defecto, si existe
        if (response.data && response.data.length > 0) {
          setSelectedRecarga(response.data[0]);
        }
      } catch (error) {
        console.error("Error fetching recargas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecargas();
  }, []);

  // Seleccionar recarga para ver detalles
  const handleRecargaSelect = (recarga) => {
    setSelectedRecarga(recarga);
  };

  // Filtrar recargas por fecha
  const handleDateFilter = (e) => {
    setFilterDate(e.target.value);
  };

  const filteredRecargas = filterDate
    ? recargas.filter((recarga) => recarga.fecha.includes(filterDate))
    : recargas;

  // Armar datos del gráfico
  const prepararDatosGrafico = () => {
    if (!selectedRecarga || !selectedRecarga.distribuciones) return [];
    return selectedRecarga.distribuciones.map((dist, index) => ({
      name: dist.nombrePropietario,
      value: parseFloat(dist.cantidadrepartirlitros) || 0,
      fill: COLORS[index % COLORS.length],
    }));
  };

  // Calcular totales de costo y de litros en todas las recargas filtradas
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

  // Función para formatear la fecha (texto) en tabla
  const formatDate = (dateString) => {
    // Crear una fecha sin conversión de zona horaria
    const fecha = new Date(dateString);
    // Ajustar la fecha añadiendo un día para compensar
    fecha.setDate(fecha.getDate() + 1);

    const options = { year: "numeric", month: "long", day: "numeric" };
    return fecha.toLocaleDateString("es-ES", options);
  };

  // Determinar si se muestra la columna "Litros Restantes"
  const showLitrosRestantes =
    selectedRecarga &&
    selectedRecarga.distribuciones &&
    selectedRecarga.distribuciones.some(
      (dist) =>
        dist.cantidadrepartirlitrosrestantes !== undefined &&
        dist.cantidadrepartirlitrosrestantes !== null
    );

  return (
    <div className={styles.mainContainer}>
      <div>
        <Menu />
      </div>
    <div className={styles.Container}>
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

      {loading ? (
        <div className={styles.loading}>Cargando recargas...</div>
      ) : recargas.length === 0 ? (
        <div className={styles.noData}>
          No hay registros de recargas disponibles.
        </div>
      ) : (
        <div className={styles.contentContainer}>
          {/* SECCIÓN DE RESUMEN */}
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

          {/* LISTA DE RECARGAS */}
          <div className={styles.tablesContainer}>
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

            {/* DETALLES DE LA RECARGA SELECCIONADA */}
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
                      {(
                        selectedRecarga.costo / selectedRecarga.cantidad
                      ).toFixed(2)}
                    </div>
                  </div>

                  {/* TABLA DE DISTRIBUCIÓN */}
                  <h4>Distribución</h4>
                  <table className={styles.tableDetail}>
                    <thead>
                      <tr>
                        <th>Propietario</th>
                        <th>Litros</th>
                        {/* Mostrar "Litros Restantes" solo si procede */}
                        {showLitrosRestantes && <th>Litros Restantes</th>}
                        <th>Porcentaje</th>
                        <th>Costo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRecarga.distribuciones.map((dist, index) => {
                        const litros =
                          parseFloat(dist.cantidadrepartirlitros) || 0;
                        const porcentaje =
                          (litros / selectedRecarga.cantidad) * 100;
                        const costoProporcional =
                          (litros / selectedRecarga.cantidad) *
                          selectedRecarga.costo;

                        // Lectura segura de 'cantidadrepartirlitrosrestantes'
                        const litrosRestantes =
                          dist.cantidadrepartirlitrosrestantes !== undefined
                            ? parseFloat(dist.cantidadrepartirlitrosrestantes)
                            : null;

                        return (
                          <React.Fragment key={index}>
                            {/* Fila principal de la distribución */}
                            <tr>
                              <td>{dist.nombrePropietario}</td>
                              <td>{litros.toFixed(2)}</td>
                              {showLitrosRestantes && (
                                <td>
                                  {litrosRestantes !== null
                                    ? litrosRestantes.toFixed(2)
                                    : ""}
                                </td>
                              )}
                              <td>{porcentaje.toFixed(2)}%</td>
                              <td>${costoProporcional.toFixed(2)}</td>
                            </tr>

                            {/* Si existe historial, mostrarlo debajo en una fila aparte */}
                            {dist.historial && dist.historial.length > 0 && (
                              <tr>
                                <td
                                  colSpan={showLitrosRestantes ? 5 : 4}
                                  style={{ backgroundColor: "#f9f9f9" }}
                                >
                                  <div style={{ marginTop: "1rem" }}>
                                    <strong>
                                      Historial de recargas para{" "}
                                      {dist.nombrePropietario}:
                                    </strong>
                                    <table
                                      className={styles.tableDetail}
                                      style={{ marginTop: "0.5rem", width: "100%" }}
                                    >
                                      {(() => {
                                        // Determinamos si hay al menos una observación
                                        const showObservacion = dist.historial.some(
                                          (h) =>
                                            h.observacion !== undefined &&
                                            h.observacion !== null
                                        );

                                        return (
                                          <>
                                            <thead>
                                              <tr>
                                                <th>Quién Recargó</th>
                                                <th>Cant. Anterior</th>
                                                <th>Cant. Cargada</th>
                                                <th>Cant. Restante</th>
                                                <th>Fecha</th>
                                                <th>Hora</th>
                                                <th>No. Económico</th>
                                                {showObservacion && (
                                                  <th>Observación</th>
                                                )}
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {dist.historial.map((h, idx) => (
                                                <tr key={idx}>
                                                  <td>{h.quienRecargo}</td>
                                                  <td>{h.cantidadAnterior}</td>
                                                  {/* 
                                                    Aquí forzamos Cant. Cargada 
                                                    a positivo usando Math.abs 
                                                  */}
                                                  <td>{Math.abs(h.cantidadCargada)}</td>
                                                  <td>{h.cantidadRestante}</td>
                                                  <td>{h.fecha}</td>
                                                  <td>{h.hora}</td>
                                                  <td>{h.numeroEconomico}</td>
                                                  {showObservacion && (
                                                    <td>
                                                      {h.observacion
                                                        ? h.observacion
                                                        : ""}
                                                    </td>
                                                  )}
                                                </tr>
                                              ))}
                                            </tbody>
                                          </>
                                        );
                                      })()}
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

                  {/* GRÁFICO DE DISTRIBUCIÓN */}
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
                              labelLine={true}
                              label={({ name, percent }) =>
                                `${name}: ${(percent * 100).toFixed(0)}%`
                              }
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
      )}
    </div>
    </div>
  );
};

export default VerRecargas;

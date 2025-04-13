import React, { useState, useEffect } from 'react';
import { obtenertablarol, eliminarTablarol } from '../../services/tablarol';
import styles from './Tablaroles.module.css'; // Estilos propios
import das from '../header/Dashboard.module.css'; // Estilos del menú
import Menu from '../../components/header/DashboardHeader';
import ViajeFormT from '../../components/horariosdeempresa/tablaH';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver'; // Asegúrate de importar saveAs correctamente
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Tablaroles = () => {
  const [tablaroles, setTablaroles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editTablarol, setEditTablarol] = useState(null);
  
  // Estado para el buscador
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTablaroles();
  }, []);

  const fetchTablaroles = async () => {
    try {
      setLoading(true);
      const data = await obtenertablarol();
      console.log("📡 Datos recibidos en el componente:", data);
      if (Array.isArray(data) && data.length > 0) {
        // Se ordenan los datos por número de ruta y número de cambio
        const sortedData = data
          .map(tablarol => ({
            ...tablarol,
            rutas: tablarol.rutas.sort((a, b) => parseInt(a.numeroRuta) - parseInt(b.numeroRuta))
          }))
          .sort((a, b) => parseInt(a.numeroCambio) - parseInt(b.numeroCambio));
        setTablaroles(sortedData);
      } else {
        setError("⚠️ No hay datos disponibles.");
      }
    } catch (err) {
      console.error("❌ Error en el componente:", err);
      setError('❌ No se pudieron obtener los tablaroles');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este registro?')) {
      try {
        await eliminarTablarol(id);
        setTablaroles(prev => prev.filter(item => item._id !== id));
        alert('✅ Registro eliminado correctamente');
      } catch (error) {
        console.error("❌ Error al eliminar:", error);
        alert('❌ Error al eliminar el registro');
      }
    }
  };

  const handleEdit = (tablarol) => {
    setEditTablarol(tablarol);
  };

  // Filtrado básico: busca en numeroCambio y en la combinación de datos de cada ruta
  const filteredTablaroles = tablaroles.filter(tablarol => {
    const cambioStr = tablarol.numeroCambio?.toString().toLowerCase() || '';
    const rutasStr = tablarol.rutas
      .map(r => ((r.numeroRuta || '') + (r.nombreCliente || '')).toLowerCase())
      .join(' ');
    const combinedStr = cambioStr + ' ' + rutasStr;
    return combinedStr.includes(searchQuery.toLowerCase());
  });

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Función para exportar a Excel que incluye todos los campos
  const handleExportToExcel = () => {
    const wsData = [];
    // Cabecera del Excel
    wsData.push([
      "Numero Cambio",
      "Dia Inicio",
      "Mes Inicio",
      "Anio Inicio",
      "Elaborado Por",
      "Numero Ruta",
      "Nombre Cliente",
      "Costo",
      "Sale De",
      "Llega A",
      "Turno",
      "Horario Entrada",
      "Horario Salida",
      "Horario inicio Jordana Salida Origen",
      "Horario inicio jornada llegada a Destino",
      "Horario salida jornada salida de Origen",
      "Horario salida jornada llegada a Destino"
    ]);

    // Se recorren los tablaroles, sus rutas y turnos para agregar una fila por cada turno
    filteredTablaroles.forEach(tablarol => {
      const numeroCambio = tablarol.numeroCambio || 'N/A';
      const diaInicio = tablarol.diaInicio || 'N/A';
      const mesInicio = tablarol.mesInicio || 'N/A';
      const anioInicio = tablarol.anioInicio || 'N/A';
      const elaboradoPor = tablarol.elaboradoPor || 'N/A';
      tablarol.rutas.forEach(ruta => {
        const numeroRuta = ruta.numeroRuta || 'N/A';
        const nombreCliente = ruta.nombreCliente || 'N/A';
        const costo = ruta.costo || 'N/A';
        const saleDe = ruta.saleDe || 'N/A';
        const llegaA = ruta.llegaA || 'N/A';

        if (ruta.turnos && ruta.turnos.length > 0) {
          ruta.turnos.forEach(turno => {
            wsData.push([
              numeroCambio,
              diaInicio,
              mesInicio,
              anioInicio,
              elaboradoPor,
              numeroRuta,
              nombreCliente,
              costo,
              saleDe,
              llegaA,
              turno.turno || 'N/A',
              turno.horarioEntrada || 'N/A',
              turno.horarioSalida || 'N/A',
              turno.horarioinicio_jordana_salidaOrigen || 'N/A',
              turno.horarioinicio_jornada_llegada_a_Destino || 'N/A',
              turno.horariosalida_jornada_salida_de_Origen || 'N/A',
              turno.horariosalida_jornada_llegada_a_Destino || 'N/A'
            ]);
          });
        } else {
          wsData.push([
            numeroCambio,
            diaInicio,
            mesInicio,
            anioInicio,
            elaboradoPor,
            numeroRuta,
            nombreCliente,
            costo,
            saleDe,
            llegaA,
            'N/A',
            'N/A',
            'N/A',
            'N/A',
            'N/A',
            'N/A',
            'N/A'
          ]);
        }
      });
    });

    const worksheet = XLSX.utils.aoa_to_sheet(wsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tablaroles");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob(
      [excelBuffer],
      { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
    );
    saveAs(dataBlob, "tablaroles.xlsx");
  };

  // Función para exportar a PDF usando jsPDF y jspdf-autotable
  const handleExportToPDF = () => {
    try {
      // Utilizamos orientación landscape para acomodar mejor las columnas
      const pdf = new jsPDF('l', 'pt', 'a4');
      
      // Definición de columnas del PDF (cabecera)
      const columns = [
        { header: "Numero Cambio", dataKey: "numeroCambio" },
        { header: "Dia Inicio", dataKey: "diaInicio" },
        { header: "Mes Inicio", dataKey: "mesInicio" },
        { header: "Anio Inicio", dataKey: "anioInicio" },
        { header: "Elaborado Por", dataKey: "elaboradoPor" },
        { header: "Numero Ruta", dataKey: "numeroRuta" },
        { header: "Nombre Cliente", dataKey: "nombreCliente" },
        { header: "Costo", dataKey: "costo" },
        { header: "Sale De", dataKey: "saleDe" },
        { header: "Llega A", dataKey: "llegaA" },
        { header: "Turno", dataKey: "turno" },
        { header: "Horario Entrada", dataKey: "horarioEntrada" },
        { header: "Horario Salida", dataKey: "horarioSalida" },
        { header: "Horario inicio Jordana Salida Origen", dataKey: "horarioinicio_jordana_salidaOrigen" },
        { header: "Horario inicio jornada llegada a Destino", dataKey: "horarioinicio_jornada_llegada_a_Destino" },
        { header: "Horario salida jornada salida de Origen", dataKey: "horariosalida_jornada_salida_de_Origen" },
        { header: "Horario salida jornada llegada a Destino", dataKey: "horariosalida_jornada_llegada_a_Destino" }
      ];

      // Se arma un arreglo de objetos para cada fila
      const dataForPdf = [];
      filteredTablaroles.forEach(tablarol => {
        const numeroCambio = tablarol.numeroCambio || 'N/A';
        const diaInicio = tablarol.diaInicio || 'N/A';
        const mesInicio = tablarol.mesInicio || 'N/A';
        const anioInicio = tablarol.anioInicio || 'N/A';
        const elaboradoPor = tablarol.elaboradoPor || 'N/A';
        tablarol.rutas.forEach(ruta => {
          const numeroRuta = ruta.numeroRuta || 'N/A';
          const nombreCliente = ruta.nombreCliente || 'N/A';
          const costo = ruta.costo || 'N/A';
          const saleDe = ruta.saleDe || 'N/A';
          const llegaA = ruta.llegaA || 'N/A';
          
          if (ruta.turnos && ruta.turnos.length > 0) {
            ruta.turnos.forEach(turno => {
              dataForPdf.push({
                numeroCambio,
                diaInicio,
                mesInicio,
                anioInicio,
                elaboradoPor,
                numeroRuta,
                nombreCliente,
                costo,
                saleDe,
                llegaA,
                turno: turno.turno || 'N/A',
                horarioEntrada: turno.horarioEntrada || 'N/A',
                horarioSalida: turno.horarioSalida || 'N/A',
                horarioinicio_jordana_salidaOrigen: turno.horarioinicio_jordana_salidaOrigen || 'N/A',
                horarioinicio_jornada_llegada_a_Destino: turno.horarioinicio_jornada_llegada_a_Destino || 'N/A',
                horariosalida_jornada_salida_de_Origen: turno.horariosalida_jornada_salida_de_Origen || 'N/A',
                horariosalida_jornada_llegada_a_Destino: turno.horariosalida_jornada_llegada_a_Destino || 'N/A'
              });
            });
          } else {
            dataForPdf.push({
              numeroCambio,
              diaInicio,
              mesInicio,
              anioInicio,
              elaboradoPor,
              numeroRuta,
              nombreCliente,
              costo,
              saleDe,
              llegaA,
              turno: 'N/A',
              horarioEntrada: 'N/A',
              horarioSalida: 'N/A',
              horarioinicio_jordana_salidaOrigen: 'N/A',
              horarioinicio_jornada_llegada_a_Destino: 'N/A',
              horariosalida_jornada_salida_de_Origen: 'N/A',
              horariosalida_jornada_llegada_a_Destino: 'N/A'
            });
          }
        });
      });

      // Configuramos autoTable para que divida la tabla en páginas automáticamente
      autoTable(pdf, {
        columns: columns,
        body: dataForPdf,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [22, 160, 133] },
        margin: { top: 40 }
      });

      pdf.save('tablaroles.pdf');
    } catch (error) {
      console.error('Error generando el PDF:', error);
    }
  };

  // Modo edición: se muestra el formulario de edición
  if (editTablarol) {
    return (
      <div className={styles.mainContainer}>
        <ViajeFormT
          tablarolEdit={editTablarol}
          setEditTablarol={() => {
            setEditTablarol(null);
            fetchTablaroles();
          }}
        />
      </div>
    );
  }

  if (loading) return <p className={styles.loadingText}>⏳ Cargando datos...</p>;
  if (error) return <p className={styles.errorText}>{error}</p>;
  if (tablaroles.length === 0) return <p className={styles.emptyText}>⚠️ No hay datos disponibles.</p>;

  return (
    <div className={styles.mainContainer}>
      <div className={das.menuContainer}>
        <Menu />
      </div>
      <div className={styles.container}>
        <div className={styles.searchContainer}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <button
            className={`${styles.actionButton} ${styles.excelButton}`}
            onClick={handleExportToExcel}
          >
            Exportar a Excel
          </button>
          <button
            className={`${styles.actionButton} ${styles.pdfButton}`}
            onClick={handleExportToPDF}
          >
            Exportar a PDF
          </button>
        </div>

        <h1 className={styles.heading}>📋 Lista de Tablaroles</h1>

        {filteredTablaroles.map(tablarol => (
          <div key={tablarol._id} className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <h2 className={styles.tableTitle}>
                🆔 Cambio: {tablarol.numeroCambio || "N/A"}
              </h2>
            </div>
            {tablarol.rutas.map((ruta, index) => (
              <div key={`${tablarol._id}-${index}`} className={styles.routeContainer}>
                <h3 className={styles.routeTitle}>
                  Ruta: {ruta.numeroRuta || "N/A"} - Cliente: {ruta.nombreCliente || "N/A"}
                </h3>
                <div className={styles.tableContainer}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Turno</th>
                        <th>Horario Entrada</th>
                        <th>Horario Salida</th>
                        <th>Ruta Salida</th>
                        <th>Ruta Destino</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ruta.turnos && ruta.turnos.length > 0 ? (
                        ruta.turnos.map((turno, i) => (
                          <tr key={`${ruta.numeroRuta}-${i}`}>
                            <td>{turno.turno || "N/A"}</td>
                            <td>{turno.horarioEntrada || "N/A"}</td>
                            <td>{turno.horarioSalida || "N/A"}</td>
                            <td>{turno.horarioinicio_jordana_salidaOrigen || "N/A"}</td>
                            <td>{turno.horarioinicio_jornada_llegada_a_Destino || "N/A"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className={styles.emptyCell}>
                            ⚠️ No hay turnos disponibles.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
            <div className={styles.buttonGroup}>
              <button onClick={() => handleEdit(tablarol)} className={styles.editButton}>
                ✏️ Editar
              </button>
              <button onClick={() => handleDelete(tablarol._id)} className={styles.deleteButton}>
                🗑️ Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tablaroles;

// src/components/viaje/TBF/TablaRolTbfComponent.jsx
import React, { useState, useEffect } from 'react';
import {
  tbfObtenerTablarolesTbf,
  tbfEliminarTablarolTbf
} from '../../services/tbfService';
import TablarolForm from '../creacionderoles/TablarolForm'; 
import styles from './TablaRolTbfComponent.module.css';
import Menu from '../../components/header/DashboardHeader';

import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const TablaRolTbfComponent = () => {
  const [tablasRol, setTablasRol] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tablaSeleccionada, setTablaSeleccionada] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  // Modo de visualización: "lista", "detalle" o "actualizar"
  const [modo, setModo] = useState('lista');

  useEffect(() => {
    const cargarTablasRol = async () => {
      try {
        setLoading(true);
        const data = await tbfObtenerTablarolesTbf();
        // Ordenar por número de cambio (convertido a número)
        const tablasOrdenadas = data.sort((a, b) => Number(a.numeroCambio) - Number(b.numeroCambio));
        setTablasRol(tablasOrdenadas);
      } catch (err) {
        setError('Error al cargar las tablas de rol: ' + (err.message || 'Error desconocido'));
      } finally {
        setLoading(false);
      }
    };
    cargarTablasRol();
  }, []);

  const verDetalleTabla = (tabla) => {
    setTablaSeleccionada(tabla);
    setModo('detalle');
  };

  const volverALista = () => {
    setTablaSeleccionada(null);
    setModo('lista');
  };

  const eliminarTabla = async (tabla) => {
    if (!window.confirm(`¿Estás seguro de eliminar la Tabla de Rol #${tabla.numeroCambio}?`)) return;
    try {
      await tbfEliminarTablarolTbf(tabla._id);
      setTablasRol((prev) => prev.filter((t) => t._id !== tabla._id));
      if (tablaSeleccionada && tablaSeleccionada._id === tabla._id) {
        volverALista();
      }
    } catch (err) {
      alert('Error al eliminar la tabla: ' + (err.message || 'Error desconocido'));
    }
  };

  const actualizarTabla = (tabla) => {
    setTablaSeleccionada(tabla);
    setModo('actualizar');
  };

  const handleBusquedaChange = (e) => {
    setBusqueda(e.target.value);
  };

  // Filtrado de tablas según la búsqueda
  const tablasFiltradas = tablasRol.filter(
    (tabla) =>
      tabla.numeroCambio.toString().includes(busqueda) ||
      (tabla.elaboradoPor && tabla.elaboradoPor.toLowerCase().includes(busqueda.toLowerCase()))
  );

  // ------------------------------------------------
  //       FUNCIONES PARA EXPORTAR 1 SOLA TABLA
  // ------------------------------------------------
  const exportarExcelTabla = (tabla) => {
    const wsData = [];
    wsData.push([
      "N° Cambio",
      "Día Inicio",
      "Mes Inicio",
      "Año Inicio",
      "Elaborado Por",
      "N° Ruta",
      "Nombre Cliente",
      "Costo",
      "Sale De",
      "Llega A",
      "Turno",
      "Horario Entrada",
      "Horario Salida",
      "Entrada: Autobús",
      "Entrada: Operador",
      "Salida: Autobús",
      "Salida: Operador"
    ]);

    const numCambio = tabla.numeroCambio || 'N/A';
    const diaInicio = tabla.diaInicio || 'N/A';
    const mesInicio = tabla.mesInicio || 'N/A';
    const anioInicio = tabla.anioInicio || 'N/A';
    const elaboradoPor = tabla.elaboradoPor || 'N/A';

    (tabla.rutas || []).forEach((ruta) => {
      const numRuta = ruta.numeroRuta || 'N/A';
      const nombreCliente = ruta.nombreCliente || 'N/A';
      const costo = ruta.costo || 'N/A';
      const saleDe = ruta.saleDe || 'N/A';
      const llegaA = ruta.llegaA || 'N/A';

      if (ruta.turnos && ruta.turnos.length > 0) {
        ruta.turnos.forEach((turno) => {
          wsData.push([
            numCambio,
            diaInicio,
            mesInicio,
            anioInicio,
            elaboradoPor,
            numRuta,
            nombreCliente,
            costo,
            saleDe,
            llegaA,
            turno.turno || 'N/A',
            turno.horarioEntrada || 'N/A',
            turno.horarioSalida || 'N/A',
            turno.entrada?.numeroAutobus || 'N/A',
            turno.entrada?.operador || 'N/A',
            turno.salida?.numeroAutobus || 'N/A',
            turno.salida?.operador || 'N/A'
          ]);
        });
      } else {
        // Si no hay turnos, al menos se agrega una fila
        wsData.push([
          numCambio,
          diaInicio,
          mesInicio,
          anioInicio,
          elaboradoPor,
          numRuta,
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

    const worksheet = XLSX.utils.aoa_to_sheet(wsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "TablaRol_" + numCambio);

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
    saveAs(dataBlob, `TablaDeRol_${numCambio}.xlsx`);
  };

  const exportarPdfTabla = (tabla) => {
    try {
      const pdf = new jsPDF('l', 'pt', 'a4');
      const columns = [
        { header: "N° Cambio", dataKey: "numeroCambio" },
        { header: "Día Inicio", dataKey: "diaInicio" },
        { header: "Mes Inicio", dataKey: "mesInicio" },
        { header: "Año Inicio", dataKey: "anioInicio" },
        { header: "Elaborado Por", dataKey: "elaboradoPor" },
        { header: "N° Ruta", dataKey: "numeroRuta" },
        { header: "Cliente", dataKey: "nombreCliente" },
        { header: "Costo", dataKey: "costo" },
        { header: "Sale De", dataKey: "saleDe" },
        { header: "Llega A", dataKey: "llegaA" },
        { header: "Turno", dataKey: "turno" },
        { header: "Horario Entrada", dataKey: "horarioEntrada" },
        { header: "Horario Salida", dataKey: "horarioSalida" },
        { header: "Entr. Autobús", dataKey: "entrada_autobus" },
        { header: "Entr. Operador", dataKey: "entrada_operador" },
        { header: "Sal. Autobús", dataKey: "salida_autobus" },
        { header: "Sal. Operador", dataKey: "salida_operador" }
      ];

      const dataRows = [];
      const numCambio = tabla.numeroCambio || 'N/A';
      const diaInicio = tabla.diaInicio || 'N/A';
      const mesInicio = tabla.mesInicio || 'N/A';
      const anioInicio = tabla.anioInicio || 'N/A';
      const elaboradoPor = tabla.elaboradoPor || 'N/A';

      (tabla.rutas || []).forEach((ruta) => {
        const numRuta = ruta.numeroRuta || 'N/A';
        const nombreCliente = ruta.nombreCliente || 'N/A';
        const costo = ruta.costo || 'N/A';
        const saleDe = ruta.saleDe || 'N/A';
        const llegaA = ruta.llegaA || 'N/A';
        if (ruta.turnos && ruta.turnos.length > 0) {
          ruta.turnos.forEach((turno) => {
            dataRows.push({
              numeroCambio: numCambio,
              diaInicio: diaInicio,
              mesInicio: mesInicio,
              anioInicio: anioInicio,
              elaboradoPor: elaboradoPor,
              numeroRuta: numRuta,
              nombreCliente: nombreCliente,
              costo: costo,
              saleDe: saleDe,
              llegaA: llegaA,
              turno: turno.turno || 'N/A',
              horarioEntrada: turno.horarioEntrada || 'N/A',
              horarioSalida: turno.horarioSalida || 'N/A',
              entrada_autobus: turno.entrada?.numeroAutobus || 'N/A',
              entrada_operador: turno.entrada?.operador || 'N/A',
              salida_autobus: turno.salida?.numeroAutobus || 'N/A',
              salida_operador: turno.salida?.operador || 'N/A'
            });
          });
        } else {
          dataRows.push({
            numeroCambio: numCambio,
            diaInicio: diaInicio,
            mesInicio: mesInicio,
            anioInicio: anioInicio,
            elaboradoPor: elaboradoPor,
            numeroRuta: numRuta,
            nombreCliente: nombreCliente,
            costo: costo,
            saleDe: saleDe,
            llegaA: llegaA,
            turno: 'N/A',
            horarioEntrada: 'N/A',
            horarioSalida: 'N/A',
            entrada_autobus: 'N/A',
            entrada_operador: 'N/A',
            salida_autobus: 'N/A',
            salida_operador: 'N/A'
          });
        }
      });

      autoTable(pdf, {
        startY: 40,
        head: [columns.map(col => col.header)],
        body: dataRows.map(row => columns.map(col => row[col.dataKey])),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [22, 160, 133] },
        margin: { left: 20, right: 20 },
        didDrawPage: (dataArg) => {
          pdf.setFontSize(12);
          pdf.text(`Tabla de Rol #${numCambio}`, dataArg.settings.margin.left, 30);
        }
      });

      pdf.save(`TablaDeRol_${numCambio}.pdf`);
    } catch (error) {
      console.error('Error generando el PDF:', error);
    }
  };

  // ------------------------------------------------
  // FUNCIONES PARA EXPORTAR TODAS LAS TABLAS FILTRADAS
  // ------------------------------------------------
  const exportarExcelTodas = () => {
    // Encabezados para la primera fila
    const wsData = [[
      "N° Cambio",
      "Día Inicio",
      "Mes Inicio",
      "Año Inicio",
      "Elaborado Por",
      "N° Ruta",
      "Nombre Cliente",
      "Costo",
      "Sale De",
      "Llega A",
      "Turno",
      "Horario Entrada",
      "Horario Salida",
      "Entrada: Autobús",
      "Entrada: Operador",
      "Salida: Autobús",
      "Salida: Operador"
    ]];

    // Se recorren todas las tablas FILTRADAS
    tablasFiltradas.forEach((tabla) => {
      const numCambio = tabla.numeroCambio || 'N/A';
      const diaInicio = tabla.diaInicio || 'N/A';
      const mesInicio = tabla.mesInicio || 'N/A';
      const anioInicio = tabla.anioInicio || 'N/A';
      const elaboradoPor = tabla.elaboradoPor || 'N/A';

      (tabla.rutas || []).forEach((ruta) => {
        const numRuta = ruta.numeroRuta || 'N/A';
        const nombreCliente = ruta.nombreCliente || 'N/A';
        const costo = ruta.costo || 'N/A';
        const saleDe = ruta.saleDe || 'N/A';
        const llegaA = ruta.llegaA || 'N/A';

        if (ruta.turnos && ruta.turnos.length > 0) {
          ruta.turnos.forEach((turno) => {
            wsData.push([
              numCambio,
              diaInicio,
              mesInicio,
              anioInicio,
              elaboradoPor,
              numRuta,
              nombreCliente,
              costo,
              saleDe,
              llegaA,
              turno.turno || 'N/A',
              turno.horarioEntrada || 'N/A',
              turno.horarioSalida || 'N/A',
              turno.entrada?.numeroAutobus || 'N/A',
              turno.entrada?.operador || 'N/A',
              turno.salida?.numeroAutobus || 'N/A',
              turno.salida?.operador || 'N/A'
            ]);
          });
        } else {
          // Si no hay turnos, al menos se agrega una fila
          wsData.push([
            numCambio,
            diaInicio,
            mesInicio,
            anioInicio,
            elaboradoPor,
            numRuta,
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

    // Generar y descargar el Excel
    const worksheet = XLSX.utils.aoa_to_sheet(wsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "TablaRoles_TBF");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
    saveAs(dataBlob, "TablasRol_TBF.xlsx");
  };

  const exportarPdfTodas = () => {
    try {
      const pdf = new jsPDF('l', 'pt', 'a4');
      const columns = [
        { header: "N° Cambio", dataKey: "numeroCambio" },
        { header: "Día Inicio", dataKey: "diaInicio" },
        { header: "Mes Inicio", dataKey: "mesInicio" },
        { header: "Año Inicio", dataKey: "anioInicio" },
        { header: "Elaborado Por", dataKey: "elaboradoPor" },
        { header: "N° Ruta", dataKey: "numeroRuta" },
        { header: "Cliente", dataKey: "nombreCliente" },
        { header: "Costo", dataKey: "costo" },
        { header: "Sale De", dataKey: "saleDe" },
        { header: "Llega A", dataKey: "llegaA" },
        { header: "Turno", dataKey: "turno" },
        { header: "Horario Entrada", dataKey: "horarioEntrada" },
        { header: "Horario Salida", dataKey: "horarioSalida" },
        { header: "Entr. Autobús", dataKey: "entrada_autobus" },
        { header: "Entr. Operador", dataKey: "entrada_operador" },
        { header: "Sal. Autobús", dataKey: "salida_autobus" },
        { header: "Sal. Operador", dataKey: "salida_operador" }
      ];

      const dataRows = [];
      // Recorremos todas las tablas filtradas
      tablasFiltradas.forEach((tabla) => {
        const numCambio = tabla.numeroCambio || 'N/A';
        const diaInicio = tabla.diaInicio || 'N/A';
        const mesInicio = tabla.mesInicio || 'N/A';
        const anioInicio = tabla.anioInicio || 'N/A';
        const elaboradoPor = tabla.elaboradoPor || 'N/A';

        (tabla.rutas || []).forEach((ruta) => {
          const numRuta = ruta.numeroRuta || 'N/A';
          const nombreCliente = ruta.nombreCliente || 'N/A';
          const costo = ruta.costo || 'N/A';
          const saleDe = ruta.saleDe || 'N/A';
          const llegaA = ruta.llegaA || 'N/A';
          if (ruta.turnos && ruta.turnos.length > 0) {
            ruta.turnos.forEach((turno) => {
              dataRows.push({
                numeroCambio: numCambio,
                diaInicio: diaInicio,
                mesInicio: mesInicio,
                anioInicio: anioInicio,
                elaboradoPor: elaboradoPor,
                numeroRuta: numRuta,
                nombreCliente: nombreCliente,
                costo: costo,
                saleDe: saleDe,
                llegaA: llegaA,
                turno: turno.turno || 'N/A',
                horarioEntrada: turno.horarioEntrada || 'N/A',
                horarioSalida: turno.horarioSalida || 'N/A',
                entrada_autobus: turno.entrada?.numeroAutobus || 'N/A',
                entrada_operador: turno.entrada?.operador || 'N/A',
                salida_autobus: turno.salida?.numeroAutobus || 'N/A',
                salida_operador: turno.salida?.operador || 'N/A'
              });
            });
          } else {
            dataRows.push({
              numeroCambio: numCambio,
              diaInicio: diaInicio,
              mesInicio: mesInicio,
              anioInicio: anioInicio,
              elaboradoPor: elaboradoPor,
              numeroRuta: numRuta,
              nombreCliente: nombreCliente,
              costo: costo,
              saleDe: saleDe,
              llegaA: llegaA,
              turno: 'N/A',
              horarioEntrada: 'N/A',
              horarioSalida: 'N/A',
              entrada_autobus: 'N/A',
              entrada_operador: 'N/A',
              salida_autobus: 'N/A',
              salida_operador: 'N/A'
            });
          }
        });
      });

      autoTable(pdf, {
        startY: 40,
        head: [columns.map(col => col.header)],
        body: dataRows.map(row => columns.map(col => row[col.dataKey])),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [52, 152, 219] }, // Color de encabezado
        margin: { left: 20, right: 20 },
        didDrawPage: (dataArg) => {
          pdf.setFontSize(12);
          pdf.text(`Tablas de Rol (TBF) - Exportación Global`, dataArg.settings.margin.left, 30);
        }
      });

      pdf.save("TablasRol_TBF.pdf");
    } catch (error) {
      console.error('Error generando el PDF:', error);
    }
  };

  // --------------------------------------
  // Vista detallada de UNA tabla
  // --------------------------------------
  const DetalleTablaRol = ({ tabla }) => {
    return (
      <div className={styles.detalleTablaRol}>
        <button className={styles.btnVolver} onClick={volverALista}>
          ← Volver a la lista
        </button>
        <div className={styles.tablaHeader}>
          <h2>Tabla de Rol #{tabla.numeroCambio}</h2>
          <p className={styles.tablaInfo}>
            <strong>Elaborado por:</strong> {tabla.elaboradoPor}
          </p>
          <p className={styles.tablaInfo}>
            <strong>Fecha de inicio:</strong> {tabla.diaInicio} de {tabla.mesInicio} de {tabla.anioInicio}
          </p>
        </div>

        {/* Botones de exportación para UNA tabla */}
        <div className={styles.exportButtons}>
          <button
            className={`${styles.btnAction} ${styles.btnExcel}`}
            onClick={() => exportarExcelTabla(tabla)}
          >
            Exportar a Excel
          </button>
          <button
            className={`${styles.btnAction} ${styles.btnPDF}`}
            onClick={() => exportarPdfTabla(tabla)}
          >
            Exportar a PDF
          </button>
        </div>

        <div className={styles.rutasContainer}>
          {tabla.rutas?.map((ruta, idx) => (
            <div key={idx} className={styles.rutaCard}>
              <DetalleRuta ruta={ruta} />
            </div>
          ))}
        </div>

        <div className={styles.buttonsContainer}>
          <button className={styles.btnActualizar} onClick={() => actualizarTabla(tabla)}>
            Actualizar
          </button>
          <button className={styles.btnEliminar} onClick={() => eliminarTabla(tabla)}>
            Eliminar
          </button>
        </div>
      </div>
    );
  };

  // Componente interno para mostrar detalles de una ruta
  const DetalleRuta = ({ ruta }) => {
    // Se arma un arreglo de filas para la tabla de turnos
    const filasTabla = [];
    ruta.turnos?.forEach((turno) => {
      // Fila de entrada
      filasTabla.push({
        turno: turno.turno,
        horario: turno.horarioEntrada,
        rutaSalida: turno.horarioinicio_jordana_salidaOrigen || 'N/A',
        rutaDestino: turno.horarioinicio_jornada_llegada_a_Destino || 'N/A',
        bus: turno.entrada?.numeroAutobus || 'N/A',
        operador: turno.entrada?.operador || 'N/A'
      });
      // Fila de salida
      filasTabla.push({
        turno: turno.turno,
        horario: turno.horarioSalida,
        rutaSalida: turno.horariosalida_jornada_salida_de_Origen || 'N/A',
        rutaDestino: turno.horariosalida_jornada_llegada_a_Destino || 'N/A',
        bus: turno.salida?.numeroAutobus || 'N/A',
        operador: turno.salida?.operador || 'N/A'
      });
    });

    return (
      <div className={styles.rutaContainer}>
        <h4 className={styles.rutaTitle}>
          Ruta {ruta.numeroRuta} - Cliente: {ruta.nombreCliente}
        </h4>
        <p className={styles.rutaSubinfo}>
          <strong>Fecha:</strong> {new Date(ruta.fecha).toLocaleDateString()}
        </p>
        <p className={styles.rutaSubinfo}>
          <strong>Inicio:</strong> {ruta.diaInicio} de {ruta.mesInicio} de {ruta.anioInicio}
        </p>
        <table className={styles.turnosTable}>
          <thead>
            <tr>
              <th>Turno</th>
              <th>Horario</th>
              <th>Salida</th>
              <th>Destino</th>
              <th>Bus</th>
              <th>Operador</th>
            </tr>
          </thead>
          <tbody>
            {filasTabla.map((fila, idx) => (
              <tr key={idx}>
                <td>{fila.turno}</td>
                <td>{fila.horario}</td>
                <td>{fila.rutaSalida}</td>
                <td>{fila.rutaDestino}</td>
                <td>{fila.bus}</td>
                <td>{fila.operador}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Vista de lista de todas las tablas
  const ListaTablasRol = () => {
    return (
      <div className={styles.listaContainer}>
        <h2 className={styles.listTitle}>Tablas de Rol TBF</h2>

        {/* Contenedor de búsqueda */}
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Buscar por Nº cambio o Elaborado por..."
            value={busqueda}
            onChange={handleBusquedaChange}
            className={styles.searchInput}
          />
        </div>

        {/* Botones para exportar TODAS las tablas filtradas */}
        <div className={styles.exportContainerGlobal}>
          <button onClick={exportarExcelTodas} className={styles.btnGlobalExport}>
            Exportar (Excel)
          </button>
          <button onClick={exportarPdfTodas} className={styles.btnGlobalExport}>
            Exportar (PDF) 
          </button>
        </div>

        {/* Contenido principal: Lista de tarjetas */}
        {tablasFiltradas.length === 0 ? (
          <p className={styles.noResults}>No hay tablas de rol disponibles.</p>
        ) : (
          <div className={styles.tablaGrid}>
            {tablasFiltradas.map((tabla) => (
              <div key={tabla._id} className={styles.tablaCard}>
                <h3>Tabla de Rol #{tabla.numeroCambio}</h3>
                <p>
                  <strong>Inicio:</strong> {tabla.diaInicio} de {tabla.mesInicio} de {tabla.anioInicio}
                </p>
                <p>
                  <strong>Elaborado por:</strong> {tabla.elaboradoPor}
                </p>
                <p>
                  <strong>Rutas:</strong> {tabla.rutas?.length || 0}
                </p>
                <button className={styles.btnVerDetalle} onClick={() => verDetalleTabla(tabla)}>
                  Ver detalles
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <div className={styles.loading}>Cargando tablas de rol...</div>;
  }
  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.mainContainer}>
      <Menu />
      <div className={styles.container}>
        {modo === 'lista' && <ListaTablasRol />}
        {modo === 'detalle' && tablaSeleccionada && <DetalleTablaRol tabla={tablaSeleccionada} />}
        {modo === 'actualizar' && tablaSeleccionada && (
          <TablarolForm
            initialData={tablaSeleccionada}
            onCancel={volverALista}
            onUpdateComplete={(tablaActualizada) => {
              setTablasRol((prev) =>
                prev.map((t) => (t._id === tablaActualizada._id ? tablaActualizada : t))
              );
              volverALista();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TablaRolTbfComponent;

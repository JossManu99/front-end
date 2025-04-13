import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import styles from './Utilidades.module.css';

import { getAutobuses } from '../../services/AutobusesService';
import { getMantenimientos } from '../../services/manttoService';
import { tbfObtenerTablarolesTbf } from '../../services/tbfService';
import Menu from '../../components/header/DashboardHeader';

// === MODAL: Importamos el componente de mantenimiento ===
import MaintenanceModal from '../mantenimiento/Modalmantenimiento'; // Ajusta la ruta si es necesario

const Utilidades = () => {
  // ==========================
  //  ESTADOS PRINCIPALES
  // ==========================
  const [numeroEconomico, setNumeroEconomico] = useState('');
  const [autobuses, setAutobuses] = useState([]);
  const [mantenimientosActuales, setMantenimientosActuales] = useState([]);
  const [tablarolesTbf, setTablarolesTbf] = useState([]);

  // Acumuladores de entradas/salidas (opcionales)
  const [registrosEntradas, setRegistrosEntradas] = useState({});
  const [registrosSalidas, setRegistrosSalidas] = useState({});

  // Fechas (rango) ingresadas por el usuario
  const [fechas, setFechas] = useState([{ inicio: '', hasta: '' }]);

  // Rutas filtradas (por fecha + bus)
  const [rutasFiltradas, setRutasFiltradas] = useState([]);

  // Estados de carga y error
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // ==========================
  // MODAL: Mantenimiento
  // ==========================
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [selectedMaintenances, setSelectedMaintenances] = useState([]);

  const openMaintenanceModal = (data) => {
    setSelectedMaintenances(data);
    setIsMaintenanceModalOpen(true);
  };

  const closeMaintenanceModal = () => {
    setSelectedMaintenances([]);
    setIsMaintenanceModalOpen(false);
  };

  // ==========================
  // 1) Cargar lista de autobuses
  // ==========================
  useEffect(() => {
    const fetchAutobuses = async () => {
      setCargando(true);
      try {
        const data = await getAutobuses();
        setAutobuses(data);
        setError(null);
      } catch (error) {
        console.error('Error al obtener los autobuses:', error);
        setError('No se pudieron cargar los autobuses');
      } finally {
        setCargando(false);
      }
    };
    fetchAutobuses();
  }, []);

  // ==========================
  // 2) Cargar roles TBF y procesar entradas/salidas (OPCIONAL)
  // ==========================
  useEffect(() => {
    const fetchTablarolesTbf = async () => {
      try {
        const data = await tbfObtenerTablarolesTbf();
        setTablarolesTbf(data);
        procesarRegistros(data);
      } catch (error) {
        console.error('Error al obtener los roles TBF:', error);
        setError('No se pudieron cargar los roles TBF');
      }
    };
    fetchTablarolesTbf();
  }, []);

  // Procesar la estructura para recuento (entradas/salidas) - OPCIONAL
  const procesarRegistros = (data) => {
    const entradasPorOperador = {};
    const entradasPorAutobus = {};
    const salidasPorOperador = {};
    const salidasPorAutobus = {};

    if (Array.isArray(data)) {
      data.forEach((documento) => {
        if (Array.isArray(documento.rutas)) {
          documento.rutas.forEach((ruta) => {
            if (Array.isArray(ruta.turnos)) {
              ruta.turnos.forEach((turno) => {
                const { entrada, salida } = turno;
                // Entradas
                if (entrada && entrada.operador && entrada.numeroAutobus) {
                  const opE = entrada.operador;
                  const busE = entrada.numeroAutobus;
                  entradasPorOperador[opE] =
                    (entradasPorOperador[opE] || 0) + 1;
                  entradasPorAutobus[busE] =
                    (entradasPorAutobus[busE] || 0) + 1;
                }
                // Salidas
                if (salida && salida.operador && salida.numeroAutobus) {
                  const opS = salida.operador;
                  const busS = salida.numeroAutobus;
                  salidasPorOperador[opS] =
                    (salidasPorOperador[opS] || 0) + 1;
                  salidasPorAutobus[busS] =
                    (salidasPorAutobus[busS] || 0) + 1;
                }
              });
            }
          });
        }
      });
    }
    setRegistrosEntradas({
      porOperador: entradasPorOperador,
      porAutobus: entradasPorAutobus,
    });
    setRegistrosSalidas({
      porOperador: salidasPorOperador,
      porAutobus: salidasPorAutobus,
    });
  };

  // ==========================
  // 3) Cargar mantenimientos según número económico
  // ==========================
  useEffect(() => {
    const checkMaintenance = async () => {
      if (!numeroEconomico) {
        setMantenimientosActuales([]);
        return;
      }
      try {
        const response = await getMantenimientos();
        if (response && response.success && Array.isArray(response.data)) {
          // Filtrar por número económico
          const filtrados = response.data.filter(
            (m) => m.numeroEconomico === numeroEconomico
          );
          setMantenimientosActuales(filtrados);
        } else {
          console.error('Formato de respuesta inesperado:', response);
        }
      } catch (error) {
        console.error('Error al obtener mantenimientos:', error);
        setError('No se pudieron cargar los mantenimientos');
      }
    };
    checkMaintenance();
  }, [numeroEconomico]);

  // ==========================
  // 4) Filtrar rutas (fecha + bus)
  // ==========================
  useEffect(() => {
    if (!numeroEconomico) {
      setRutasFiltradas([]);
      return;
    }

    const parseRutaDate = (str) => {
      if (!str) return null;
      return new Date(str);
    };

    const parseUserDate = (str) => {
      if (!str) return null;
      // Ajustamos para evitar problemas de zona horaria
      return new Date(`${str}T00:00:00`);
    };

    const dateRanges = fechas.map((f) => ({
      start: parseUserDate(f.inicio),
      end: parseUserDate(f.hasta),
    }));

    const isInAnyRange = (date) => {
      return dateRanges.some((range) => {
        if (!range.start || !range.end) return false;
        return date >= range.start && date <= range.end;
      });
    };

    const nuevas = [];
    if (Array.isArray(tablarolesTbf)) {
      tablarolesTbf.forEach((doc) => {
        if (Array.isArray(doc.rutas)) {
          doc.rutas.forEach((ruta) => {
            const fechaRuta = parseRutaDate(ruta.fecha);
            if (!fechaRuta) return;

            // ¿Hay un turno con el bus seleccionado?
            let hasBus = false;
            if (Array.isArray(ruta.turnos)) {
              hasBus = ruta.turnos.some((turno) => {
                const busE = turno.entrada?.numeroAutobus;
                const busS = turno.salida?.numeroAutobus;
                return busE === numeroEconomico || busS === numeroEconomico;
              });
            }

            // Si el bus coincide y la fecha cae en alguno de los rangos
            if (hasBus && isInAnyRange(fechaRuta)) {
              nuevas.push(ruta);
            }
          });
        }
      });
    }
    setRutasFiltradas(nuevas);
  }, [fechas, numeroEconomico, tablarolesTbf]);

  // ==========================
  // Handlers de fechas y selección
  // ==========================
  const handleSelectBus = (e) => {
    setNumeroEconomico(e.target.value);
  };

  const handleCambioFecha = (indice, campo, valor) => {
    const copia = [...fechas];
    copia[indice][campo] = valor;
    setFechas(copia);
  };

  const agregarRangoFecha = () => {
    setFechas([...fechas, { inicio: '', hasta: '' }]);
  };

  const eliminarRangoFecha = (indice) => {
    if (fechas.length <= 1) return;
    const nuevasFechas = fechas.filter((_, idx) => idx !== indice);
    setFechas(nuevasFechas);
  };

  // ==========================
  // VERIFICACIONES / CÁLCULOS BÁSICOS
  // ==========================
  // Verificar si hay al menos un rango de fechas completo
  const hasValidDateRange = fechas.some(
    (r) => r.inicio.trim() !== '' && r.hasta.trim() !== ''
  );

  // Aplanar turnos en allTurnos (solo lo filtrado)
  const allTurnos = rutasFiltradas.flatMap((ruta) => {
    if (!Array.isArray(ruta.turnos)) return [];
    return ruta.turnos.map((turno) => {
      const horarioEntrada = turno.horarioEntrada || '??:??';
      const horarioSalida = turno.horarioSalida || '??:??';
      const saleDe = ruta.saleDe || '---';
      const llegaA = ruta.llegaA || '---';
      const costo = ruta.costo || 0;
      return {
        horarioEntrada,
        horarioSalida,
        saleDe,
        llegaA,
        costo,
      };
    });
  });

  // Cálculo: Costo/2 Rutas vs. Costo Mantenimientos
  const totalRutasCostHalf = rutasFiltradas.reduce((acc, ruta) => {
    if (!ruta.costo) return acc;
    const c = parseFloat(ruta.costo) || 0;
    return acc + c / 2;
  }, 0);

  const totalMantenimientosCost = mantenimientosActuales.reduce((acc, mant) => {
    const cm = parseFloat(mant.total) || 0;
    return acc + cm;
  }, 0);

  const totalFinal = totalRutasCostHalf - totalMantenimientosCost;

  // Cantidad de mantenimientos para el autobús
  const cantidadMantenimientos = mantenimientosActuales.length;

  // ==========================
  // REF PARA EXPORTAR (Tabla de Viajes Filtrados)
  // ==========================
  const viajesRef = useRef(null);

  // ==========================
  // EXPORTACIÓN A EXCEL (solo la tabla filtrada)
  // ==========================
  const exportToExcel = () => {
    if (!viajesRef.current) return;
    // Crear un nuevo libro de Excel
    const wb = XLSX.utils.book_new();
    // Tomar la tabla de viajes filtrados
    const ws = XLSX.utils.table_to_sheet(viajesRef.current);
    XLSX.utils.book_append_sheet(wb, ws, 'ViajesFiltrados');
    // Descargar el archivo
    XLSX.writeFile(wb, 'viajesFiltrados.xlsx');
  };

  // ==========================
  // EXPORTACIÓN A PDF (solo la tabla filtrada)
  // ==========================
  const exportToPDF = () => {
    if (!viajesRef.current) return;
    // Capturamos la tabla de viajes
    html2canvas(viajesRef.current, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      // Calculamos la altura manteniendo la proporción
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('viajesFiltrados.pdf');
    });
  };

  // ==========================
  // RENDER PRINCIPAL
  // ==========================
  return (
    <div className={styles.mainContainer}>
      <div>
        <Menu />
      </div>

      <div className={styles.Container}>
        {/* Encabezado */}
        <div className={styles.headerSection}>
          <h2>Utilidades de Flota</h2>

          {/* Botones de exportación:
              - Solo habilitarlos si allTurnos tiene datos (opcional).
              - Ajusta la lógica si prefieres que se muestren siempre. */}
          <div style={{ marginLeft: 'auto' }}>
            <button
              onClick={exportToExcel}
              style={{ marginRight: '8px' }}
              disabled={allTurnos.length === 0}
            >
              Exportar a Excel
            </button>
            <button onClick={exportToPDF} disabled={allTurnos.length === 0}>
              Exportar a PDF
            </button>
          </div>
        </div>

        {/* Selector de autobús */}
        <div className={`${styles.card} ${styles.selectorBus}`}>
          <h3>Información del Autobús</h3>
          <div className={styles.selectorContainer}>
            <label>Selecciona un número económico:</label>
            <select
              value={numeroEconomico}
              onChange={handleSelectBus}
              disabled={cargando}
            >
              <option value="">-- Seleccionar autobús --</option>
              {autobuses.map((bus) => (
                <option key={bus.numeroEconomico} value={bus.numeroEconomico}>
                  {bus.numeroEconomico}
                </option>
              ))}
            </select>
          </div>

          {cargando && <div className={styles.loader}>Cargando datos...</div>}
          {error && <div className={styles.error}>{error}</div>}
        </div>

        {/* Fechas y Finanzas */}
        <div className={styles.dashboard}>
          {/* Fechas */}
          <div className={`${styles.card} ${styles.datesSection}`}>
            <h3>Rangos de Fecha</h3>
            <div className={styles.dateControlsHeader}>
              <span>Definir períodos para filtrar datos</span>
              <button className={styles.addButton} onClick={agregarRangoFecha}>
                + Agregar rango
              </button>
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Rango</th>
                  <th>Inicio</th>
                  <th>Hasta</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {fechas.map((f, idx) => (
                  <tr key={idx}>
                    <td>Rango {idx + 1}</td>
                    <td>
                      <input
                        type="date"
                        value={f.inicio}
                        onChange={(e) =>
                          handleCambioFecha(idx, 'inicio', e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        value={f.hasta}
                        onChange={(e) =>
                          handleCambioFecha(idx, 'hasta', e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <button
                        className={styles.deleteButton}
                        onClick={() => eliminarRangoFecha(idx)}
                        disabled={fechas.length <= 1}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Finanzas */}
          <div className={`${styles.card} ${styles.financesSection}`}>
            <h3>Finanzas</h3>
            <p className={styles.sectionInfo}>
              Revisa los costos de rutas y mantenimientos (solo se muestran si
              has definido al menos un rango de fechas).
            </p>
            <table className={styles.table}>
              <thead>
                <tr>
                  {hasValidDateRange && <th>Costo/2 Rutas</th>}
                  {hasValidDateRange && <th>Costo Mantenimientos</th>}
                  {hasValidDateRange && <th>Total Final</th>}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {hasValidDateRange && (
                    <td>${totalRutasCostHalf.toFixed(2)}</td>
                  )}
                  {hasValidDateRange && (
                    <td>${totalMantenimientosCost.toFixed(2)}</td>
                  )}
                  {hasValidDateRange && (
                    <td>
                      <div
                        className={`${styles.totalBox} ${
                          totalFinal >= 0
                            ? styles.positiveAmount
                            : styles.negativeAmount
                        }`}
                      >
                        {totalFinal >= 0
                          ? `$${totalFinal.toFixed(2)}`
                          : `-$${Math.abs(totalFinal).toFixed(2)}`}
                      </div>
                    </td>
                  )}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabla de Viajes Realizados (solo si hay turnos filtrados) */}
        {allTurnos.length > 0 && (
          <div className={`${styles.card} ${styles.viajesSection}`}>
            <h3>Viajes Realizados (Bus: {numeroEconomico})</h3>

            {/* Esta tabla es la que se exportará (solo lo que se está filtrando) */}
            <div className={styles.tableContainer}>
              <table ref={viajesRef} className={styles.table}>
                <thead>
                  <tr>
                    <th>Número Económico</th>
                    <th>Horario Entrada</th>
                    <th>Horario Salida</th>
                    <th>Sale de</th>
                    <th>Llega a</th>
                    <th>Costo / 2</th>
                    <th>Mantenimientos</th>
                  </tr>
                </thead>
                <tbody>
                  {allTurnos.map((turno, idx) => {
                    const costoDividido = parseFloat(turno.costo)
                      ? (parseFloat(turno.costo) / 2).toFixed(2)
                      : '---';

                    return (
                      <tr key={idx}>
                        <td>{numeroEconomico}</td>
                        <td>{turno.horarioEntrada}</td>
                        <td>{turno.horarioSalida}</td>
                        <td>{turno.saleDe}</td>
                        <td>{turno.llegaA}</td>
                        <td>{costoDividido}</td>
                        {/* 
                          Mantenimientos: 
                          Solo en la primera fila mostramos la celda 
                          con el total de mantenimientos y un span clickable
                        */}
                        {idx === 0 && (
                          <td rowSpan={allTurnos.length}>
                            <span
                              className={styles.maintenanceBadge}
                              onClick={() =>
                                openMaintenanceModal(mantenimientosActuales)
                              }
                            >
                              {cantidadMantenimientos}
                            </span>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className={styles.tableSummary}>
              <span>
                Total de viajes: <strong>{allTurnos.length}</strong>
              </span>
            </div>
          </div>
        )}

        {/* Modal de mantenimiento */}
        <MaintenanceModal
          show={isMaintenanceModalOpen}
          handleClose={closeMaintenanceModal}
          maintenances={selectedMaintenances}
        />
      </div>
    </div>
  );
};

export default Utilidades;

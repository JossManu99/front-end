import React, { useState, useEffect } from 'react';
import styles from './Nomina.module.css';
import { getOperadores } from '../../services/OperadorService';
import { getMantenimientos } from '../../services/manttoService';
import { tbfObtenerTablarolesTbf } from '../../services/tbfService';
import Menu from '../../components/header/DashboardHeader';


// Mantenemos la utilidad de fechas para que todo funcione como antes
const monthsMap = {
  enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
  julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
};

function parseSpanishDate(str) {
  let parts = str.split(',');
  if (parts.length > 1) {
    str = parts[1].trim();
  }
  parts = str.split(' ');
  if (parts.length < 5) return null;

  const day = parseInt(parts[0], 10);
  const monthStr = parts[2].toLowerCase();
  const year = parseInt(parts[4], 10);

  if (!monthsMap.hasOwnProperty(monthStr)) return null;
  const month = monthsMap[monthStr];

  const parsedDate = new Date(year, month, day);
  return isNaN(parsedDate.getTime()) ? null : parsedDate;
}

const checkFechaValida = (fechaStr) => {
  const normalDate = new Date(fechaStr);
  if (!isNaN(normalDate.getTime())) {
    return normalDate;
  }
  const spDate = parseSpanishDate(fechaStr);
  if (spDate && !isNaN(spDate.getTime())) {
    return spDate;
  }
  return null;
};

const Nomina = () => {
  // Estados
  const [numeroOperador, setNumeroOperador] = useState('');
  const [operadores, setOperadores] = useState([]);
  const [mantenimientos, setMantenimientos] = useState([]);
  const [tablarolesTbf, setTablarolesTbf] = useState([]);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [ingreso, setIngreso] = useState('');
  const [gastos, setGastos] = useState('');
  const [filteredMantenimientos, setFilteredMantenimientos] = useState([]);
  const [filteredRutas, setFilteredRutas] = useState([]);
  const [loading, setLoading] = useState({
    operadores: false,
    mantenimientos: false,
    rutas: false
  });

  // Cargar operadores
  useEffect(() => {
    const fetchOperadores = async () => {
      setLoading(prev => ({ ...prev, operadores: true }));
      try {
        const data = await getOperadores();
        setOperadores(data);
      } catch (error) {
        console.error('Error al obtener los operadores:', error);
      } finally {
        setLoading(prev => ({ ...prev, operadores: false }));
      }
    };
    fetchOperadores();
  }, []);

  // Cargar mantenimientos
  useEffect(() => {
    const fetchMantenimientos = async () => {
      setLoading(prev => ({ ...prev, mantenimientos: true }));
      try {
        const response = await getMantenimientos();
        if (response && response.success && Array.isArray(response.data)) {
          setMantenimientos(response.data);
        } else if (Array.isArray(response)) {
          setMantenimientos(response);
        } else {
          console.error('Formato de respuesta inesperado:', response);
        }
      } catch (error) {
        console.error('Error al obtener mantenimientos:', error);
      } finally {
        setLoading(prev => ({ ...prev, mantenimientos: false }));
      }
    };
    fetchMantenimientos();
  }, []);

  // Cargar roles TBF
  useEffect(() => {
    const fetchTablarolesTbf = async () => {
      setLoading(prev => ({ ...prev, rutas: true }));
      try {
        const data = await tbfObtenerTablarolesTbf();
        setTablarolesTbf(data);
      } catch (error) {
        console.error('Error al obtener roles TBF:', error);
      } finally {
        setLoading(prev => ({ ...prev, rutas: false }));
      }
    };
    fetchTablarolesTbf();
  }, []);

  // Filtrar datos cuando cambian los criterios
  useEffect(() => {
    if (!numeroOperador) {
      setFilteredMantenimientos([]);
      setFilteredRutas([]);
      return;
    }
    
    const operador = operadores.find((op) => op.numeroOperador === numeroOperador);
    if (!operador) {
      setFilteredMantenimientos([]);
      setFilteredRutas([]);
      return;
    }
    
    const operadorNombre = operador.nombre.trim().toLowerCase();
    const start = fechaInicio ? new Date(`${fechaInicio}T00:00:00`) : null;
    const end = fechaHasta ? new Date(`${fechaHasta}T23:59:59`) : null;
    const rangoValido = start && end;

    // Filtrar mantenimientos
    const fmants = mantenimientos.filter((m) => {
      if (!m.nombreOperador) return false;
      if (m.nombreOperador.trim().toLowerCase() !== operadorNombre) return false;
      if (!rangoValido) return false;
      const fechaM = checkFechaValida(m.fecha);
      if (!fechaM) return false;
      return fechaM >= start && fechaM <= end;
    });
    setFilteredMantenimientos(fmants);

    // Filtrar rutas
    const frutas = [];
    if (Array.isArray(tablarolesTbf)) {
      tablarolesTbf.forEach((doc) => {
        if (!Array.isArray(doc.rutas)) return;
        doc.rutas.forEach((ruta) => {
          if (!Array.isArray(ruta.turnos)) return;
          const tieneOp = ruta.turnos.some((turno) => {
            const opE = turno.entrada?.operador?.trim().toLowerCase();
            const opS = turno.salida?.operador?.trim().toLowerCase();
            return opE === operadorNombre || opS === operadorNombre;
          });
          if (!tieneOp) return;
          if (!rangoValido) return;
          const fechaR = checkFechaValida(ruta.fecha);
          if (!fechaR) return;
          if (fechaR >= start && fechaR <= end) {
            frutas.push(ruta);
          }
        });
      });
    }
    setFilteredRutas(frutas);
  }, [numeroOperador, fechaInicio, fechaHasta, operadores, mantenimientos, tablarolesTbf]);

  // Calcular total financiero
  const calcularTotal = () => {
    const valIng = parseFloat(ingreso) || 0;
    const valGas = parseFloat(gastos) || 0;
    return valIng - valGas;
  };

  // Formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', { 
      style: 'currency', 
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    }).format(amount);
  };

  return (

    <div className={styles.mainContainer}>
      <div >
          <Menu />
        </div>
    <div className={styles.Container}>


      {/* Título - Ahora está primero y con position: sticky */}
      <div className={styles.header}>
        <h2>Nómina</h2>
      </div>

      {/* Fila de filtros y finanzas */}
      <div className={styles.filtersRow}>
        {/* Card 1: Operador */}
        <div className={styles.card}>
          <label>Selecciona un Operador:</label>
          <select
            value={numeroOperador}
            onChange={(e) => setNumeroOperador(e.target.value)}
            disabled={loading.operadores}
          >
            <option value="">-- Seleccionar --</option>
            {operadores.map((op) => (
              <option key={op._id} value={op.numeroOperador}>
                {op.numeroOperador} - {op.nombre}
              </option>
            ))}
          </select>

          {numeroOperador && (
            <div className={styles.debugInfo}>
              <p>Operadores cargados: {operadores.length}</p>
              <p>Operador seleccionado: {numeroOperador}</p>
              <p>Mantenimientos encontrados: {filteredMantenimientos.length}</p>
              <p>Rutas encontradas: {filteredRutas.length}</p>
            </div>
          )}
        </div>

        {/* Card 2: Rango de fechas */}
        <div className={styles.card}>
          <label>Fecha de Inicio:</label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />

          <label>Fecha Hasta:</label>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
          />
        </div>

        {/* Card 3: Finanzas */}
        <div className={styles.card}>
          <label>Ingreso:</label>
          <input
            type="number"
            value={ingreso}
            onChange={(e) => setIngreso(e.target.value)}
            placeholder="0.00"
          />

          <label>Gastos:</label>
          <input
            type="number"
            value={gastos}
            onChange={(e) => setGastos(e.target.value)}
            placeholder="0.00"
          />

          <label>Total:</label>
          <div
            className={
              calcularTotal() >= 0 ? styles.positiveAmount : styles.negativeAmount
            }
          >
            {formatCurrency(calcularTotal())}
          </div>
        </div>
      </div>

      {/* Sección de resultados */}
      <div className={styles.resultsSection}>
        {/* Mantenimientos */}
        {filteredMantenimientos.length > 0 && (
          <div className={styles.resultBlock}>
            <h3>Mantenimientos (Operador: {numeroOperador})</h3>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Número Económico</th>
                    <th>Kilometraje</th>
                    <th>Falla</th>
                    <th>Solución</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMantenimientos.map((mant) => (
                    <tr key={mant._id}>
                      <td>{mant.fecha}</td>
                      <td>{mant.hora}</td>
                      <td>{mant.numeroEconomico}</td>
                      <td>{mant.kilometraje}</td>
                      <td>{mant.falla}</td>
                      <td>{mant.solucion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Viajes */}
        {filteredRutas.length > 0 && (
          <div className={styles.resultBlock}>
            <h3>Viajes Realizados (Operador: {numeroOperador})</h3>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Número Ruta</th>
                    <th>Nombre Cliente</th>
                    <th>Turno</th>
                    <th>Horario</th>
                    <th>Número Económico</th>
                    <th>Elaborado Por</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRutas.map((ruta) => {
                    if (!Array.isArray(ruta.turnos)) return null;
                    return ruta.turnos.map((turno, idxTurno) => {
                      const numeroBus =
                        turno.entrada?.numeroAutobus ||
                        turno.salida?.numeroAutobus ||
                        'N/A';
                      const horario = `${turno.horarioEntrada || 'N/A'} - ${
                        turno.horarioSalida || 'N/A'
                      }`;

                      return (
                        <tr key={`${ruta._id}-${idxTurno}`}>
                          <td>
                            {new Date(ruta.fecha).toLocaleDateString() || 'Inválida'}
                          </td>
                          <td>{ruta.numeroRuta || 'N/A'}</td>
                          <td>{ruta.nombreCliente || 'N/A'}</td>
                          <td>{turno.turno || 'N/A'}</td>
                          <td>{horario}</td>
                          <td>{numeroBus}</td>
                          <td>{ruta.elaboradoPor || 'N/A'}</td>
                        </tr>
                      );
                    });
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Mensaje cuando no hay resultados */}
        {numeroOperador && !loading.mantenimientos && !loading.rutas && 
         filteredMantenimientos.length === 0 && filteredRutas.length === 0 && (
          <div className={styles.resultBlock}>
            <p style={{ textAlign: 'center', padding: '20px' }}>
              No se encontraron registros para el operador y rango de fechas seleccionados.
            </p>
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default Nomina;

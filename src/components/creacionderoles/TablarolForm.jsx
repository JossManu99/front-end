import React, { useState, useEffect } from 'react';
import { obtenertablarol } from '../../services/tablarol';
import { getAutobuses } from '../../services/AutobusesService';
import { getOperadores } from '../../services/OperadorService';
import { tbfCrearTablarolTbf, tbfActualizarTablarolTbf } from '../../services/tbfService';
import { createExtra } from '../../services/extrasService';
import Menu from '../../components/header/DashboardHeader';

import styles from './TablarolForm.module.css';
import das from '../header/Dashboard.module.css';

const TablarolForm = ({ initialData, onCancel, onUpdateComplete }) => {
  const [tablaroles, setTablaroles] = useState([]);
  const [autobuses, setAutobuses] = useState([]);
  const [operadores, setOperadores] = useState([]);
  const [cambioSeleccionado, setCambioSeleccionado] = useState('');
  const [rutas, setRutas] = useState([]);

  // Estados para la información del cambio
  const [diaInicio, setDiaInicio] = useState('');
  const [mesInicio, setMesInicio] = useState('');
  const [anioInicio, setAnioInicio] = useState('');
  const [elaboradoPor, setElaboradoPor] = useState('');

  // Estados de carga/envío
  const [cargando, setCargando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // Fecha actual (para mostrarla en pantalla)
  const [currentDate] = useState(new Date());

  // SECCIÓN: EXTRAS
  const [extras, setExtras] = useState([
    {
      turno: '1°',
      tipoViaje: 'medio',
      entrada: {
        horario: '',
        rutaSalida: '',
        rutaDestino: '',
        numeroAutobus: '',
        operador: ''
      },
      salida: {
        horario: '',
        rutaSalida: '',
        rutaDestino: '',
        numeroAutobus: '',
        operador: ''
      }
    }
  ]);

  const agregarFilaExtra = () => {
    setExtras((prev) => [
      ...prev,
      {
        turno: '',
        tipoViaje: 'medio',
        entrada: {
          horario: '',
          rutaSalida: '',
          rutaDestino: '',
          numeroAutobus: '',
          operador: ''
        },
        salida: {
          horario: '',
          rutaSalida: '',
          rutaDestino: '',
          numeroAutobus: '',
          operador: ''
        }
      }
    ]);
  };

  const handleExtraChange = (index, tipo, campo, valor) => {
    setExtras((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        if (tipo === 'turno') {
          return { ...item, turno: valor };
        }
        if (tipo === 'tipoViaje') {
          let newItem = { ...item, tipoViaje: valor };
          if (valor === 'completo') {
            newItem.salida.numeroAutobus = newItem.entrada.numeroAutobus;
            newItem.salida.operador = newItem.entrada.operador;
          }
          return newItem;
        }
        let newItem = {
          ...item,
          [tipo]: {
            ...item[tipo],
            [campo]: valor
          }
        };
        if (
          newItem.tipoViaje === 'completo' &&
          tipo === 'entrada' &&
          (campo === 'numeroAutobus' || campo === 'operador')
        ) {
          newItem.salida[campo] = valor;
        }
        return newItem;
      })
    );
  };

  const resetExtraRow = (index, tipo) => {
    setExtras((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        return {
          ...item,
          [tipo]: {
            horario: '',
            rutaSalida: '',
            rutaDestino: '',
            numeroAutobus: '',
            operador: ''
          }
        };
      })
    );
  };

  const eliminarExtraCompleto = (index) => {
    setExtras((prev) => prev.filter((_, i) => i !== index));
  };

  // Carga inicial de datos (tablaroles, autobuses y operadores)
  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      try {
        const tablarolesData = await obtenertablarol();
        setTablaroles(tablarolesData);

        const [autobusesData, operadoresData] = await Promise.all([
          getAutobuses(),
          getOperadores()
        ]);
        setAutobuses(autobusesData);
        setOperadores(operadoresData);

        // Si se envía initialData, precargamos los valores
        if (initialData) {
          setCambioSeleccionado(initialData.numeroCambio);
          setDiaInicio(initialData.diaInicio || '');
          setMesInicio(initialData.mesInicio || '');
          setAnioInicio(initialData.anioInicio || '');
          setElaboradoPor(initialData.elaboradoPor || '');
          // Normalizamos las rutas para asegurarnos que cada turno tenga la estructura
          const rutasNormalizadas = (initialData.rutas || []).map((ruta) => {
            const turnosNormalizados = (ruta.turnos || []).map((turno) => ({
              ...turno,
              entrada: turno.entrada || { numeroAutobus: '', operador: '' },
              salida: turno.salida || { numeroAutobus: '', operador: '' },
              tipoViaje: turno.tipoViaje || 'medio'
            }));
            return {
              ...ruta,
              fecha: ruta.fecha || new Date(),
              turnos: turnosNormalizados
            };
          });
          setRutas(rutasNormalizadas);
        }
      } catch (error) {
        console.error('Error al cargar los datos:', error);
        alert('Error al cargar los datos: ' + (error.message || 'Error desconocido'));
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, [initialData]);

  // Manejo de la selección de "Número de Cambio" (solo para creación)
  const handleCambioChange = (e) => {
    const numeroCambioSeleccionado = e.target.value;
    setCambioSeleccionado(numeroCambioSeleccionado);

    const cambioEncontrado = tablaroles.find(
      (tablarol) => tablarol.numeroCambio === numeroCambioSeleccionado
    );

    if (cambioEncontrado) {
      setDiaInicio(cambioEncontrado.diaInicio || '');
      setMesInicio(cambioEncontrado.mesInicio || '');
      setAnioInicio(cambioEncontrado.anioInicio || '');
      setElaboradoPor(cambioEncontrado.elaboradoPor || '');
      const rutasNormalizadas = (cambioEncontrado.rutas || []).map((ruta) => {
        const turnosNormalizados = (ruta.turnos || []).map((turno) => ({
          ...turno,
          entrada: turno.entrada || { numeroAutobus: '', operador: '' },
          salida: turno.salida || { numeroAutobus: '', operador: '' },
          tipoViaje: turno.tipoViaje || 'medio'
        }));
        return {
          ...ruta,
          fecha: ruta.fecha || new Date(),
          turnos: turnosNormalizados
        };
      });
      setRutas(rutasNormalizadas);
    } else {
      setRutas([]);
      setDiaInicio('');
      setMesInicio('');
      setAnioInicio('');
      setElaboradoPor('');
    }
  };

  // SECCIÓN: RUTAS EXISTENTES
  const actualizarFila = (rutaIndex, turnoIndex, tipo, campo, valor) => {
    setRutas((prevRutas) =>
      prevRutas.map((ruta, rIdx) => {
        if (rIdx !== rutaIndex) return ruta;
        return {
          ...ruta,
          turnos: ruta.turnos.map((turno, tIdx) => {
            if (tIdx !== turnoIndex) return turno;
            if (tipo === 'tipoViaje') {
              const updatedTurno = { ...turno, tipoViaje: valor };
              if (valor === 'completo') {
                updatedTurno.salida.numeroAutobus = updatedTurno.entrada?.numeroAutobus || '';
                updatedTurno.salida.operador = updatedTurno.entrada?.operador || '';
              }
              return updatedTurno;
            }
            const updatedTurno = {
              ...turno,
              [tipo]: {
                ...(turno[tipo] || {}),
                [campo]: valor
              }
            };
            if (
              updatedTurno.tipoViaje === 'completo' &&
              tipo === 'entrada' &&
              (campo === 'numeroAutobus' || campo === 'operador')
            ) {
              updatedTurno.salida = {
                ...(updatedTurno.salida || {}),
                [campo]: valor
              };
            }
            return updatedTurno;
          })
        };
      })
    );
  };

  const resetearFila = (rutaIndex, turnoIndex, tipo) => {
    setRutas((prevRutas) =>
      prevRutas.map((ruta, rIdx) => {
        if (rIdx !== rutaIndex) return ruta;
        return {
          ...ruta,
          turnos: ruta.turnos.map((turno, tIdx) => {
            if (tIdx !== turnoIndex) return turno;
            return {
              ...turno,
              [tipo]: {
                numeroAutobus: '',
                operador: ''
              }
            };
          })
        };
      })
    );
  };

  const handleSubmit = async () => {
    if (!cambioSeleccionado) {
      alert('Por favor, seleccione un número de cambio.');
      return;
    }
    if (rutas.length === 0) {
      alert('No hay rutas para guardar.');
      return;
    }
    try {
      setEnviando(true);
      const registro = {
        numeroCambio: cambioSeleccionado,
        diaInicio,
        mesInicio,
        anioInicio,
        elaboradoPor,
        rutas: rutas.map((ruta) => ({
          ...ruta,
          fecha: ruta.fecha || new Date()
        }))
      };
      // Si existe initialData, se trata de una actualización
      if (initialData) {
        const registroActualizado = await tbfActualizarTablarolTbf(initialData._id, registro);
        alert('Registro actualizado exitosamente');
        if (onUpdateComplete) onUpdateComplete(registroActualizado);
      } else {
        await tbfCrearTablarolTbf(registro);
        alert('Registro creado exitosamente');
        const tablarolesData = await obtenertablarol();
        setTablaroles(tablarolesData);
      }
    } catch (error) {
      console.error('Error al enviar el registro:', error);
      alert('Error al enviar el registro: ' + (error.message || 'Error desconocido'));
    } finally {
      setEnviando(false);
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('es-MX');
  };

  const guardarExtras = async () => {
    try {
      for (const extra of extras) {
        await createExtra(extra);
      }
      alert('Extras guardados correctamente');
    } catch (error) {
      console.error('Error al guardar extras:', error);
      alert('Error al guardar extras');
    }
  };

  return (
    <div className={styles.mainContainer}>
      <div className={das.menuContainer}>
        <Menu />
      </div>

      <div className={styles.formContainer}>
        <h2 className={styles.formTitle}>
          {initialData
            ? `Actualizar Tabla de Rol #${initialData.numeroCambio}`
            : 'Distribucion de operadores - Número de Cambio'}
        </h2>
        <p className={styles.dateInfo}>Fecha: {formatDate(currentDate)}</p>

        {/* SELECCIÓN DE NÚMERO DE CAMBIO (solo en creación) */}
        {!initialData && (
          <div className={styles.formGroup}>
            <label className={styles.label}>Número de Cambio:</label>
            <select
              className={styles.select}
              value={cambioSeleccionado || ''}
              onChange={handleCambioChange}
              disabled={cargando || enviando}
            >
              <option value="">Seleccionar</option>
              {tablaroles.map((tablarol) => (
                <option key={tablarol._id} value={tablarol.numeroCambio}>
                  {tablarol.numeroCambio}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* INFORMACIÓN DEL CAMBIO */}
        {(cambioSeleccionado || initialData) && (
          <div className={styles.cambioInfo}>
            <div className={styles.infoRow}>
              <div className={styles.infoItem}>
                <label>Día Inicio:</label>
                <span>{diaInicio}</span>
              </div>
              <div className={styles.infoItem}>
                <label>Mes Inicio:</label>
                <span>{mesInicio}</span>
              </div>
              <div className={styles.infoItem}>
                <label>Año Inicio:</label>
                <span>{anioInicio}</span>
              </div>
              <div className={styles.infoItem}>
                <label>Elaborado Por:</label>
                <span>{elaboradoPor}</span>
              </div>
            </div>
          </div>
        )}

        {/* TABLA DE RUTAS EXISTENTES */}
        {rutas.length > 0 && (
          <>
            {rutas.map((ruta, rutaIndex) => (
              <div key={rutaIndex} className={styles.routeContainer}>
                <h3 className={styles.routeTitle}>
                  Ruta {ruta.numeroRuta} - Cliente: {ruta.nombreCliente} - Costo: {ruta.costo} - Sale de: {ruta.saleDe} - Llega a: {ruta.llegaA}
                </h3>
                <p className={styles.dateInfo}>
                  Fecha: {ruta.fecha ? formatDate(ruta.fecha) : formatDate(currentDate)}
                </p>
                <div className={styles.tableContainer}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Turno</th>
                        <th>Horario</th>
                        <th>Salida</th>
                        <th>Destino</th>
                        <th>Núm. Autobús</th>
                        <th>Operador</th>
                        <th>Tipo de Viaje</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ruta.turnos.map((turno, turnoIndex) => (
                        <React.Fragment key={turnoIndex}>
                          {/* FILA DE ENTRADA */}
                          <tr>
                            <td>{turno.turno}</td>
                            <td>{turno.horarioEntrada}</td>
                            <td>{turno.horarioinicio_jordana_salidaOrigen}</td>
                            <td>{turno.horarioinicio_jornada_llegada_a_Destino}</td>
                            <td>
                              <select
                                className={styles.selectSmall}
                                value={turno.entrada.numeroAutobus}
                                onChange={(e) =>
                                  actualizarFila(
                                    rutaIndex,
                                    turnoIndex,
                                    'entrada',
                                    'numeroAutobus',
                                    e.target.value
                                  )
                                }
                                disabled={enviando}
                              >
                                <option value="">Seleccionar</option>
                                {autobuses.map((bus) => (
                                  <option key={bus._id} value={bus.numeroEconomico}>
                                    {bus.numeroEconomico || bus.numeroUnidad || 'Autobús'}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <select
                                className={styles.selectSmall}
                                value={turno.entrada.operador}
                                onChange={(e) =>
                                  actualizarFila(
                                    rutaIndex,
                                    turnoIndex,
                                    'entrada',
                                    'operador',
                                    e.target.value
                                  )
                                }
                                disabled={enviando}
                              >
                                <option value="">Seleccionar</option>
                                {operadores.map((op) => (
                                  <option key={op._id} value={op.nombre}>
                                    {op.nombre} {op.apellido}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <select
                                className={styles.selectSmall}
                                value={turno.tipoViaje}
                                onChange={(e) =>
                                  actualizarFila(
                                    rutaIndex,
                                    turnoIndex,
                                    'tipoViaje',
                                    null,
                                    e.target.value
                                  )
                                }
                                disabled={enviando}
                              >
                                <option value="medio">Medio</option>
                                <option value="completo">Completo</option>
                              </select>
                            </td>
                            <td>
                              <button
                                className={styles.smallButton}
                                onClick={() => resetearFila(rutaIndex, turnoIndex, 'entrada')}
                                disabled={enviando}
                              >
                                Reset
                              </button>
                            </td>
                          </tr>
                          {/* FILA DE SALIDA */}
                          <tr>
                            <td>{turno.turno}</td>
                            <td>{turno.horarioSalida}</td>
                            <td>{turno.horariosalida_jornada_salida_de_Origen}</td>
                            <td>{turno.horariosalida_jornada_llegada_a_Destino}</td>
                            <td>
                              <select
                                className={styles.selectSmall}
                                value={turno.salida.numeroAutobus}
                                onChange={(e) =>
                                  actualizarFila(
                                    rutaIndex,
                                    turnoIndex,
                                    'salida',
                                    'numeroAutobus',
                                    e.target.value
                                  )
                                }
                                disabled={enviando || turno.tipoViaje === 'completo'}
                              >
                                <option value="">Seleccionar</option>
                                {autobuses.map((bus) => (
                                  <option key={bus._id} value={bus.numeroEconomico}>
                                    {bus.numeroEconomico || bus.numeroUnidad || 'Autobús'}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <select
                                className={styles.selectSmall}
                                value={turno.salida.operador}
                                onChange={(e) =>
                                  actualizarFila(
                                    rutaIndex,
                                    turnoIndex,
                                    'salida',
                                    'operador',
                                    e.target.value
                                  )
                                }
                                disabled={enviando || turno.tipoViaje === 'completo'}
                              >
                                <option value="">Seleccionar</option>
                                {operadores.map((op) => (
                                  <option key={op._id} value={op.nombre}>
                                    {op.nombre} {op.apellido}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td style={{ textAlign: 'center' }}>--</td>
                            <td>
                              <button
                                className={styles.smallButton}
                                onClick={() => resetearFila(rutaIndex, turnoIndex, 'salida')}
                                disabled={enviando}
                              >
                                Reset
                              </button>
                            </td>
                          </tr>
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
            <div className={styles.buttonsContainer}>
              <button
                className={styles.submitButton}
                onClick={handleSubmit}
                disabled={enviando}
              >
                {enviando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </>
        )}

        {/* SECCIÓN: TABLA DE EXTRAS */}
        <div className={styles.extrasContainer}>
          <h3 className={styles.routeTitle}>Extras</h3>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Turno</th>
                  <th>Horario</th>
                  <th>Salida</th>
                  <th>Destino</th>
                  <th>Núm. Autobús</th>
                  <th>Operador</th>
                  <th>Tipo de Viaje</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {extras.map((extra, index) => (
                  <React.Fragment key={index}>
                    {/* FILA DE ENTRADA */}
                    <tr>
                      <td>{extra.turno}</td>
                      <td>
                        <input
                          type="text"
                          value={extra.entrada.horario}
                          onChange={(e) =>
                            handleExtraChange(index, 'entrada', 'horario', e.target.value)
                          }
                          className={styles.inputSmall}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={extra.entrada.rutaSalida}
                          onChange={(e) =>
                            handleExtraChange(index, 'entrada', 'rutaSalida', e.target.value)
                          }
                          className={styles.inputSmall}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={extra.entrada.rutaDestino}
                          onChange={(e) =>
                            handleExtraChange(index, 'entrada', 'rutaDestino', e.target.value)
                          }
                          className={styles.inputSmall}
                        />
                      </td>
                      <td>
                        <select
                          className={styles.selectSmall}
                          value={extra.entrada.numeroAutobus}
                          onChange={(e) =>
                            handleExtraChange(index, 'entrada', 'numeroAutobus', e.target.value)
                          }
                        >
                          <option value="">Seleccionar</option>
                          {autobuses.map((bus) => (
                            <option key={bus._id} value={bus.numeroEconomico}>
                              {bus.numeroEconomico || bus.numeroUnidad || 'Autobús'}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          className={styles.selectSmall}
                          value={extra.entrada.operador}
                          onChange={(e) =>
                            handleExtraChange(index, 'entrada', 'operador', e.target.value)
                          }
                        >
                          <option value="">Seleccionar</option>
                          {operadores.map((op) => (
                            <option key={op._id} value={op.nombre}>
                              {op.nombre} {op.apellido}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          className={styles.selectSmall}
                          value={extra.tipoViaje}
                          onChange={(e) =>
                            handleExtraChange(index, 'tipoViaje', null, e.target.value)
                          }
                        >
                          <option value="medio">Medio</option>
                          <option value="completo">Completo</option>
                        </select>
                      </td>
                      <td>
                        <button
                          className={styles.smallButton}
                          onClick={() => resetExtraRow(index, 'entrada')}
                        >
                          Reset
                        </button>
                      </td>
                    </tr>
                    {/* FILA DE SALIDA */}
                    <tr>
                      <td>
                        <input
                          type="text"
                          value={extra.turno}
                          onChange={(e) =>
                            handleExtraChange(index, 'turno', null, e.target.value)
                          }
                          className={styles.inputSmall}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={extra.salida.horario}
                          onChange={(e) =>
                            handleExtraChange(index, 'salida', 'horario', e.target.value)
                          }
                          className={styles.inputSmall}
                          disabled={extra.tipoViaje === 'completo'}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={extra.salida.rutaSalida}
                          onChange={(e) =>
                            handleExtraChange(index, 'salida', 'rutaSalida', e.target.value)
                          }
                          className={styles.inputSmall}
                          disabled={extra.tipoViaje === 'completo'}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={extra.salida.rutaDestino}
                          onChange={(e) =>
                            handleExtraChange(index, 'salida', 'rutaDestino', e.target.value)
                          }
                          className={styles.inputSmall}
                          disabled={extra.tipoViaje === 'completo'}
                        />
                      </td>
                      <td>
                        <select
                          className={styles.selectSmall}
                          value={extra.salida.numeroAutobus}
                          onChange={(e) =>
                            handleExtraChange(index, 'salida', 'numeroAutobus', e.target.value)
                          }
                          disabled={extra.tipoViaje === 'completo'}
                        >
                          <option value="">Seleccionar</option>
                          {autobuses.map((bus) => (
                            <option key={bus._id} value={bus.numeroEconomico}>
                              {bus.numeroEconomico || bus.numeroUnidad || 'Autobús'}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          className={styles.selectSmall}
                          value={extra.salida.operador}
                          onChange={(e) =>
                            handleExtraChange(index, 'salida', 'operador', e.target.value)
                          }
                          disabled={extra.tipoViaje === 'completo'}
                        >
                          <option value="">Seleccionar</option>
                          {operadores.map((op) => (
                            <option key={op._id} value={op.nombre}>
                              {op.nombre} {op.apellido}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={{ textAlign: 'center' }}>--</td>
                      <td>
                        <button
                          className={styles.smallButton}
                          onClick={() => resetExtraRow(index, 'salida')}
                        >
                          Reset
                        </button>
                        <button
                          className={styles.smallButton}
                          onClick={() => eliminarExtraCompleto(index)}
                          style={{ marginLeft: '5px' }}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.buttonsContainer}>
            <button className={styles.submitButton} onClick={agregarFilaExtra}>
              Agregar Fila Extra
            </button>
            <button className={styles.submitButton} onClick={guardarExtras}>
              Guardar Extras
            </button>
          </div>
        </div>

        {/* Botón Cancelar para volver a la vista anterior */}
        <div className={styles.buttonsContainer}>
          <button className={styles.btnCancelar} onClick={onCancel}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TablarolForm;

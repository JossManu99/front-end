import React, { useState, useEffect } from 'react';
import { createViaje, updateViaje } from '../../services/viaje/viajeService';
import styles from './FormViaje.module.css';
import Menu from '../../components/header/DashboardHeader';
import das from '../header/Dashboard.module.css';

const FormViaje = ({ onViajeCreated, viaje, onDeleteViaje }) => {
  // Horarios predefinidos para cada turno
  const turnoHorarios = {
    '1°': { inicio: '05:25', fin: '15:20' },
    '2°': { inicio: '13:20', fin: '22:50' },
    '3°': { inicio: '20:20', fin: '07:20' },
    '4°': { inicio: '20:30', fin: '07:20' },
    '5°': { inicio: '21:30', fin: '07:20' }
  };

  const [formData, setFormData] = useState({
    numeroRuta: '',
    nombreCliente: '',
    saleDe: '',
    llegaA: '',
    distancia: '',
    costoPorKm: '',
    costo: '',
    turnos: [{
      turno: '1°',
      horario1: '',
      horario2: '',
      ruta1: { origen: '', destino: '', tipo: '' },
      ruta2: { origen: '', destino: '', tipo: '' },
      horarioPredefinidoInicio: turnoHorarios['1°'].inicio,
      horarioPredefinidoFin: turnoHorarios['1°'].fin
    }]
  });

  // Estado para datos del usuario (por si se necesita)
  const [userData] = useState({ role: 'admin' });
  // Estado para manejar el envío y evitar envíos múltiples
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (viaje) {
      // Mapear datos del backend al formato del formulario
      const turnos = viaje.turnos || [];
      const turnos_formateados = turnos.map(t => ({
        turno: t.turno || '1°',
        horario1: t.horarioEntrada || '',
        horario2: t.horarioSalida || '',
        ruta1: { 
          origen: t.horarioinicio_jordana_salidaOrigen || '', 
          destino: t.horarioinicio_jornada_llegada_a_Destino || '', 
          tipo: t.horarioEntrada ? 'entrada' : '' 
        },
        ruta2: { 
          origen: t.horariosalida_jornada_salida_de_Origen || '', 
          destino: t.horariosalida_jornada_llegada_a_Destino || '', 
          tipo: t.horarioSalida ? 'salida' : '' 
        },
        horarioPredefinidoInicio: turnoHorarios[t.turno] ? turnoHorarios[t.turno].inicio : turnoHorarios['1°'].inicio,
        horarioPredefinidoFin: turnoHorarios[t.turno] ? turnoHorarios[t.turno].fin : turnoHorarios['1°'].fin
      }));

      if (turnos_formateados.length === 0) {
        turnos_formateados.push({
          turno: '1°',
          horario1: '',
          horario2: '',
          ruta1: { origen: '', destino: '', tipo: '' },
          ruta2: { origen: '', destino: '', tipo: '' },
          horarioPredefinidoInicio: turnoHorarios['1°'].inicio,
          horarioPredefinidoFin: turnoHorarios['1°'].fin
        });
      }

      setFormData({
        ...viaje,
        turnos: turnos_formateados
      });
    }
  }, [viaje]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => {
      const updatedData = { ...prevData, [name]: value };

      // Actualizar costoPorKm si se cambian "costo" o "distancia"
      if (name === 'costo' || name === 'distancia') {
        const costo = parseFloat(updatedData.costo);
        const distancia = parseFloat(updatedData.distancia);
        if (!isNaN(costo) && !isNaN(distancia) && distancia > 0) {
          updatedData.costoPorKm = (costo / distancia).toFixed(2);
        } else {
          updatedData.costoPorKm = '';
        }
      }

      // Si cambia "saleDe" o "llegaA", actualizar rutas en todos los turnos
      if (name === 'saleDe' || name === 'llegaA') {
        updatedData.turnos = updatedData.turnos.map(turno => {
          const ruta1 = { ...turno.ruta1 };
          const ruta2 = { ...turno.ruta2 };

          if (ruta1.tipo === 'entrada') {
            ruta1.origen = updatedData.saleDe;
            ruta1.destino = updatedData.llegaA;
          } else if (ruta1.tipo === 'salida') {
            ruta1.origen = updatedData.llegaA;
            ruta1.destino = updatedData.saleDe;
          }

          if (ruta2.tipo === 'entrada') {
            ruta2.origen = updatedData.saleDe;
            ruta2.destino = updatedData.llegaA;
          } else if (ruta2.tipo === 'salida') {
            ruta2.origen = updatedData.llegaA;
            ruta2.destino = updatedData.saleDe;
          }

          return { ...turno, ruta1, ruta2 };
        });
      }
      return updatedData;
    });
  };

  const determinarTipoHorario = (hora, turno) => {
    if (!hora) return '';
    const [horaStr, minutoStr] = hora.split(':');
    const horaInt = parseInt(horaStr, 10);
    const minutoInt = parseInt(minutoStr || '0', 10);
    const minutosTotales = horaInt * 60 + minutoInt;
    const esMadrugada = horaInt >= 0 && horaInt < 4;
    if (turno === '2°') {
      if (esMadrugada || (minutosTotales >= 22 * 60)) return 'salida';
      if (minutosTotales >= 13 * 60 && minutosTotales <= 18 * 60) return 'entrada';
    } else if (['3°', '4°', '5°'].includes(turno)) {
      if (minutosTotales >= 4 * 60 && minutosTotales <= 9 * 60) return 'salida';
      if (minutosTotales >= 18 * 60 || esMadrugada) return 'entrada';
    } else if (turno === '1°') {
      if (minutosTotales >= 5 * 60 && minutosTotales <= 10 * 60) return 'entrada';
      if (minutosTotales >= 13 * 60 && minutosTotales <= 18 * 60) return 'salida';
    }
    return '';
  };

  const calcularRuta = (hora, turno) => {
    if (!hora) return { origen: '', destino: '', tipo: '' };
    const tipo = determinarTipoHorario(hora, turno);
    if (tipo === 'entrada') {
      return { origen: formData.saleDe, destino: formData.llegaA, tipo: 'entrada' };
    } else if (tipo === 'salida') {
      return { origen: formData.llegaA, destino: formData.saleDe, tipo: 'salida' };
    }
    return { origen: '', destino: '', tipo: '' };
  };

  const handleTurnoChange = (index, campo, valor) => {
    const turnosActualizados = [...formData.turnos];
    turnosActualizados[index] = { ...turnosActualizados[index], [campo]: valor };
    if (campo === 'turno') {
      turnosActualizados[index].horarioPredefinidoInicio = turnoHorarios[valor].inicio;
      turnosActualizados[index].horarioPredefinidoFin = turnoHorarios[valor].fin;
      if (turnosActualizados[index].horario1) {
        turnosActualizados[index].ruta1 = calcularRuta(turnosActualizados[index].horario1, valor);
      }
      if (turnosActualizados[index].horario2) {
        turnosActualizados[index].ruta2 = calcularRuta(turnosActualizados[index].horario2, valor);
      }
    } else if (campo === 'horario1' && valor) {
      turnosActualizados[index].ruta1 = calcularRuta(valor, turnosActualizados[index].turno);
    } else if (campo === 'horario2' && valor) {
      turnosActualizados[index].ruta2 = calcularRuta(valor, turnosActualizados[index].turno);
    }
    setFormData({ ...formData, turnos: turnosActualizados });
  };

  const addTurno = () => {
    setFormData({
      ...formData,
      turnos: [
        ...formData.turnos,
        {
          turno: '1°',
          horario1: '',
          horario2: '',
          ruta1: { origen: '', destino: '', tipo: '' },
          ruta2: { origen: '', destino: '', tipo: '' },
          horarioPredefinidoInicio: turnoHorarios['1°'].inicio,
          horarioPredefinidoFin: turnoHorarios['1°'].fin
        }
      ]
    });
  };

  const removeTurno = (index) => {
    const turnosActualizados = [...formData.turnos];
    turnosActualizados.splice(index, 1);
    setFormData({
      ...formData,
      turnos: turnosActualizados.length
        ? turnosActualizados
        : [{
            turno: '1°',
            horario1: '',
            horario2: '',
            ruta1: { origen: '', destino: '', tipo: '' },
            ruta2: { origen: '', destino: '', tipo: '' },
            horarioPredefinidoInicio: turnoHorarios['1°'].inicio,
            horarioPredefinidoFin: turnoHorarios['1°'].fin
          }]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Evitar envíos múltiples
    if (isSubmitting) return;
    setIsSubmitting(true);

    const dataToSubmit = {
      ...formData,
      turnos: formData.turnos.map(t => {
        const horario1Tipo = determinarTipoHorario(t.horario1, t.turno);
        const horario2Tipo = determinarTipoHorario(t.horario2, t.turno);
        let horarioinicio_jordana_salidaOrigen = '';
        let horarioinicio_jornada_llegada_a_Destino = '';
        let horarioEntrada = '';
        if (horario1Tipo === 'entrada') {
          horarioinicio_jordana_salidaOrigen = formData.saleDe;
          horarioinicio_jornada_llegada_a_Destino = formData.llegaA;
          horarioEntrada = t.horario1;
        } else if (horario2Tipo === 'entrada') {
          horarioinicio_jordana_salidaOrigen = formData.saleDe;
          horarioinicio_jornada_llegada_a_Destino = formData.llegaA;
          horarioEntrada = t.horario2;
        }
        let horariosalida_jornada_salida_de_Origen = '';
        let horariosalida_jornada_llegada_a_Destino = '';
        let horarioSalida = '';
        if (horario1Tipo === 'salida') {
          horariosalida_jornada_salida_de_Origen = formData.llegaA;
          horariosalida_jornada_llegada_a_Destino = formData.saleDe;
          horarioSalida = t.horario1;
        } else if (horario2Tipo === 'salida') {
          horariosalida_jornada_salida_de_Origen = formData.llegaA;
          horariosalida_jornada_llegada_a_Destino = formData.saleDe;
          horarioSalida = t.horario2;
        }
        return {
          turno: t.turno,
          horarioEntrada: horarioEntrada,
          horarioSalida: horarioSalida,
          horarioinicio_jordana_salidaOrigen: horarioinicio_jordana_salidaOrigen,
          horarioinicio_jornada_llegada_a_Destino: horarioinicio_jornada_llegada_a_Destino,
          horariosalida_jornada_salida_de_Origen: horariosalida_jornada_salida_de_Origen,
          horariosalida_jornada_llegada_a_Destino: horariosalida_jornada_llegada_a_Destino
        };
      })
    };

    console.log('Submitting form data:', dataToSubmit);
    try {
      let result;
      if (dataToSubmit._id) {
        result = await updateViaje(dataToSubmit);
      } else {
        result = await createViaje(dataToSubmit);
      }
      if (onViajeCreated) onViajeCreated(result);
      // Resetear formulario
      setFormData({
        numeroRuta: '',
        nombreCliente: '',
        saleDe: '',
        llegaA: '',
        distancia: '',
        costoPorKm: '',
        costo: '',
        turnos: [{
          turno: '1°',
          horario1: '',
          horario2: '',
          ruta1: { origen: '', destino: '', tipo: '' },
          ruta2: { origen: '', destino: '', tipo: '' },
          horarioPredefinidoInicio: turnoHorarios['1°'].inicio,
          horarioPredefinidoFin: turnoHorarios['1°'].fin
        }]
      });
      alert(dataToSubmit._id ? 'Viaje actualizado con éxito' : 'Viaje creado con éxito');
    } catch (error) {
      console.error('Error al guardar el viaje:', error);
      alert('Error al guardar el viaje');
    } finally {
      setIsSubmitting(false);
    }
  };

  const turnoOptions = ['1°', '2°', '3°', '4°', '5°'];

  const mostrarInfoRuta = (ruta) => {
    if (!ruta.tipo) return null;
    return (
      <div className={styles.routeInfoSimple}>
        <span>
          {ruta.tipo === 'entrada' ? 'Entrada' : 'Salida'}: Sale de <strong>{ruta.origen}</strong> - Llega a <strong>{ruta.destino}</strong>
        </span>
      </div>
    );
  };

  return (
    <div className={styles.generalconauner}>
      {(!viaje || !viaje._id) && (
        <div className={das.menuContainer}>
          <Menu />
        </div>
      )}
      <div className={styles.formContainer}>
        <h2 className={styles.formTitle}>
          {formData._id ? 'Actualizar Viaje' : 'Crear Viaje'}
        </h2>
        <form onSubmit={handleSubmit} className={styles.formContent}>
          <div className={styles.formSection}>
            <div className={styles.formRow}>
              <div className={styles.formHeader}>Número de Ruta</div>
              <div className={styles.formHeader}>Nombre Cliente:</div>
              <div className={styles.formHeader}>Origen:</div>
              <div className={styles.formHeader}>Destino:</div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <input 
                  type="text" 
                  id="numeroRuta" 
                  name="numeroRuta" 
                  value={formData.numeroRuta || ''} 
                  onChange={handleChange} 
                  required 
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formField}>
                <input 
                  type="text" 
                  id="nombreCliente" 
                  name="nombreCliente" 
                  value={formData.nombreCliente || ''} 
                  onChange={handleChange} 
                  required 
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formField}>
                <input 
                  type="text" 
                  id="saleDe" 
                  name="saleDe" 
                  value={formData.saleDe || ''} 
                  onChange={handleChange} 
                  required 
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formField}>
                <input 
                  type="text" 
                  id="llegaA" 
                  name="llegaA" 
                  value={formData.llegaA || ''} 
                  onChange={handleChange} 
                  required 
                  className={styles.formInput}
                />
              </div>
            </div>
          </div>
          <div className={styles.formSection}>
            <div className={styles.formRow}>
              <div className={styles.formHeader}>Distancia Recorrida (km):</div>
              <div className={styles.formHeader}>Costo por Km ($):</div>
              <div className={styles.formHeader}>Costo ($):</div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <input 
                  type="number" 
                  id="distancia" 
                  name="distancia" 
                  value={formData.distancia || ''} 
                  onChange={handleChange} 
                  required 
                  min="0" 
                  step="0.01" 
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formField}>
                <input 
                  type="text" 
                  id="costoPorKm" 
                  name="costoPorKm" 
                  value={formData.costoPorKm || ''} 
                  readOnly 
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formField}>
                <input 
                  type="number" 
                  id="costo" 
                  name="costo" 
                  value={formData.costo || ''} 
                  onChange={handleChange} 
                  required 
                  min="0" 
                  step="0.01" 
                  className={styles.formInput}
                />
              </div>
            </div>
          </div>
          <div className={styles.formSection}>
            <div className={styles.formRow}>
              <div className={styles.turnoHeader}>Turno</div>
              <div className={styles.turnoHeader}>Horario 1</div>
              <div className={styles.turnoHeader}>Horario 2</div>
              <div className={styles.actionColumn}></div>
            </div>
            {formData.turnos.map((turnoItem, index) => (
              <React.Fragment key={index}>
                <div className={styles.formRow}>
                  <div className={styles.formField}>
                    <select 
                      value={turnoItem.turno}
                      onChange={(e) => handleTurnoChange(index, 'turno', e.target.value)}
                      className={styles.formInput}
                    >
                      {turnoOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formField}>
                    <input 
                      type="text"
                      value={turnoItem.horario1} 
                      onChange={(e) => handleTurnoChange(index, 'horario1', e.target.value)} 
                      className={styles.formInput}
                      placeholder={`Ej: ${turnoHorarios[turnoItem.turno].inicio}`}
                    />
                    {mostrarInfoRuta(turnoItem.ruta1)}
                  </div>
                  <div className={styles.formField}>
                    <input 
                      type="text"
                      value={turnoItem.horario2} 
                      onChange={(e) => handleTurnoChange(index, 'horario2', e.target.value)} 
                      className={styles.formInput}
                      placeholder={`Ej: ${turnoHorarios[turnoItem.turno].fin}`}
                    />
                    {mostrarInfoRuta(turnoItem.ruta2)}
                  </div>
                  <div className={styles.actionColumn}>
                    <button 
                      type="button" 
                      className={styles.deleteButton}
                      onClick={() => removeTurno(index)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </React.Fragment>
            ))}
            <div className={styles.formRow}>
              <button 
                type="button" 
                className={styles.addButton}
                onClick={addTurno}
              >
                Agregar otra fila
              </button>
            </div>
          </div>
          <div className={styles.formFooter}>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'CREANDO...' : (formData._id ? 'ACTUALIZAR VIAJE' : 'CREAR VIAJE')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormViaje;

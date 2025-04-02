import React, { useState, useEffect } from 'react';
import { createViaje, updateViaje } from '../../services/viaje/viajeService';
import Menu from '../../components/header/DashboardHeader';
import das from '../header/Dashboard.module.css';
import styles from './FormViaje.module.css';

const turnoHorarios = {
  '1°': { inicio: '05:25', fin: '15:20' },
  '2°': { inicio: '13:20', fin: '22:50' },
  '3°': { inicio: '20:20', fin: '07:20' },
  '4°': { inicio: '20:30', fin: '07:20' },
  '5°': { inicio: '21:30', fin: '07:20' }
};

const FormViaje = ({ onViajeCreated, viaje, onDeleteViaje }) => {
  const [formData, setFormData] = useState({
    numeroRuta: '',
    nombreCliente: '',
    saleDe: '',
    llegaA: '',
    distancia: '',
    costoPorKm: '',
    costo: '',
    turnos: [
      {
        turno: '1°',
        horario1: '',
        horario2: '',
        horarioPredefinidoInicio: turnoHorarios['1°'].inicio,
        horarioPredefinidoFin: turnoHorarios['1°'].fin
      }
    ]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (viaje) {
      const turnos = viaje.turnos || [];
      const turnosFormateados = turnos.map((t) => ({
        turno: t.turno || '1°',
        horario1: t.horarioEntrada || '',
        horario2: t.horarioSalida || '',
        horarioPredefinidoInicio: turnoHorarios[t.turno]
          ? turnoHorarios[t.turno].inicio
          : turnoHorarios['1°'].inicio,
        horarioPredefinidoFin: turnoHorarios[t.turno]
          ? turnoHorarios[t.turno].fin
          : turnoHorarios['1°'].fin
      }));

      if (turnosFormateados.length === 0) {
        turnosFormateados.push({
          turno: '1°',
          horario1: '',
          horario2: '',
          horarioPredefinidoInicio: turnoHorarios['1°'].inicio,
          horarioPredefinidoFin: turnoHorarios['1°'].fin
        });
      }

      setFormData({ ...viaje, turnos: turnosFormateados });
    }
  }, [viaje]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Recalcular costoPorKm si cambian "costo" o "distancia"
      if (name === 'costo' || name === 'distancia') {
        const costo = parseFloat(updated.costo);
        const dist = parseFloat(updated.distancia);
        if (!isNaN(costo) && !isNaN(dist) && dist > 0) {
          updated.costoPorKm = (costo / dist).toFixed(2);
        } else {
          updated.costoPorKm = '';
        }
      }
      return updated;
    });
  };

  const handleTurnoChange = (index, campo, valor) => {
    const turnos = [...formData.turnos];
    turnos[index] = { ...turnos[index], [campo]: valor };
    if (campo === 'turno') {
      turnos[index].horarioPredefinidoInicio = turnoHorarios[valor].inicio;
      turnos[index].horarioPredefinidoFin = turnoHorarios[valor].fin;
    }
    setFormData({ ...formData, turnos });
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
          horarioPredefinidoInicio: turnoHorarios['1°'].inicio,
          horarioPredefinidoFin: turnoHorarios['1°'].fin
        }
      ]
    });
  };

  const removeTurno = (index) => {
    const turnos = [...formData.turnos];
    turnos.splice(index, 1);
    setFormData({
      ...formData,
      turnos: turnos.length
        ? turnos
        : [
            {
              turno: '1°',
              horario1: '',
              horario2: '',
              horarioPredefinidoInicio: turnoHorarios['1°'].inicio,
              horarioPredefinidoFin: turnoHorarios['1°'].fin
            }
          ]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const dataToSubmit = { ...formData };
    console.log('Submitting:', dataToSubmit);
    try {
      let result;
      if (dataToSubmit._id) {
        result = await updateViaje(dataToSubmit);
      } else {
        result = await createViaje(dataToSubmit);
      }
      if (onViajeCreated) onViajeCreated(result);

      // Reset form
      setFormData({
        numeroRuta: '',
        nombreCliente: '',
        saleDe: '',
        llegaA: '',
        distancia: '',
        costoPorKm: '',
        costo: '',
        turnos: [
          {
            turno: '1°',
            horario1: '',
            horario2: '',
            horarioPredefinidoInicio: turnoHorarios['1°'].inicio,
            horarioPredefinidoFin: turnoHorarios['1°'].fin
          }
        ]
      });
      alert(dataToSubmit._id ? 'Viaje actualizado con éxito' : 'Viaje creado con éxito');
    } catch (error) {
      console.error('Error al guardar viaje:', error);
      alert('Error al guardar viaje');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.generalContainer}>
      <div className={das.menuContainer}>
        <Menu />
      </div>

      <div className={styles.formContainer}>
        <h2 className={styles.formTitle}>
          {formData._id ? 'Actualizar Viaje' : 'Crear Viaje'}
        </h2>

        <form onSubmit={handleSubmit} className={styles.formContent}>
          {/* Fila 1: 4 campos */}
          <div className={styles.formRow}>
            <div className={styles.formField}>
              <label className={styles.fieldLabel} htmlFor="numeroRuta">
                Número de Ruta
              </label>
              <input
                type="text"
                name="numeroRuta"
                id="numeroRuta"
                value={formData.numeroRuta || ''}
                onChange={handleChange}
                className={styles.formInput}
                required
              />
            </div>
            <div className={styles.formField}>
              <label className={styles.fieldLabel} htmlFor="nombreCliente">
                Nombre Cliente
              </label>
              <input
                type="text"
                name="nombreCliente"
                id="nombreCliente"
                value={formData.nombreCliente || ''}
                onChange={handleChange}
                className={styles.formInput}
                required
              />
            </div>
            <div className={styles.formField}>
              <label className={styles.fieldLabel} htmlFor="saleDe">
                Sale De
              </label>
              <input
                type="text"
                name="saleDe"
                id="saleDe"
                value={formData.saleDe || ''}
                onChange={handleChange}
                className={styles.formInput}
                required
              />
            </div>
            <div className={styles.formField}>
              <label className={styles.fieldLabel} htmlFor="llegaA">
                Llega A
              </label>
              <input
                type="text"
                name="llegaA"
                id="llegaA"
                value={formData.llegaA || ''}
                onChange={handleChange}
                className={styles.formInput}
                required
              />
            </div>
          </div>

          {/* Fila 2: 3 campos */}
          <div className={styles.formRow}>
            <div className={styles.formField}>
              <label className={styles.fieldLabel} htmlFor="distancia">
                Distancia Recorrida (km)
              </label>
              <input
                type="number"
                name="distancia"
                id="distancia"
                value={formData.distancia || ''}
                onChange={handleChange}
                className={styles.formInput}
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className={styles.formField}>
              <label className={styles.fieldLabel} htmlFor="costoPorKm">
                Costo por Km ($)
              </label>
              <input
                type="text"
                name="costoPorKm"
                id="costoPorKm"
                value={formData.costoPorKm || ''}
                className={styles.formInput}
                readOnly
              />
            </div>
            <div className={styles.formField}>
              <label className={styles.fieldLabel} htmlFor="costo">
                Costo ($)
              </label>
              <input
                type="number"
                name="costo"
                id="costo"
                value={formData.costo || ''}
                onChange={handleChange}
                className={styles.formInput}
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          {/* Fila 3: Turnos */}
          <div className={styles.turnoSection}>
            <div className={styles.turnoHeaderRow}>
              <div className={styles.turnoHeader}>Turno</div>
              <div className={styles.turnoHeader}>Horario 1</div>
              <div className={styles.turnoHeader}>Horario 2</div>
              <div className={styles.turnoHeader} style={{ textAlign: 'center' }}>
                Acción
              </div>
            </div>

            {formData.turnos.map((t, index) => (
              <div className={styles.formRow} key={index}>
                <div className={styles.formField}>
                  <select
                    value={t.turno}
                    onChange={(e) => handleTurnoChange(index, 'turno', e.target.value)}
                    className={styles.formInput}
                  >
                    {['1°', '2°', '3°', '4°', '5°'].map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formField}>
                  <input
                    type="text"
                    value={t.horario1}
                    onChange={(e) => handleTurnoChange(index, 'horario1', e.target.value)}
                    className={styles.formInput}
                    placeholder={`Ej: ${t.horarioPredefinidoInicio}`}
                  />
                </div>
                <div className={styles.formField}>
                  <input
                    type="text"
                    value={t.horario2}
                    onChange={(e) => handleTurnoChange(index, 'horario2', e.target.value)}
                    className={styles.formInput}
                    placeholder={`Ej: ${t.horarioPredefinidoFin}`}
                  />
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
              {isSubmitting ? 'CREANDO...' : formData._id ? 'ACTUALIZAR VIAJE' : 'CREAR VIAJE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormViaje;

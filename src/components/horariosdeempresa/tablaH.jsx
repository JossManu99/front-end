import React, { useState, useEffect } from 'react';
import { getViajes } from '../../services/viaje/viajeService';
import { crearTablarol, actualizarTablarol } from '../../services/tablarol';
import styles from './ViajeFormT.module.css'; 
import das from '../header/Dashboard.module.css'; // Ajusta si no lo usas
import Menu from '../../components/header/DashboardHeader'; // Ajusta si no lo usas
import { useNavigate } from 'react-router-dom';

const ViajeFormT = ({ tablarolEdit, setEditTablarol }) => {
  const navigate = useNavigate();
  const [rutas, setRutas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [turnosActivos, setTurnosActivos] = useState({});
  const [formData, setFormData] = useState({
    numeroCambio: '',
    diaInicio: '',
    mesInicio: '',
    anioInicio: '',
    elaboradoPor: '',
    rutas: []
  });

  useEffect(() => {
    const cargarRutas = async () => {
      setCargando(true);
      try {
        const viajesData = await getViajes();
        setRutas(viajesData.sort((a, b) => a.numeroRuta - b.numeroRuta));
      } catch (error) {
        console.error('❌ Error al cargar las rutas:', error);
        alert('❌ No se pudieron cargar las rutas');
      } finally {
        setCargando(false);
      }
    };
    cargarRutas();
  }, []);

  useEffect(() => {
    if (tablarolEdit) {
      setFormData({
        numeroCambio: tablarolEdit.numeroCambio?.toString() || '',
        diaInicio: tablarolEdit.diaInicio?.toString() || '',
        mesInicio: tablarolEdit.mesInicio || '',
        anioInicio: tablarolEdit.anioInicio?.toString() || '',
        elaboradoPor: tablarolEdit.elaboradoPor || '',
        rutas: tablarolEdit.rutas || []
      });

      const turnosMap = {};
      tablarolEdit.rutas.forEach(ruta => {
        ruta.turnos.forEach((_, index) => {
          turnosMap[`${ruta.numeroRuta}-${index}`] = true;
        });
      });
      setTurnosActivos(turnosMap);
    }
  }, [tablarolEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.numeroCambio ||
      !formData.diaInicio ||
      !formData.mesInicio ||
      !formData.anioInicio ||
      !formData.elaboradoPor
    ) {
      alert('⚠️ Por favor, complete todos los campos obligatorios.');
      return;
    }

    // Selecciona solo los turnos marcados como activos
    const turnosSeleccionados = rutas
      .map(ruta => ({
        numeroRuta: ruta.numeroRuta,
        nombreCliente: ruta.nombreCliente,
        saleDe: ruta.saleDe,
        llegaA: ruta.llegaA,
        costo: ruta.costo,
        turnos: ruta.turnos.filter((_, index) => turnosActivos[`${ruta.numeroRuta}-${index}`])
      }))
      .filter(ruta => ruta.turnos.length > 0);

    if (turnosSeleccionados.length === 0) {
      alert('⚠️ Debes seleccionar al menos un turno.');
      return;
    }

    const data = {
      ...formData,
      numeroCambio: parseInt(formData.numeroCambio, 10),
      diaInicio: parseInt(formData.diaInicio, 10),
      anioInicio: parseInt(formData.anioInicio, 10),
      rutas: turnosSeleccionados
    };

    try {
      setCargando(true);
      if (tablarolEdit) {
        await actualizarTablarol(tablarolEdit._id, data);
        alert('✅ Datos actualizados correctamente.');
      } else {
        await crearTablarol(data);
        alert('✅ Datos guardados correctamente.');
      }
      if (typeof setEditTablarol === 'function') {
        setEditTablarol(null);
      }
      navigate('/vertablaroles');
    } catch (error) {
      console.error("❌ Error al guardar:", error);
      alert(`❌ Error al ${tablarolEdit ? 'actualizar' : 'guardar'} los datos.`);
    } finally {
      setCargando(false);
    }
  };

  // Genera las opciones para los select
  const generateOptions = (start, end) => {
    const options = [];
    for (let i = start; i <= end; i++) {
      options.push(i);
    }
    return options;
  };

  const cambioOptions = generateOptions(1, 12);
  const diaOptions = generateOptions(1, 30);

  const handleCancel = () => {
    if (typeof setEditTablarol === 'function') {
      setEditTablarol(null);
    }
    navigate('/dashboard/tablaroles');
  };

  return (
    <div className={styles.mainContainer}>
      {/* Menú superior (opcional) */}
      <div >
        <Menu />
      </div>

      <div className={styles.container}>
        <h2 className={styles.title}>
          {tablarolEdit ? '📝 Editar' : '📋 Crear'} Tabla de roles
        </h2>

        <form onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label># Cambio</label>
              <select
                className={styles.select}
                name="numeroCambio"
                value={formData.numeroCambio}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona un cambio</option>
                {cambioOptions.map(num => (
                  <option key={`cambio-${num}`} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Día de inicio</label>
              <select
                className={styles.select}
                name="diaInicio"
                value={formData.diaInicio}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona un día</option>
                {diaOptions.map(dia => (
                  <option key={`dia-${dia}`} value={dia}>
                    {dia}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Mes de inicio</label>
              <select
                className={styles.select}
                name="mesInicio"
                value={formData.mesInicio}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona un mes</option>
                {[
                  'Enero',
                  'Febrero',
                  'Marzo',
                  'Abril',
                  'Mayo',
                  'Junio',
                  'Julio',
                  'Agosto',
                  'Septiembre',
                  'Octubre',
                  'Noviembre',
                  'Diciembre'
                ].map(mes => (
                  <option key={mes} value={mes}>
                    {mes}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Año de inicio</label>
              <input
                className={styles.input}
                type="number"
                name="anioInicio"
                value={formData.anioInicio}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Elaborado por</label>
              <input
                className={styles.input}
                type="text"
                name="elaboradoPor"
                value={formData.elaboradoPor}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <h3 className={styles.subTitle}>📍 Selecciona las Rutas y Turnos</h3>

          {rutas.map((ruta) => (
            <div key={ruta.numeroRuta} className={styles.routeCard}>
              <div className={styles.routeHeader}>
                <div>
                  <span className={styles.routeTitle}>
                    Ruta {ruta.numeroRuta} - {ruta.nombreCliente}
                  </span>
                  <p className={styles.routeDetails}>
                    <strong>Origen:</strong> {ruta.saleDe} &nbsp;|&nbsp; 
                    <strong>Destino:</strong> {ruta.llegaA}&nbsp;|&nbsp; 
                    <strong>costo:$</strong> {ruta.costo}
                  </p>
                </div>
                <div className={styles.routeCost}>
                  Costo: {ruta.costo}
                </div>
              </div>

              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Turno</th>
                      <th>Horario Entrada</th>
                      <th>Horario Salida</th>
                      <th>Activo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ruta.turnos.map((turno, index) => (
                      <tr key={`${ruta.numeroRuta}-${index}`}>
                        <td>{turno.turno}</td>
                        <td>{turno.horarioEntrada}</td>
                        <td>{turno.horarioSalida}</td>
                        <td>
                          <input
                            type="checkbox"
                            checked={turnosActivos[`${ruta.numeroRuta}-${index}`] || false}
                            onChange={() =>
                              setTurnosActivos(prev => ({
                                ...prev,
                                [`${ruta.numeroRuta}-${index}`]:
                                  !prev[`${ruta.numeroRuta}-${index}`]
                              }))
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          <div className={styles.actionButtons}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={cargando}
            >
              {cargando ? 'Guardando...' : tablarolEdit ? 'Actualizar' : 'Guardar'}
            </button>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleCancel}
              disabled={cargando}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ViajeFormT;

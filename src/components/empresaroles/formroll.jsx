import React, { useState, useEffect } from 'react';
import { createEmpresaRol, getEmpresasRoles } from '../../services/empresaroles';
import { obtenerRutas } from '../../services/rutaServiceV';
import { getViajes } from '../../services/viaje/viajeService';
import styles from './formroll.module.css';

const CreateEmpresaRolForm = () => {
  const [empresas, setEmpresas] = useState([]);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState('');
  const [turnosDisponibles, setTurnosDisponibles] = useState([]);
  const [turnosSeleccionados, setTurnosSeleccionados] = useState([]);
  const [turnoActivo, setTurnoActivo] = useState(null);
  const [rutasDisponibles, setRutasDisponibles] = useState([]);
  const [rutasSeleccionadas, setRutasSeleccionadas] = useState([]);
  const [error, setError] = useState(null);
  const [mostrarDetallesTurno, setMostrarDetallesTurno] = useState(false);
  const [usuarioNombre, setUsuarioNombre] = useState('');
  const [fechaCreacion, setFechaCreacion] = useState(new Date().toISOString());

  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        const data = await obtenerRutas();
        console.log('Empresas obtenidas:', data);
        const empresasTransformadas = data.map(ruta => ({
          _id: ruta._id,
          empresa: ruta.nombreCliente,
          turnos: ruta.turnos.map((turno, index) => ({
            turno: turno,
            horario: ruta.horarios[index] || "Sin horario"
          }))
        }));
        setEmpresas(empresasTransformadas);
      } catch (error) {
        console.error('Error al obtener empresas:', error);
      }
    };

    const fetchRutas = async () => {
      try {
        const data = await getViajes();
        console.log('Rutas obtenidas:', data);
        setRutasDisponibles(data.map((viaje) => ({
          ruta: viaje.numeroRuta, 
          nombre: viaje.nombreRuta, 
        })));
      } catch (error) {
        console.error('Error al obtener rutas:', error);
      }
    };

    fetchEmpresas();
    fetchRutas();
  }, []);

  const handleEmpresaChange = (e) => {
    const empresa = e.target.value;
    setEmpresaSeleccionada(empresa);
    setTurnosSeleccionados([]);
    setTurnoActivo(null);
    setMostrarDetallesTurno(false);

    const empresaEncontrada = empresas.find((emp) => emp.empresa === empresa);
    setTurnosDisponibles(empresaEncontrada ? empresaEncontrada.turnos : []);
  };

  const handleRutaChange = (e) => {
    const { options } = e.target;
    const seleccionados = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        seleccionados.push(options[i].value);
      }
    }
    setRutasSeleccionadas(seleccionados);
  };

  const toggleTurnoSelection = (turno) => {
    if (turnosSeleccionados.includes(turno)) {
      setTurnosSeleccionados(turnosSeleccionados.filter(t => t !== turno));
    } else {
      setTurnosSeleccionados([...turnosSeleccionados, turno]);
    }
  };

  const mostrarHorariosTurno = (turno) => {
    setTurnoActivo(turno);
    setMostrarDetallesTurno(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const empresaRolData = {
      empresarol: empresaSeleccionada,
      turnos: turnosSeleccionados,
      rutas: rutasSeleccionadas,
      fechaCreacion: fechaCreacion,
      elaboradoPor: usuarioNombre,
    };

    try {
      await createEmpresaRol(empresaRolData);
      alert('Empresa creada con éxito');
      
      // Limpiar el formulario después de éxito
      setEmpresaSeleccionada('');
      setTurnosSeleccionados([]);
      setRutasSeleccionadas([]);
      setUsuarioNombre('');
      setFechaCreacion(new Date().toISOString());
      setError(null);
      setMostrarDetallesTurno(false);
      setTurnoActivo(null);
    } catch (error) {
      setError('Error al crear la empresa. Verifica los datos.');
    }
  };

  const renderTurnosTable = () => {
    if (!empresaSeleccionada || !turnosDisponibles.length) return null;
    
    return (
      <div className={styles.turnosTableContainer}>
        <table className={styles.turnosTable}>
          <thead>
            <tr>
              <th className={styles.tableHeader}>Turnos</th>
              {turnosDisponibles.map((turno) => (
                <th key={turno.turno} className={styles.tableHeader}>
                  {turno.turno}°
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={styles.tableCell}>Entrada</td>
              {turnosDisponibles.map((turno) => (
                <td 
                  key={`entrada-${turno.turno}`} 
                  className={`${styles.tableCell} ${turnosSeleccionados.includes(turno.turno) ? styles.selectedTurno : ''}`}
                  onClick={() => toggleTurnoSelection(turno.turno)}
                  style={{ backgroundColor: turnosSeleccionados.includes(turno.turno) ? '#FFA500' : 'transparent' }}
                >
                  {turno.horario}
                </td>
              ))}
            </tr>
            <tr>
              <td className={styles.tableCell}></td>
              {turnosDisponibles.map((turno) => (
                <td 
                  key={`action-${turno.turno}`}
                  className={styles.tableCell}
                >
                  {turnosSeleccionados.includes(turno.turno) && (
                    <button 
                      type="button" 
                      onClick={() => mostrarHorariosTurno(turno)}
                      className={styles.showTurnoButton}
                    >
                      Mostrar Turno
                    </button>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.Container}>
        <h2>Crear Empresa</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          {/* Selección de Empresa */}
          <div>
            <label>Selecciona una Empresa:</label>
            <select value={empresaSeleccionada} onChange={handleEmpresaChange} required>
              <option value="">Seleccione una empresa</option>
              {empresas.map((emp) => (
                <option key={emp._id} value={emp.empresa}>
                  {emp.empresa}
                </option>
              ))}
            </select>
          </div>

          {/* Tabla de Turnos */}
          {renderTurnosTable()}

          {/* Mostrar horarios del turno seleccionado */}
          {mostrarDetallesTurno && turnoActivo && (
            <div className={styles.turnoDetails}>
              <h3>Horarios del Turno {turnoActivo.turno}</h3>
              <table className={styles.horarioTable}>
                <thead>
                  <tr>
                    <th>Turno</th>
                    <th>Horario</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{turnoActivo.turno}°</td>
                    <td>{turnoActivo.horario}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Selección de Rutas */}
          <div>
            <label>Selecciona las Rutas:</label>
            <select multiple value={rutasSeleccionadas} onChange={handleRutaChange} required>
              {rutasDisponibles.map((ruta, index) => (
                <option key={index} value={ruta.ruta}>
                  {ruta.nombre} (Ruta {ruta.ruta})
                </option>
              ))}
            </select>
          </div>

          {/* Nombre del Usuario */}
          <div>
            <label>Creado por:</label>
            <input 
              type="text" 
              value={usuarioNombre} 
              onChange={(e) => setUsuarioNombre(e.target.value)} 
              placeholder="Ingresa tu nombre"
              required 
            />
          </div>

          {/* Fecha de Creación */}
          <div>
            <label>Fecha de Creación:</label>
            <input type="text" value={fechaCreacion} readOnly />
          </div>

          {/* Botón para Enviar el formulario */}
          <button type="submit">Crear Empresa</button>
        </form>
      </div>
    </div>
  );
};

export default CreateEmpresaRolForm;
import React, { useState, useEffect } from "react";
import { getTurnos } from "../../services/clientesServive";
import axios from "axios";
import styles from './Turnos.module.css';

const TurnosModal = () => {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [empresaEditando, setEmpresaEditando] = useState(null);

  useEffect(() => {
    fetchTurnos();
  }, []);

  const fetchTurnos = async () => {
    try {
      const data = await getTurnos();
      setEmpresas(data);
    } catch (error) {
      console.error("Error al obtener los turnos:", error);
      setError("Error al cargar los turnos. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditEmpresa = async (empresaId) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/empresas/${empresaId}`);
      setEmpresaEditando(response.data);
    } catch (error) {
      console.error("Error al obtener la empresa:", error);
      setError("Error al cargar la empresa.");
    }
  };

  const handleDeleteEmpresa = async (empresaId) => {
    try {
      await axios.delete(`http://localhost:3000/api/empresas/${empresaId}`);
      alert("Empresa eliminada correctamente.");
      setEmpresas(empresas.filter((empresa) => empresa._id !== empresaId));
    } catch (error) {
      console.error("Error al eliminar la empresa:", error);
      setError("Error al eliminar la empresa.");
    }
  };

  const handleDeleteTurno = (turnoIndex) => {
    const nuevosTurnos = empresaEditando.turnos.filter((_, index) => index !== turnoIndex);
    setEmpresaEditando({ ...empresaEditando, turnos: nuevosTurnos });
  };

  const handleChange = (e) => {
    setEmpresaEditando({ ...empresaEditando, [e.target.name]: e.target.value });
  };

  const handleTurnoChange = (e, turnoIndex, campo) => {
    const nuevosTurnos = [...empresaEditando.turnos];
    if (campo === 'turno' || campo === 'clave') {
      nuevosTurnos[turnoIndex][campo] = e.target.value;
    } else {
      nuevosTurnos[turnoIndex].horarios[campo] = e.target.value;
    }
    setEmpresaEditando({ ...empresaEditando, turnos: nuevosTurnos });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:3000/api/empresas/${empresaEditando._id}`, empresaEditando);
      alert("Empresa actualizada correctamente.");
      setEmpresaEditando(null);
      fetchTurnos();
    } catch (error) {
      console.error("Error al actualizar la empresa:", error);
      setError("Error al actualizar la empresa.");
    }
  };

  if (loading) return <p className={styles.loading}>Cargando...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.turnosContainer}>
      <h1>Turnos de Empresas</h1>

      {empresaEditando ? (
        <div className={styles.editForm}>
          <h2>Editar Empresa</h2>
          <form onSubmit={handleSubmit}>
            <label>Nombre de la Empresa:</label>
            <input
              type="text"
              name="empresa"
              value={empresaEditando.empresa}
              onChange={handleChange}
            />

            <h3>Editar Turnos</h3>
            {empresaEditando.turnos.map((turno, turnoIndex) => (
              <div key={turnoIndex} className={styles.turnoEdit}>
                <div className={styles.turnoHeader}>
                  <span>Turno: </span>
                  <input
                    type="text"
                    value={turno.turno}
                    onChange={(e) => handleTurnoChange(e, turnoIndex, 'turno')}
                    className={styles.turnoInput}
                  />
                  <span> (Clave: </span>
                  <input
                    type="text"
                    value={turno.clave}
                    onChange={(e) => handleTurnoChange(e, turnoIndex, 'clave')}
                    className={styles.turnoInput}
                  />
                  <span>)</span>
                </div>
                <div className={styles.horarios}>
                  {["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"].map(
                    (dia) => (
                      <div key={dia}>
                        <label>{dia.charAt(0).toUpperCase() + dia.slice(1)}:</label>
                        <input
                          type="text"
                          value={turno.horarios[dia] || ""}
                          onChange={(e) => handleTurnoChange(e, turnoIndex, dia)}
                        />
                      </div>
                    )
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteTurno(turnoIndex)}
                  className={styles.deleteTurnoBtn}
                >
                  Eliminar Turno
                </button>
              </div>
            ))}

            <div className={styles.formButtons}>
              <button type="submit" className={styles.saveBtn}>Guardar Cambios</button>
              <button type="button" onClick={() => setEmpresaEditando(null)} className={styles.cancelBtn}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      ) : (
        empresas.length > 0 ? (
          empresas.map((empresa) => (
            <div key={empresa._id} className={styles.turnosWrapper}>
              <h2>{empresa.empresa}</h2>
              <table className={styles.turnosTable}>
                <thead>
                  <tr>
                    <th>Clave</th>
                    <th>Turno</th>
                    <th>Lunes</th>
                    <th>Martes</th>
                    <th>Miércoles</th>
                    <th>Jueves</th>
                    <th>Viernes</th>
                    <th>Sábado</th>
                    <th>Domingo</th>
                  </tr>
                </thead>
                <tbody>
                  {empresa.turnos.length > 0 ? (
                    empresa.turnos.map((turno) => (
                      <tr key={turno.clave}>
                        <td>{turno.clave}</td>
                        <td>{turno.turno}</td>
                        <td>{turno.horarios.lunes}</td>
                        <td>{turno.horarios.martes}</td>
                        <td>{turno.horarios.miercoles}</td>
                        <td>{turno.horarios.jueves}</td>
                        <td>{turno.horarios.viernes}</td>
                        <td>{turno.horarios.sabado}</td>
                        <td>{turno.horarios.domingo}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9">No hay turnos disponibles.</td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className={styles.empresaActions}>
                <button onClick={() => handleEditEmpresa(empresa._id)} className={styles.editBtn}>
                  Editar Empresa
                </button>
                <button onClick={() => handleDeleteEmpresa(empresa._id)} className={styles.deleteBtn}>
                  Eliminar Empresa
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className={styles.noEmpresas}>No hay empresas disponibles.</p>
        )
      )}
    </div>
  );
};

export default TurnosModal;

import React, { useEffect, useState } from 'react';
import { getMantenimientos, deleteMantenimiento } from '../../services/manttoService';
import styles from './MantenimientosList.module.css';
import MaintenanceForm from '../mantenimiento/MaintenanceForm';
import Menu from '../../components/header/DashboardHeader';

const MantenimientosList = () => {
  const [mantenimientos, setMantenimientos] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    cargarMantenimientos();
  }, []);

  const cargarMantenimientos = async () => {
    try {
      const data = await getMantenimientos();
      if (data?.success && Array.isArray(data.data)) {
        setMantenimientos(data.data);
      } else if (Array.isArray(data)) {
        setMantenimientos(data);
      } else {
        setMantenimientos([]);
      }
    } catch (error) {
      console.error('Error al cargar mantenimientos:', error);
    }
  };

  const handleEditar = async (mntId) => {
    setEditandoId(mntId);
    setShowForm(true);
  };

  const handleCancelarEdicion = () => {
    setEditandoId(null);
    setShowForm(false);
    cargarMantenimientos();
  };

  const handleEliminar = async (mntId) => {
    if (window.confirm('¿Eliminar este registro?')) {
      try {
        await deleteMantenimiento(mntId);
        cargarMantenimientos();
      } catch (error) {
        console.error('Error al eliminar mantenimiento:', error);
      }
    }
  };

  return (
    <div className={styles.mainContainer}>
      <div>
        <Menu />
      </div>

      <div className={styles.container}>
        <h2 className={styles.title}>Lista de Mantenimientos</h2>

        {showForm && editandoId ? (
          <MaintenanceForm
            isEditing={true}
            mantenimientoId={editandoId}
            onCancel={handleCancelarEdicion}
            onSuccess={handleCancelarEdicion}
          />
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th># Económico</th>
                  <th>Operador</th>
                  <th>Kilometraje</th>
                  <th>Falla</th>
                  <th>Solución</th>
                  <th>Asignado</th>
                  <th>Total</th>
                  <th>Refacciones</th> {/* Nueva columna */}
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {mantenimientos.length > 0 ? (
                  mantenimientos.map((mnt) => (
                    <tr key={mnt._id}>
                      <td>{mnt.fecha}</td>
                      <td>{mnt.hora}</td>
                      <td>{mnt.numeroEconomico}</td>
                      <td>{mnt.nombreOperador}</td>
                      <td>{mnt.kilometraje}</td>
                      <td>{mnt.falla}</td>
                      <td>{mnt.solucion}</td>
                      <td>{mnt.asignado}</td>
                      <td>${parseFloat(mnt.total || 0).toFixed(2)}</td>
                      <td>
                        {mnt.refacciones && mnt.refacciones.length > 0
                          ? mnt.refacciones.map((ref, index) => (
                              <span key={index}>
                                {ref.nombre}{index < mnt.refacciones.length - 1 && ', '}
                              </span>
                            ))
                          : 'N/A'}
                      </td>
                      <td>
                        <div className={styles.btnContainer}>
                          <button
                            className={styles.btnEdit}
                            onClick={() => handleEditar(mnt._id)}
                          >
                            Editar
                          </button>
                          <button
                            className={styles.btnDelete}
                            onClick={() => handleEliminar(mnt._id)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" className={styles.noData}>
                      No hay registros de mantenimiento.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MantenimientosList;

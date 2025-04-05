import React, { useEffect, useState } from 'react';
import {
  obtenerRefacciones,
  actualizarRefaccion,
  eliminarRefaccion,
} from '../../services/refaccionService';
import RefactionForm from '../mantenimiento/FormularioRefaccion'; // Update this path as needed
import styles from './RefaccionesComponent.module.css';
import MaintenanceForm from '../mantenimiento/MaintenanceForm';
import Menu from '../../components/header/DashboardHeader';

const RefaccionesComponent = () => {
  const [refacciones, setRefacciones] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [selectedRefaccion, setSelectedRefaccion] = useState(null);

  useEffect(() => {
    cargarRefacciones();
  }, []);

  const cargarRefacciones = async () => {
    try {
      const data = await obtenerRefacciones();
      setRefacciones(data);
    } catch (error) {
      console.error('Error al cargar las refacciones:', error);
    }
  };

  const handleEditar = (ref) => {
    setEditandoId(ref._id);
    setSelectedRefaccion(ref);
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Está seguro que desea eliminar esta refacción?')) {
      try {
        await eliminarRefaccion(id);
        cargarRefacciones();
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    }
  };

  const handleEditComplete = () => {
    setEditandoId(null);
    setSelectedRefaccion(null);
    cargarRefacciones();
  };

  // Si estamos en modo edición, mostrar el formulario
  if (editandoId) {
    return (
      <RefactionForm 
        isEditing={true} 
        refaccionId={editandoId} 
        initialData={selectedRefaccion}
        onEditComplete={handleEditComplete}
      />
    );
  }

  return (
    <div className={styles.mainContainer}>

    <div >
                <Menu />
              </div>
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Refacciones Registradas</h2>
      </div>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Cantidad</th>
              <th>Proveedor</th>
              <th>Costo Individual</th>
              <th>Costo Total</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {refacciones.length > 0 ? (
              refacciones.map((ref) => (
                <tr key={ref._id}>
                  <td>{ref.codigo}</td>
                  <td>{ref.nombreRefaccion}</td>
                  <td>{ref.cantidad}</td>
                  <td>{ref.nombreProveedor}</td>
                  <td>{`$${ref.costoIndividual}`}</td>
                  <td>{`$${ref.costoTotal}`}</td>
                  <td>{ref.descripcion || '-'}</td>
                  <td className={styles.actions}>
                    <button 
                      className={`${styles.button} ${styles.editButton}`} 
                      onClick={() => handleEditar(ref)}
                    >
                      Editar
                    </button>
                    <button 
                      className={`${styles.button} ${styles.deleteButton}`} 
                      onClick={() => handleEliminar(ref._id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className={styles.emptyMessage}>
                  No hay refacciones registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
};

export default RefaccionesComponent;
import React, { useEffect, useState } from 'react';
import { getPropietarios, deletePropietario } from '../../services/propietarioService';
import styles from './ListaPropietarios.module.css';
import FormularioPropietario from '../autobuses/propietarioform';
import Menu from '../../components/header/DashboardHeader';
import das from '../header/Dashboard.module.css';

const ListaPropietarios = () => {
  const [propietarios, setPropietarios] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    cargarPropietarios();
  }, []);

  const cargarPropietarios = async () => {
    try {
      const data = await getPropietarios();
      if (data?.success && Array.isArray(data.data)) {
        setPropietarios(data.data);
      } else if (Array.isArray(data)) {
        setPropietarios(data);
      } else {
        setPropietarios([]);
      }
    } catch (error) {
      console.error('Error al cargar propietarios:', error);
    }
  };

  const handleEditar = (prop) => {
    setInitialData(prop);
    setMostrarFormulario(true);
  };

  const handleEliminar = async (id) => {
    if (confirm('¿Eliminar este propietario?')) {
      try {
        await deletePropietario(id);
        cargarPropietarios();
      } catch (error) {
        console.error('Error al eliminar propietario:', error);
      }
    }
  };

  // Se cierra el formulario y se recarga la lista
  const handleCerrarFormulario = () => {
    setMostrarFormulario(false);
    setInitialData(null);
    cargarPropietarios();
  };

  return (
     <div className={styles.mainContainer}>
      
        <div className={das.menuContainer}>
          <Menu />
        </div>
      

    <div className={styles.container}>
      <h2 className={styles.title}>Lista de Propietarios</h2>
      {mostrarFormulario ? (
        <FormularioPropietario initialData={initialData} onClose={handleCerrarFormulario} />
      ) : (
        <table className={styles.table}>
          <thead className={styles.tableHeader}>
            <tr>
              <th>Nombre</th>
              <th>RFC</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {propietarios.length > 0 ? (
              propietarios.map((prop) => (
                <tr key={prop._id}>
                  <td>{prop.nombrePropietario}</td>
                  <td>{prop.rfc}</td>
                  <td>
                    <div className={styles.btnContainer}>
                      <button
                        className={styles.btnEdit}
                        onClick={() => handleEditar(prop)}
                      >
                        Editar
                      </button>
                      <button
                        className={styles.btnDelete}
                        onClick={() => handleEliminar(prop._id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className={styles.noData}>
                  No hay propietarios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
    </div>
  );
};

export default ListaPropietarios;

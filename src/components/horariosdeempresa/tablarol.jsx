import React, { useState, useEffect } from 'react';
import { obtenertablarol, eliminarTablarol } from '../../services/tablarol';
import styles from './Tablaroles.module.css'; // Estilos propios
import das from '../header/Dashboard.module.css'; // Estilos del menú
import Menu from '../../components/header/DashboardHeader';
import ViajeFormT from '../../components/horariosdeempresa/tablaH';

const Tablaroles = () => {
  const [tablaroles, setTablaroles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editTablarol, setEditTablarol] = useState(null);

  useEffect(() => {
    fetchTablaroles();
  }, []);

  const fetchTablaroles = async () => {
    try {
      setLoading(true);
      const data = await obtenertablarol();
      console.log("📡 Datos recibidos en el componente:", data);

      if (Array.isArray(data) && data.length > 0) {
        const sortedData = data
          .map(tablarol => ({
            ...tablarol,
            rutas: tablarol.rutas.sort((a, b) => parseInt(a.numeroRuta) - parseInt(b.numeroRuta))
          }))
          .sort((a, b) => parseInt(a.numeroCambio) - parseInt(b.numeroCambio));

        setTablaroles(sortedData);
      } else {
        setError("⚠️ No hay datos disponibles.");
      }
    } catch (err) {
      console.error("❌ Error en el componente:", err);
      setError('❌ No se pudieron obtener los tablaroles');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este registro?')) {
      try {
        await eliminarTablarol(id);
        setTablaroles(prev => prev.filter(item => item._id !== id));
        alert('✅ Registro eliminado correctamente');
      } catch (error) {
        console.error("❌ Error al eliminar:", error);
        alert('❌ Error al eliminar el registro');
      }
    }
  };

  const handleEdit = (tablarol) => {
    setEditTablarol(tablarol);
  };

  // Mostrar solo el formulario en modo edición
  if (editTablarol) {
    return (
      <div className={styles.mainContainer}>
        <ViajeFormT
          tablarolEdit={editTablarol}
          setEditTablarol={() => {
            setEditTablarol(null); // Salir del modo edición
            fetchTablaroles();     // Recargar la lista al terminar
          }}
        />
      </div>
    );
  }

  // Mostrar lista si no está en modo edición
  if (loading) return <p className={styles.loadingText}>⏳ Cargando datos...</p>;
  if (error) return <p className={styles.errorText}>{error}</p>;
  if (tablaroles.length === 0) return <p className={styles.emptyText}>⚠️ No hay datos disponibles.</p>;

  return (
    <div className={styles.mainContainer}>
      <div className={das.menuContainer}>
        <Menu />
      </div>

      <div className={styles.container}>
        <h1 className={styles.heading}>📋 Lista de Tablaroles</h1>

        {tablaroles.map(tablarol => (
          <div key={tablarol._id} className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <h2 className={styles.tableTitle}>
                🆔 Cambio: {tablarol.numeroCambio || "N/A"}
              </h2>
            </div>

            {tablarol.rutas.map((ruta, index) => (
              <div key={`${tablarol._id}-${index}`} className={styles.routeContainer}>
                <h3 className={styles.routeTitle}>
                  Ruta: {ruta.numeroRuta || "N/A"} - Cliente: {ruta.nombreCliente || "N/A"}
                </h3>
                <div className={styles.tableContainer}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Turno</th>
                        <th>Horario Entrada</th>
                        <th>Horario Salida</th>
                        <th>Ruta Salida</th>
                        <th>Ruta Destino</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ruta.turnos && ruta.turnos.length > 0 ? (
                        ruta.turnos.map((turno, i) => (
                          <tr key={`${ruta.numeroRuta}-${i}`}>
                            <td>{turno.turno || "N/A"}</td>
                            <td>{turno.horarioEntrada || "N/A"}</td>
                            <td>{turno.horarioSalida || "N/A"}</td>
                            <td>{turno.horarioinicio_jordana_salidaOrigen || "N/A"}</td>
                            <td>{turno.horarioinicio_jornada_llegada_a_Destino || "N/A"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className={styles.emptyCell}>
                            ⚠️ No hay turnos disponibles.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            <div className={styles.buttonGroup}>
              <button onClick={() => handleEdit(tablarol)} className={styles.editButton}>
                ✏️ Editar
              </button>
              <button onClick={() => handleDelete(tablarol._id)} className={styles.deleteButton}>
                🗑️ Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tablaroles;

import React, { useState, useEffect } from 'react';
import {
  tbfObtenerTablarolesTbf,
  tbfEliminarTablarolTbf
} from '../../services/tbfService';
import TablarolForm from '../creacionderoles/TablarolForm'; // Asegúrate de ajustar la ruta de importación
import styles from './TablaRolTbfComponent.module.css';
import Menu from '../../components/header/DashboardHeader';


const TablaRolTbfComponent = () => {
  const [tablasRol, setTablasRol] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tablaSeleccionada, setTablaSeleccionada] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  // Modo de visualización: "lista", "detalle" o "actualizar"
  const [modo, setModo] = useState('lista');

  useEffect(() => {
    const cargarTablasRol = async () => {
      try {
        setLoading(true);
        const data = await tbfObtenerTablarolesTbf();
        // Ordenar por número de cambio
        const tablasOrdenadas = data.sort((a, b) => Number(a.numeroCambio) - Number(b.numeroCambio));
        setTablasRol(tablasOrdenadas);
      } catch (err) {
        setError('Error al cargar las tablas de rol: ' + (err.message || 'Error desconocido'));
      } finally {
        setLoading(false);
      }
    };
    cargarTablasRol();
  }, []);

  // Cambia al modo detalle
  const verDetalleTabla = (tabla) => {
    setTablaSeleccionada(tabla);
    setModo('detalle');
  };

  // Vuelve a la vista de lista
  const volverALista = () => {
    setTablaSeleccionada(null);
    setModo('lista');
  };

  // Eliminar la tabla
  const eliminarTabla = async (tabla) => {
    if (!window.confirm(`¿Estás seguro de eliminar la Tabla de Rol #${tabla.numeroCambio}?`)) return;
    try {
      await tbfEliminarTablarolTbf(tabla._id);
      setTablasRol((prev) => prev.filter((t) => t._id !== tabla._id));
      // Si la tabla que se elimina está seleccionada, volvemos a la lista
      if (tablaSeleccionada && tablaSeleccionada._id === tabla._id) {
        volverALista();
      }
    } catch (err) {
      alert('Error al eliminar la tabla: ' + (err.message || 'Error desconocido'));
    }
  };

  // Actualizar la tabla (modo edición)
  const actualizarTabla = (tabla) => {
    setTablaSeleccionada(tabla);
    setModo('actualizar');
  };

  const handleBusquedaChange = (e) => {
    setBusqueda(e.target.value);
  };

  // Filtrado de tablas según la búsqueda
  const tablasFiltradas = tablasRol.filter(
    (tabla) =>
      tabla.numeroCambio.toString().includes(busqueda) ||
      tabla.elaboradoPor?.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Componente interno para mostrar detalles de UNA ruta
  const DetalleRuta = ({ ruta }) => {
    // Creamos un array "plano" de filas (entrada y salida)
    const filasTabla = [];

    ruta.turnos?.forEach((turno) => {
      // Fila de entrada
      filasTabla.push({
        turno: turno.turno,
        horario: turno.horarioEntrada,
        rutaSalida: turno.horarioinicio_jordana_salidaOrigen || 'arrollo zarco',
        rutaDestino: turno.horarioinicio_jornada_llegada_a_Destino || 'mk',
        bus: turno.entrada?.numeroAutobus || '-',
        operador: turno.entrada?.operador || '-'
      });
      // Fila de salida
      filasTabla.push({
        turno: turno.turno,
        horario: turno.horarioSalida,
        rutaSalida: turno.horariosalida_jornada_salida_de_Origen || 'mk',
        rutaDestino: turno.horariosalida_jornada_llegada_a_Destino || 'arrollo zarco',
        bus: turno.salida?.numeroAutobus || '-',
        operador: turno.salida?.operador || '-'
      });
    });

    return (
      <div className={styles.rutaContainer}>
        <h4 className={styles.rutaTitle}>
          Ruta {ruta.numeroRuta} - Cliente: {ruta.nombreCliente}
        </h4>
        <p className={styles.rutaSubinfo}>
          <strong>Fecha:</strong> {new Date(ruta.fecha).toLocaleDateString()}
        </p>
        <p className={styles.rutaSubinfo}>
          <strong>Inicio:</strong> {ruta.diaInicio} de {ruta.mesInicio} de {ruta.anioInicio}
        </p>
        <table className={styles.turnosTable}>
          <thead>
            <tr>
              <th>Turno</th>
              <th>Horario</th>
              <th>Salida</th>
              <th>Destino</th>
              <th>Bus</th>
              <th>Operador</th>
            </tr>
          </thead>
          <tbody>
            {filasTabla.map((fila, idx) => (
              <tr key={idx}>
                <td>{fila.turno}</td>
                <td>{fila.horario}</td>
                <td>{fila.rutaSalida}</td>
                <td>{fila.rutaDestino}</td>
                <td>{fila.bus}</td>
                <td>{fila.operador}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Vista detallada de UNA tabla (con botón de "Eliminar" y "Actualizar")
  const DetalleTablaRol = ({ tabla }) => {
    return (
      <div className={styles.detalleTablaRol}>
        <button className={styles.btnVolver} onClick={volverALista}>
          ← Volver a la lista
        </button>
        <div className={styles.tablaHeader}>
          <h2>Tabla de Rol #{tabla.numeroCambio}</h2>
          <p className={styles.tablaInfo}>
            <strong>Elaborado por:</strong> {tabla.elaboradoPor}
          </p>
          <p className={styles.tablaInfo}>
            <strong>Fecha de inicio:</strong> {tabla.diaInicio} de {tabla.mesInicio} de {tabla.anioInicio}
          </p>
        </div>

        <div className={styles.rutasContainer}>
          {tabla.rutas?.map((ruta, idx) => (
            <div key={idx} className={styles.rutaCard}>
              <DetalleRuta ruta={ruta} />
            </div>
          ))}
        </div>

        <div className={styles.buttonsContainer}>
          <button className={styles.btnActualizar} onClick={() => actualizarTabla(tabla)}>
            Actualizar
          </button>
          <button className={styles.btnEliminar} onClick={() => eliminarTabla(tabla)}>
            Eliminar
          </button>
        </div>
      </div>
    );
  };

  // Vista de lista de TODAS las tablas (solo botón "Ver detalles")
  const ListaTablasRol = () => {
    return (
      <div className={styles.listaContainer}>
        <h2 className={styles.listTitle}>Tablas de Rol TBF</h2>
        <div className={styles.searchContainer}>
          
        </div>
        {tablasFiltradas.length === 0 ? (
          <p className={styles.noResults}>No hay tablas de rol disponibles.</p>
        ) : (
          <div className={styles.tablaGrid}>
            {tablasFiltradas.map((tabla) => (
              <div key={tabla._id} className={styles.tablaCard}>
                <h3>Tabla de Rol #{tabla.numeroCambio}</h3>
                <p>
                  <strong>Inicio:</strong> {tabla.diaInicio} de {tabla.mesInicio} de {tabla.anioInicio}
                </p>
                <p>
                  <strong>Elaborado por:</strong> {tabla.elaboradoPor}
                </p>
                <p>
                  <strong>Rutas:</strong> {tabla.rutas?.length || 0}
                </p>
                <button className={styles.btnVerDetalle} onClick={() => verDetalleTabla(tabla)}>
                  Ver detalles
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <div className={styles.loading}>Cargando tablas de rol...</div>;
  }
  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
   <div className={styles.mainContainer} >
     <div>
            <Menu />
          </div>
    <div className={styles.container}>
      {modo === 'lista' && <ListaTablasRol />}
      {modo === 'detalle' && tablaSeleccionada && <DetalleTablaRol tabla={tablaSeleccionada} />}
      {modo === 'actualizar' && tablaSeleccionada && (
        <TablarolForm
          initialData={tablaSeleccionada}
          onCancel={volverALista}
          onUpdateComplete={(tablaActualizada) => {
            // Actualiza la lista con los datos modificados
            setTablasRol((prev) =>
              prev.map((t) => (t._id === tablaActualizada._id ? tablaActualizada : t))
            );
            volverALista();
          }}
        />
      )}
    </div>
    </div> 
  );
};

export default TablaRolTbfComponent;

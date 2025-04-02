import React, { useState, useEffect } from 'react';
import { tbfObtenerTablarolesTbf } from '../../services/tbfService';
import styles from './RutasDisplay.module.css';
import Menu from '../../components/header/DashboardHeader';
import das from '../header/Dashboard.module.css';

const RutasDisplay = () => {
  const [rutasData, setRutasData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRutas = async () => {
      try {
        setLoading(true);
        const data = await tbfObtenerTablarolesTbf();
        if (data && data.length > 0) {
          setRutasData(data);
        }
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los datos de rutas');
        setLoading(false);
        console.error('Error fetching routes:', err);
      }
    };

    fetchRutas();
  }, []);

  if (loading) return <div className={styles.loading}>Cargando datos...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!rutasData || rutasData.length === 0) return <div className={styles['no-data']}>No hay datos disponibles</div>;

  return (

    <div className={styles.mainContainer}>

    <div className={das.menuContainer}>
    <Menu />
    </div>

    <div className={styles.container}>
      {rutasData.map((rutaData, rutaIndex) => (
        <div key={rutaIndex} className={styles['ruta-card']}>
          <div className={styles['ruta-header']}>
            <div className={styles['ruta-info']}>
              <label className={styles.label}>Número de Ruta:</label>
              <input 
                type="text" 
                className={styles.input} 
                value={rutaData.numeroRuta || ''} 
                readOnly 
              />
            </div>
            <div className={styles['ruta-info']}>
              <label className={styles.label}>Nombre del Cliente:</label>
              <input 
                type="text" 
                className={styles.input} 
                value={rutaData.nombreCliente || ''} 
                readOnly 
              />
            </div>
          </div>
          <div className={styles['table-container']}>
            <table className={styles.table}>
              <thead>
                <tr className={styles['table-header']}>
                  <th>Turno</th>
                  <th>Horario</th>
                  <th>Ruta Salida</th>
                  <th>Ruta Destino</th>
                  <th>Número de Autobús</th>
                  <th>Operador</th>
                </tr>
              </thead>
              <tbody>
                {rutaData.turnos.map((turno, turnoIndex) => (
                  <tr key={turnoIndex} className={styles['table-row']}>
                    <td className={styles['table-cell']}>
                      <input 
                        type="text" 
                        className={styles['table-cell-input']} 
                        value={turno.turno} 
                        readOnly 
                      />
                    </td>
                    <td className={styles['table-cell']}>
                      <input 
                        type="text" 
                        className={styles['table-cell-input']} 
                        value={turno.horario} 
                        readOnly 
                      />
                    </td>
                    <td className={styles['table-cell']}>
                      <input 
                        type="text" 
                        className={styles['table-cell-input']} 
                        value={turno.rutaSalida} 
                        readOnly 
                      />
                    </td>
                    <td className={styles['table-cell']}>
                      <input 
                        type="text" 
                        className={styles['table-cell-input']} 
                        value={turno.rutaDestino} 
                        readOnly 
                      />
                    </td>
                    <td className={styles['table-cell']}>
                      <input 
                        type="text" 
                        className={styles['table-cell-input']} 
                        value={turno.numeroAutobus} 
                        readOnly 
                      />
                    </td>
                    <td className={styles['table-cell']}>
                      <input 
                        type="text" 
                        className={styles['table-cell-input']} 
                        value={turno.operador} 
                        readOnly 
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
    </div>
  );
};

export default RutasDisplay;
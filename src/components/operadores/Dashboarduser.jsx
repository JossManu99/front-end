import React, { useEffect, useState } from 'react';
import { getAutobuses } from '../services/AutobusesService';
import { getOperadores } from '../services/OperadorService';
import { getViajes } from '../services/viaje/viajeService';
import './Dashboard.css';

const Dashboard = () => {
  const [autobuses, setAutobuses] = useState([]);
  const [operadores, setOperadores] = useState([]);
  const [viajes, setViajes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const autobusesData = await getAutobuses();
        const autobusesFiltered = autobusesData.map(bus => ({
          numeroEconomico: bus.numeroEconomico,
          marca: bus.marca,
          modelo: bus.modelo,
        }));

        const operadoresData = await getOperadores();
        const operadoresFiltered = operadoresData.map(op => ({
          nombre: op.nombre,
        }));

        const viajesData = await getViajes();
        const viajesFiltered = viajesData.map(viaje => ({
          origen: viaje.origen,
          destino: viaje.destino,
        }));

        setAutobuses(autobusesFiltered);
        setOperadores(operadoresFiltered);
        setViajes(viajesFiltered);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="dashboard-container">Cargando datos...</div>;
  }

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      <div className="dashboard-grid">

        {/* Sección de autobuses */}
        <section className="dashboard-section">
          <h2>Autobuses</h2>
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Número Económico</th>
                <th>Marca</th>
                <th>Modelo</th>
              </tr>
            </thead>
            <tbody>
              {autobuses.map((bus, index) => (
                <tr key={index}>
                  <td>{bus.numeroEconomico}</td>
                  <td>{bus.marca}</td>
                  <td>{bus.modelo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Sección de operadores */}
        <section className="dashboard-section">
          <h2>Operadores</h2>
          <ul className="dashboard-list">
            {operadores.map((op, index) => (
              <li key={index}>{op.nombre}</li>
            ))}
          </ul>
        </section>

        {/* Sección de viajes */}
        <section className="dashboard-section">
          <h2>Viajes</h2>
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Origen</th>
                <th>Destino</th>
              </tr>
            </thead>
            <tbody>
              {viajes.map((viaje, index) => (
                <tr key={index}>
                  <td>{viaje.origen}</td>
                  <td>{viaje.destino}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;

// src/pages/viajes/ViajePage.jsx
import React, { useEffect, useState } from 'react';
import ViajeModal from '../../components/viaje/ViajeModal';
import Menu from '../../components/header/DashboardHeader';
import das from '../../components/header/Dashboard.module.css';
import './ViajePage.css';
import { getViajes, deleteViaje, updateViaje } from '../../services/viaje/viajeService';

const ViajePage = () => {
  const [viajes, setViajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedViaje, setSelectedViaje] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshKey, setRefreshKey] = useState(0); // clave para forzar re-render

  const fetchAllViajes = async () => {
    try {
      const data = await getViajes();
      setViajes(data);
    } catch (err) {
      setError('Error al obtener los viajes');
      console.error('Error al obtener viajes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllViajes();
  }, []);

  const handleViewDetails = (viaje) => {
    setSelectedViaje(viaje);
  };

  const handleCloseModal = () => {
    setSelectedViaje(null);
  };

  const handleDelete = async (id) => {
    try {
      await deleteViaje(id);
      setViajes((prev) => prev.filter((viaje) => viaje._id !== id));
      setSelectedViaje(null);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error('Error al eliminar viaje:', err);
      setError('Error al eliminar el viaje.');
    }
  };

  const handleUpdate = async (viajeActualizado) => {
    try {
      // Puedes optar por usar la respuesta del update o recargar la lista completa
      await updateViaje(viajeActualizado);
      await fetchAllViajes();
      setSelectedViaje(null);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error('Error al actualizar viaje:', err);
      setError('Error al actualizar el viaje.');
    }
  };

  const filteredViajes = viajes.filter((viaje) =>
    Object.values(viaje).join(' ').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Agrupar viajes por cliente
  const groupViajesByClient = (viajes) => {
    const grouped = {};
    viajes.forEach((viaje) => {
      const clientName = viaje.nombreCliente || 'Sin cliente';
      if (!grouped[clientName]) {
        grouped[clientName] = [];
      }
      grouped[clientName].push(viaje);
    });
    return grouped;
  };

  const groupedViajes = groupViajesByClient(filteredViajes);

  return (
    <div className="mainContainer">
      <div className={das.menuContainer}>
        <Menu />
      </div>

      <div className="viajes-page">
        <h2>Lista de Viajes</h2>
        <input
          type="text"
          placeholder="Buscar viaje..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <div className="Container" key={refreshKey}>
          {error && <p className="error-message">{error}</p>}

          {loading ? (
            <p>Cargando viajes...</p>
          ) : (
            <div className="viajes-grupos">
              {Object.keys(groupedViajes).length === 0 ? (
                <p>No se encontraron viajes.</p>
              ) : (
                Object.entries(groupedViajes).map(([clientName, clientViajes]) => (
                  <div key={clientName} className="cliente-grupo">
                    <h3 className="cliente-titulo">Cliente: {clientName}</h3>
                    <div className="viajes-list">
                      {clientViajes.map((viaje) => (
                        <div key={viaje._id} className="viaje-card">
                          <h3>{viaje.numeroViaje}</h3>
                          <p>
                            <strong>Origen:</strong> {viaje.saleDe}
                          </p>
                          <p>
                            <strong>Destino:</strong> {viaje.llegaA}
                          </p>
                          <button
                            className="ver-info"
                            onClick={() => handleViewDetails(viaje)}
                          >
                            Ver información del viaje
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {selectedViaje && (
          <ViajeModal
            viaje={selectedViaje}
            onClose={handleCloseModal}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default ViajePage;

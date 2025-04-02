// src/pages/viajes/ViajePage.js
import React, { useEffect, useState } from 'react';
// Remove this line: import axios from 'axios'; // We won't need axios here
import ViajeModal from '../../components/viaje/ViajeModal';
import './ViajePage.css';
import Menu from '../../components/header/DashboardHeader';
import das from '../../components/header/DashboardHeader';

// Import the service functions
import { getViajes, deleteViaje, updateViaje } from '../../services/viaje/viajeService';

const ViajePage = () => {
  const [viajes, setViajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedViaje, setSelectedViaje] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAllViajes = async () => {
      try {
        const data = await getViajes(); // Use service
        setViajes(data);
      } catch (err) {
        setError('Error al obtener los viajes');
        console.error('Error al obtener viajes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllViajes();
  }, []);

  // Manejo del botón "Ver información del viaje"
  const handleViewDetails = (viaje) => {
    setSelectedViaje(viaje);
  };

  // Cerrar el modal
  const handleCloseModal = () => {
    setSelectedViaje(null);
  };

  // Eliminar un viaje usando la función del servicio
  const handleDelete = async (id) => {
    try {
      await deleteViaje(id); // Use service
      setViajes((prev) => prev.filter((viaje) => viaje._id !== id));
      setSelectedViaje(null);
    } catch (err) {
      console.error('Error al eliminar viaje:', err);
      setError('Error al eliminar el viaje.');
    }
  };

  // Actualizar un viaje usando la función del servicio
  const handleUpdate = async (viajeActualizado) => {
    try {
      const updated = await updateViaje(viajeActualizado); // Use service
      // Actualizar lista de viajes en el estado
      setViajes((prev) =>
        prev.map((v) => (v._id === updated._id ? updated : v))
      );
      setSelectedViaje(null);
    } catch (err) {
      console.error('Error al actualizar viaje:', err);
      setError('Error al actualizar el viaje.');
    }
  };

  // Filtrar viajes con el término de búsqueda
  const filteredViajes = viajes.filter((viaje) =>
    Object.values(viaje)
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Agrupar viajes por nombreCliente
  const groupViajesByClient = (viajes) => {
    const groupedViajes = {};
    viajes.forEach((viaje) => {
      const clientName = viaje.nombreCliente || 'Sin cliente';
      if (!groupedViajes[clientName]) {
        groupedViajes[clientName] = [];
      }
      groupedViajes[clientName].push(viaje);
    });
    return groupedViajes;
  };

  const groupedViajes = groupViajesByClient(filteredViajes);

  return (
    <div className="mainContainer">
      <div className={das.menuContainer}>
        <Menu />
      </div>

      <div className="viajes-page">
        <h2>Lista de Viajes</h2>

        {/* Input de búsqueda */}
        <input
          type="text"
          placeholder="Buscar viaje..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <div className="Container">
          {/* Mostrar error si existe */}
          {error && <p className="error-message">{error}</p>}

          {/* Mostrar indicador de carga o la lista de viajes agrupados */}
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
                            <strong>Origen:</strong> {viaje.origen}
                          </p>
                          <p>
                            <strong>Destino:</strong> {viaje.destino}
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

          {/* Modal de información del viaje */}
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
    </div>
  );
};

export default ViajePage;

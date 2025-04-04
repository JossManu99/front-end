// src/pages/autobuses/Autobuses.js
import React, { useEffect, useState } from 'react';
import Menu from '../../components/header/DashboardHeader';
import das from '../../components/header/Dashboard.module.css';
import AutobusModal from '../../components/autobuses/AutobusModal';
// Importa los métodos del servicio
import {
  getAutobuses,
  deleteAutobus,
  updateAutobus,
} from '../../services/AutobusesService';

import './Autobuses.css';

const Autobuses = () => {
  const [autobuses, setAutobuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAutobus, setSelectedAutobus] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Obtiene todos los autobuses mediante el servicio
    const fetchAllAutobuses = async () => {
      try {
        const data = await getAutobuses();
        setAutobuses(data);
      } catch (err) {
        setError('Error al obtener los autobuses');
        console.error('Error al obtener los autobuses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllAutobuses();
  }, []);

  // Función para formatear las fechas
  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Función para determinar el color del punto de vencimiento
  const getVencimientoStatusColor = (fechaVencimiento) => {
    if (!fechaVencimiento) return '#ccc';

    const now = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diffTime = vencimiento - now;
    const diffDays = diffTime / (1000 * 3600 * 24);

    if (diffDays < 16) {
      return '#e74c3c'; // Vencido o próximo a vencer (menos de 16 días) - rojo
    } else if (diffDays <= 30) {
      return '#f39c12'; // Cerca de vencer (entre 16 y 30 días) - naranja
    } else {
      return '#2ecc71'; // Aún válido (más de 30 días) - verde
    }
  };

  const handleViewDetails = (autobus) => {
    setSelectedAutobus(autobus);
  };

  const handleCloseModal = () => {
    setSelectedAutobus(null);
  };

  // Eliminar autobús usando la función del servicio
  const handleDelete = async (id) => {
    try {
      await deleteAutobus(id);
      setAutobuses((prev) => prev.filter((autobus) => autobus._id !== id));
      setSelectedAutobus(null);
    } catch (err) {
      console.error('Error al eliminar autobús:', err);
      setError('Error al eliminar el autobús.');
    }
  };

  // Actualizar autobús usando la función del servicio
  const handleUpdate = async (autobusActualizado) => {
    try {
      const updatedBus = await updateAutobus(
        autobusActualizado._id,
        autobusActualizado
      );

      // Actualiza la lista de autobuses con el autobús actualizado
      setAutobuses((prevAutobuses) =>
        prevAutobuses.map((autobus) =>
          autobus._id === updatedBus._id ? updatedBus : autobus
        )
      );
    } catch (err) {
      console.error('Error al actualizar el autobús:', err);
      setError('Error al actualizar el autobús.');
    }
  };

  // Filtra los autobuses según el término de búsqueda
  const filteredAutobuses = autobuses.filter((autobus) =>
    Object.values(autobus)
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mainContainer">
      <div className={das.menuContainer}>
        <Menu />
      </div>

      <div className="autobuses-page">
        <h2>Listado de flotillas</h2>
        <p>Marzo 2025</p>

        {/* Input de búsqueda */}
        <input
          type="text"
          className="search-input"
          placeholder="Buscar autobuses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {error && <p className="error-message">{error}</p>}

        {loading ? (
          <p>Cargando autobuses...</p>
        ) : (
          <div className="container">
            <div className="autobuses-list-header">
              <div className="header-item">Núm. económico</div>
              <div className="header-item">Núm. serie</div>
              <div className="header-item">Tipo placa</div>
              <div className="header-item">Núm. placa</div>
              <div className="header-item">Vigencia en documentos</div>
              <div className="header-item acciones">Ver más</div>
            </div>

            <div className="autobuses-list">
              {filteredAutobuses.length === 0 ? (
                <div className="no-results">No se encontraron autobuses.</div>
              ) : (
                filteredAutobuses.map((autobus) => (
                  <div key={autobus._id} className="autobus-row">
                    {/* Columna 1: Información con número económico y foto */}
                    <div className="autobus-info">
                      <div className="autobus-avatar">
                        <div
                          className="avatar-circle"
                          style={{
                            backgroundImage: `url(${
                              autobus.foto || 'https://via.placeholder.com/150'
                            })`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        />
                      </div>
                      <div className="autobus-details">
                        <h3>No. {autobus.numeroEconomico || '1234'}</h3>
                        <p>{autobus.tipoPropietario || ''}</p>
                      </div>
                    </div>

                    {/* Columna 2: Número de serie */}
                    <div className="autobus-serie">
                      {autobus.numeroSerie || '3CEJ2X51435002740'}
                    </div>

                    {/* Columna 3: Tipo de placa */}
                    <div className="autobus-tipo-placa">
                      {autobus.tipoPlaca || 'Estatales'}
                    </div>

                    {/* Columna 4: Número de placa */}
                    <div className="autobus-placa">
                      {autobus.numeroPlaca || '632025T'}
                    </div>

                    {/* Columna 5: Indicador de vigencia de documentos */}
                    <div className="vigencia-docs">
                      <div className="documento-status">
                        <div className="documento-label">Permiso:</div>
                        <div className="documento-info">
                          <div
                            className="status-indicator"
                            style={{
                              backgroundColor: getVencimientoStatusColor(
                                autobus.caducidadPermiso
                              ),
                            }}
                            title={
                              autobus.caducidadPermiso
                                ? formatDate(autobus.caducidadPermiso)
                                : 'Sin fecha'
                            }
                          ></div>
                          <span className="fecha-vencimiento">
                            {autobus.caducidadPermiso
                              ? formatDate(autobus.caducidadPermiso)
                              : 'N/D'}
                          </span>
                        </div>
                      </div>
                      <div className="documento-status">
                        <div className="documento-label">Seguro:</div>
                        <div className="documento-info">
                          <div
                            className="status-indicator"
                            style={{
                              backgroundColor: getVencimientoStatusColor(
                                autobus.caducidadSeguro
                              ),
                            }}
                            title={
                              autobus.caducidadSeguro
                                ? formatDate(autobus.caducidadSeguro)
                                : 'Sin fecha'
                            }
                          ></div>
                          <span className="fecha-vencimiento">
                            {autobus.caducidadSeguro
                              ? formatDate(autobus.caducidadSeguro)
                              : 'N/D'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Columna 6: Botón de acciones */}
                    <div className="actions">
                      <button
                        className="view-details-btn"
                        onClick={() => handleViewDetails(autobus)}
                      >
                        <i className="details-icon"></i>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {selectedAutobus && (
          <AutobusModal
            autobus={selectedAutobus}
            onClose={handleCloseModal}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default Autobuses;

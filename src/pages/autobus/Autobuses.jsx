import React, { useEffect, useState } from 'react';
import Menu from '../../components/header/DashboardHeader';
import das from '../../components/header/Dashboard.module.css';
import AutobusModal from '../../components/autobuses/AutobusModal';
import { getAutobuses, deleteAutobus, updateAutobus } from '../../services/AutobusesService';
import './Autobuses.css';

const Autobuses = () => {
  const [autobuses, setAutobuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAutobus, setSelectedAutobus] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshKey, setRefreshKey] = useState(0); // Estado para forzar re-render

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

  useEffect(() => {
    fetchAllAutobuses();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getVencimientoStatusColor = (fechaVencimiento) => {
    if (!fechaVencimiento) return '#ccc';
    const now = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diffTime = vencimiento - now;
    const diffDays = diffTime / (1000 * 3600 * 24);
    if (diffDays < 16) return '#e74c3c';
    else if (diffDays <= 30) return '#f39c12';
    else return '#2ecc71';
  };

  const handleViewDetails = (autobus) => {
    setSelectedAutobus(autobus);
  };

  const handleCloseModal = () => {
    setSelectedAutobus(null);
  };

  const handleDelete = async (id) => {
    try {
      await deleteAutobus(id);
      setAutobuses((prev) => prev.filter((a) => a._id !== id));
      setSelectedAutobus(null);
    } catch (err) {
      console.error('Error al eliminar autobús:', err);
      setError('Error al eliminar el autobús.');
    }
  };

  const handleUpdate = async (autobusActualizado) => {
    try {
      await updateAutobus(autobusActualizado._id, autobusActualizado);
      await fetchAllAutobuses();
      setSelectedAutobus(null);
      setRefreshKey(prev => prev + 1); // Forzar re-render
      // Opcional: limpiar el campo de búsqueda
      // setSearchTerm('');
    } catch (err) {
      console.error('Error al actualizar el autobús:', err);
      setError('Error al actualizar el autobús.');
    }
  };

  const filteredAutobuses = autobuses.filter((autobus) =>
    Object.values(autobus).join(' ').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mainContainer">
      <div className={das.menuContainer}>
        <Menu />
      </div>
      <div className="autobuses-page">
        <h2>Listado de flotillas</h2>
        <p>Marzo 2025</p>
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
          <div className="container" key={refreshKey}>
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
                    <div className="autobus-info">
                      <div className="autobus-avatar">
                        <div
                          className="avatar-circle"
                          style={{
                            backgroundImage: `url(${autobus.foto || 'https://via.placeholder.com/150'})`,
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
                    <div className="autobus-serie">
                      {autobus.numeroSerie || '3CEJ2X51435002740'}
                    </div>
                    <div className="autobus-tipo-placa">
                      {autobus.tipoPlaca || 'Estatales'}
                    </div>
                    <div className="autobus-placa">
                      {autobus.numeroPlaca || '632025T'}
                    </div>
                    <div className="vigencia-docs">
                      <div className="documento-status">
                        <div className="documento-label">Permiso:</div>
                        <div className="documento-info">
                          <div
                            className="status-indicator"
                            style={{
                              backgroundColor: getVencimientoStatusColor(autobus.caducidadPermiso),
                            }}
                            title={autobus.caducidadPermiso ? formatDate(autobus.caducidadPermiso) : 'Sin fecha'}
                          />
                          <span className="fecha-vencimiento">
                            {autobus.caducidadPermiso ? formatDate(autobus.caducidadPermiso) : 'N/D'}
                          </span>
                        </div>
                      </div>
                      <div className="documento-status">
                        <div className="documento-label">Seguro:</div>
                        <div className="documento-info">
                          <div
                            className="status-indicator"
                            style={{
                              backgroundColor: getVencimientoStatusColor(autobus.caducidadSeguro),
                            }}
                            title={autobus.caducidadSeguro ? formatDate(autobus.caducidadSeguro) : 'Sin fecha'}
                          />
                          <span className="fecha-vencimiento">
                            {autobus.caducidadSeguro ? formatDate(autobus.caducidadSeguro) : 'N/D'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="actions">
                      <button className="view-details-btn" onClick={() => handleViewDetails(autobus)}>
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
            key={selectedAutobus._id}
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

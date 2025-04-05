import React, { useState } from 'react';
import BusForm from '../../components/autobuses/AutobusForm';
import './AutobusModal.css';

const AutobusModal = ({ autobus, onClose, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleUpdate = async (updatedAutobus) => {
    await onUpdate(updatedAutobus);
    onClose();
  };

  const handleDelete = () => {
    if (!autobus._id) {
      alert('El autobús no tiene un ID válido');
      return;
    }
    if (window.confirm(`¿Estás seguro de que deseas eliminar el autobús ${autobus.numeroEconomico}?`)) {
      onDelete(autobus._id);
    }
  };

  return (
    <div className="autobus-modal">
      <div className="modal-content">
        <span className="close-btn" onClick={onClose}>&times;</span>
        <h2 className="modal-title">
          {isEditing ? 'Editar Información del Autobús' : 'Información del Autobús'}
        </h2>
        {isEditing ? (
          <BusForm
            autobus={autobus}
            onSave={handleUpdate}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <div className="autobus-details">
            <div className="details-container">
              {autobus.foto ? (
                <img src={autobus.foto} alt="Foto del Autobús" className="autobus-photo" />
              ) : (
                <p className="no-photo">Sin foto disponible</p>
              )}
              <div className="details-section">
                <p><strong>Número Económico:</strong> {autobus.numeroEconomico || 'N/A'}</p>
                <p><strong>Número de Motor:</strong> {autobus.numeroMotor || 'N/A'}</p>
                <p><strong>Número de Serie:</strong> {autobus.numeroSerie || 'N/A'}</p>
                <p><strong>Marca:</strong> {autobus.marca || 'N/A'}</p>
                <p><strong>Modelo:</strong> {autobus.modelo || 'N/A'}</p>
                <p><strong>Tipo de Placa:</strong> {autobus.tipoPlaca || 'N/A'}</p>
                <p>
                  <strong>Verificación (Contaminante):</strong>{' '}
                  {autobus.verificacionContaminante ? (
                    <a href={autobus.verificacionContaminante} target="_blank" rel="noopener noreferrer">
                      Ver documento
                    </a>
                  ) : ('No disponible')}
                </p>
                <p><strong>Caducidad Verificación:</strong> {autobus.caducidadVerificacionContaminante || 'N/A'}</p>
                <p>
                  <strong>Verificación (Físico-Mecánico):</strong>{' '}
                  {autobus.verificacionFisicoMecanico ? (
                    <a href={autobus.verificacionFisicoMecanico} target="_blank" rel="noopener noreferrer">
                      Ver documento
                    </a>
                  ) : ('No disponible')}
                </p>
                <p><strong>Caducidad Verificación:</strong> {autobus.caducidadVerificacionFisicoMecanico || 'N/A'}</p>
                <p>
                  <strong>Tarjeta de Circulación:</strong>{' '}
                  {autobus.tarjetaCirculacion ? (
                    <a href={autobus.tarjetaCirculacion} target="_blank" rel="noopener noreferrer">
                      Ver documento
                    </a>
                  ) : ('No disponible')}
                </p>
                <p><strong>Caducidad Tarjeta de Circulación:</strong> {autobus.caducidadTarjetaCirculacion || 'N/A'}</p>
                <p>
                  <strong>Seguro:</strong>{' '}
                  {autobus.seguro ? (
                    <a href={autobus.seguro} target="_blank" rel="noopener noreferrer">
                      Ver documento
                    </a>
                  ) : ('No disponible')}
                </p>
                <p><strong>Caducidad Seguro:</strong> {autobus.caducidadSeguro || 'N/A'}</p>
                <p>
                  <strong>Permiso:</strong>{' '}
                  {autobus.permiso ? (
                    <a href={autobus.permiso} target="_blank" rel="noopener noreferrer">
                      Ver documento
                    </a>
                  ) : ('No disponible')}
                </p>
                <p><strong>Caducidad Permiso:</strong> {autobus.caducidadPermiso || 'N/A'}</p>
                <p><strong>Número de Asientos:</strong> {autobus.numeroAsientos || 'N/A'}</p>
                <p><strong>Usos del Autobús:</strong> {autobus.usos?.join(', ') || 'N/A'}</p>
                <p><strong>Nombre de Propietario:</strong> {autobus.nombrepropietario || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}
        {!isEditing && (
          <div className="modal-actions">
            <button className="update-btn" onClick={handleEditClick}>Editar</button>
            <button className="delete-btn" onClick={handleDelete}>Eliminar</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AutobusModal;

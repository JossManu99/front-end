import React, { useState } from 'react';
import FormOperador from './FormOperador'; // Componente del formulario reutilizable
import './OperadorModal.css'; // Estilos del modal

// Función para formatear fechas en formato dd/mm/yyyy
const formatDate = (date) => {
  if (!date) return 'N/A';
  
  const d = new Date(date);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  
  return `${day}/${month}/${year}`;
};

const OperadorModal = ({ operador, onClose, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleUpdate = (updatedOperador) => {
    onUpdate(updatedOperador);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!operador._id) {
      alert('El operador no tiene un ID válido');
      return;
    }
    if (window.confirm(`¿Estás seguro de que deseas eliminar al operador ${operador.nombre}?`)) {
      onDelete(operador._id);
    }
  };

  // Verificamos si el puesto es "operador" (ignorando mayúsculas/minúsculas)
  const isOperador = operador?.puesto?.toLowerCase() === 'operador';

  return (
    <div className="operador-modal">
      <div className="modal-content">
        <span className="close-btn" onClick={onClose}>&times;</span>
        <h2 className="modal-title">
          {isEditing ? 'Editar Información del Operador' : 'Información del Operador'}
        </h2>

        {isEditing ? (
          // Modo edición: se muestra el formulario de edición
          <FormOperador
            operador={operador}
            onSave={handleUpdate}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          // Modo visualización: se muestran los datos del operador
          <div className="operador-details">
            <div className="operador-photo">
              <img
                src={operador.foto || '/default-avatar.png'}
                alt={`Foto de ${operador.nombre}`}
                className="photo-img"
              />
            </div>
            
            <div className="details-section">
              {/* Campos comunes a todos los puestos */}
              <p><strong>Número de Operador:</strong> {operador.numeroOperador || 'N/A'}</p>
              <p><strong>Nombre:</strong> {operador.nombre || 'Desconocido'}</p>
              <p><strong>Fecha de Nacimiento:</strong> {formatDate(operador.fechaNacimiento)}</p>
              <p><strong>Edad:</strong> {operador.edad || 'N/A'}</p>
              <p><strong>Fecha de Ingreso:</strong> {formatDate(operador.fechaIngreso)}</p>
              <p><strong>Puesto:</strong> {operador.puesto || 'N/A'}</p>

              {/* Solo se muestran estos campos de LICENCIAS si el puesto es "operador" */}
              {isOperador && (
                <>
                  <p><strong>Tipo de Licencia:</strong> {operador.tipoLicencia || 'N/A'}</p>
                  <p>
                    <strong>Fecha de Vencimiento Licencia Estatal:</strong>{' '}
                    {formatDate(operador.fechaVencimientoLicenciaEstatal)}
                  </p>
                  <p>
                    <strong>Documento Licencia Estatal:</strong>{' '}
                    {operador.documentoLicenciaEstatal ? (
                      <a
                        href={operador.documentoLicenciaEstatal}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Ver Documento
                      </a>
                    ) : 'N/A'}
                  </p>
                  <p>
                    <strong>Fecha de Vencimiento Licencia Federal:</strong>{' '}
                    {formatDate(operador.fechaVencimientoLicenciaFederal)}
                  </p>
                  <p>
                    <strong>Documento Licencia Federal:</strong>{' '}
                    {operador.documentoLicenciaFederal ? (
                      <a
                        href={operador.documentoLicenciaFederal}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Ver Documento
                      </a>
                    ) : 'N/A'}
                  </p>

                  {/* Tarjetón también solo si es operador */}
                  <p>
                    <strong>Fecha de Vencimiento Tarjetón:</strong>{' '}
                    {formatDate(operador.fechaVencimientoTarjeton)}
                  </p>
                  <p>
                    <strong>Documento Tarjetón:</strong>{' '}
                    {operador.documentoTarjeton ? (
                      <a
                        href={operador.documentoTarjeton}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Ver Documento
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </p>
                </>
              )}

              {/* Examen Médico siempre visible (si así lo deseas) */}
              <p>
                <strong>Fecha de Vencimiento Examen Médico:</strong>{' '}
                {formatDate(operador.fechaVencimientoExamenMedico)}
              </p>
              <p>
                <strong>Documento Examen Médico:</strong>{' '}
                {operador.documentoExamenMedico ? (
                  <a
                    href={operador.documentoExamenMedico}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver Documento
                  </a>
                ) : (
                  'N/A'
                )}
              </p>

              {/* Observaciones siempre visibles */}
              <p><strong>Observaciones:</strong> {operador.observaciones || 'Sin observaciones'}</p>
            </div>
          </div>
        )}

        {/* Botones de acción (Editar / Eliminar) se muestran solo en modo visualización */}
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

export default OperadorModal;

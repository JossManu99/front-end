// src/components/viaje/ViajeModal.jsx
import React, { useState, useEffect } from 'react';
import FormViaje from './FormViaje'; 
import './ViajeModal.css';
import { getTurnos } from '../../services/clientesServive';

const formatDate = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${day}/${month}/${year}`;
};

const ViajeModal = ({ viaje, onClose, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar los turnos cuando el componente se monta o cuando cambia la empresa del viaje
  useEffect(() => {
    const fetchTurnos = async () => {
      if (viaje.empresa) {
        setLoading(true);
        try {
          const turnosData = await getTurnos(viaje.empresa);
          console.log("Turnos obtenidos:", turnosData);
          const empresaTurnos = turnosData.filter((item) => item.empresa === viaje.empresa);
          if (empresaTurnos.length > 0) {
            setTurnos(empresaTurnos[0].turnos || []); 
          } else {
            console.error('No se encontraron turnos válidos para esta empresa');
            setError('No se encontraron turnos válidos para esta empresa.');
          }
        } catch (error) {
          console.error("Error al obtener los turnos:", error);
          setError("Hubo un error al cargar los turnos.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTurnos();
  }, [viaje.empresa]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  // Al actualizar, se llama a onUpdate y luego se cierra el modal con onClose
  const handleUpdate = (updatedViaje) => {
    onUpdate(updatedViaje);
    setIsEditing(false);
    onClose();
  };

  const handleDelete = () => {
    if (!viaje._id) {
      alert('El viaje no tiene un ID válido');
      return;
    }
    if (window.confirm(`¿Estás seguro de que deseas eliminar el viaje con ruta ${viaje.numeroRuta}?`)) {
      onDelete(viaje._id);
    }
  };

  const renderTurnos = () => {
    if (!viaje.turnos || viaje.turnos.length === 0) {
      return <p><strong>Turnos:</strong> No hay turnos asignados.</p>;
    }

    return (
      <div>
        <strong>Turnos y Horarios:</strong>
        <ul className="turnos-list">
          {viaje.turnos.map((turnoItem, index) => (
            <li key={index} className="turno-item">
              <p><strong>Turno:</strong> {turnoItem.turno}</p>
              <p>
                <strong>Entrada:</strong> {turnoItem.horarioEntrada} | <strong>Salida:</strong> {turnoItem.horarioSalida}
              </p>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="viaje-modal">
      <div className="modal-content">
        <span className="close-btn" onClick={onClose}>&times;</span>
        <h2 className="modal-title">
          {isEditing ? 'Editar Información del Viaje' : 'Información del Viaje'}
        </h2>
        {isEditing ? (
          <FormViaje
            viaje={viaje}
            onViajeCreated={handleUpdate}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <div className="viaje-details">
            <p><strong>Número de Ruta:</strong> {viaje.numeroRuta || 'N/A'}</p>
            <p><strong>Nombre Cliente:</strong> {viaje.nombreCliente || 'N/A'}</p>
            <p><strong>Origen:</strong> {viaje.saleDe || 'Desconocido'}</p>
            <p><strong>Destino:</strong> {viaje.llegaA || 'Desconocido'}</p>
            <p><strong>Distancia:</strong> {viaje.distancia || 'N/A'} km</p>
            <p><strong>Costo por Km:</strong> ${viaje.costoPorKm || 'N/A'}</p>
            <p><strong>Costo Total:</strong> ${viaje.costo || 'N/A'}</p>
            {renderTurnos()}
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

export default ViajeModal;

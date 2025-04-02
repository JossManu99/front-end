import React from 'react';
import { useNavigate } from 'react-router-dom';

const AccessDenied = () => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate('/profile'); // Redirige a la página del perfil
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1 style={{ color: 'red' }}>Acceso Denegado</h1>
      <p>No tienes permiso para acceder a esta página.</p>
      <button
        onClick={goBack}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '20px',
        }}
      >
        Volver al Inicio
      </button>
    </div>
  );
};

export default AccessDenied;

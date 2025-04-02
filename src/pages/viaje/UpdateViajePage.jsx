import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getViajeById, updateViaje } from '../../services/viaje/viajeService';
import FormViaje from '../../components/viaje/FormViaje'; // Usamos el formulario para editar el viaje

const UpdateViajePage = () => {
  const { id } = useParams(); // Obtener el ID del viaje de la URL
  const navigate = useNavigate();
  const [viaje, setViaje] = useState(null);

  // Cargar los detalles del viaje cuando se monta el componente
  useEffect(() => {
    const fetchViaje = async () => {
      try {
        const data = await getViajeById(id);
        setViaje(data);
      } catch (error) {
        console.error('Error al obtener el viaje para editar:', error);
      }
    };

    fetchViaje();
  }, [id]);

  // Llamada para actualizar el viaje
  const handleViajeUpdated = (updatedViaje) => {
    // Redirigir a la página de viajes después de actualizar
    navigate('/viajes'); // Asegúrate de que esta ruta es la correcta
  };

  return (
    <div>
      <h2>Editar Viaje</h2>
      {viaje ? (
        <FormViaje
          viaje={viaje} // Le pasamos los datos del viaje a editar
          onViajeCreated={handleViajeUpdated} // La función que se ejecutará después de la actualización
        />
      ) : (
        <p>Cargando...</p> // Mostrar un mensaje mientras se cargan los datos del viaje
      )}
    </div>
  );
};

export default UpdateViajePage;

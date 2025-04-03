import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOperadorById, updateOperador } from '../../services/operador/OperadorService'; // Suponiendo que tienes estos servicios
import FormOperador from '../../components/operador/FormOperador'; // Formulario reutilizado

const UpdateOperadorPage = () => {
  const { id } = useParams(); // Obtener el ID del operador de la URL
  const navigate = useNavigate();
  const [operador, setOperador] = useState(null);

  // Cargar los detalles del operador cuando se monta el componente
  useEffect(() => {
    const fetchOperador = async () => {
      try {
        const data = await getOperadorById(id); // Obtenemos los detalles del operador por ID
        setOperador(data);
      } catch (error) {
        console.error('Error al obtener el operador para editar:', error);
      }
    };

    fetchOperador();
  }, [id]);

  // Llamada para actualizar el operador
  const handleOperadorUpdated = (updatedOperador) => {
    // Redirigir a la página de operadores después de actualizar
    navigate('/operadores'); // Cambia la ruta según sea necesario
  };

  return (
    <div>
      <h2>Editar Operador</h2>
      {operador ? (
        <FormOperador
          operador={operador} // Le pasamos los datos del operador a editar
          onOperadorUpdated={handleOperadorUpdated} // La función que se ejecutará después de la actualización
        />
      ) : (
        <p>Cargando...</p> // Mostrar un mensaje mientras se cargan los datos del operador
      )}
    </div>
  );
};

export default UpdateOperadorPage;

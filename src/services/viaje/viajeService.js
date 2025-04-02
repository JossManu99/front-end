import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api/viajes`;

// Función para normalizar los datos del viaje antes de enviarlos al servidor
const normalizarDatosViaje = (viajeData) => {
  // Asegurarse de que los valores numéricos sean números
  const datosNormalizados = {
    ...viajeData,
    distancia: parseFloat(viajeData.distancia),
    costoPorKm: parseFloat(viajeData.costoPorKm),
    costo: parseFloat(viajeData.costo),
  };

  return datosNormalizados;
};

// Crear un viaje
export const createViaje = async (viajeData) => {
  try {
    const datosNormalizados = normalizarDatosViaje(viajeData);
    const response = await axios.post(API_URL, datosNormalizados);
    return response.data;
  } catch (error) {
    console.error('Error al crear el viaje:', error);
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      throw new Error(error.response.data.message || 'Error en el servidor');
    } else if (error.request) {
      // La solicitud fue hecha pero no se recibió respuesta
      throw new Error('No se recibió respuesta del servidor');
    } else {
      // Algo ocurrió al configurar la solicitud
      throw new Error('Error al procesar la solicitud');
    }
  }
};

// Obtener todos los viajes
export const getViajes = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error al obtener los viajes:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Error al obtener los viajes');
    } else {
      throw new Error('Error de conexión al obtener los viajes');
    }
  }
};

// Obtener un viaje por ID
export const getViajeById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener el viaje por ID:', error);
    if (error.response && error.response.status === 404) {
      throw new Error('Viaje no encontrado');
    } else if (error.response) {
      throw new Error(error.response.data.message || 'Error al obtener el viaje');
    } else {
      throw new Error('Error de conexión al obtener el viaje');
    }
  }
};

// Actualizar un viaje
export const updateViaje = async (viajeData) => {
  try {
    if (!viajeData._id) {
      throw new Error('Se requiere el ID del viaje para actualizar');
    }
    
    const datosNormalizados = normalizarDatosViaje(viajeData);
    const response = await axios.put(`${API_URL}/${viajeData._id}`, datosNormalizados);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar el viaje:', error);
    if (error.response && error.response.status === 404) {
      throw new Error('Viaje no encontrado');
    } else if (error.response) {
      throw new Error(error.response.data.message || 'Error al actualizar el viaje');
    } else if (error.request) {
      throw new Error('No se recibió respuesta del servidor');
    } else {
      throw error; // Reenviar el error específico
    }
  }
};

// Eliminar un viaje
export const deleteViaje = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar el viaje:', error);
    if (error.response && error.response.status === 404) {
      throw new Error('Viaje no encontrado');
    } else if (error.response) {
      throw new Error(error.response.data.message || 'Error al eliminar el viaje');
    } else {
      throw new Error('Error de conexión al eliminar el viaje');
    }
  }
};

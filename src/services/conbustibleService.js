import axios from 'axios';

// Obtiene la URL base desde la variable de entorno VITE_API_URL o usa el fallback a localhost
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api/combustible`;

// Crear nuevo registro de combustible
export const crearCombustible = async (combustibleData) => {
  try {
    const response = await axios.post(API_URL, combustibleData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Obtener todos los registros de combustible
export const obtenerCombustibles = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Obtener un registro de combustible por ID
export const obtenerCombustiblePorId = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Actualizar un registro de combustible
export const actualizarCombustible = async (id, combustibleData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, combustibleData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Eliminar un registro de combustible
export const eliminarCombustible = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

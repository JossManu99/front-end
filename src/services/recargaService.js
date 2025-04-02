import axios from 'axios';

// Obtiene la URL base desde la variable de entorno VITE_API_URL o usa 'http://localhost:3000' por defecto
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api/recargas`;

// Crear recarga
export const createRecarga = async (formData) => {
  try {
    const response = await axios.post(API_URL, formData);
    return response.data;
  } catch (error) {
    console.error('Error al crear la recarga:', error);
    throw new Error(error.response ? error.response.data : 'Error de red');
  }
};

// Obtener todas las recargas
export const getRecargas = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error al obtener las recargas:', error);
    throw new Error(error.response ? error.response.data : 'Error de red');
  }
};

// Obtener recarga por ID
export const getRecargaById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener la recarga:', error);
    throw new Error(error.response ? error.response.data : 'Error de red');
  }
};

// Actualizar una recarga
export const updateRecarga = async (id, formData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, formData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar la recarga:', error);
    throw new Error(error.response ? error.response.data : 'Error de red');
  }
};

// Eliminar una recarga
export const deleteRecarga = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar la recarga:', error);
    throw new Error(error.response ? error.response.data : 'Error de red');
  }
};

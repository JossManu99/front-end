import axios from 'axios';

// Obtiene la URL base desde la variable de entorno VITE_API_URL o usa 'http://localhost:3000' por defecto
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api/propietarios`;

// Crear un propietario
export const createPropietario = async (formData) => {
  try {
    const response = await axios.post(API_URL, formData);
    return response.data;
  } catch (error) {
    console.error('Error al crear el propietario:', error);
    throw new Error(error.response ? error.response.data : 'Error de red');
  }
};

// Obtener todos los propietarios
export const getPropietarios = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error al obtener los propietarios:', error);
    throw new Error(error.response ? error.response.data : 'Error de red');
  }
};

// Obtener un propietario por ID
export const getPropietarioById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener el propietario:', error);
    throw new Error(error.response ? error.response.data : 'Error de red');
  }
};

// Actualizar un propietario por ID
export const updatePropietario = async (id, formData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, formData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar el propietario:', error);
    throw new Error(error.response ? error.response.data : 'Error de red');
  }
};

// Eliminar un propietario por ID
export const deletePropietario = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar el propietario:', error);
    throw new Error(error.response ? error.response.data : 'Error de red');
  }
};

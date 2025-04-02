import axios from 'axios';

// Obtiene la URL base desde la variable de entorno VITE_API_URL o usa 'http://localhost:3000' por defecto
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api/operadores`;

// Crear operador
export const createOperador = async (formData) => {
  try {
    const response = await axios.post(API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Para subir archivos
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response ? error.response.data : 'Network error');
  }
};

// Obtener todos los operadores
export const getOperadores = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error al obtener los operadores:', error);
    throw error;
  }
};

// Obtener un operador por ID
export const getOperadorById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener el operador:', error);
    throw error;
  }
};

// Actualizar un operador
export const updateOperador = async (id, formData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Para subir archivos
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response ? error.response.data : 'Network error');
  }
};

// Eliminar un operador
export const deleteOperador = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response ? error.response.data : 'Network error');
  }
};

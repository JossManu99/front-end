import axios from 'axios';

const API_URL = 'http://localhost:3000/api/operadores'; // Ajusta según la URL de tu API

// Crear operador
export const createOperador = async (formData) => {
  try {
    const response = await axios.post(API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Asegura que el contenido es de tipo multipart/form-data para cargar archivos
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
        'Content-Type': 'multipart/form-data', // Asegura que el contenido es de tipo multipart/form-data si subimos archivos
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

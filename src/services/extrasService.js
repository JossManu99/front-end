import axios from 'axios';

// Obtiene la URL base desde la variable de entorno VITE_API_URL o usa 'http://localhost:3000' por defecto
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api/extras`;

// Obtener todas las extras
export const getExtras = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Obtener una extra por ID
export const getExtraById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Crear una nueva extra
export const createExtra = async (extraData) => {
  try {
    const response = await axios.post(API_URL, extraData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Actualizar una extra existente
export const updateExtra = async (id, extraData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, extraData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Eliminar una extra
export const deleteExtra = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

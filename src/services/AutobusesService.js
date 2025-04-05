import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api/autobuses`;

export const createAutobus = async (formData) => {
  try {
    const response = await axios.post(API_URL, formData);
    return response.data;
  } catch (error) {
    console.error('Error al crear el autobús:', error);
    throw new Error(error.response ? error.response.data : 'Error de red');
  }
};

export const getAutobuses = async () => {
  try {
    const response = await axios.get(`${API_URL}?t=${Date.now()}`); // Agrega timestamp para evitar cache
    return response.data;
  } catch (error) {
    console.error('Error al obtener los autobuses:', error);
    throw new Error(error.response ? error.response.data : 'Error de red');
  }
};

export const getAutobusById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener el autobús:', error);
    throw new Error(error.response ? error.response.data : 'Error de red');
  }
};

export const updateAutobus = async (id, formData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, formData);
    // Retornamos directamente el autobús actualizado
    return response.data.bus;
  } catch (error) {
    console.error('Error al actualizar el autobús:', error);
    throw new Error(error.response ? error.response.data : 'Error de red');
  }
};

export const deleteAutobus = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar el autobús:', error);
    throw new Error(error.response ? error.response.data : 'Error de red');
  }
};

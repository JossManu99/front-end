import axios from 'axios';

const API_URL = 'http://localhost:3000/api/autobuses'; // URL base para la API

// Crear un autobús
export const createAutobus = async (autobusData) => {
  try {
    const response = await axios.post(API_URL, autobusData);
    return response.data;
  } catch (error) {
    console.error('Error al crear el autobús:', error);
    throw error;
  }
};

// Obtener todos los autobuses
export const getAutobuses = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error al obtener los autobuses:', error);
    throw error;
  }
};

// Obtener un autobús por ID
export const getAutobusById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener el autobús por ID:', error);
    throw error;
  }
};

export const updateAutobus = async (id, autobusData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, autobusData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar el autobús:', error);
    throw error;
  }
};


// Eliminar un autobús
export const deleteAutobus = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar el autobús:', error);
    throw error;
  }
};

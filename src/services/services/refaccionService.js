import axios from 'axios';

const API_URL = 'http://localhost:3000/api/refacciones'; // Asegúrate de que esta URL sea la correcta

// Crear una refacción
export const crearRefaccion = async (refaccionData) => {
  try {
    const response = await axios.post(API_URL, refaccionData);
    return response.data;
  } catch (error) {
    console.error('Error al crear la refacción:', error);
    throw error;
  }
};

// Obtener todas las refacciones
export const obtenerRefacciones = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error al obtener las refacciones:', error);
    throw error;
  }
};

// Obtener una refacción por ID
export const obtenerRefaccionPorId = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener la refacción por ID:', error);
    throw error;
  }
};

// Actualizar una refacción
export const actualizarRefaccion = async (refaccionData) => {
  try {
    const response = await axios.put(`${API_URL}/${refaccionData._id}`, refaccionData);
    return response.data; // Retorna la refacción actualizada
  } catch (error) {
    console.error('Error al actualizar la refacción:', error);
    throw error;
  }
};

// Eliminar una refacción
export const eliminarRefaccion = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar la refacción:', error);
    throw error;
  }
};
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/viajes';  // Asegúrate de que esta URL sea la correcta

// Crear un viaje
export const createViaje = async (viajeData) => {
  try {
    const response = await axios.post(API_URL, viajeData);
    return response.data;
  } catch (error) {
    console.error('Error al crear el viaje:', error);
    throw error;
  }
};

// Obtener todos los viajes
export const getViajes = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error al obtener los viajes:', error);
    throw error;
  }
};

// Obtener un viaje por ID
export const getViajeById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener el viaje por ID:', error);
    throw error;
  }
};

// Actualizar un viaje
// src/services/viaje/viajeService.js

// Función para actualizar el viaje
export const updateViaje = async (viajeData) => {
  try {
    const response = await axios.put(`${API_URL}/${viajeData._id}`, viajeData);
    return response.data;  // Retorna el viaje actualizado
  } catch (error) {
    console.error('Error al actualizar el viaje:', error);
    throw error;
  }
};


// Eliminar un viaje
export const deleteViaje = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar el viaje:', error);
    throw error;
  }
};

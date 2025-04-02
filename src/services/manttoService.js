import axios from 'axios';

// Obtiene la URL base desde la variable de entorno VITE_API_URL o usa 'http://localhost:3000' por defecto
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api/mantenimiento`;

// Crear mantenimiento
export const createMantenimiento = async (formData) => {
  try {
    const response = await axios.post(API_URL, formData);
    return response.data;
  } catch (error) {
    console.error('Error al crear el registro de mantenimiento:', error);
    throw new Error(error.response ? error.response.data : 'Error de red');
  }
};

// Obtener todos los mantenimientos
export const getMantenimientos = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error al obtener los registros de mantenimiento:', error);
    throw new Error(error.response ? error.response.data : 'Error de red');
  }
};

// Obtener un mantenimiento por ID
export const getMantenimientoById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener el registro de mantenimiento:', error);
    throw new Error(error.response ? error.response.data : 'Error de red');
  }
};

// Actualizar un mantenimiento
export const updateMantenimiento = async (id, formData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, formData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar el registro de mantenimiento:', error);
    throw new Error(error.response ? error.response.data : 'Error de red');
  }
};

// Eliminar un mantenimiento
export const deleteMantenimiento = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar el registro de mantenimiento:', error);
    throw new Error(error.response ? error.response.data : 'Error de red');
  }
};

// Obtener mantenimientos por rango de fechas
export const getMantenimientosByDateRange = async (startDate, endDate) => {
  try {
    const response = await axios.get(`${API_URL}/fecha/rango?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener registros por rango de fechas:', error);
    throw new Error(error.response ? error.response.data : 'Error de red');
  }
};

// Obtener mantenimientos por número económico
export const getMantenimientosByNumeroEconomico = async (numeroEconomico) => {
  try {
    const response = await axios.get(`${API_URL}/autobus/${numeroEconomico}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener registros para autobús ${numeroEconomico}:`, error);
    throw new Error(error.response ? error.response.data : 'Error de red');
  }
};

// Obtener mantenimientos por operador
export const getMantenimientosByOperador = async (nombreOperador) => {
  try {
    const response = await axios.get(`${API_URL}/operador/${nombreOperador}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener registros para operador ${nombreOperador}:`, error);
    throw new Error(error.response ? error.response.data : 'Error de red');
  }
};

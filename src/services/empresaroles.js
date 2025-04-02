import axios from 'axios';

// Obtiene la URL base desde la variable de entorno VITE_API_URL o usa 'http://localhost:3000' por defecto
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api/empresaroles`;

export const createEmpresaRol = async (empresaRolData) => {
  try {
    const response = await axios.post(API_URL, empresaRolData);
    return response.data;
  } catch (error) {
    console.error('Error creando empresa:', error);
    throw error;
  }
};

// Obtener todas las empresas
export const getEmpresasRoles = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo empresas:', error);
    throw error;
  }
};

// Obtener una empresa por ID
export const getEmpresaRolById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error obteniendo empresa con ID ${id}:`, error);
    throw error;
  }
};

// Actualizar una empresa por ID
export const updateEmpresaRol = async (id, empresaRolData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, empresaRolData);
    return response.data;
  } catch (error) {
    console.error(`Error actualizando empresa con ID ${id}:`, error);
    throw error;
  }
};

// Eliminar una empresa por ID
export const deleteEmpresaRol = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error eliminando empresa con ID ${id}:`, error);
    throw error;
  }
};

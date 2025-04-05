import axios from 'axios';

// Utiliza la variable de entorno de Vite o 'http://localhost:3000' como fallback.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
// URL base para los endpoints de usuarios
const API_BASE_URL = `${BASE_URL}/api/users`;

/**
 * Obtiene todos los usuarios.
 */
export const getUsersService = async () => {
  try {
    const response = await axios.get(API_BASE_URL);
    // Se espera que el backend retorne { status, users }
    return response.data;
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    throw error;
  }
};

/**
 * Obtiene un usuario por su ID.
 * @param {string} userId - ID del usuario.
 */
export const getUserByIdService = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener el usuario con ID ${userId}:`, error);
    throw error;
  }
};

/**
 * Actualiza un usuario por su ID.
 * @param {string} userId - ID del usuario.
 * @param {object} updateData - Datos a actualizar.
 */
export const updateUserService = async (userId, updateData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${userId}`, updateData);
    // Se espera que el backend retorne { status, user }
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar el usuario con ID ${userId}:`, error);
    throw error;
  }
};

/**
 * Elimina un usuario por su ID.
 * @param {string} userId - ID del usuario.
 */
export const deleteUserService = async (userId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${userId}`);
    // Se espera que el backend retorne { status, message }
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar el usuario con ID ${userId}:`, error);
    throw error;
  }
};

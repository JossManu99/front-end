import axios from 'axios';

// Obtén la URL base desde la variable de entorno VITE_API_URL o usa el fallback
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/** 
 * Servicio para iniciar sesión.
 * Envía las credenciales y, si son correctas, guarda en el localStorage el token y el usuario.
 */
export const loginService = async (userData) => {
  try {
    // Validar que se hayan proporcionado email y password
    if (!userData.email || !userData.password) {
      throw new Error("El email y la contraseña son obligatorios.");
    }

    const response = await axios.post(`${BASE_URL}/api/login`, userData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Verificar si la respuesta es exitosa
    if (response.status === 200 && response.data.status === 'success') {
      // Guardar el token en el localStorage
      localStorage.setItem('authToken', response.data.token);
      // Guardar también el objeto usuario actualizado en el localStorage
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return { status: 'success', data: response.data };
    } else {
      throw new Error(response.data.message || 'Error en el inicio de sesión.');
    }
  } catch (error) {
    console.error('Error en loginService:', error.message);
    throw new Error(
      error.response?.data?.message || error.message || 'Error desconocido'
    );
  }
};

// URL base para los endpoints de usuarios
const API_USERS_URL = `${BASE_URL}/api/users`;

/**
 * Obtiene todos los usuarios.
 */
export const getUsersService = async () => {
  try {
    const response = await axios.get(API_USERS_URL);
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
    const response = await axios.get(`${API_USERS_URL}/${userId}`);
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
    const response = await axios.put(`${API_USERS_URL}/${userId}`, updateData);
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
    const response = await axios.delete(`${API_USERS_URL}/${userId}`);
    // Se espera que el backend retorne { status, message }
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar el usuario con ID ${userId}:`, error);
    throw error;
  }
};

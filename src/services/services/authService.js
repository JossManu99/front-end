import axios from 'axios';

// Servicio para iniciar sesión
export const loginService = async (userData) => {
  try {
    // Validar que se hayan proporcionado email y password
    if (!userData.email || !userData.password) {
      throw new Error("El email y la contraseña son obligatorios.");
    }

    const response = await axios.post('http://localhost:3000/api/login', userData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Verificar si la respuesta es exitosa
    if (response.status === 200 && response.data.status === 'success') {
      localStorage.setItem('authToken', response.data.token); // Almacenar token
      return { status: 'success', data: response.data };
    } else {
      throw new Error(response.data.message || 'Error en el inicio de sesión.');
    }
  } catch (error) {
    console.error('Error en loginService:', error.message);
    throw new Error(error.response?.data?.message || error.message || 'Error desconocido');
  }
};

// Servicio para obtener el perfil del usuario
export const profileService = async (userId) => {
  try {
    if (!userId) {
      throw new Error("El ID del usuario es obligatorio.");
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error("El usuario no está autenticado.");
    }

    const response = await axios.get(`http://localhost:3000/api/profile/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200 && response.data.status === 'success') {
      return { status: 'success', data: response.data.user };
    } else {
      throw new Error(response.data.message || 'Error al obtener el perfil.');
    }
  } catch (error) {
    console.error('Error en profileService:', error.message);
    throw new Error(error.response?.data?.message || error.message || 'Error desconocido');
  }
};

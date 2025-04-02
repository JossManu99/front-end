import axios from 'axios';

const registerUser = async (data) => {
  try {
    // Realiza la solicitud POST (solo con los datos necesarios)
    const response = await axios.post('http://localhost:3000/api/register', data);
    return response.data;
  } catch (error) {
    console.error('Error en el registro:', error.response?.data || error.message);
    throw error;
  }
};

export default registerUser;

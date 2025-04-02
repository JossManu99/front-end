import axios from 'axios';

// Configuración base de la URL del backend
const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Cambia esta URL a la de tu servidor
});

// Crear un nuevo horario para una empresa
export const createTurno = async (empresa, turnos) => {
  try {
    const response = await api.post('/empresas', { empresa, turnos });
    return response.data;
  } catch (error) {
    console.error('Error al crear el turno:', error.response.data);
    throw error.response.data;
  }
};

// Obtener todos los turnos de todas las empresas (o por empresa específica)
export const getTurnos = async (empresa = '') => {
  try {
    const response = await api.get('/empresas', { params: { empresa } });
    return response.data;
  } catch (error) {
    console.error('Error al obtener los turnos:', error.response.data);
    throw error.response.data;
  }
};

// Obtener un turno específico por su ID
export const getTurnoById = async (id) => {
  try {
    const response = await api.get(`/empresas/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener el turno:', error.response.data);
    throw error.response.data;
  }
};

// Actualizar un turno
export const updateTurno = async (id, clave, turno, horarios) => {
  try {
    const response = await api.put(`/empresas/${id}`, { clave, turno, horarios });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar el turno:', error.response.data);
    throw error.response.data;
  }
};

// Eliminar un turno
export const deleteTurno = async (id) => {
  try {
    const response = await api.delete(`/empresas/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar el turno:', error.response.data);
    throw error.response.data;
  }
};

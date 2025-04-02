import axios from 'axios';

// Obtiene la URL base desde la variable de entorno VITE_API_URL o usa 'http://localhost:3000' por defecto
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api/tablaroltbf`;

// Obtener todas las tablas de rol
export const tbfObtenerTablarolesTbf = async () => {
  try {
    const response = await axios.get(API_URL);
    console.log("📡 Datos obtenidos del backend:", response.data); // Debug: Ver datos en consola
    return response.data;
  } catch (error) {
    console.error("❌ Error al obtener los tablaroles:", error.response?.data || error.message);
    throw error;
  }
};

// Obtener una tabla de rol por ID
export const tbfObtenerTablarolTbf = async (id) => {
  if (!id) throw new Error("❌ ID no proporcionado");
  
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error al obtener el tablarol con ID ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

// Crear una nueva tabla de rol
export const tbfCrearTablarolTbf = async (tablarolData) => {
  try {
    const response = await axios.post(API_URL, tablarolData);
    return response.data;
  } catch (error) {
    console.error('❌ Error al crear el tablarol:', error.response?.data || error.message);
    throw error;
  }
};

// Actualizar una tabla de rol por ID
export const tbfActualizarTablarolTbf = async (id, tablarolData) => {
  if (!id) throw new Error("❌ ID no proporcionado");
  
  try {
    const response = await axios.put(`${API_URL}/${id}`, tablarolData);
    return response.data;
  } catch (error) {
    console.error(`❌ Error al actualizar el tablarol con ID ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

// Eliminar una tabla de rol por ID
export const tbfEliminarTablarolTbf = async (id) => {
  if (!id) throw new Error("❌ ID no proporcionado");
  
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.status === 204 ? { message: "✅ Tablarol eliminado correctamente" } : response.data;
  } catch (error) {
    console.error(`❌ Error al eliminar el tablarol con ID ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

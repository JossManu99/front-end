import axios from 'axios';

const API_URL = 'http://localhost:3000/api/tablaroles'; // Ajusta la URL según tu backend

// Obtener todos los tablaroles
export const obtenertablarol = async () => {
    try {
        const response = await axios.get(API_URL);
        console.log("📡 Datos obtenidos del backend:", response.data); // Debug: Ver datos en consola
        return response.data;
    } catch (error) {
        console.error("❌ Error al obtener los tablaroles:", error.response?.data || error.message);
        throw error;
    }
};

// Obtener un tablarol por ID
export const obtenerTablarol = async (id) => {
    if (!id) throw new Error("❌ ID no proporcionado");

    try {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error("❌ Error al obtener el tablarol:", error.response?.data || error.message);
        throw error;
    }
};

// Crear un nuevo tablarol
export const crearTablarol = async (data) => {
    try {
        const response = await axios.post(API_URL, data);
        return response.data;
    } catch (error) {
        console.error("❌ Error al crear el tablarol:", error.response?.data || error.message);
        throw error;
    }
};

// Actualizar un tablarol existente
export const actualizarTablarol = async (id, data) => {
    if (!id) throw new Error("❌ ID no proporcionado");

    try {
        const response = await axios.put(`${API_URL}/${id}`, data);
        return response.data;
    } catch (error) {
        console.error("❌ Error al actualizar el tablarol:", error.response?.data || error.message);
        throw error;
    }
};

// Eliminar un tablarol por su ID
export const eliminarTablarol = async (id) => {
    if (!id) throw new Error("❌ ID no proporcionado");

    try {
        const response = await axios.delete(`${API_URL}/${id}`);
        return response.status === 204 ? { message: "✅ Tablarol eliminado correctamente" } : response.data;
    } catch (error) {
        console.error("❌ Error al eliminar el tablarol:", error.response?.data || error.message);
        throw error;
    }
};

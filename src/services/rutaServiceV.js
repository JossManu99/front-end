import axios from 'axios';

// Obtiene la URL base desde la variable de entorno VITE_API_URL o usa 'http://localhost:3000' por defecto
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api/rutas`;

// Obtener todas las rutas
export const obtenerRutas = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error("Error al obtener las rutas:", error.response?.data || error.message);
        throw error;
    }
};

// Obtener una ruta por su ID
export const obtenerRuta = async (id) => {
    if (!id) throw new Error("ID no proporcionado");

    try {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error al obtener la ruta:", error.response?.data || error.message);
        throw error;
    }
};

// Crear una nueva ruta
export const crearRuta = async (rutaData) => {
    try {
        const response = await axios.post(API_URL, rutaData);
        return response.data;
    } catch (error) {
        console.error("Error al crear la ruta:", error.response?.data || error.message);
        throw error;
    }
};

// Actualizar una ruta existente
export const actualizarRuta = async (id, rutaData) => {
    if (!id) throw new Error("ID no proporcionado");

    try {
        const response = await axios.put(`${API_URL}/${id}`, rutaData);
        return response.data;
    } catch (error) {
        console.error("Error al actualizar la ruta:", error.response?.data || error.message);
        throw error;
    }
};

// Eliminar una ruta por su ID
export const eliminarRuta = async (id) => {
    if (!id) throw new Error("ID no proporcionado");

    try {
        const response = await axios.delete(`${API_URL}/${id}`);
        return response.status === 204
            ? { message: "Ruta eliminada correctamente" }
            : response.data;
    } catch (error) {
        console.error("Error al eliminar la ruta:", error.response?.data || error.message);
        throw error;
    }
};

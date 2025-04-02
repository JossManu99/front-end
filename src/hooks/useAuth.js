import { jwtDecode } from "jwt-decode";

export const useAuth = () => {
  const token = localStorage.getItem('token');

  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; // El tiempo actual en segundos

    // Verificar si el token ha expirado
    if (decoded.exp && decoded.exp < currentTime) {
      console.log('El token ha expirado.');
      localStorage.removeItem('token'); // Eliminar token expirado
      return null; // Si el token ha expirado, retorna null
    }

    console.log('Token decodificado:', decoded);
    return decoded; // Si el token es válido, retorna el contenido decodificado
  } catch (error) {
    console.error('Error al decodificar el token:', error);
    return null;
  }
};

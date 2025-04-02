import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element, role }) => {
  // Obtener el objeto 'user' de localStorage
  const user = JSON.parse(localStorage.getItem('user'));

  // Log de depuración (remover en producción)
  console.log('user:', user, 'required role:', role);

  // Si no existe el usuario, redirigir al login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Verificar que el usuario tenga el rol requerido.
  // Nota: Si deseas permitir que un admin acceda a rutas de usuario, ajusta la condición.
  if (role) {
    const requiredRole = role.toLowerCase();
    const userRole = user.role?.toLowerCase();
    if (userRole !== requiredRole && !(requiredRole === 'user' && userRole === 'admin')) {
      return <Navigate to="/access-denied" replace />;
    }
  }

  // Si la verificación es correcta, renderizar el componente protegido
  return element;
};

export default ProtectedRoute;

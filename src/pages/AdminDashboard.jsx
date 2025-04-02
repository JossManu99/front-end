import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AdminDashboard = () => {
  const user = useAuth();


  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" />; // Redirige si el rol no es admin
  }

  return <div>Bienvenido al panel de administrador</div>;
};

export default AdminDashboard;

import { useAuth } from '../hooks/useAuth';  // Asegúrate de que esta ruta sea correcta
import { Navigate } from 'react-router-dom';  // Asegúrate de tener esta importación también

const UserDashboard = () => {
  const user = useAuth();  // Llamas al hook

  if (!user) {
      return <Navigate to="/login" />;  // Si no hay usuario, rediriges a login
  }

  if (user.role !== 'user') {
      return <Navigate to="/" />;  // Si no es un usuario, rediriges a la página principal
  }

  return <div>Bienvenido al panel de usuario</div>;  // Si todo está bien, renderizas el contenido
};

export default UserDashboard;

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute'; // Asegúrate de que esta ruta sea correcta
import ViajePage from './pages/viaje/ViajePage';
import UpdateViajePage from './pages/viaje/UpdateViajePage';
import CreateViajePage from './pages/viaje/CreateViajePage';
import OperadorPage from './pages/operadores/OperadorPage';
import Operadores from './pages/operadores/operadores';
import BusForm from './components/autobuses/AutobusForm';
import FormRegister from './components/auth/FormRegister';
import Profile from './components/auth/Profile';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import Autobuses from './pages/autobus/Autobuses';
import LoginForm from './components/auth/LoginForm';
import AccessDenied from './pages/AccessDenied'; // Página de acceso denegado
import Dashboard from './components/Dashboarduser';
import TurnosModal from './components/clientes/turnosModal';
import FormEmpresarol from './components/empresaroles/formroll';
import EmpresaDetalles from './components/empresaroles/EmpresaRollModal';
import FormCliente from './components/clientes/clienteForm';
import FormularioRuta from './components/rutasV/formrutaV';
import RutasTable from './components/rutasV/ListaRutas';
import ViajeFormT from './components/horariosdeempresa/tablaH';
import Tablaroles from './components/horariosdeempresa/tablarol';
import TablarolForm from './components/creacionderoles/TablarolForm';
import TablarolTbfList from './components/creacionderoles/TablarolTbfList';
import FuelForm from './components/combustible/FuelForm';
import MaintenanceForm from './components/mantenimiento/MaintenanceForm';
import RefactionForm from './components/mantenimiento/FormularioRefaccion';
import DashboardHeader from './components/header/DashboardHeader';
import FormularioPropietario from './components/autobuses/propietarioform';
import RecargarCombustible from './components/combustible/RecargarCombustible';
import VerRecargas from './components/combustible/VerRecargas';
import TablaRolTbfComponent from './components/creacionderoles/TablaRolTbfComponent';
import Utilidades from './components/utilidades/utilidades';
import Nomina from './components/Nominas/Nominas';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas protegidas para usuarios con rol admin o user */}
        <Route
          path="/lista-viajes"
          element={<ProtectedRoute element={<ViajePage />} role="admin" />}
        />
        <Route
          path="/editar-viaje/:id"
          element={<ProtectedRoute element={<UpdateViajePage />} role="admin" />}
        />
        <Route
          path="/crear-viaje"
          element={<ProtectedRoute element={<CreateViajePage />} role="admin" />}
        />
        <Route
          path="/crear-operador"
          element={<ProtectedRoute element={<OperadorPage />} role="admin" />}
        />
        <Route
          path="/lista-operadores"
          element={<ProtectedRoute element={<Operadores />} role="admin" />}
        />
        <Route
          path="/crear-autobus"
          element={<ProtectedRoute element={<BusForm />} role="admin" />}
        />
        <Route
          path="/lista-autobus"
          element={<ProtectedRoute element={<Autobuses />} role="admin" />}
        />
        <Route
          path="/admin-dashboard"
          element={<ProtectedRoute element={<AdminDashboard />} role="admin" />}
        />
        <Route
          path="/user-dashboard"
          element={<ProtectedRoute element={<UserDashboard />} role="user" />}
        />
        <Route
          path="/panelusuario"
          element={<ProtectedRoute element={<Dashboard />} role="admin" />}
        />
        <Route
          path="/recargacombustible"
          element={<ProtectedRoute element={<RecargarCombustible />} role="admin" />}
        />
        <Route
          path="/profile/:id"
          element={<ProtectedRoute element={<Profile />} />}
        />
        <Route
          path="/profile"
          element={<ProtectedRoute element={<Profile />} />}
        />
        <Route
          path="/Turnosclientes"
          element={<ProtectedRoute element={<FormCliente />} role="admin" />}
        />
        <Route
          path="/verturnosclientes"
          element={<ProtectedRoute element={<TurnosModal />} role="admin" />}
        />
        <Route
          path="/rol"
          element={<ProtectedRoute element={<FormEmpresarol />} role="admin" />}
        />
        <Route
          path="/det"
          element={<ProtectedRoute element={<EmpresaDetalles />} role="admin" />}
        />
        <Route
          path="/rutaf"
          element={<ProtectedRoute element={<FormularioRuta />} role="admin" />}
        />
        <Route
          path="/li"
          element={<ProtectedRoute element={<RutasTable />} role="admin" />}
        />
        <Route
          path="/tabla"
          element={<ProtectedRoute element={<ViajeFormT />} role="admin" />}
        />
        <Route
          path="/vertablaroles"
          element={<ProtectedRoute element={<Tablaroles />} role="admin" />}
        />
        {/* Estas dos rutas se protegerán, pero serán accesibles para ambos roles: admin y user */}
        <Route 
          path="/tablarfr" 
          element={<ProtectedRoute element={<TablarolForm />} />} 
        />
        <Route 
          path="/vertablafr" 
          element={<ProtectedRoute element={<TablarolTbfList />} />} 
        />
        <Route
          path="/combustible"
          element={<ProtectedRoute element={<FuelForm />} role="admin" />}
        />
        <Route
          path="/mantenimiento"
          element={<ProtectedRoute element={<MaintenanceForm />} role="admin" />}
        />
        <Route
          path="/refacciones"
          element={<ProtectedRoute element={<RefactionForm />} role="admin" />}
        />
        <Route
          path="/das"
          element={<ProtectedRoute element={<DashboardHeader />} role="admin" />}
        />
        <Route
          path="/propietario"
          element={<ProtectedRoute element={<FormularioPropietario />} role="admin" />}
        />
        <Route
          path="/verrecargacombustible"
          element={<ProtectedRoute element={<VerRecargas />} role="admin" />}
        />
        <Route
          path="/cargarTablasRol"
          element={<ProtectedRoute element={<TablaRolTbfComponent />} />}
        />
        <Route
          path="/utilidades"
          element={<ProtectedRoute element={<Utilidades />} role="admin" />}
        />
        <Route
          path="/Nomina"
          element={<ProtectedRoute element={<Nomina />} role="admin" />}
        />

        {/* Rutas públicas */}
        <Route path="/registrar" element={<FormRegister />} />
        <Route path="/" element={<LoginForm />} />
        <Route path="/access-denied" element={<AccessDenied />} />
      </Routes>
    </Router>
  );
}

export default App;

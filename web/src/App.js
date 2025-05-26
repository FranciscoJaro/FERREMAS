import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavbarFerremas from './components/NavbarFerremas';
import FooterFerremas from './components/FooterFerremas';

// Páginas generales (fuera de subcarpetas)
import HomePage from './pages/HomePage';
import SobreNosotros from './pages/SobreNosotros';
import Contacto from './pages/Contacto';
import LoginPage from './pages/LoginPage';
import Registro from './pages/Registro';

// Páginas ADMIN (carpeta /pages/Admin/)
import AdminPage from './pages/Admin/AdminPage';
import GestionUsuariosPage from './pages/Admin/GestionUsuariosPage';
import GestionProductosPage from './pages/Admin/GestionProductosPage';
import ReportesAdminPage from "./pages/Admin/ReportesAdminPage";

// Páginas de otros roles (cada una en su carpeta)
import VendedorPage from './pages/Vendedor/VendedorPage';
import BodegueroPage from './pages/Bodeguero/BodegueroPage';
import PerfilPage from './pages/Cliente/PerfilPage';
// Si tienes más roles/agrega aquí (ejemplo ContadorPage, etc.)

import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <Router>
      <NavbarFerremas />
      <Routes>
        {/* Páginas generales */}
        <Route path="/" element={<HomePage />} />
        <Route path="/sobre-nosotros" element={<SobreNosotros />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<Registro />} />

        {/* Panel ADMIN + rutas internas protegidas */}
        <Route
          path="/admin"
          element={
            <PrivateRoute rolesPermitidos={["administrador"]}>
              <AdminPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/usuarios"
          element={
            <PrivateRoute rolesPermitidos={["administrador"]}>
              <GestionUsuariosPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/productos"
          element={
            <PrivateRoute rolesPermitidos={["administrador"]}>
              <GestionProductosPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/reportes"
          element={
            <PrivateRoute rolesPermitidos={["administrador"]}>
              <ReportesAdminPage />
            </PrivateRoute>
          }
        />

        {/* Rutas protegidas de otros roles */}
        <Route
          path="/vendedor"
          element={
            <PrivateRoute rolesPermitidos={["vendedor"]}>
              <VendedorPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/bodeguero"
          element={
            <PrivateRoute rolesPermitidos={["bodeguero"]}>
              <BodegueroPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/perfil"
          element={
            <PrivateRoute rolesPermitidos={["cliente"]}>
              <PerfilPage />
            </PrivateRoute>
          }
        />
      </Routes>
      <FooterFerremas />
    </Router>
  );
}

export default App;

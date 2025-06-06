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
import InformesVentaPage from "./pages/Admin/InformesVentaPage";

// Páginas de otros roles 
import VendedorPage from './pages/Vendedor/VendedorPage';
import BodegueroPage from './pages/Bodeguero/BodegueroPage';
import PerfilPage from './pages/Cliente/PerfilPage';

//Página de carrito (cliente)
import CarritoPage from './pages/Cliente/CarritoPage';

//pagina contador
import ReportesFinancierosPage from './pages/Contador/ReportesFinancierosPage';
//Página de cambio de contraseña**
import CambiarContrasenaPage from './pages/CambiarContrasenaPage';
import RecuperarContrasenaPage from './pages/RecuperarContrasenaPage';

import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <Router>
      <NavbarFerremas />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sobre-nosotros" element={<SobreNosotros />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<Registro />} />
          <Route
            path="/cambiar-contrasena"
            element={
              <PrivateRoute rolesPermitidos={["administrador", "cliente", "vendedor", "bodeguero", "contador"]}>
                <CambiarContrasenaPage />
              </PrivateRoute>
            }
          />
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
          <Route
            path="/admin/Informes"
            element={
              <PrivateRoute rolesPermitidos={["administrador"]}>
                <InformesVentaPage />
              </PrivateRoute>
            }
          />
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
          <Route
            path="/carrito"
            element={
              <PrivateRoute rolesPermitidos={["cliente"]}>
                <CarritoPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/contador"
            element={
               <PrivateRoute rolesPermitidos={["contador"]}>
                 <ReportesFinancierosPage />
             </PrivateRoute>
            }
          />
          <Route path="/recuperar-contrasena" element={<RecuperarContrasenaPage />} />
        </Routes>
      </div>
      <FooterFerremas />
    </Router>
  );
}

export default App;

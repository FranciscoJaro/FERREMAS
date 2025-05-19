import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavbarFerremas from './components/NavbarFerremas';
import FooterFerremas from './components/FooterFerremas';
import HomePage from './pages/HomePage';
import SobreNosotros from './pages/SobreNosotros';
import Contacto from './pages/Contacto';
import LoginPage from './pages/LoginPage';
import Registro from './pages/Registro';
// ...

function App() {
  return (
    <Router>
      <NavbarFerremas />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sobre-nosotros" element={<SobreNosotros />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<Registro />} />
      </Routes>
      <FooterFerremas />
    </Router>
  );
}

export default App;

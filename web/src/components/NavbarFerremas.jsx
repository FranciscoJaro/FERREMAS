import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { FaShoppingCart, FaUserCircle } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';

export default function NavbarFerremas() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    navigate("/login");
    window.location.reload();
  };

  const renderLinks = () => {
    if (!usuario) {
      return (
        <>
          <Nav.Link as={Link} to="/" className="nav-link-custom">Inicio</Nav.Link>
          <Nav.Link as={Link} to="/sobre-nosotros" className="nav-link-custom">Sobre Nosotros</Nav.Link>
          <Nav.Link as={Link} to="/contacto" className="nav-link-custom">Contáctenos</Nav.Link>
        </>
      );
    }

    switch (usuario.tipo_usuario) {
      case "cliente":
        return (
          <>
            <Nav.Link as={Link} to="/" className="nav-link-custom">Inicio</Nav.Link>
            <Nav.Link as={Link} to="/sobre-nosotros" className="nav-link-custom">Sobre Nosotros</Nav.Link>
            <Nav.Link as={Link} to="/contacto" className="nav-link-custom">Contáctenos</Nav.Link>
            <Nav.Link as={Link} to="/perfil" className="nav-link-custom">
              <FaUserCircle size={21} style={{ marginBottom: 2, marginRight: 4 }} />
              Mi Perfil
            </Nav.Link>
            <Nav.Link as={Link} to="/carrito" className="nav-link-custom">
              <FaShoppingCart size={22} title="Carrito" />
            </Nav.Link>
          </>
        );
      case "administrador":
        return (
          <>
            <Nav.Link as={Link} to="/admin" className="nav-link-custom">Panel Admin</Nav.Link>
          </>
        );
      case "vendedor":
        return (
          <>
            <Nav.Link as={Link} to="/vendedor" className="nav-link-custom">Panel Vendedor</Nav.Link>
          </>
        );
      case "bodeguero":
        return (
          <>
            <Nav.Link as={Link} to="/bodeguero" className="nav-link-custom">Panel Bodeguero</Nav.Link>
          </>
        );
      case "contador":
        return (
          <>
            <Nav.Link as={Link} to="/contador" className="nav-link-custom">Panel Contador</Nav.Link>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Navbar
      bg="dark"
      variant="dark"
      expand="lg"
      className="shadow-sm"
      style={{
        minHeight: 60,
        padding: "0 0.6rem",
        letterSpacing: "1px",
        borderBottom: "2px solid #2563eb"
      }}
    >
      <Container fluid>
        <Navbar.Brand
          as={Link}
          to="/"
          style={{
            fontWeight: 'bold',
            letterSpacing: '2.5px',
            fontSize: "1.5rem",
            color: "#38b6ff"
          }}
        >
          FERREMAS
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto" style={{ fontSize: "1.1rem" }}>
            {renderLinks()}
          </Nav>
          <Nav className="align-items-center">
            {usuario ? (
              <>
                <span className="text-light me-2">Hola, {usuario.nombre}</span>
                <button
                  className="btn btn-outline-light btn-sm ms-3"
                  onClick={handleLogout}
                  style={{
                    borderRadius: "1.3rem",
                    padding: "4px 16px",
                    border: "1px solid #38b6ff"
                  }}
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="nav-link-custom">Iniciar Sesión</Nav.Link>
                <Nav.Link as={Link} to="/registro" className="nav-link-custom">Registrarse</Nav.Link>
                <Nav.Link as={Link} to="/carrito" className="ms-3 nav-link-custom">
                  <FaShoppingCart size={22} title="Carrito" />
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
      <style>{`
        .nav-link-custom {
          transition: color .18s;
        }
        .nav-link-custom:hover {
          color: #38b6ff !important;
          text-decoration: underline;
        }
      `}</style>
    </Navbar>
  );
}

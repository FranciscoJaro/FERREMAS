// src/components/NavbarFerremas.jsx
import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { FaShoppingCart } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';

export default function NavbarFerremas() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    navigate("/login");
    window.location.reload();
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm px-4">
      <Container fluid>
        <Navbar.Brand as={Link} to="/" style={{ fontWeight: 'bold', letterSpacing: '2px' }}>FERREMAS</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Inicio</Nav.Link>
            <Nav.Link as={Link} to="/sobre-nosotros">Sobre Nosotros</Nav.Link>
            <Nav.Link as={Link} to="/contacto">Contáctenos</Nav.Link>
          </Nav>
          <Nav className="align-items-center">
            {usuario ? (
              <>
                <span className="text-light me-2">Hola, {usuario.nombre}</span>
                <Nav.Link as={Link} to="/carrito" className="ms-3">
                  <FaShoppingCart size={22} style={{ verticalAlign: 'middle' }} title="Carrito" />
                </Nav.Link>
                <button className="btn btn-outline-light btn-sm ms-2" onClick={handleLogout}>
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Iniciar Sesión</Nav.Link>
                <Nav.Link as={Link} to="/registro">Registrarse</Nav.Link>
                <Nav.Link as={Link} to="/carrito" className="ms-3">
                  <FaShoppingCart size={22} style={{ verticalAlign: 'middle' }} title="Carrito" />
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

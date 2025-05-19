import React, { useEffect, useState } from 'react';
import { Container, Button, Card, Row, Col, Spinner } from 'react-bootstrap';

export default function HomePage() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:8000/productos/')
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar productos');
        return res.json();
      })
      .then(data => {
        setProductos(data);
        setCargando(false);
      })
      .catch(err => {
        setError('No se pudieron cargar los productos. Intenta más tarde.');
        setCargando(false);
      });
  }, []);

  return (
    <>
      {/* PORTADA */}
      <div
        className="text-white text-center py-5"
        style={{
          background: "linear-gradient(90deg, #2563eb 0%, #38b6ff 100%)",
          minHeight: "260px",
          marginBottom: "3rem",
        }}
      >
        <h1 className="display-4 fw-bold mb-3" style={{ letterSpacing: "1px" }}>
          Tu tienda online de <span style={{ color: "#FFD600" }}>herramientas</span>
        </h1>
        <p className="lead mb-0" style={{ fontSize: "1.4rem" }}>
          Compra fácil, rápido y seguro.<br />¡Todo lo que buscas para tus proyectos!
        </p>
      </div>

      {/* LISTA DE PRODUCTOS */}
      <Container className="my-5">
        <h2 className="mb-4 fw-semibold">Productos destacados</h2>
        {cargando && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" /> <br />
            <span className="text-secondary">Cargando productos...</span>
          </div>
        )}
        {error && <div className="alert alert-danger">{error}</div>}
        <Row>
          {productos.length === 0 && !cargando && !error && (
            <div className="text-center text-muted mb-5">No hay productos disponibles</div>
          )}
          {productos.map((producto) => (
            <Col md={4} key={producto.id_producto} className="mb-4 d-flex align-items-stretch">
              <Card className="shadow-sm border-0 h-100" style={{ transition: "transform 0.18s", cursor: "pointer" }}>
                <Card.Img
                  variant="top"
                  src="https://via.placeholder.com/400x220?text=Producto" // Puedes cambiar si tienes url real
                  style={{ objectFit: "cover", height: "220px", borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem" }}
                  alt={producto.nombre}
                />
                <Card.Body>
                  <Card.Title className="fw-bold">{producto.nombre}</Card.Title>
                  <Card.Text>{producto.descripcion}</Card.Text>
                  <h5 className="text-primary fw-bold mb-3">${producto.precio.toLocaleString('es-CL')}</h5>
                  <Button variant="primary" className="w-100">Agregar al carrito</Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
}

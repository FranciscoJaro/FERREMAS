import React, { useEffect, useState } from 'react';
import { Container, Button, Card, Row, Col, Spinner, Badge, Alert } from 'react-bootstrap';
import { FaTools } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function shortDesc(text, max = 48) {
  return text?.length > max ? text.slice(0, max - 3) + "..." : text;
}

export default function HomePage() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState(null);
  const [tipoMsg, setTipoMsg] = useState('success');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:4000/productos')
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar productos');
        return res.json();
      })
      .then(data => {
        // Ordena por más nuevos primero
        data.sort((a, b) => b.id_producto - a.id_producto);
        setProductos(data);
        setCargando(false);
      })
      .catch(() => {
        setError('No se pudieron cargar los productos. Intenta más tarde.');
        setCargando(false);
      });
  }, []);

  // -------- AGREGAR AL CARRITO --------
  const handleAgregarCarrito = async (producto) => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario || usuario.tipo_usuario !== "cliente" || !usuario.id_usuario) {
      setMensaje("Debes iniciar sesión como cliente para comprar.");
      setTipoMsg("warning");
      setTimeout(() => navigate("/login"), 1200);
      return;
    }
    try {
      const resp = await fetch("http://localhost:4000/carrito/agregar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario: usuario.id_usuario,
          id_producto: producto.id_producto,
          cantidad: 1
        })
      });
      if (!resp.ok) throw new Error("No se pudo agregar al carrito");
      setMensaje("Producto agregado al carrito.");
      setTipoMsg("success");
    } catch (e) {
      setMensaje("Ocurrió un error al agregar al carrito.");
      setTipoMsg("danger");
    }
    setTimeout(() => setMensaje(null), 1800);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* PORTADA */}
      <div
        className="d-flex flex-column justify-content-center align-items-center"
        style={{
          background: "linear-gradient(90deg, #2563eb 0%, #38b6ff 100%)",
          minHeight: "300px",
          width: "100vw",
          marginLeft: "calc(-50vw + 50%)",
          marginRight: "calc(-50vw + 50%)",
        }}
      >
        <h1 className="display-4 fw-bold mb-2 text-center" style={{ letterSpacing: "2.5px", lineHeight: "1.1" }}>
          Tu tienda online de <span style={{ color: "#FFD600" }}>herramientas</span>
        </h1>
        <p className="lead mb-0 text-center" style={{ fontSize: "1.25rem" }}>
          Compra fácil, rápido y seguro.<br />¡Todo lo que buscas para tus proyectos!
        </p>
      </div>

      {/* MENSAJE de feedback */}
      <Container fluid="md" style={{ maxWidth: 740 }}>
        {mensaje && (
          <Alert
            variant={tipoMsg}
            className="mt-4 text-center py-2"
            style={{ fontSize: "1.06rem", letterSpacing: ".3px" }}
          >
            {mensaje}
          </Alert>
        )}
      </Container>

      {/* PRODUCTOS */}
      <div style={{
        flex: 1,
        background: "#f9fafd",
        paddingTop: "48px",
        paddingBottom: "60px",
      }}>
        <Container fluid="md">
          {/* TÍTULO MEJORADO */}
          <div className="text-center mb-4">
            <span style={{ color: "#2563eb", fontSize: "2rem", marginRight: 10, verticalAlign: "middle" }}>
              <FaTools />
            </span>
            <span className="fw-bold" style={{ fontSize: "2rem", letterSpacing: "1.5px" }}>
              Productos destacados
            </span>
            <div style={{ width: 80, height: 5, background: "#FFD600", borderRadius: 4, margin: "10px auto 0" }} />
          </div>

          {cargando && (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" /> <br />
              <span className="text-secondary">Cargando productos...</span>
            </div>
          )}
          {error && <div className="alert alert-danger">{error}</div>}

          <Row className="g-4 justify-content-center">
            {productos.length === 0 && !cargando && !error && (
              <div className="text-center text-muted mb-5">No hay productos disponibles</div>
            )}
            {productos.map((producto, idx) => (
              <Col xs={12} sm={6} md={4} lg={3} key={producto.id_producto} className="d-flex justify-content-center">
                <Card
                  className="producto-card border-0 shadow-sm"
                  style={{
                    borderRadius: "1.3rem",
                    minWidth: 250,
                    maxWidth: 320,
                    minHeight: 380,
                    display: "flex",
                    flexDirection: "column",
                    background: "#fff",
                    position: "relative"
                  }}
                >
                  <div style={{
                    overflow: "hidden",
                    borderTopLeftRadius: "1.3rem",
                    borderTopRightRadius: "1.3rem",
                    background: "#f1f1f1",
                  }}>
                    <Card.Img
                      variant="top"
                      src={producto.imagen || "https://via.placeholder.com/400x220?text=Producto"}
                      style={{
                        objectFit: "cover",
                        height: "180px",
                        transition: "transform .20s",
                        borderRadius: "1.3rem 1.3rem 0 0"
                      }}
                      alt={producto.nombre}
                      className="producto-img"
                    />
                  </div>
                  {/* Badge "Nuevo" */}
                  {idx === 0 && (
                    <Badge bg="warning" text="dark" style={{
                      position: "absolute",
                      top: 16, left: 20, fontSize: "1.05rem", borderRadius: "1rem", padding: "5px 16px", fontWeight: 600
                    }}>
                      ¡Nuevo!
                    </Badge>
                  )}
                  <Card.Body className="d-flex flex-column py-3 px-3">
                    <Card.Title className="fw-bold fs-5 mb-1">{producto.nombre}</Card.Title>
                    <Card.Text className="mb-2 text-secondary" style={{
                      minHeight: 35, fontSize: "1.02rem"
                    }}>
                      {shortDesc(producto.descripcion)}
                    </Card.Text>
                    <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#008700" }}>
                      ${Number(producto.precio).toLocaleString('es-CL')}
                    </div>
                    <Button
                      variant="primary"
                      className="mt-auto w-100 fw-semibold agregar-btn"
                      style={{
                        borderRadius: "2rem",
                        fontSize: "1.08rem",
                        boxShadow: "0 2px 10px 0 #2563eb22",
                        transition: "box-shadow .18s, background .16s",
                        padding: "8px 0"
                      }}
                      onClick={() => handleAgregarCarrito(producto)}
                    >
                      Agregar al carrito
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      <style>{`
        .producto-card {
          transition: box-shadow .16s, transform .13s;
        }
        .producto-card:hover {
          box-shadow: 0 8px 32px #38b6ff24, 0 2px 8px #0002;
          transform: translateY(-6px) scale(1.02);
        }
        .producto-card:hover .producto-img {
          transform: scale(1.05);
          filter: brightness(.95);
        }
        .agregar-btn:hover, .agregar-btn:focus {
          background: #159fff !important;
          box-shadow: 0 7px 16px #38b6ff29;
        }
        @media (max-width: 575px) {
          .producto-card { min-height: 230px !important; }
        }
      `}</style>
    </div>
  );
}

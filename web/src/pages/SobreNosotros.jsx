import React from 'react';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { FaHandsHelping, FaTruck, FaCheckCircle, FaTools, FaUsers } from "react-icons/fa";

export default function SobreNosotros() {
  return (
    <div style={{ background: "#f6f9fb", minHeight: "85vh", paddingTop: 40 }}>
      <Container className="py-5">
        {/* Título centrado y con ícono */}
        <div className="text-center mb-5">
          <span style={{ fontSize: 38, color: "#2563eb", verticalAlign: "middle" }}>
            <FaUsers />
          </span>
          <span className="fw-bold" style={{ fontSize: 32, marginLeft: 14, letterSpacing: "1px", color: "#2563eb" }}>
            Sobre Nosotros
          </span>
          <div style={{ width: 85, height: 4, background: "#FFD600", borderRadius: 3, margin: "18px auto 0" }} />
        </div>
        <Row className="align-items-center justify-content-center">
          <Col md={7} className="mb-4">
            <Card className="shadow-lg border-0" style={{ borderRadius: "1.3rem", background: "#fff" }}>
              <Card.Body className="px-4 py-4">
                {/* Franja de misión */}
                <Badge bg="primary" style={{
                  fontSize: "1.12rem",
                  borderRadius: "0.8rem",
                  padding: "9px 20px",
                  marginBottom: "1.2rem"
                }}>
                  Nuestra misión: <span style={{ color: "#FFD600" }}>Facilitar tus proyectos</span>
                </Badge>
                <p style={{ fontSize: "1.15rem", marginTop: 10 }}>
                  <b>FERREMAS</b> es una tienda online dedicada a ofrecer <b>herramientas</b> y productos de ferretería de la mejor calidad para profesionales, empresas y entusiastas del bricolaje.
                  <br /><br />
                  Nuestra misión es <b>facilitar tus proyectos</b>, ofreciéndote una experiencia de compra fácil, rápida y segura, con atención personalizada y el respaldo de las mejores marcas del mercado.
                </p>
                <hr />
                {/* Beneficios con íconos */}
                <Row className="text-center" style={{ fontSize: "1.09rem" }}>
                  <Col xs={6} md={6} className="mb-2">
                    <FaHandsHelping style={{ color: "#2563eb", marginRight: 7 }} />
                    Atención personalizada
                  </Col>
                  <Col xs={6} md={6} className="mb-2">
                    <FaTruck style={{ color: "#2563eb", marginRight: 7 }} />
                    Envíos a todo Chile
                  </Col>
                  <Col xs={6} md={6} className="mb-2">
                    <FaCheckCircle style={{ color: "#2563eb", marginRight: 7 }} />
                    Productos garantizados
                  </Col>
                  <Col xs={6} md={6} className="mb-2">
                    <FaTools style={{ color: "#2563eb", marginRight: 7 }} />
                    Soporte técnico y postventa
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
          <Col md={5} className="d-flex align-items-center">
            <Card className="shadow-sm border-0 w-100" style={{ borderRadius: "1.3rem" }}>
              <Card.Img
                src="https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80"
                alt="Equipo Ferremas"
                style={{ objectFit: "cover", height: "255px", borderTopLeftRadius: "1.3rem", borderTopRightRadius: "1.3rem" }}
              />
              <Card.Body>
                <Card.Text className="text-center mb-0" style={{ fontWeight: 600 }}>
                  ¡Más de 10 años acercando las mejores herramientas a tu proyecto!
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

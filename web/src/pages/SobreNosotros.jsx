import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

export default function SobreNosotros() {
  return (
    <div style={{ background: "#f6f9fb", minHeight: "85vh" }}>
      <Container className="py-5">
        <h1 className="fw-bold mb-4 text-primary">Sobre Nosotros</h1>
        <Row>
          <Col md={7}>
            <p style={{ fontSize: "1.25rem" }}>
              <b>FERREMAS</b> es una tienda online dedicada a ofrecer herramientas y productos de ferretería de la mejor calidad para profesionales, empresas y entusiastas del bricolaje.
              <br /><br />
              Nuestra misión es facilitar tus proyectos, ofreciéndote una experiencia de compra fácil, rápida y segura, con atención personalizada y el respaldo de las mejores marcas del mercado.
            </p>
            <ul style={{ fontSize: "1.1rem" }}>
              <li>✓ Atención personalizada a clientes y empresas</li>
              <li>✓ Envíos a todo Chile</li>
              <li>✓ Productos 100% garantizados</li>
              <li>✓ Soporte técnico y postventa</li>
            </ul>
          </Col>
          <Col md={5} className="d-flex align-items-center">
            <Card className="shadow-sm border-0 w-100">
              <Card.Img
                src="https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80"
                alt="Equipo Ferremas"
                style={{ objectFit: "cover", height: "250px" }}
              />
              <Card.Body>
                <Card.Text className="text-center mb-0">
                  <b>¡Más de 10 años acercando las mejores herramientas a tu proyecto!</b>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

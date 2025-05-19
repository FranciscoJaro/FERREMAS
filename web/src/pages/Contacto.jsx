import React from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';

export default function Contacto() {
  return (
    <div style={{ background: "#f6f9fb", minHeight: "85vh" }}>
      <Container className="py-5">
        <h1 className="fw-bold mb-4 text-primary">Contáctanos</h1>
        <Row>
          <Col md={7}>
            <Form>
              <Form.Group className="mb-3" controlId="formNombre">
                <Form.Label>Nombre</Form.Label>
                <Form.Control type="text" placeholder="Ingresa tu nombre" />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" placeholder="tuemail@ejemplo.com" />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formMensaje">
                <Form.Label>Mensaje</Form.Label>
                <Form.Control as="textarea" rows={4} placeholder="¿En qué te podemos ayudar?" />
              </Form.Group>
              <Button variant="primary" type="submit">Enviar mensaje</Button>
            </Form>
          </Col>
          <Col md={5}>
            <Card className="shadow-sm border-0">
              <Card.Body>
                <h5 className="fw-bold">Datos de contacto</h5>
                <p className="mb-1"><b>Email:</b> contacto@ferremas.cl</p>
                <p className="mb-1"><b>Teléfono:</b> +56 9 1234 5678</p>
                <p className="mb-1"><b>Dirección:</b> Av. Las Herramientas 123, Santiago</p>
                <hr />
                <p className="mb-0">Nuestro equipo te responderá dentro de 24 horas hábiles.</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

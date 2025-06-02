import React from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaRegPaperPlane } from "react-icons/fa";

export default function Contacto() {
  return (
    <div style={{ background: "#f6f9fb", minHeight: "85vh", paddingTop: 40 }}>
      <Container className="py-5">
        <div className="text-center mb-5">
          <span style={{ fontSize: 38, color: "#2563eb", verticalAlign: "middle" }}>
            <FaRegPaperPlane />
          </span>
          <span className="fw-bold" style={{ fontSize: 34, marginLeft: 14, letterSpacing: "1px", color: "#222" }}>
            Contáctanos
          </span>
          <div style={{ width: 85, height: 4, background: "#FFD600", borderRadius: 3, margin: "18px auto 0" }} />
        </div>
        <Row className="justify-content-center">
          <Col md={7} className="mb-4">
            <Card className="shadow-lg border-0" style={{ borderRadius: "1.3rem" }}>
              <Card.Body className="px-4 py-4">
                <Form>
                  <Form.Group className="mb-3" controlId="formNombre">
                    <Form.Label className="fw-semibold">Nombre</Form.Label>
                    <Form.Control type="text" placeholder="Ingresa tu nombre" />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="formEmail">
                    <Form.Label className="fw-semibold">Email</Form.Label>
                    <Form.Control type="email" placeholder="tuemail@ejemplo.com" />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="formMensaje">
                    <Form.Label className="fw-semibold">Mensaje</Form.Label>
                    <Form.Control as="textarea" rows={4} placeholder="¿En qué te podemos ayudar?" />
                  </Form.Group>
                  <div className="d-grid gap-2">
                    <Button variant="primary" type="submit" size="lg" style={{ borderRadius: "2rem", fontWeight: 600 }}>
                      Enviar mensaje
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
          <Col md={5} className="d-flex align-items-stretch">
            <Card className="shadow-sm border-0" style={{ borderRadius: "1.3rem", background: "#eef4fa" }}>
              <Card.Body className="px-4 py-4">
                <h5 className="fw-bold mb-3" style={{ color: "#2563eb" }}>Datos de contacto</h5>
                <p className="mb-2">
                  <FaEnvelope style={{ color: "#2563eb", marginRight: 8 }} />
                  <b>Email:</b> contacto@ferremas.cl
                </p>
                <p className="mb-2">
                  <FaPhone style={{ color: "#2563eb", marginRight: 8 }} />
                  <b>Teléfono:</b> +56 9 1234 5678
                </p>
                <p className="mb-2">
                  <FaMapMarkerAlt style={{ color: "#2563eb", marginRight: 8 }} />
                  <b>Dirección:</b> Av. Las Herramientas 123, Santiago
                </p>
                <hr />
                <p className="mb-0" style={{ color: "#666" }}>
                  Nuestro equipo te responderá dentro de 24 horas hábiles.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

import React, { useState } from "react";
import { Form, Button, Alert, Container, Card } from "react-bootstrap";
import { FaUserCircle, FaLock } from "react-icons/fa";

export default function LoginPage() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const [tipo, setTipo] = useState("danger");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    try {
      const response = await fetch("http://localhost:8000/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, contrasena }),
      });
      const data = await response.json();
      if (response.ok) {
        setTipo("success");
        setMensaje("¡Bienvenido " + data.usuario.nombre + "!");
        localStorage.setItem("usuario", JSON.stringify(data.usuario));
        setTimeout(() => {
          if (data.usuario.tipo_usuario === "administrador") {
            window.location.href = "/admin";
          } else if (data.usuario.tipo_usuario === "vendedor") {
            window.location.href = "/vendedor";
          } else if (data.usuario.tipo_usuario === "bodeguero") {
            window.location.href = "/bodeguero";
          } else {
            window.location.href = "/";
          }
        }, 800);
      }
      else {
        setTipo("danger");
        setMensaje(data.detail || "Credenciales incorrectas");
      }
    } catch (error) {
      setTipo("danger");
      setMensaje("Error de conexión con el servidor");
    }
  };

  return (
    <div style={{
      background: "#f6f9fb",
      minHeight: "93vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <Container className="d-flex justify-content-center align-items-center">
        <Card style={{
          width: "370px",
          borderRadius: "1.3rem",
          boxShadow: "0 6px 36px #2563eb22"
        }}>
          <Card.Body>
            <div className="text-center mb-3">
              <FaUserCircle size={60} color="#2563eb" style={{ marginBottom: 7 }} />
              <h3 className="fw-bold text-primary mb-0" style={{ letterSpacing: "1px" }}>
                Iniciar Sesión
              </h3>
              <div style={{
                width: 44, height: 3, background: "#FFD600",
                borderRadius: 2, margin: "11px auto 8px"
              }} />
            </div>
            {mensaje && (
              <Alert
                variant={tipo}
                className="py-2 mb-3 text-center"
                style={{ fontSize: "1.02rem" }}
              >
                {mensaje}
              </Alert>
            )}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="correo">
                <Form.Label className="fw-semibold">Correo electrónico</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Ejemplo: usuario@ferremas.cl"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  required
                  autoFocus
                  style={{ borderRadius: "0.9rem" }}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="contrasena">
                <Form.Label className="fw-semibold">Contraseña</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Contraseña"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  required
                  style={{ borderRadius: "0.9rem" }}
                />
              </Form.Group>
              <Button
                variant="primary"
                type="submit"
                className="w-100 fw-semibold"
                size="lg"
                style={{
                  borderRadius: "2rem",
                  fontSize: "1.09rem",
                  marginTop: 10,
                  boxShadow: "0 4px 20px #2563eb18"
                }}
              >
                <FaLock style={{ marginRight: 8, marginBottom: 2 }} />
                Iniciar sesión
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

import React, { useState } from "react";
import { Form, Button, Alert, Container, Card } from "react-bootstrap";

export default function LoginPage() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const [tipo, setTipo] = useState("danger"); // para tipo de mensaje

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
        // GUARDA el usuario autenticado en localStorage:
        localStorage.setItem("usuario", JSON.stringify(data.usuario));
        // Redirige al home o donde quieras:
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
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
    <Container className="my-5 d-flex justify-content-center">
      <Card style={{ width: "350px" }} className="shadow-sm">
        <Card.Body>
          <h3 className="mb-4 text-primary text-center">Iniciar Sesión</h3>
          {mensaje && <Alert variant={tipo}>{mensaje}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="correo">
              <Form.Label>Correo electrónico</Form.Label>
              <Form.Control
                type="email"
                placeholder="Ingrese su correo"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="contrasena">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="Ingrese su contraseña"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              Iniciar sesión
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

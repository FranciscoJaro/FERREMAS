import React, { useState } from "react";
import { Container, Card, Form, Button, Alert, Spinner } from "react-bootstrap";

export default function RecuperarContrasenaPage() {
  const [rut, setRut] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [msg, setMsg] = useState(null);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);

    if (contrasena.length < 6) {
      setMsg({ type: "danger", text: "La contraseña debe tener al menos 6 caracteres." });
      return;
    }
    if (contrasena !== confirmar) {
      setMsg({ type: "danger", text: "Las contraseñas no coinciden." });
      return;
    }

    setCargando(true);
    try {
      const rutLimpio = rut.trim();
      const resp = await fetch(`http://localhost:8000/usuarios/recuperar/${rutLimpio}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contrasena }),
      });
      if (resp.ok) {
        setMsg({ type: "success", text: "Contraseña actualizada. ¡Ya puedes iniciar sesión!" });
        setContrasena("");
        setConfirmar("");
      } else {
        const data = await resp.json();
        setMsg({ type: "danger", text: data.detail || "Error al actualizar contraseña." });
      }
    } catch {
      setMsg({ type: "danger", text: "No se pudo conectar con el servidor." });
    } finally {
      setCargando(false);
    }
  };

  // Limpia mensajes al modificar cualquier campo
  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    setMsg(null);
  };

  return (
    <Container className="mt-5 d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <Card className="shadow-lg" style={{ borderRadius: "1.5rem", maxWidth: 420, width: "100%", padding: "10px 0" }}>
        <Card.Body>
          <h3 className="fw-bold mb-3 text-center">Recuperar contraseña</h3>
          {msg && <Alert variant={msg.type}>{msg.text}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>RUT</Form.Label>
              <Form.Control
                value={rut}
                onChange={handleInputChange(setRut)}
                required
                placeholder="Ejemplo: 12345678-9"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nueva contraseña</Form.Label>
              <Form.Control
                type="password"
                value={contrasena}
                onChange={handleInputChange(setContrasena)}
                required
                minLength={6}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Confirmar contraseña</Form.Label>
              <Form.Control
                type="password"
                value={confirmar}
                onChange={handleInputChange(setConfirmar)}
                required
                minLength={6}
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100" disabled={cargando}>
              {cargando ? <Spinner size="sm" /> : "Cambiar contraseña"}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

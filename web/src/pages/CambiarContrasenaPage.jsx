import React, { useState } from "react";
import { Container, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function CambiarContrasenaPage() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const navigate = useNavigate();
  const [contrasena, setContrasena] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [msg, setMsg] = useState(null);
  const [cargando, setCargando] = useState(false);

  if (!usuario) return <div className="text-center mt-5">Debes iniciar sesión.</div>;
  if (!usuario.cambiar_contrasena) {
    navigate("/admin");
    return null;
  }

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
      const resp = await fetch(`http://localhost:8000/usuarios/${usuario.id_usuario}/cambiar_contrasena`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contrasena }),
      });
      if (resp.ok) {
        // Actualiza el usuario local para que no vuelva a pedir el cambio
        usuario.cambiar_contrasena = 1;
        localStorage.setItem("usuario", JSON.stringify(usuario));
        setMsg({ type: "success", text: "Contraseña actualizada con éxito. Redirigiendo..." });
        setTimeout(() => navigate("/admin"), 1500); // Redirige después de actualizar
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

  return (
    <Container className="mt-5 d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <Card className="shadow-lg" style={{ borderRadius: "1.5rem", maxWidth: 400, width: "100%", padding: "10px 0" }}>
        <Card.Body>
          <h3 className="fw-bold mb-3 text-center">Cambiar contraseña</h3>
          {msg && <Alert variant={msg.type}>{msg.text}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nueva contraseña</Form.Label>
              <Form.Control
                type="password"
                value={contrasena}
                onChange={e => setContrasena(e.target.value)}
                required
                minLength={6}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Confirmar contraseña</Form.Label>
              <Form.Control
                type="password"
                value={confirmar}
                onChange={e => setConfirmar(e.target.value)}
                required
                minLength={6}
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100" disabled={cargando}>
              {cargando ? <Spinner size="sm" /> : "Guardar"}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

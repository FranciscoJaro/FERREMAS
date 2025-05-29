import React, { useEffect, useState } from "react";
import { Container, Card, Row, Col, Badge, Button, Form, Spinner, Alert } from "react-bootstrap";
import { FaUserCircle, FaEnvelope, FaIdCard, FaHome, FaPhoneAlt, FaEdit, FaSave, FaTimes } from "react-icons/fa";

export default function PerfilPage() {
  const [usuario, setUsuario] = useState(null); // {id_usuario, rut, correo, nombre, ...}
  const [cliente, setCliente] = useState(null); // {direccion, telefono}
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({ direccion: "", telefono: "" });
  const [cargando, setCargando] = useState(true);
  const [msg, setMsg] = useState(null);
  const [telefonoError, setTelefonoError] = useState(""); // Para mostrar errores en teléfono

  // Cargar datos reales del cliente al entrar
  useEffect(() => {
    const data = localStorage.getItem("usuario");
    if (!data) return setCargando(false);

    const user = JSON.parse(data);
    setUsuario(user);

    fetch(`http://localhost:8000/clientes/usuario/${user.id_usuario}`)
      .then(res => res.json())
      .then(data => {
        setCliente(data);
        setForm({
          direccion: data?.direccion || "",
          telefono: data?.telefono || "",
        });
        setCargando(false);
      })
      .catch(() => setCargando(false));
  }, []);

  if (cargando) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (!usuario) return <div className="text-center mt-5">Debes iniciar sesión.</div>;

  const handleEdit = () => setEditando(true);

  const handleCancel = () => {
    setForm({
      direccion: cliente?.direccion || "",
      telefono: cliente?.telefono || "",
    });
    setTelefonoError("");
    setEditando(false);
    setMsg(null);
  };

  // Solo permite números y opcional "+" al inicio
  const handleTelefonoChange = (e) => {
    let val = e.target.value;
    if (/^\+?\d*$/.test(val)) { // Permite "+" al inicio y luego solo dígitos
      setForm((f) => ({ ...f, telefono: val }));
      setTelefonoError("");
    } else {
      setTelefonoError("Solo se permiten números (y opcional '+').");
    }
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMsg(null);

    // Validación extra en JS
    if (!form.telefono.match(/^\+?\d{7,15}$/)) {
      setTelefonoError("El teléfono debe tener solo números y entre 7 y 15 dígitos.");
      setCargando(false);
      return;
    }

    try {
      // PUT api para actualizar datos del cliente
      const resp = await fetch(`http://localhost:8000/clientes/${usuario.id_usuario}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          direccion: form.direccion,
          telefono: form.telefono,
        }),
      });
      if (resp.ok) {
        setCliente((cli) => ({
          ...cli,
          direccion: form.direccion,
          telefono: form.telefono,
        }));
        setMsg({ type: "success", text: "Perfil actualizado con éxito." });
        setEditando(false);
      } else {
        const data = await resp.json();
        setMsg({ type: "danger", text: data.detail || "Error al actualizar perfil." });
      }
    } catch {
      setMsg({ type: "danger", text: "No se pudo conectar con el servidor." });
    } finally {
      setCargando(false);
    }
  };

  return (
    <Container className="mt-5 d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <Card className="shadow-lg" style={{
        borderRadius: "1.5rem",
        maxWidth: 450,
        width: "100%",
        padding: "10px 0"
      }}>
        <Card.Body className="text-center">
          <FaUserCircle size={70} color="#2563eb" style={{ marginBottom: 10 }} />
          <h3 className="fw-bold mb-1">{usuario.nombre || usuario.primer_nombre + " " + usuario.apellido_paterno}</h3>
          <Badge bg="info" className="mb-3" style={{ fontSize: ".99rem" }}>
            Cliente
          </Badge>

          {/* Mensaje feedback */}
          {msg && (
            <Alert variant={msg.type} className="py-2">
              {msg.text}
            </Alert>
          )}

          <Row className="mb-2 text-start" style={{ fontSize: "1.08rem" }}>
            <Col xs={2} className="text-end"><FaEnvelope /></Col>
            <Col>{usuario.correo || <span className="text-muted">Sin correo</span>}</Col>
          </Row>
          <Row className="mb-2 text-start" style={{ fontSize: "1.08rem" }}>
            <Col xs={2} className="text-end"><FaIdCard /></Col>
            <Col>{usuario.rut}</Col>
          </Row>

          {/* Editar dirección y teléfono */}
          {editando ? (
            <Form onSubmit={handleSave}>
              <Row className="mb-2 text-start" style={{ fontSize: "1.08rem" }}>
                <Col xs={2} className="text-end"><FaHome /></Col>
                <Col>
                  <Form.Control
                    name="direccion"
                    value={form.direccion}
                    onChange={handleChange}
                    placeholder="Dirección"
                    required
                  />
                </Col>
              </Row>
              <Row className="mb-2 text-start" style={{ fontSize: "1.08rem" }}>
                <Col xs={2} className="text-end"><FaPhoneAlt /></Col>
                <Col>
                  <Form.Control
                    name="telefono"
                    value={form.telefono}
                    onChange={handleTelefonoChange}
                    placeholder="Teléfono"
                    required
                  />
                  {telefonoError && <div className="text-danger small">{telefonoError}</div>}
                </Col>
              </Row>
              <div className="d-flex justify-content-center gap-2 mt-4">
                <Button type="submit" variant="success" disabled={cargando || !!telefonoError}>
                  <FaSave /> Guardar
                </Button>
                <Button variant="secondary" onClick={handleCancel} disabled={cargando}>
                  <FaTimes /> Cancelar
                </Button>
              </div>
            </Form>
          ) : (
            <>
              <Row className="mb-2 text-start" style={{ fontSize: "1.08rem" }}>
                <Col xs={2} className="text-end"><FaHome /></Col>
                <Col>{cliente?.direccion || <span className="text-muted">No registrado</span>}</Col>
              </Row>
              <Row className="mb-2 text-start" style={{ fontSize: "1.08rem" }}>
                <Col xs={2} className="text-end"><FaPhoneAlt /></Col>
                <Col>{cliente?.telefono || <span className="text-muted">No registrado</span>}</Col>
              </Row>
              <Button variant="primary" className="mt-3" onClick={handleEdit}>
                <FaEdit /> Editar perfil
              </Button>
            </>
          )}
          <hr className="my-4" />
          <p className="text-secondary" style={{ fontSize: "1.02rem" }}>
            Aquí puedes ver y actualizar tus datos personales.<br />
            (Pronto: historial de compras, más opciones)
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
}

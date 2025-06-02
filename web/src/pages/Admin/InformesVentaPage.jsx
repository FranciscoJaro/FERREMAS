import React, { useEffect, useState } from "react";
import { Container, Card, Table, Button, Form, Alert, Spinner } from "react-bootstrap";

export default function PanelAdminPage() {
  const usuario = JSON.parse(localStorage.getItem("usuario")); // El admin debe estar logueado
  const [informes, setInformes] = useState([]);
  const [descripcion, setDescripcion] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  // Cargar informes al inicio
  useEffect(() => {
    setCargando(true);
    fetch("http://localhost:4000/informes-venta")
      .then(res => res.json())
      .then(data => {
        setInformes(data);
        setCargando(false);
      })
      .catch(() => {
        setError("No se pudieron cargar los informes");
        setCargando(false);
      });
  }, [msg]); // Recarga cuando se crea un informe

  // Crear informe
  const handleCrearInforme = async e => {
    e.preventDefault();
    setMsg("");
    setError("");
    if (!descripcion.trim()) return setError("Ingresa una descripción del informe");
    if (!usuario || usuario.tipo_usuario !== "administrador") {
      setError("No autorizado");
      return;
    }
    try {
      const res = await fetch("http://localhost:4000/informes-venta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descripcion, administrador_id_usuario: usuario.id_usuario })
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Informe creado correctamente");
        setDescripcion("");
      } else {
        setError(data.error || "No se pudo crear el informe");
      }
    } catch {
      setError("Error de conexión");
    }
  };

  return (
    <Container className="py-5">
      <h2 className="fw-bold text-primary mb-4">Panel Administrador - Informes de Venta</h2>
      {msg && <Alert variant="success" onClose={() => setMsg("")} dismissible>{msg}</Alert>}
      {error && <Alert variant="danger" onClose={() => setError("")} dismissible>{error}</Alert>}

      {/* Crear informe */}
      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleCrearInforme}>
            <Form.Group className="mb-3">
              <Form.Label>Descripción del informe</Form.Label>
              <Form.Control
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                placeholder="Ej: Ventas totales del mes, informe mensual, etc."
                required
              />
            </Form.Group>
            <Button type="submit" variant="success">Crear Informe de Venta</Button>
          </Form>
        </Card.Body>
      </Card>

      {/* Tabla de informes */}
      <Card>
        <Card.Body>
          <h5>Historial de informes de venta</h5>
          {cargando ? (
            <Spinner animation="border" />
          ) : (
            <Table striped bordered hover className="mt-3">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Fecha</th>
                  <th>Descripción</th>
                  <th>Monto Total</th>
                  <th>Administrador</th>
                </tr>
              </thead>
              <tbody>
                {informes.length > 0 ? (
                  informes.map(inf => (
                    <tr key={inf.id_informe}>
                      <td>{inf.id_informe}</td>
                      <td>{new Date(inf.fecha).toLocaleDateString()}</td>
                      <td>{inf.descripcion}</td>
                      <td>${Number(inf.monto_total).toLocaleString("es-CL")}</td>
                      <td>{inf.administrador}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center">No hay informes registrados</td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

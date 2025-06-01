import React, { useEffect, useState } from "react";
import { Container, Card, Button, Table, Form, Alert } from "react-bootstrap";

export default function ReportesFinancierosPage() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const [reportes, setReportes] = useState([]);
  const [detalle, setDetalle] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [ventasMes, setVentasMes] = useState(null);

  // Cargar reportes y ventas del mes
  useEffect(() => {
    fetch("http://localhost:4000/reportes-financieros")
      .then(res => res.json())
      .then(setReportes)
      .catch(() => setError("No se pudo cargar reportes"));
  }, [msg]);

  useEffect(() => {
    fetch("http://localhost:4000/reportes-financieros/ventas-mes")
      .then(res => res.json())
      .then(data => setVentasMes(data.total_ventas_mes))
      .catch(() => setVentasMes(null));
  }, [msg]); // Se recarga también si se crea un reporte

  // Crear nuevo reporte
  const handleCrear = async e => {
    e.preventDefault();
    setMsg("");
    setError("");
    if (!detalle.trim()) return setError("Ingrese un detalle para el reporte");
    try {
      const res = await fetch("http://localhost:4000/reportes-financieros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ detalle, contador_id_usuario: usuario.id_usuario })
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Reporte creado correctamente");
        setDetalle("");
      } else {
        setError(data.error || "Error al crear el reporte");
      }
    } catch {
      setError("Error de conexión");
    }
  };

  return (
    <Container className="py-5">
      <h2 className="fw-bold text-primary mb-4">Reportes Financieros</h2>
      {msg && <Alert variant="success" onClose={() => setMsg("")} dismissible>{msg}</Alert>}
      {error && <Alert variant="danger" onClose={() => setError("")} dismissible>{error}</Alert>}

      {/* Ventas totales del mes */}
      <Card className="mb-4">
        <Card.Body>
          <b>Ventas totales del mes:&nbsp;</b>
          {ventasMes !== null
            ? <span className="fw-bold text-success">${ventasMes.toLocaleString("es-CL")}</span>
            : <span className="text-muted">Cargando...</span>}
        </Card.Body>
      </Card>

      {/* Crear reporte */}
      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleCrear}>
            <Form.Group className="mb-3">
              <Form.Label>Detalle del reporte financiero</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={detalle}
                onChange={e => setDetalle(e.target.value)}
                required
                placeholder="Ej: Balance del mes de junio, pagos confirmados, etc."
              />
            </Form.Group>
            <Button type="submit" variant="success">Crear Reporte</Button>
          </Form>
        </Card.Body>
      </Card>

      {/* Historial de reportes */}
      <Card>
        <Card.Body>
          <h5>Historial de reportes financieros</h5>
          <Table striped bordered hover className="mt-3">
            <thead>
              <tr>
                <th>#</th>
                <th>Fecha</th>
                <th>Detalle</th>
                <th>Contador</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(reportes) && reportes.length > 0 ? (
                reportes.map(rep => (
                  <tr key={rep.id_reporte}>
                    <td>{rep.id_reporte}</td>
                    <td>{new Date(rep.fecha).toLocaleDateString()}</td>
                    <td>{rep.detalle}</td>
                    <td>{rep.nombre_contador}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center">No hay reportes registrados</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
}

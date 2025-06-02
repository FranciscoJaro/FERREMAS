import React, { useEffect, useState } from "react";
import { Container, Card, Button, Table, Form, Alert, Spinner, Accordion, Badge } from "react-bootstrap";

export default function PanelContadorPage() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const [reportes, setReportes] = useState([]);
  const [detalle, setDetalle] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [ventasMes, setVentasMes] = useState(null);
  const [pedidosTransf, setPedidosTransf] = useState([]);
  const [cargandoPedidos, setCargandoPedidos] = useState(true);

  useEffect(() => {
    fetch("http://localhost:4000/pedidos-transferencia")
      .then(res => res.json())
      .then(setPedidosTransf)
      .catch(() => setPedidosTransf([]))
      .finally(() => setCargandoPedidos(false));
  }, [msg]);

  // --- Reportes y ventas mes ---
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
  }, [msg]);

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

  // Aprobar o rechazar pedido transferencia
  const handleEstadoPago = async (id_pago, nuevoEstado) => {
    setMsg("");
    try {
      const res = await fetch(`http://localhost:4000/pagos/${id_pago}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado_pago: nuevoEstado })
      });
      const data = await res.json();
      if (res.ok) {
        setMsg(`Pago ${nuevoEstado === "CONFIRMADO" ? "aprobado" : "rechazado"} correctamente`);
      } else {
        setMsg(data.error || "No se pudo actualizar el pago");
      }
    } catch {
      setMsg("Error de conexión al cambiar estado del pago");
    }
  };

  return (
    <Container className="py-5">
      <h2 className="fw-bold text-primary mb-4">Panel Contador</h2>
      {msg && <Alert variant="success" onClose={() => setMsg("")} dismissible>{msg}</Alert>}
      {error && <Alert variant="danger" onClose={() => setError("")} dismissible>{error}</Alert>}

      {/* Sección de pagos por transferencia */}
      <Card className="mb-4">
        <Card.Body>
          <h5 className="fw-bold mb-3">Pagos por Transferencia pendientes</h5>
          {cargandoPedidos && <Spinner animation="border" />}
          {!cargandoPedidos && pedidosTransf.length === 0 && (
            <div className="text-muted">No hay pagos pendientes de aprobación.</div>
          )}
          {!cargandoPedidos && pedidosTransf.length > 0 && (
            <Accordion>
              {pedidosTransf.map((p, idx) => (
                <Accordion.Item eventKey={String(idx)} key={p.id_pago}>
                  <Accordion.Header>
                    Pedido #{p.id_pedido} &nbsp; | Cliente: {p.cliente_nombre} &nbsp; | 
                    Monto: <b>${Number(p.monto).toLocaleString("es-CL")}</b> &nbsp; | 
                    Estado: <Badge bg="warning">Pendiente</Badge>
                  </Accordion.Header>
                  <Accordion.Body>
                    <div>
                      <b>Comprobante:</b>
                      {p.comprobante_url ? (
                        <div style={{marginTop: 8, marginBottom: 8}}>
                          {/* Mostrar imagen */}
                          <img
                            src={`data:image/png;base64,${p.comprobante_url}`}
                            alt="Comprobante"
                            style={{ maxWidth: "380px", maxHeight: "250px", borderRadius: 8, border: "1px solid #ccc" }}
                          />
                          <br />
                          {/* Descargar imagen como archivo */}
                          <a
                            href={`data:application/octet-stream;base64,${p.comprobante_url}`}
                            download={p.nombre_archivo || "comprobante.png"}
                            className="btn btn-sm btn-outline-primary mt-2"
                          >
                            Descargar comprobante
                          </a>
                        </div>
                      ) : (
                        <span className="text-muted">No disponible</span>
                      )}
                    </div>
                    <div className="mt-3">
                      <Button
                        variant="success"
                        className="me-2"
                        onClick={() => handleEstadoPago(p.id_pago, "CONFIRMADO")}
                      >
                        Aprobar
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleEstadoPago(p.id_pago, "RECHAZADO")}
                      >
                        Rechazar
                      </Button>
                    </div>
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          )}
        </Card.Body>
      </Card>

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
                placeholder="Ej: Balance del mes, pagos confirmados, etc."
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

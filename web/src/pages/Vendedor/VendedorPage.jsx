import React, { useEffect, useState } from "react";
import { Container, Table, Button, Badge, Spinner, Modal } from "react-bootstrap";

export default function VendedorPage() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [detalle, setDetalle] = useState(null);
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  // Cargar pedidos del vendedor
  const cargarPedidos = () => {
    if (!usuario || !usuario.id_usuario) return;
    setCargando(true);
    fetch(`http://localhost:4000/pedidos?vendedor_id=${usuario.id_usuario}`)
      .then(res => res.json())
      .then(data => {
        setPedidos(Array.isArray(data) ? data : []);
        setCargando(false);
        setError("");
      })
      .catch(() => {
        setError("Error al cargar pedidos");
        setCargando(false);
      });
  };

  useEffect(() => {
    cargarPedidos();
    // eslint-disable-next-line
  }, []); // Solo al montar el componente

  // Cambiar estado del pedido
  const handleEstado = async (id_pedido, nuevo_estado) => {
    try {
      const res = await fetch(`http://localhost:4000/pedidos/${id_pedido}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevo_estado })
      });
      if (res.ok) {
        cargarPedidos(); // Recargar pedidos después de actualizar
      }
    } catch (e) {
      alert("No se pudo cambiar el estado.");
    }
  };

  if (!usuario) {
    return (
      <Container className="py-5">
        <div className="alert alert-warning">
          Debes iniciar sesión como vendedor para ver esta página.
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="mb-4 text-primary fw-bold">Panel de Vendedor</h2>
      {cargando && <Spinner animation="border" />}
      {error && <div className="alert alert-danger">{error}</div>}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Cliente</th>
            <th>Productos</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.length === 0 && !cargando && (
            <tr>
              <td colSpan={6} className="text-center text-muted">
                No hay pedidos registrados.
              </td>
            </tr>
          )}
          {pedidos.map((p) => (
            <tr key={p.id_pedido}>
              <td>{p.id_pedido}</td>
              <td>{p.cliente_nombre}</td>
              <td>
                <Button
                  size="sm"
                  variant="info"
                  onClick={() => setDetalle(p)}
                >
                  Ver detalle
                </Button>
              </td>
              <td>{p.fecha ? new Date(p.fecha).toLocaleDateString() : ""}</td>
              <td>
                <Badge bg={
                  p.estado?.toUpperCase() === "PENDIENTE" ? "warning"
                  : p.estado?.toUpperCase() === "PREPARADO" ? "primary"
                  : "success"
                }>
                  {p.estado}
                </Badge>
              </td>
              <td>
                {p.estado?.toUpperCase() === "PENDIENTE" && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleEstado(p.id_pedido, "PREPARADO")}
                  >
                    Marcar como Preparado
                  </Button>
                )}
                {p.estado?.toUpperCase() === "PREPARADO" && (
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => handleEstado(p.id_pedido, "ENVIADO")}
                  >
                    Marcar como Enviado
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* MODAL DE DETALLE DE PRODUCTOS */}
      <Modal show={!!detalle} onHide={() => setDetalle(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Detalle del Pedido #{detalle?.id_pedido}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detalle?.productos && (
            <ul>
              {detalle.productos.map((prod, i) => (
                <li key={i}>{prod.nombre} (x{prod.cantidad})</li>
              ))}
            </ul>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDetalle(null)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

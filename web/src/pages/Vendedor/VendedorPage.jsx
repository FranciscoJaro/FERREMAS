import React, { useEffect, useState } from "react";
import { Container, Accordion, Card, Badge, Button, Spinner, Alert, Table } from "react-bootstrap";

export default function VendedorPage() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    if (!usuario) return;
    setCargando(true);
    fetch(`http://localhost:4000/pedidos?vendedor_id=${usuario.id_usuario}`)
      .then(res => res.json())
      .then(data => {
        setPedidos(data || []);
        setCargando(false);
      })
      .catch(() => setCargando(false));
  }, []); // SOLO al montar

  const estados = [
    { value: "PENDIENTE", label: "Pendiente", color: "warning" },
    { value: "APROBADO", label: "Aprobado", color: "info" },
    { value: "PREPARACION", label: "En Preparación", color: "primary" },
    { value: "LISTO", label: "Listo", color: "secondary" },
    { value: "ENTREGADO", label: "Entregado", color: "success" },
    { value: "RECHAZADO", label: "Rechazado", color: "danger" }
  ];

  const handleCambiarEstado = async (id_pedido, nuevoEstado) => {
    setMsg(null);
    try {
      const res = await fetch(`http://localhost:4000/pedidos/${id_pedido}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      if (res.ok) {
        setPedidos(pedidos =>
          pedidos.map(p =>
            p.id_pedido === id_pedido ? { ...p, estado: nuevoEstado } : p
          )
        );
        setMsg({ type: "success", text: "Estado actualizado." });
      } else {
        setMsg({ type: "danger", text: "Error al cambiar estado." });
      }
    } catch {
      setMsg({ type: "danger", text: "No se pudo conectar al servidor." });
    }
  };

  const getEstadoBadge = estado => {
    const info = estados.find(e => e.value === estado) || {};
    return (
      <Badge bg={info.color || "secondary"} style={{ fontSize: "0.97rem" }}>
        {info.label || estado}
      </Badge>
    );
  };

  return (
    <Container className="py-4">
      <h2 className="fw-bold text-primary mb-4">Panel de Vendedor</h2>
      {msg && (
        <Alert variant={msg.type} onClose={() => setMsg(null)} dismissible>
          {msg.text}
        </Alert>
      )}

      {cargando && (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" /> <br />
          Cargando pedidos...
        </div>
      )}

      {!cargando && pedidos.length === 0 && (
        <div className="text-center text-muted my-5">No hay pedidos asignados.</div>
      )}

      {!cargando && pedidos.length > 0 && (
        <Accordion>
          {pedidos.map((pedido, idx) => (
            <Accordion.Item eventKey={String(idx)} key={pedido.id_pedido}>
              <Accordion.Header>
                <b className="me-2">#{pedido.id_pedido}</b>
                Cliente: {pedido.cliente_nombre} &nbsp;|&nbsp; 
                Estado: {getEstadoBadge(pedido.estado)} &nbsp;|&nbsp;
                Fecha: {new Date(pedido.fecha).toLocaleDateString()}
              </Accordion.Header>
              <Accordion.Body>
                <Table bordered size="sm">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Stock actual</th> {/* NUEVO */}
                    </tr>
                  </thead>
                  <tbody>
                    {pedido.productos?.map((prod, i) => (
                      <tr key={i}>
                        <td>{prod.nombre}</td>
                        <td>{prod.cantidad}</td>
                        <td>{prod.stock ?? "?"}</td> {/* NUEVO */}
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <div className="d-flex gap-2 flex-wrap">
                  {/* Cambiar estado */}
                  {pedido.estado === "PENDIENTE" && (
                    <>
                      <Button
                        variant="info"
                        onClick={() => handleCambiarEstado(pedido.id_pedido, "APROBADO")}
                      >
                        Aprobar pedido
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleCambiarEstado(pedido.id_pedido, "RECHAZADO")}
                      >
                        Rechazar pedido
                      </Button>
                    </>
                  )}
                  {pedido.estado === "LISTO" && (
                    <Button
                      variant="success"
                      onClick={() => handleCambiarEstado(pedido.id_pedido, "ENTREGADO")}
                    >
                      Marcar como Entregado
                    </Button>
                  )}
                </div>
                {pedido.estado === "RECHAZADO" && (
                  <Alert variant="danger" className="mt-3">
                    Pedido rechazado. El cliente fue notificado.
                  </Alert>
                )}
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      )}
    </Container>
  );
}

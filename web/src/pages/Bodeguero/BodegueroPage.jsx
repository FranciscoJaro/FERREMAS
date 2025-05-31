import React, { useEffect, useState } from "react";
import { Container, Table, Button, Badge, Collapse, Spinner, Alert } from "react-bootstrap";

export default function BodegueroPage() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [msg, setMsg] = useState(null);
  const [expanded, setExpanded] = useState({});

  // Cargar pedidos al entrar
  useEffect(() => {
    if (!usuario) return;
    setCargando(true);
    fetch(`http://localhost:4000/pedidos-bodega?bodeguero_id=${usuario.id_usuario}`)
      .then(res => res.json())
      .then(data => {
        setPedidos(data);
        setCargando(false);
      })
      .catch(() => setCargando(false));
  }, []);

  // Cambia el estado de un pedido
  const cambiarEstado = async (id_pedido, nuevoEstado) => {
    try {
      const resp = await fetch(`http://localhost:4000/pedidos/${id_pedido}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (resp.ok) {
        setMsg({ type: "success", text: "Estado actualizado." });
        setPedidos(pedidos =>
          pedidos.map(p =>
            p.id_pedido === id_pedido ? { ...p, estado: nuevoEstado } : p
          )
        );
      } else {
        setMsg({ type: "danger", text: "No se pudo actualizar el estado." });
      }
    } catch {
      setMsg({ type: "danger", text: "Error de conexión." });
    }
  };

  const handleExpand = id_pedido =>
    setExpanded(e => ({ ...e, [id_pedido]: !e[id_pedido] }));

  const colorEstado = estado => {
    switch (estado) {
      case "PENDIENTE": return "secondary";
      case "APROBADO": return "info";
      case "EN PREPARACIÓN": return "warning";
      case "LISTO": return "success";
      case "ENTREGADO": return "primary";
      default: return "dark";
    }
  };

  if (cargando) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (!usuario) return <div className="text-center mt-5">Debes iniciar sesión.</div>;

  return (
    <Container className="py-5">
      <h2 className="mb-4 text-primary fw-bold">Panel de Bodeguero</h2>
      {msg && <Alert variant={msg.type}>{msg.text}</Alert>}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Cliente</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((pedido, idx) => (
            <React.Fragment key={pedido.id_pedido}>
              <tr>
                <td>{idx + 1}</td>
                <td>{pedido.cliente_nombre}</td>
                <td>{pedido.fecha}</td>
                <td>
                  <Badge bg={colorEstado(pedido.estado)}>
                    {pedido.estado}
                  </Badge>
                </td>
                <td>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => handleExpand(pedido.id_pedido)}
                  >
                    {expanded[pedido.id_pedido] ? "Ocultar" : "Ver detalle"}
                  </Button>
                  {" "}
                  {pedido.estado === "APROBADO" && (
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => cambiarEstado(pedido.id_pedido, "EN PREPARACIÓN")}
                    >
                      Preparar
                    </Button>
                  )}
                  {pedido.estado === "EN PREPARACIÓN" && (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => cambiarEstado(pedido.id_pedido, "LISTO")}
                    >
                      Marcar como Listo
                    </Button>
                  )}
                </td>
              </tr>
              <tr>
                <td colSpan={5} style={{ padding: 0, border: "none", background: "#f8fafd" }}>
                  <Collapse in={expanded[pedido.id_pedido]}>
                    <div>
                      <Table size="sm" bordered className="mb-0">
                        <thead>
                          <tr>
                            <th>Producto</th>
                            <th>Cantidad</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pedido.productos.map(prod => (
                            <tr key={prod.nombre}>
                              <td>{prod.nombre}</td>
                              <td>{prod.cantidad}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </Collapse>
                </td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </Table>
      {pedidos.length === 0 && (
        <div className="text-center text-muted">No hay pedidos pendientes en bodega.</div>
      )}
    </Container>
  );
}

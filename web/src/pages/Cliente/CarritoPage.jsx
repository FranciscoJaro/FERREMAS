import React, { useEffect, useState } from "react";
import { Container, Table, Button, Spinner, Alert, Row, Col, Card, Form } from "react-bootstrap";

export default function CarritoPage() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const [carrito, setCarrito] = useState(null);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [editando, setEditando] = useState({}); // Para controlar edición de cantidad

  // Carga el carrito del cliente al montar
  useEffect(() => {
    if (!usuario || !usuario.id_usuario) return;
    cargarCarrito();
    // eslint-disable-next-line
  }, []);

  const cargarCarrito = () => {
    setCargando(true);
    fetch(`http://localhost:4000/carrito/${usuario.id_usuario}`)
      .then(res => res.json())
      .then(data => {
        setCarrito(data.carrito);
        setProductos(data.productos || []);
        setCargando(false);
        setError("");
      })
      .catch(() => {
        setError("Error al cargar el carrito.");
        setCargando(false);
      });
  };

  // Eliminar producto del carrito
  const handleEliminar = async (id_detalle) => {
    if (!window.confirm("¿Seguro que deseas eliminar este producto del carrito?")) return;
    try {
      const res = await fetch(`http://localhost:4000/carrito/eliminar/${id_detalle}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setProductos(productos.filter(p => p.id_detalle_carrito !== id_detalle));
        setMsg("Producto eliminado del carrito");
      }
    } catch {
      alert("No se pudo eliminar el producto.");
    }
  };

  // Cambiar cantidad (en tabla, en memoria)
  const handleCantidadChange = (id_detalle, cantidad) => {
    setProductos(productos.map(p =>
      p.id_detalle_carrito === id_detalle ? { ...p, cantidad: Number(cantidad) } : p
    ));
    setEditando({ ...editando, [id_detalle]: true }); // Habilitar botón guardar
  };

  // Guardar nueva cantidad en el backend
  const handleGuardarCantidad = async (id_detalle, cantidad) => {
    if (cantidad < 1) {
      alert("Cantidad inválida");
      return;
    }
    try {
      const res = await fetch(`http://localhost:4000/carrito/actualizar-cantidad/${id_detalle}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cantidad })
      });
      if (res.ok) {
        setMsg("Cantidad actualizada");
        setEditando({ ...editando, [id_detalle]: false });
        cargarCarrito(); // Refresca datos desde la API
      } else {
        alert("No se pudo actualizar la cantidad");
      }
    } catch {
      alert("Error de conexión");
    }
  };

  // Calcular total
  const total = productos.reduce((sum, p) => sum + p.cantidad * p.precio_unitario, 0);

  return (
    <div style={{ background: "#f9fafb", minHeight: "87vh" }}>
      <Container className="py-5">
        <h2 className="mb-4 text-primary fw-bold">Tu Carrito de Compras</h2>
        {msg && <Alert variant="success" onClose={() => setMsg("")} dismissible>{msg}</Alert>}
        {cargando && <Spinner animation="border" />}
        {error && <Alert variant="danger">{error}</Alert>}

        {!cargando && productos.length === 0 && (
          <Card className="shadow-sm border-0 text-center p-5 mt-4">
            <Card.Body>
              <h4 className="mb-3">No tienes productos en tu carrito</h4>
              <p>¡Agrega productos desde la tienda para comenzar tu compra!</p>
              <Button href="/" variant="primary">Ver productos</Button>
            </Card.Body>
          </Card>
        )}

        {productos.length > 0 && (
          <>
            <Table responsive bordered hover className="bg-white shadow-sm mt-3">
              <thead>
                <tr className="text-center">
                  <th>Producto</th>
                  <th>Precio Unitario</th>
                  <th>Cantidad</th>
                  <th>Subtotal</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((prod) => (
                  <tr key={prod.id_detalle_carrito} className="align-middle">
                    <td>
                      <b>{prod.nombre}</b><br />
                      <span className="text-muted">{prod.descripcion}</span>
                    </td>
                    <td className="text-center">${Number(prod.precio_unitario).toLocaleString("es-CL")}</td>
                    <td className="text-center">
                      <Form className="d-flex justify-content-center align-items-center" style={{ gap: 6 }}
                        onSubmit={e => { e.preventDefault(); handleGuardarCantidad(prod.id_detalle_carrito, prod.cantidad); }}>
                        <Form.Control
                          type="number"
                          min={1}
                          value={prod.cantidad}
                          style={{ width: 60 }}
                          onChange={e => handleCantidadChange(prod.id_detalle_carrito, e.target.value)}
                        />
                        <Button
                          size="sm"
                          variant="success"
                          type="submit"
                          disabled={!editando[prod.id_detalle_carrito]}
                        >Guardar</Button>
                      </Form>
                    </td>
                    <td className="text-center fw-bold">
                      ${Number(prod.precio_unitario * prod.cantidad).toLocaleString("es-CL")}
                    </td>
                    <td className="text-center">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleEliminar(prod.id_detalle_carrito)}
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {/* Resumen */}
            <Row className="justify-content-end mt-4">
              <Col xs={12} md={5}>
                <Card className="shadow border-0">
                  <Card.Body>
                    <h5 className="mb-3">Resumen de compra</h5>
                    <div className="d-flex justify-content-between mb-2">
                    <span>Total productos</span>
                    <b>{productos.reduce((acum, p) => acum + p.cantidad, 0)}</b>
                    </div>
                    <div className="d-flex justify-content-between mb-2 fs-5">
                      <span>Total a pagar:</span>
                      <span className="fw-bold text-primary">${total.toLocaleString("es-CL")}</span>
                    </div>
                    <Button
                      variant="success"
                      className="w-100 mt-2 fw-semibold"
                      size="lg"
                      disabled
                    >
                      Finalizar compra (pronto)
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Container>
    </div>
  );
}

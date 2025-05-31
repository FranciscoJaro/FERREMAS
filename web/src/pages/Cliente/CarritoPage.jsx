import React, { useEffect, useState, useRef } from "react";
import { Container, Table, Button, Spinner, Alert, Row, Col, Card, Form } from "react-bootstrap";

// Client ID sandbox de PayPal
const PAYPAL_CLIENT_ID = "AX8-uXey4JmOVfSsiVcjImUMIfiJ2hbUOENG-siWfG0n-hjcEWctEyQCAHZUk-Cj6R0bxd5pvVD4nqHQ";

export default function CarritoPage() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [dolar, setDolar] = useState(null);
  const paypalRef = useRef();

  // Carga el valor del dólar una sola vez
  useEffect(() => {
    fetch("https://mindicador.cl/api/dolar")
      .then(res => res.json())
      .then(data => setDolar(data.serie[0].valor))
      .catch(() => setDolar(950));
  }, []);

  // Cargar carrito al iniciar
  useEffect(() => {
    if (!usuario || !usuario.id_usuario) return;
    setCargando(true);
    fetch(`http://localhost:4000/carrito/${usuario.id_usuario}`)
      .then(res => res.json())
      .then(data => {
        setProductos(data.productos || []);
        setCargando(false);
        setError("");
      })
      .catch(() => {
        setError("Error al cargar el carrito.");
        setCargando(false);
      });
    // eslint-disable-next-line
  }, [usuario?.id_usuario]);

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

  // Cambiar cantidad y guardar automáticamente
  const handleCantidadChange = async (id_detalle, cantidad) => {
    if (cantidad < 1) return;
    const nuevaLista = productos.map(p =>
      p.id_detalle_carrito === id_detalle ? { ...p, cantidad: Number(cantidad) } : p
    );
    setProductos(nuevaLista);
    try {
      await fetch(`http://localhost:4000/carrito/actualizar-cantidad/${id_detalle}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cantidad })
      });
      setMsg("Cantidad actualizada");
    } catch {
      alert("Error de conexión");
    }
  };

  // Calcular totales
  const totalCLP = productos.reduce((sum, p) => sum + p.cantidad * p.precio_unitario, 0);
  const totalUSD = dolar ? Math.round((totalCLP / dolar) * 100) / 100 : 0;

  // PayPal: solo una vez, y cambia el "key" del div para forzar rerender seguro
  const [paypalLoaded, setPaypalLoaded] = useState(false);

  useEffect(() => {
    if (!paypalLoaded) {
      const script = document.createElement("script");
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;
      script.async = true;
      script.onload = () => setPaypalLoaded(true);
      document.body.appendChild(script);
    }
  }, [paypalLoaded]);

  useEffect(() => {
    if (!paypalLoaded || !paypalRef.current || !window.paypal) return;
    window.paypal.Buttons({
      style: {
        layout: 'horizontal',
        color: 'blue',
        shape: 'rect',
        label: 'pay'
      },
      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: totalUSD.toString(),
              currency_code: "USD"
            },
            description: "Pago Ferremas"
          }]
        });
      },
      onApprove: (data, actions) => {
        return actions.order.capture().then(async function (details) {
          setMsg("¡Pago realizado correctamente! Generando pedido...");

          // Llama a tu API para crear el pedido real
          try {
            const resp = await fetch("http://localhost:4000/pedido/crear-desde-carrito", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id_usuario: usuario.id_usuario })
            });
            const result = await resp.json();
            if (resp.ok) {
              setMsg("¡Pedido generado correctamente! ID: " + result.id_pedido);
              setProductos([]); // Limpia el carrito visualmente
            } else {
              setMsg("Error al generar pedido: " + (result.error || "Error desconocido"));
            }
          } catch (err) {
            setMsg("Error de conexión con el backend al crear pedido");
          }
        });
      },
      onError: (err) => {
        setMsg("Ocurrió un error con PayPal.");
      }
    }).render(paypalRef.current);
    // eslint-disable-next-line
  }, [paypalLoaded, totalUSD]);

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
                      <Form.Control
                        type="number"
                        min={1}
                        value={prod.cantidad}
                        style={{ width: 60 }}
                        onChange={e => handleCantidadChange(prod.id_detalle_carrito, e.target.value)}
                      />
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
                      <span>Total a pagar (CLP):</span>
                      <span className="fw-bold text-primary">${totalCLP.toLocaleString("es-CL")}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2 fs-5">
                      <span>Total a pagar (USD):</span>
                      <span className="fw-bold text-info">${totalUSD}</span>
                    </div>
                    {/* Botón PayPal */}
                    <div ref={paypalRef} key={totalUSD} className="my-3" />
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

import React, { useEffect, useState, useRef } from "react";
import { Container, Table, Button, Spinner, Alert, Row, Col, Card, Form, Modal } from "react-bootstrap";

const PAYPAL_CLIENT_ID = "AX8-uXey4JmOVfSsiVcjImUMIfiJ2hbUOENG-siWfG0n-hjcEWctEyQCAHZUk-Cj6R0bxd5pvVD4nqHQ";

export default function CarritoPage() {
  const [usuario] = useState(() => JSON.parse(localStorage.getItem("usuario")));
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [dolar, setDolar] = useState(null);
  const paypalRef = useRef();
  const [tipoEntrega, setTipoEntrega] = useState("DOMICILIO");
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [detalleAEliminar, setDetalleAEliminar] = useState(null);
  const [showTransfer, setShowTransfer] = useState(false);
  const [file, setFile] = useState(null);

  const scrollPositionRef = useRef(0);
  useEffect(() => {
    if (showModal || showTransfer) {
      scrollPositionRef.current = window.scrollY;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollPositionRef.current}px`;
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollPositionRef.current);
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
    };
  }, [showModal, showTransfer]);

  const handleShowModal = (id_detalle) => {
    setDetalleAEliminar(id_detalle);
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setDetalleAEliminar(null);
    setShowModal(false);
  };

  // Modal transferencia
  const handleShowTransfer = () => setShowTransfer(true);
  const handleCloseTransfer = () => {
    setShowTransfer(false);
    setFile(null);
  };

  // Eliminar producto 
  const confirmarEliminar = async () => {
    if (!detalleAEliminar) return;
    try {
      const res = await fetch(`http://localhost:4000/carrito/eliminar/${detalleAEliminar}`, { method: "DELETE" });
      if (res.ok) {
        setProductos(productos.filter(p => p.id_detalle_carrito !== detalleAEliminar));
        setMsg("Producto eliminado del carrito");
      }
    } catch {
      alert("No se pudo eliminar el producto.");
    }
    setShowModal(false);
    setDetalleAEliminar(null);
  };

  // Dólar
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario?.id_usuario]);

  // Calcular totales
  const totalCLP = productos.reduce((sum, p) => sum + p.cantidad * p.precio_unitario, 0);
  const totalUSD = dolar ? Math.round((totalCLP / dolar) * 100) / 100 : 0;

  // PayPal:
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
        return actions.order.capture().then(async function () {
          setMsg("¡Pago realizado correctamente! Generando pedido...");
          try {
            const resp = await fetch("http://localhost:4000/pedido/crear-desde-carrito", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id_usuario: usuario.id_usuario, tipo_entrega: tipoEntrega })
            });
            const result = await resp.json();
            if (resp.ok) {
              setMsg("¡Pedido generado correctamente! ID: " + result.id_pedido);
              setProductos([]);
            } else {
              setMsg("Error al generar pedido: " + (result.error || "Error desconocido"));
            }
          } catch (err) {
            setMsg("Error de conexión con el backend al crear pedido");
          }
        });
      },
      onError: () => {
        setMsg("Ocurrió un error con PayPal.");
      }
    }).render(paypalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paypalLoaded, totalUSD, tipoEntrega, usuario?.id_usuario]);

  // Manejar envío de comprobante de transferencia
  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setMsg("Adjunta el comprobante de transferencia.");

    // Leer archivo como base64 para enviar 
    const reader = new FileReader();
    reader.onload = async function (evt) {
      const base64 = evt.target.result.split(",")[1]; 

      try {
        const resp = await fetch("http://localhost:4000/pedido/transferencia", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_usuario: usuario.id_usuario,
            tipo_entrega: tipoEntrega,
            comprobante: base64,
            nombre_archivo: file.name,
            monto: totalCLP
          })
        });
        const result = await resp.json();
        if (resp.ok) {
          setMsg("¡Pedido generado correctamente! Queda pendiente de revisión.");
          setProductos([]);
        } else {
          setMsg("Error al crear pedido: " + (result.error || "Error desconocido"));
        }
      } catch {
        setMsg("Error de conexión al enviar transferencia");
      }
      setShowTransfer(false);
      setFile(null);
    };
    reader.readAsDataURL(file);
  };

  // Cambiar cantidad y guardar automáticamente, NO PERMITIR MÁS QUE EL STOCK
  const handleCantidadChange = async (id_detalle, cantidad) => {
    cantidad = Number(cantidad);
    if (cantidad < 1) return;
    const prod = productos.find(p => p.id_detalle_carrito === id_detalle);
    if (!prod) return;
    if (prod.stock !== undefined && cantidad > prod.stock) {
      setMsg(`No puedes comprar más de ${prod.stock} unidades de este producto (Stock máximo disponible).`);
      return;
    }
    const nuevaLista = productos.map(p =>
      p.id_detalle_carrito === id_detalle ? { ...p, cantidad } : p
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

  return (
    <div style={{ background: "#f9fafb", minHeight: "87vh" }}>
      <Container className="py-5">
        <h2 className="mb-4 text-primary fw-bold">Tu Carrito de Compras</h2>
        {msg && <Alert variant="success" onClose={() => setMsg("")} dismissible>{msg}</Alert>}
        {cargando && <Spinner animation="border" />}
        {error && <Alert variant="danger">{error}</Alert>}

        {/* Modal para eliminar producto */}
        <Modal show={showModal} onHide={handleCloseModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>Eliminar producto</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            ¿Seguro que deseas eliminar este producto del carrito?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmarEliminar}>
              Eliminar
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal transferencia */}
        <Modal show={showTransfer} onHide={handleCloseTransfer} centered>
          <Modal.Header closeButton>
            <Modal.Title>Pagar por transferencia</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleTransferSubmit}>
            <Modal.Body>
              <p>
                <b>Datos para transferencia bancaria:</b><br />
                <span style={{ fontSize: "0.95rem" }}>
                  <b>Banco:</b> Banco Estado<br />
                  <b>Tipo de cuenta:</b> Cuenta Rut<br />
                  <b>N° de cuenta:</b> 12345678<br />
                  <b>Nombre titular:</b> Ferremas Spa<br />
                  <b>RUT:</b> 12.345.678-9<br />
                  <b>Correo:</b> pagos@ferremas.cl<br />
                </span>
              </p>
              <hr />
              <p>
                Adjunta el comprobante de transferencia bancaria.<br />
                <span className="text-muted" style={{ fontSize: "0.95rem" }}>
                  (Solo imagen)
                </span>
              </p>
              <Form.Control
                type="file"
                accept="image/*,application/pdf"
                onChange={e => setFile(e.target.files[0])}
                required
              />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseTransfer}>
                Cancelar
              </Button>
              <Button variant="success" type="submit">
                Enviar comprobante
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

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
                  <th>Stock</th>
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
                        max={prod.stock !== undefined ? prod.stock : 9999}
                        value={prod.cantidad}
                        style={{ width: 60 }}
                        onChange={e => handleCantidadChange(prod.id_detalle_carrito, e.target.value)}
                      />
                    </td>
                    <td className="text-center fw-bold">
                      ${Number(prod.precio_unitario * prod.cantidad).toLocaleString("es-CL")}
                    </td>
                    <td className="text-center">
                      {prod.stock !== undefined ? prod.stock : "?"}
                    </td>
                    <td className="text-center">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleShowModal(prod.id_detalle_carrito)}
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {/* Tipo de entrega */}
            <Card className="mb-3 border-0 shadow-sm">
              <Card.Body>
                <Form.Group as={Row} className="mb-0 align-items-center">
                  <Form.Label column sm={4} className="fw-semibold">Tipo de entrega:</Form.Label>
                  <Col sm={8}>
                    <Form.Select value={tipoEntrega} onChange={e => setTipoEntrega(e.target.value)}>
                      <option value="DOMICILIO">Despacho a domicilio</option>
                      <option value="RETIRO">Retiro en tienda</option>
                    </Form.Select>
                  </Col>
                </Form.Group>
              </Card.Body>
            </Card>

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
                    <div ref={paypalRef} key={totalUSD + tipoEntrega} className="my-3" />
                    {/* Botón Transferencia */}
                    <Button
                      variant="outline-success"
                      className="w-100 mb-2"
                      onClick={handleShowTransfer}
                    >
                      Pagar con transferencia bancaria
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

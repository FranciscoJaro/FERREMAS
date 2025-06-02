import React, { useEffect, useState } from "react";
import { Container, Table, Button, Spinner, Alert, Modal, Form, Image } from "react-bootstrap";

export default function GestionProductosPage() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const [sucursales, setSucursales] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    id_sucursal: "",
    id_modelo: "",
    imagen: ""
  });

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState(null);

  const fetchProductos = () => {
    setCargando(true);
    fetch("http://localhost:4000/productos")
      .then(res => res.json())
      .then(data => {
        setProductos(Array.isArray(data) ? data : []);
        setCargando(false);
        setError("");
      })
      .catch(() => {
        setError("Error al cargar productos");
        setProductos([]);
        setCargando(false);
      });
  };
  const fetchSucursales = () => {
    fetch("http://localhost:4000/sucursales")
      .then(res => res.json())
      .then(data => setSucursales(Array.isArray(data) ? data : []))
      .catch(() => setSucursales([]));
  };
  const fetchModelos = () => {
    fetch("http://localhost:4000/modelos")
      .then(res => res.json())
      .then(data => setModelos(Array.isArray(data) ? data : []))
      .catch(() => setModelos([]));
  };

  useEffect(() => {
    fetchProductos();
    fetchSucursales();
    fetchModelos();
  }, []);

  // Agregar producto
  const handleAgregar = async () => {
    if (!nuevoProducto.nombre || !nuevoProducto.precio || !nuevoProducto.stock ||
        !nuevoProducto.id_sucursal || !nuevoProducto.id_modelo) {
      setMensaje({ tipo: "danger", texto: "Completa los campos obligatorios." });
      return;
    }
    try {
      const res = await fetch("http://localhost:4000/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...nuevoProducto,
          precio: Number(nuevoProducto.precio),
          stock: Number(nuevoProducto.stock),
          id_sucursal: Number(nuevoProducto.id_sucursal),
          id_modelo: Number(nuevoProducto.id_modelo),
          imagen: nuevoProducto.imagen || null
        }),
      });
      if (res.ok) {
        setMensaje({ tipo: "success", texto: "Producto agregado." });
        setShowAddModal(false);
        setNuevoProducto({
          nombre: "", descripcion: "", precio: "", stock: "",
          id_sucursal: "", id_modelo: "", imagen: ""
        });
        fetchProductos();
      } else {
        setMensaje({ tipo: "danger", texto: "Error al agregar producto." });
      }
    } catch {
      setMensaje({ tipo: "danger", texto: "Error de conexión." });
    }
  };

  // Eliminar producto
  const handleEliminar = async (id_producto) => {
    try {
      const res = await fetch(`http://localhost:4000/productos/${id_producto}`, { method: "DELETE" });
      if (res.ok) {
        setMensaje({ tipo: "success", texto: "Producto eliminado." });
        fetchProductos();
      } else {
        setMensaje({ tipo: "danger", texto: "No se pudo eliminar." });
      }
    } catch {
      setMensaje({ tipo: "danger", texto: "Error de conexión." });
    }
    setShowConfirmModal(false);
    setProductoAEliminar(null);
  };

  // Editar producto 
  const abrirEditar = (p) => {
    setProductoEditando({ ...p });
    setShowEditModal(true);
  };

  // Guardar edición
  const handleGuardarEdicion = async () => {
    if (!productoEditando.nombre || !productoEditando.precio || !productoEditando.stock ||
        !productoEditando.id_sucursal || !productoEditando.id_modelo) {
      setMensaje({ tipo: "danger", texto: "Completa los campos obligatorios." });
      return;
    }
    try {
      const res = await fetch(`http://localhost:4000/productos/${productoEditando.id_producto}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: productoEditando.nombre,
          descripcion: productoEditando.descripcion,
          precio: Number(productoEditando.precio),
          stock: Number(productoEditando.stock),
          id_sucursal: Number(productoEditando.id_sucursal),
          id_modelo: Number(productoEditando.id_modelo),
          imagen: productoEditando.imagen || null
        }),
      });
      if (res.ok) {
        setMensaje({ tipo: "success", texto: "Producto actualizado." });
        setShowEditModal(false);
        fetchProductos();
      } else {
        setMensaje({ tipo: "danger", texto: "Error al actualizar." });
      }
    } catch {
      setMensaje({ tipo: "danger", texto: "Error de conexión." });
    }
  };

  return (
    <Container className="mt-5">
      <h2 className="mb-4">Gestión de Productos</h2>
      {mensaje && <Alert variant={mensaje.tipo}>{mensaje.texto}</Alert>}

      <Button className="mb-3" onClick={() => setShowAddModal(true)}>
        Agregar Producto
      </Button>

      {cargando && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}
      {!cargando && productos.length === 0 && (
        <Alert variant="info">No hay productos registrados.</Alert>
      )}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Sucursal</th>
            <th>Modelo</th>
            <th>Imagen</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p) => (
            <tr key={p.id_producto}>
              <td>{p.id_producto}</td>
              <td>{p.nombre}</td>
              <td>{p.descripcion}</td>
              <td>${Number(p.precio).toLocaleString("es-CL")}</td>
              <td>{p.stock}</td>
              <td>
                {Array.isArray(sucursales) && sucursales.length > 0
                  ? (sucursales.find(s => String(s.id_sucursal) === String(p.id_sucursal))?.nombre || p.id_sucursal)
                  : p.id_sucursal}
              </td>
              <td>
                {Array.isArray(modelos) && modelos.length > 0
                  ? (modelos.find(m => String(m.id_modelo) === String(p.id_modelo))?.nombre || p.id_modelo)
                  : p.id_modelo}
              </td>
              <td>
                {p.imagen ? (
                  <Image src={p.imagen} alt="img" width={40} height={40} rounded style={{objectFit:"cover"}} />
                ) : (
                  <span className="text-muted">Sin imagen</span>
                )}
              </td>
              <td>
                <Button size="sm" variant="warning" className="me-2" onClick={() => abrirEditar(p)}>Editar</Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => { setProductoAEliminar(p); setShowConfirmModal(true); }}
                >
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal Agregar */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton><Modal.Title>Agregar Producto</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                value={nuevoProducto.nombre}
                onChange={e => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                value={nuevoProducto.descripcion}
                onChange={e => setNuevoProducto({ ...nuevoProducto, descripcion: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Precio</Form.Label>
              <Form.Control
                type="number"
                value={nuevoProducto.precio}
                onChange={e => setNuevoProducto({ ...nuevoProducto, precio: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Stock</Form.Label>
              <Form.Control
                type="number"
                value={nuevoProducto.stock}
                onChange={e => setNuevoProducto({ ...nuevoProducto, stock: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Sucursal</Form.Label>
              <Form.Select
                value={nuevoProducto.id_sucursal}
                onChange={e => setNuevoProducto({ ...nuevoProducto, id_sucursal: e.target.value })}
              >
                <option value="">Selecciona una sucursal</option>
                {Array.isArray(sucursales) && sucursales.length > 0
                  ? sucursales.map(s => (
                    <option key={s.id_sucursal} value={s.id_sucursal}>{s.nombre}</option>
                  ))
                  : <option value="">(Sin sucursales)</option>
                }
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Modelo</Form.Label>
              <Form.Select
                value={nuevoProducto.id_modelo}
                onChange={e => setNuevoProducto({ ...nuevoProducto, id_modelo: e.target.value })}
              >
                <option value="">Selecciona un modelo</option>
                {Array.isArray(modelos) && modelos.length > 0
                  ? modelos.map(m => (
                    <option key={m.id_modelo} value={m.id_modelo}>{m.nombre}</option>
                  ))
                  : <option value="">(Sin modelos)</option>
                }
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>URL Imagen</Form.Label>
              <Form.Control
                value={nuevoProducto.imagen}
                onChange={e => setNuevoProducto({ ...nuevoProducto, imagen: e.target.value })}
                placeholder="https://misimagenes.com/ejemplo.jpg"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={handleAgregar}>Agregar</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Editar */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton><Modal.Title>Editar Producto</Modal.Title></Modal.Header>
        <Modal.Body>
          {productoEditando && (
            <Form>
              <Form.Group className="mb-2">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  value={productoEditando.nombre}
                  onChange={e => setProductoEditando({ ...productoEditando, nombre: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  value={productoEditando.descripcion}
                  onChange={e => setProductoEditando({ ...productoEditando, descripcion: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Precio</Form.Label>
                <Form.Control
                  type="number"
                  value={productoEditando.precio}
                  onChange={e => setProductoEditando({ ...productoEditando, precio: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Stock</Form.Label>
                <Form.Control
                  type="number"
                  value={productoEditando.stock}
                  onChange={e => setProductoEditando({ ...productoEditando, stock: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Sucursal</Form.Label>
                <Form.Select
                  value={productoEditando.id_sucursal}
                  onChange={e => setProductoEditando({ ...productoEditando, id_sucursal: e.target.value })}
                >
                  <option value="">Selecciona una sucursal</option>
                  {Array.isArray(sucursales) && sucursales.length > 0
                    ? sucursales.map(s => (
                      <option key={s.id_sucursal} value={s.id_sucursal}>{s.nombre}</option>
                    ))
                    : <option value="">(Sin sucursales)</option>
                  }
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Modelo</Form.Label>
                <Form.Select
                  value={productoEditando.id_modelo}
                  onChange={e => setProductoEditando({ ...productoEditando, id_modelo: e.target.value })}
                >
                  <option value="">Selecciona un modelo</option>
                  {Array.isArray(modelos) && modelos.length > 0
                    ? modelos.map(m => (
                      <option key={m.id_modelo} value={m.id_modelo}>{m.nombre}</option>
                    ))
                    : <option value="">(Sin modelos)</option>
                  }
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>URL Imagen</Form.Label>
                <Form.Control
                  value={productoEditando.imagen}
                  onChange={e => setProductoEditando({ ...productoEditando, imagen: e.target.value })}
                  placeholder="https://misimagenes.com/ejemplo.jpg"
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={handleGuardarEdicion}>Guardar</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Confirmar Eliminar */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {productoAEliminar &&
            <div>
              ¿Seguro que quieres eliminar <b>{productoAEliminar.nombre}</b> (ID: {productoAEliminar.id_producto})?
            </div>
          }
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>Cancelar</Button>
          <Button variant="danger" onClick={() => handleEliminar(productoAEliminar.id_producto)}>Eliminar</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

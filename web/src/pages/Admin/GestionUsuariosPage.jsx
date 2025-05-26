import React, { useEffect, useState } from "react";
import { Container, Table, Button, Spinner, Modal, Form, Alert } from "react-bootstrap";

const TIPOS_USUARIO = [
  "administrador", "vendedor", "bodeguero", "contador", "cliente"
];

const validarRut = rut => /^[0-9]{7,8}-[0-9kK]$/.test(rut);
const validarEmail = correo => /\S+@\S+\.\S+/.test(correo);

export default function GestionUsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [editando, setEditando] = useState(false);

  // Para agregar usuario
  const [showAddModal, setShowAddModal] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    rut: "",
    correo: "",
    contrasena: "",
    primer_nombre: "",
    segundo_nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    tipo_usuario: "cliente"
  });
  const [errores, setErrores] = useState({});

  // Modal de confirmación de eliminación
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  function fetchUsuarios() {
    setCargando(true);
    fetch("http://localhost:8000/usuarios/")
      .then((res) => res.json())
      .then((data) => {
        setUsuarios(data);
        setCargando(false);
        setError("");
      })
      .catch(() => {
        setError("Error al cargar usuarios");
        setCargando(false);
      });
  }

  // Validación en cada cambio
  const validarCampo = (name, value) => {
    switch (name) {
      case "rut":
        if (!value) return "El RUT es obligatorio.";
        if (!validarRut(value)) return "Formato RUT inválido (Ej: 12345678-9)";
        return "";
      case "correo":
        if (!value) return "El correo es obligatorio.";
        if (!validarEmail(value)) return "Correo inválido (Ej: correo@ejemplo.com)";
        return "";
      case "contrasena":
        if (!value) return "La contraseña es obligatoria.";
        if (value.length < 6) return "Debe tener al menos 6 caracteres.";
        return "";
      case "primer_nombre":
        if (!value) return "El primer nombre es obligatorio.";
        return "";
      case "apellido_paterno":
        if (!value) return "El apellido paterno es obligatorio.";
        return "";
      case "apellido_materno":
        if (!value) return "El apellido materno es obligatorio.";
        return "";
      case "tipo_usuario":
        if (!value) return "Selecciona un tipo.";
        if (!TIPOS_USUARIO.includes(value)) return "Tipo no válido.";
        return "";
      default:
        return "";
    }
  };

  const handleNuevoUsuarioChange = (e) => {
    const { name, value } = e.target;
    let nuevoValor = value;
    if (name === "rut") {
      nuevoValor = value.replace(/[^0-9kK-]/g, "").slice(0, 10);
    }
    setNuevoUsuario({ ...nuevoUsuario, [name]: nuevoValor });

    setErrores({
      ...errores,
      [name]: validarCampo(name, nuevoValor)
    });
  };

  // Eliminar usuario con confirmación modal
  const handleEliminar = async (rut) => {
    try {
      const res = await fetch(`http://localhost:8000/usuarios/${rut}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setMensaje({ tipo: "success", texto: "Usuario eliminado correctamente" });
        setUsuarios(usuarios.filter((u) => u.rut !== rut));
      } else {
        setMensaje({ tipo: "danger", texto: data.detail || "Error al eliminar usuario" });
      }
    } catch {
      setMensaje({ tipo: "danger", texto: "Error de conexión" });
    }
    setShowConfirmModal(false);
    setUsuarioAEliminar(null);
  };

  // Editar usuario
  const handleEditar = (usuario) => {
    setUsuarioEditar({ ...usuario });
    setShowModal(true);
    setMensaje(null);
  };

  // Guardar edición
  const handleGuardar = async () => {
    if (!usuarioEditar) return;
    setEditando(true);
    try {
      const res = await fetch(`http://localhost:8000/usuarios/${usuarioEditar.rut}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuarioEditar),
      });
      const data = await res.json();
      if (res.ok) {
        setMensaje({ tipo: "success", texto: "Usuario actualizado" });
        setShowModal(false);
        fetchUsuarios();
      } else {
        setMensaje({ tipo: "danger", texto: data.detail || "Error al actualizar" });
      }
    } catch {
      setMensaje({ tipo: "danger", texto: "Error de conexión" });
    }
    setEditando(false);
  };

  // AGREGAR USUARIO CON VALIDACIÓN FINAL AL ENVIAR
  const handleAddUser = async () => {
    let valid = true;
    const nuevosErrores = {};
    Object.entries(nuevoUsuario).forEach(([name, value]) => {
      if (name === "segundo_nombre") return;
      const errorMsg = validarCampo(name, value);
      if (errorMsg) valid = false;
      nuevosErrores[name] = errorMsg;
    });
    setErrores(nuevosErrores);

    if (!valid) {
      setMensaje({ tipo: "danger", texto: "Corrige los errores del formulario antes de agregar." });
      return;
    }

    setEditando(true);
    try {
      const res = await fetch("http://localhost:8000/usuarios/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoUsuario),
      });
      const data = await res.json();
      if (res.ok) {
        setMensaje({ tipo: "success", texto: "Usuario agregado correctamente" });
        setShowAddModal(false);
        setNuevoUsuario({
          rut: "",
          correo: "",
          contrasena: "",
          primer_nombre: "",
          segundo_nombre: "",
          apellido_paterno: "",
          apellido_materno: "",
          tipo_usuario: "cliente"
        });
        setErrores({});
        fetchUsuarios();
      } else {
        let msg = data.detail || "Error al agregar usuario";
        if (
          msg.includes("ORA-00001") ||
          msg.includes("restricción única") ||
          msg.includes("unique constraint")
        ) {
          msg = "El RUT o correo ya están registrados. Prueba con otros datos.";
        }
        setMensaje({ tipo: "danger", texto: msg });
      }
    } catch {
      setMensaje({ tipo: "danger", texto: "Error de conexión" });
    }
    setEditando(false);
  };

  return (
    <Container className="my-5">
      <h2 className="mb-4 fw-bold text-primary">Administración de Usuarios</h2>

      {mensaje && <Alert variant={mensaje.tipo}>{mensaje.texto}</Alert>}

      <Button className="mb-3" onClick={() => { setShowAddModal(true); setErrores({}); }}>
        Agregar Usuario
      </Button>

      {cargando ? (
        <div className="text-center py-5">
          <Spinner animation="border" /> <br />
          <span>Cargando usuarios...</span>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>RUT</th>
              <th>Correo</th>
              <th>Nombre</th>
              <th>Apellido Paterno</th>
              <th>Apellido Materno</th>
              <th>Tipo Usuario</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.rut}>
                <td>{u.rut}</td>
                <td>{u.correo}</td>
                <td>{u.primer_nombre} {u.segundo_nombre || ""}</td>
                <td>{u.apellido_paterno}</td>
                <td>{u.apellido_materno}</td>
                <td>{u.tipo_usuario}</td>
                <td>
                  <Button
                    size="sm"
                    variant="warning"
                    className="me-2"
                    onClick={() => handleEditar(u)}
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      setUsuarioAEliminar(u);
                      setShowConfirmModal(true);
                    }}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* MODAL DE EDICIÓN */}
      <Modal show={showModal && !!usuarioEditar} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {usuarioEditar ? (
            <Form>
              <Form.Group className="mb-2">
                <Form.Label>Correo</Form.Label>
                <Form.Control
                  type="email"
                  value={usuarioEditar.correo || ""}
                  onChange={e => setUsuarioEditar({ ...usuarioEditar, correo: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Primer nombre</Form.Label>
                <Form.Control
                  value={usuarioEditar.primer_nombre || ""}
                  onChange={e => setUsuarioEditar({ ...usuarioEditar, primer_nombre: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Segundo nombre</Form.Label>
                <Form.Control
                  value={usuarioEditar.segundo_nombre || ""}
                  onChange={e => setUsuarioEditar({ ...usuarioEditar, segundo_nombre: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Apellido paterno</Form.Label>
                <Form.Control
                  value={usuarioEditar.apellido_paterno || ""}
                  onChange={e => setUsuarioEditar({ ...usuarioEditar, apellido_paterno: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Apellido materno</Form.Label>
                <Form.Control
                  value={usuarioEditar.apellido_materno || ""}
                  onChange={e => setUsuarioEditar({ ...usuarioEditar, apellido_materno: e.target.value })}
                />
              </Form.Group>
              {/* Tipo usuario solo se muestra y NO se puede editar */}
              <Form.Group className="mb-2">
                <Form.Label>Tipo usuario</Form.Label>
                <Form.Control
                  value={usuarioEditar.tipo_usuario}
                  disabled
                />
                <Form.Text className="text-muted">
                  No se puede cambiar el tipo de usuario. Para eso, elimine y cree uno nuevo.
                </Form.Text>
              </Form.Group>
            </Form>
          ) : (
            <div>No hay usuario seleccionado.</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleGuardar} disabled={editando || !usuarioEditar}>
            Guardar cambios
          </Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL DE AGREGAR USUARIO */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>RUT</Form.Label>
              <Form.Control
                name="rut"
                value={nuevoUsuario.rut}
                onChange={handleNuevoUsuarioChange}
                placeholder="Ej: 12345678-9"
                isInvalid={!!errores.rut}
                maxLength={10}
              />
              <Form.Text>Ejemplo: 12345678-9</Form.Text>
              <Form.Control.Feedback type="invalid">{errores.rut}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Correo</Form.Label>
              <Form.Control
                name="correo"
                type="email"
                value={nuevoUsuario.correo}
                onChange={handleNuevoUsuarioChange}
                placeholder="Ej: usuario@ferremas.cl"
                isInvalid={!!errores.correo}
              />
              <Form.Text>Ejemplo: usuario@ferremas.cl</Form.Text>
              <Form.Control.Feedback type="invalid">{errores.correo}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                name="contrasena"
                type="password"
                value={nuevoUsuario.contrasena}
                onChange={handleNuevoUsuarioChange}
                placeholder="Al menos 6 caracteres"
                isInvalid={!!errores.contrasena}
              />
              <Form.Text>Ejemplo: tuclave123</Form.Text>
              <Form.Control.Feedback type="invalid">{errores.contrasena}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Primer nombre</Form.Label>
              <Form.Control
                name="primer_nombre"
                value={nuevoUsuario.primer_nombre}
                onChange={handleNuevoUsuarioChange}
                placeholder="Ej: Juan"
                isInvalid={!!errores.primer_nombre}
              />
              <Form.Text>Ejemplo: Juan</Form.Text>
              <Form.Control.Feedback type="invalid">{errores.primer_nombre}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Segundo nombre (opcional)</Form.Label>
              <Form.Control
                name="segundo_nombre"
                value={nuevoUsuario.segundo_nombre}
                onChange={handleNuevoUsuarioChange}
                placeholder="Ej: Pablo"
              />
              <Form.Text>Ejemplo: Pablo</Form.Text>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Apellido paterno</Form.Label>
              <Form.Control
                name="apellido_paterno"
                value={nuevoUsuario.apellido_paterno}
                onChange={handleNuevoUsuarioChange}
                placeholder="Ej: Fernández"
                isInvalid={!!errores.apellido_paterno}
              />
              <Form.Text>Ejemplo: Fernández</Form.Text>
              <Form.Control.Feedback type="invalid">{errores.apellido_paterno}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Apellido materno</Form.Label>
              <Form.Control
                name="apellido_materno"
                value={nuevoUsuario.apellido_materno}
                onChange={handleNuevoUsuarioChange}
                placeholder="Ej: López"
                isInvalid={!!errores.apellido_materno}
              />
              <Form.Text>Ejemplo: López</Form.Text>
              <Form.Control.Feedback type="invalid">{errores.apellido_materno}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Tipo usuario</Form.Label>
              <Form.Select
                name="tipo_usuario"
                value={nuevoUsuario.tipo_usuario}
                onChange={handleNuevoUsuarioChange}
                isInvalid={!!errores.tipo_usuario}
              >
                {TIPOS_USUARIO.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </Form.Select>
              <Form.Text>Ejemplo: cliente, vendedor...</Form.Text>
              <Form.Control.Feedback type="invalid">{errores.tipo_usuario}</Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleAddUser} disabled={editando}>
            Agregar usuario
          </Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL DE CONFIRMACIÓN ELIMINAR */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {usuarioAEliminar &&
            <div>
              ¿Seguro que quieres eliminar al usuario <b>{usuarioAEliminar.primer_nombre} {usuarioAEliminar.apellido_paterno}</b> ({usuarioAEliminar.correo})?
            </div>
          }
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={() => handleEliminar(usuarioAEliminar.rut)}
          >
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

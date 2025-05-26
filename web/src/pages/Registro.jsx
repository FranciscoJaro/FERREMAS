import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "react-bootstrap";
import { FaUserPlus } from "react-icons/fa";

const validarRut = rut => /^[0-9]{7,8}-[0-9kK]$/.test(rut);
const validarEmail = correo => /\S+@\S+\.\S+/.test(correo);

export default function Registro() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    rut: '',
    correo: '',
    contrasena: '',
    primer_nombre: '',
    segundo_nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    direccion: '',
    telefono: '',
  });
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState('');
  const [tipo, setTipo] = useState('');
  const [enviando, setEnviando] = useState(false);

  const validarCampo = (name, value) => {
    switch (name) {
      case "rut":
        if (!value) return "El RUT es obligatorio.";
        if (!validarRut(value)) return "Formato RUT inválido. Ej: 12345678-9";
        return "";
      case "correo":
        if (!value) return "El correo es obligatorio.";
        if (!validarEmail(value)) return "Correo inválido. Ej: usuario@correo.com";
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
      case "direccion":
        if (!value) return "La dirección es obligatoria.";
        return "";
      case "telefono":
        if (!value) return "El teléfono es obligatorio.";
        if (!/^[0-9]{8,15}$/.test(value)) return "Solo números, 8 a 15 dígitos.";
        return "";
      default:
        return "";
    }
  };

  const esFormularioValido = () => {
    let valid = true;
    for (const campo of ["rut", "correo", "contrasena", "primer_nombre", "apellido_paterno", "apellido_materno", "direccion", "telefono"]) {
      const error = validarCampo(campo, form[campo]);
      if (error) valid = false;
    }
    return valid;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    let nuevoValor = value;
    if (name === "rut") {
      nuevoValor = value.replace(/[^0-9kK-]/g, "").slice(0, 10);
    } else if (name === "telefono") {
      nuevoValor = value.replace(/[^0-9]/g, "").slice(0, 15);
    }
    setForm(f => ({ ...f, [name]: nuevoValor }));
    setErrores(errs => ({
      ...errs,
      [name]: validarCampo(name, nuevoValor)
    }));
    setMensaje('');
    setTipo('');
  };

  const validarTodo = () => {
    const nuevosErrores = {};
    let valido = true;
    for (const campo of ["rut", "correo", "contrasena", "primer_nombre", "apellido_paterno", "apellido_materno", "direccion", "telefono"]) {
      const error = validarCampo(campo, form[campo]);
      nuevosErrores[campo] = error;
      if (error) valido = false;
    }
    setErrores(nuevosErrores);
    return valido;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMensaje('');
    setTipo('');
    if (!validarTodo()) {
      setMensaje('Corrige los errores antes de registrar.');
      setTipo('danger');
      return;
    }
    setEnviando(true);
    try {
      const resUsuario = await fetch('http://localhost:8000/usuarios/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rut: form.rut,
          correo: form.correo,
          contrasena: form.contrasena,
          primer_nombre: form.primer_nombre,
          segundo_nombre: form.segundo_nombre,
          apellido_paterno: form.apellido_paterno,
          apellido_materno: form.apellido_materno,
          tipo_usuario: 'cliente'
        })
      });
      const dataUsuario = await resUsuario.json();

      if (!resUsuario.ok) {
        let msg = dataUsuario.detail || 'Error usuario';
        if (
          msg.includes("ORA-00001") ||
          msg.includes("restricción única") ||
          msg.includes("unique constraint")
        ) {
          msg = "El RUT o correo ya están registrados. Puedes iniciar sesión.";
          setMensaje(msg);
          setTipo('success');
          setTimeout(() => navigate("/"), 1500);
          setEnviando(false);
          return;
        }
        setMensaje(msg);
        setTipo('danger');
        setEnviando(false);
        return;
      }

      const resCliente = await fetch('http://localhost:8000/clientes/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario: dataUsuario.id_usuario,
          nombre: `${form.primer_nombre} ${form.apellido_paterno}`,
          direccion: form.direccion,
          telefono: form.telefono
        })
      });
      const dataCliente = await resCliente.json();

      if (!resCliente.ok) {
        let msg = dataCliente.detail || 'Error cliente';
        if (
          msg.includes("ORA-00001") ||
          msg.includes("restricción única") ||
          msg.includes("unique constraint")
        ) {
          setMensaje('¡Registro exitoso! Redirigiendo...');
          setTipo('success');
          setTimeout(() => navigate("/"), 1200);
          setEnviando(false);
          return;
        }
        setMensaje(msg);
        setTipo('danger');
        setEnviando(false);
        return;
      }

      setMensaje('¡Registro exitoso! Redirigiendo...');
      setTipo('success');
      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      let msg = err.message;
      if (
        msg.includes("ORA-00001") ||
        msg.includes("restricción única") ||
        msg.includes("unique constraint")
      ) {
        msg = "El RUT o correo ya están registrados. Puedes iniciar sesión.";
        setMensaje(msg);
        setTipo('success');
        setTimeout(() => navigate("/"), 1200);
        setEnviando(false);
        return;
      }
      setMensaje(msg);
      setTipo('danger');
    }
    setEnviando(false);
  };

  return (
    <div style={{
      minHeight: "93vh",
      background: "#f6f9fb",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <Card className="shadow-lg" style={{
        maxWidth: 440,
        width: "100%",
        borderRadius: "1.3rem",
        padding: "22px 7px"
      }}>
        <Card.Body>
          <div className="text-center mb-3">
            <FaUserPlus size={48} color="#2563eb" style={{ marginBottom: 8 }} />
            <h3 className="fw-bold text-primary mb-0" style={{ letterSpacing: "1px" }}>
              Crear cuenta
            </h3>
            <div style={{
              width: 50, height: 3, background: "#FFD600",
              borderRadius: 2, margin: "13px auto 10px"
            }} />
          </div>
          {mensaje && (
            <div className={`alert alert-${tipo} py-2 mb-3 text-center`} style={{ fontSize: "1.04rem" }}>
              {mensaje}
            </div>
          )}
          <form onSubmit={handleSubmit} noValidate>
            {[
              { name: "rut", label: "RUT", placeholder: "Ej: 12345678-9", maxLength: 10 },
              { name: "correo", label: "Correo electrónico", placeholder: "usuario@correo.com" },
              { name: "contrasena", label: "Contraseña", placeholder: "Mínimo 6 caracteres", type: "password" },
              { name: "primer_nombre", label: "Primer nombre", placeholder: "Ej: Juan" },
              { name: "segundo_nombre", label: "Segundo nombre (opcional)", placeholder: "Ej: Pablo" },
              { name: "apellido_paterno", label: "Apellido paterno", placeholder: "Ej: Fernández" },
              { name: "apellido_materno", label: "Apellido materno", placeholder: "Ej: López" },
              { name: "direccion", label: "Dirección", placeholder: "Ej: Av. Siempre Viva 742" },
              { name: "telefono", label: "Teléfono", placeholder: "Ej: 912345678", maxLength: 15 },
            ].map((input, i) => (
              <div className="mb-2" key={input.name}>
                <label className="form-label mb-0">{input.label}</label>
                <input
                  name={input.name}
                  type={input.type || "text"}
                  className={`form-control ${errores[input.name] ? "is-invalid" : ""}`}
                  placeholder={input.placeholder}
                  value={form[input.name]}
                  onChange={handleChange}
                  maxLength={input.maxLength}
                  autoComplete="off"
                  style={{ borderRadius: "0.8rem" }}
                />
                {input.name === "rut" && (
                  <div className="form-text">Máximo 10 caracteres. Ejemplo: 12345678-9</div>
                )}
                <div className="invalid-feedback">{errores[input.name]}</div>
              </div>
            ))}
            <button
              className="btn btn-primary w-100 mt-2 fw-semibold"
              disabled={!esFormularioValido() || enviando}
              style={{
                borderRadius: "2rem",
                fontSize: "1.07rem",
                marginTop: 7,
                boxShadow: "0 4px 18px #2563eb16"
              }}
            >
              <FaUserPlus style={{ marginRight: 7, marginBottom: 2 }} />
              Registrarse
            </button>
          </form>
        </Card.Body>
      </Card>
    </div>
  );
}

// src/pages/Registro.jsx
import React, { useState } from 'react';

export default function Registro() {
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
  const [mensaje, setMensaje] = useState('');
  const [tipo, setTipo] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const validar = () => {
    // Valida campos básicos...
    if (!form.rut) return 'RUT requerido';
    if (!form.correo) return 'Correo requerido';
    if (!form.contrasena || form.contrasena.length < 6) return 'Contraseña mínima 6 caracteres';
    if (!form.primer_nombre) return 'Nombre requerido';
    if (!form.apellido_paterno) return 'Apellido paterno requerido';
    if (!form.apellido_materno) return 'Apellido materno requerido';
    if (!form.direccion) return 'Dirección requerida';
    if (!form.telefono) return 'Teléfono requerido';
    return '';
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMensaje('');
    setTipo('');
    const error = validar();
    if (error) {
      setMensaje(error);
      setTipo('danger');
      return;
    }
    try {
      // 1. Registrar usuario
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
          apellido_materno: form.apellido_materno
        })
      });
      const dataUsuario = await resUsuario.json();
      if (!resUsuario.ok) throw new Error(dataUsuario.detail || 'Error usuario');

      // 2. Registrar cliente con el id_usuario devuelto
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
      if (!resCliente.ok) throw new Error(dataCliente.detail || 'Error cliente');

      setMensaje('¡Registro exitoso! Ya puedes iniciar sesión.');
      setTipo('success');
      setForm({
        rut: '', correo: '', contrasena: '',
        primer_nombre: '', segundo_nombre: '',
        apellido_paterno: '', apellido_materno: '',
        direccion: '', telefono: ''
      });
    } catch (err) {
      setMensaje(err.message);
      setTipo('danger');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 500 }}>
      <h2 className="mb-4">Registrarse</h2>
      {mensaje && <div className={`alert alert-${tipo}`}>{mensaje}</div>}
      <form onSubmit={handleSubmit}>
        <input name="rut" className="form-control mb-2" placeholder="RUT" value={form.rut} onChange={handleChange} />
        <input name="correo" className="form-control mb-2" placeholder="Correo" value={form.correo} onChange={handleChange} />
        <input name="contrasena" type="password" className="form-control mb-2" placeholder="Contraseña" value={form.contrasena} onChange={handleChange} />
        <input name="primer_nombre" className="form-control mb-2" placeholder="Primer nombre" value={form.primer_nombre} onChange={handleChange} />
        <input name="segundo_nombre" className="form-control mb-2" placeholder="Segundo nombre (opcional)" value={form.segundo_nombre} onChange={handleChange} />
        <input name="apellido_paterno" className="form-control mb-2" placeholder="Apellido paterno" value={form.apellido_paterno} onChange={handleChange} />
        <input name="apellido_materno" className="form-control mb-2" placeholder="Apellido materno" value={form.apellido_materno} onChange={handleChange} />
        <input name="direccion" className="form-control mb-2" placeholder="Dirección de envío" value={form.direccion} onChange={handleChange} />
        <input name="telefono" className="form-control mb-2" placeholder="Teléfono" value={form.telefono} onChange={handleChange} />
        <button className="btn btn-primary w-100">Registrarse</button>
      </form>
    </div>
  );
}

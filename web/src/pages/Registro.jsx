import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validarRut(rut) {
  return /^[0-9]+-[0-9kK]$/.test(rut);
}

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
    direccion: ''
  });
  const [mensaje, setMensaje] = useState('');
  const [tipo, setTipo] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validar = () => {
    if (!form.rut || !validarRut(form.rut)) return 'El RUT es obligatorio y debe tener formato 12345678-9';
    if (!form.correo || !validarEmail(form.correo)) return 'Correo electrónico inválido';
    if (!form.contrasena || form.contrasena.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
    if (!form.primer_nombre) return 'Debes ingresar tu primer nombre';
    if (!form.apellido_paterno) return 'Debes ingresar tu apellido paterno';
    if (!form.apellido_materno) return 'Debes ingresar tu apellido materno';
    if (!form.direccion || form.direccion.length < 5) return 'Debes ingresar una dirección válida';
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
      const res = await fetch('http://localhost:8000/usuarios/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setMensaje('¡Registro exitoso! Redirigiendo al login...');
        setTipo('success');
        setForm({
          rut: '',
          correo: '',
          contrasena: '',
          primer_nombre: '',
          segundo_nombre: '',
          apellido_paterno: '',
          apellido_materno: '',
          direccion: ''
        });
        // Redirige al login después de 1.5 segundos
        setTimeout(() => navigate('/login'), 1500);
      } else {
        if (data.detail && data.detail.includes('ORA-01400')) {
          setMensaje('Error: Hubo un problema con los datos ingresados. ¿Ya existe ese RUT o correo?');
        } else if (data.detail && data.detail.includes('ORA-00001')) {
          setMensaje('Error: Ese usuario ya está registrado.');
        } else {
          setMensaje(data.detail || 'Error al registrar');
        }
        setTipo('danger');
      }
    } catch {
      setMensaje('No se pudo conectar con el servidor');
      setTipo('danger');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #fff 100%)' }}>
      <div className="card shadow-lg" style={{ minWidth: 400, maxWidth: 430, width: '100%', padding: '2.5rem 2rem', borderRadius: '2rem' }}>
        <h2 className="mb-3 text-center" style={{ fontWeight: 'bold', color: '#2357ec', letterSpacing: 1 }}>Crear cuenta en <span style={{ color: '#1e293b' }}>FERREMAS</span></h2>
        <p className="text-center text-secondary mb-4" style={{ fontSize: 16 }}>¡Regístrate para comprar y acceder a todas las funciones!</p>
        {mensaje && (
          <div className={`alert alert-${tipo} text-center`} style={{ fontSize: 15 }}>{mensaje}</div>
        )}
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="mb-3">
            <label className="form-label">RUT</label>
            <input name="rut" className="form-control form-control-lg" placeholder="12345678-9" value={form.rut} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Correo electrónico</label>
            <input name="correo" className="form-control form-control-lg" placeholder="correo@ejemplo.com" value={form.correo} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <input name="contrasena" type="password" className="form-control form-control-lg" placeholder="Mínimo 6 caracteres" value={form.contrasena} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Primer nombre</label>
            <input name="primer_nombre" className="form-control form-control-lg" placeholder="Tu nombre" value={form.primer_nombre} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Segundo nombre (opcional)</label>
            <input name="segundo_nombre" className="form-control form-control-lg" placeholder="Opcional" value={form.segundo_nombre} onChange={handleChange} />
          </div>
          <div className="mb-3">
            <label className="form-label">Apellido paterno</label>
            <input name="apellido_paterno" className="form-control form-control-lg" placeholder="Apellido paterno" value={form.apellido_paterno} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Apellido materno</label>
            <input name="apellido_materno" className="form-control form-control-lg" placeholder="Apellido materno" value={form.apellido_materno} onChange={handleChange} required />
          </div>
          <div className="mb-4">
            <label className="form-label">Dirección de envío</label>
            <input name="direccion" className="form-control form-control-lg" placeholder="Ejemplo: Av. Siempre Viva 742" value={form.direccion} onChange={handleChange} required />
          </div>
          <button className="btn btn-primary w-100 py-2 fs-5" type="submit" style={{ borderRadius: '2rem' }}>
            Registrarse
          </button>
        </form>
      </div>
    </div>
  );
}

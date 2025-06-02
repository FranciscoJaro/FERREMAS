import React, { useEffect, useState } from 'react';
import { Container, Button, Card, Row, Col, Spinner, Badge, Alert, Form } from 'react-bootstrap';
import { FaTools, FaShoppingCart, FaStar, FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function shortDesc(text, max = 54) {
  return text?.length > max ? text.slice(0, max - 3) + "..." : text;
}

export default function HomePage() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState(null);
  const [tipoMsg, setTipoMsg] = useState('success');
  const [busqueda, setBusqueda] = useState('');
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');
  const [soloDestacados, setSoloDestacados] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:4000/productos')
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar productos');
        return res.json();
      })
      .then(data => {
        data.sort((a, b) => b.id_producto - a.id_producto);
        setProductos(data);
        setCargando(false);
      })
      .catch(() => {
        setError('No se pudieron cargar los productos. Intenta más tarde.');
        setCargando(false);
      });
  }, []);

  const handleAgregarCarrito = async (producto) => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario || usuario.tipo_usuario !== "cliente" || !usuario.id_usuario) {
      setMensaje("Debes iniciar sesión como cliente para comprar.");
      setTipoMsg("warning");
      setTimeout(() => navigate("/login"), 1200);
      return;
    }
    try {
      const resp = await fetch("http://localhost:4000/carrito/agregar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario: usuario.id_usuario,
          id_producto: producto.id_producto,
          cantidad: 1
        })
      });
      if (!resp.ok) throw new Error("No se pudo agregar al carrito");
      setMensaje("Producto agregado al carrito.");
      setTipoMsg("success");
    } catch (e) {
      setMensaje("Ocurrió un error al agregar al carrito.");
      setTipoMsg("danger");
    }
    setTimeout(() => setMensaje(null), 1800);
  };

  const productosFiltrados = productos.filter(p => {
    if (Number(p.stock) <= 0) return false;
    if (busqueda && !(
      p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
    )) return false;
    if (precioMin && Number(p.precio) < Number(precioMin)) return false;
    if (precioMax && Number(p.precio) > Number(precioMax)) return false;
    if (soloDestacados && p.id_producto !== productos[0]?.id_producto) return false;
    return true;
  });

  function ProductoCard({ producto, esNuevo }) {
    return (
      <div className="nuevo-card-ferremas">
        <div className="img-container-ferremas">
          <img
            src={producto.imagen || "https://via.placeholder.com/420x240?text=Producto"}
            alt={producto.nombre}
            className="img-ferremas"
            draggable={false}
          />
          {esNuevo && (
            <Badge className="badge-nuevo-ferremas" bg="warning" text="dark">
              <FaStar style={{ marginBottom: 2 }} /> ¡Nuevo!
            </Badge>
          )}
          <Badge className="badge-stock-ferremas" bg="success">
            <FaCheckCircle style={{ marginBottom: 2 }} /> {producto.stock}
          </Badge>
        </div>
        <div className="body-ferremas">
          <div className="info-ferremas">
            <h5 className="title-ferremas">{producto.nombre}</h5>
            <div className="desc-ferremas">{shortDesc(producto.descripcion, 60)}</div>
          </div>
          <div className="price-btn-ferremas">
            <span className="price-ferremas">
              ${Number(producto.precio).toLocaleString('es-CL')}
            </span>
            <Button
              className="add-btn-ferremas"
              onClick={() => handleAgregarCarrito(producto)}
            >
              <FaShoppingCart style={{ marginBottom: 3, marginRight: 6 }} />
              Agregar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f7fafd", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          background: "linear-gradient(90deg, #2563eb 0%, #38b6ff 100%)",
          minHeight: "230px",
          width: "100vw",
          marginLeft: "calc(-50vw + 50%)",
          marginRight: "calc(-50vw + 50%)",
          boxShadow: "0 2px 12px #2563eb20",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <h1 className="display-5 fw-bold mb-1 text-center" style={{ letterSpacing: "1.2px", lineHeight: "1.15" }}>
          <span style={{ color: "#FFD600" }}>FERREMAS</span> | Herramientas y Equipamiento
        </h1>
        <p className="lead mb-0 text-center" style={{ fontSize: "1.13rem", color: "#e5f2fa" }}>
          Tu ferretería online: Precios, calidad y entrega segura.
        </p>
      </div>

      <Container fluid="md" style={{ maxWidth: 1080, marginTop: -32 }}>
        <div style={{
          display: "flex",
          gap: "11px",
          alignItems: "center",
          padding: "13px 17px",
          background: "#fff",
          borderRadius: "1.12rem",
          marginBottom: "28px",
          boxShadow: "0 1.5px 10px #e0eaff33",
          overflowX: "auto"
        }}>
          <Form.Control
            type="text"
            placeholder="Buscar productos..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{ minWidth: 200, maxWidth: 230, borderRadius: "1.1rem" }}
          />
          <Form.Control
            type="number"
            placeholder="Precio mín"
            value={precioMin}
            onChange={e => setPrecioMin(e.target.value)}
            min={0}
            style={{ minWidth: 90, borderRadius: "1.1rem" }}
          />
          <Form.Control
            type="number"
            placeholder="Precio máx"
            value={precioMax}
            onChange={e => setPrecioMax(e.target.value)}
            min={0}
            style={{ minWidth: 90, borderRadius: "1.1rem" }}
          />
          <Form.Check
            type="switch"
            checked={soloDestacados}
            onChange={() => setSoloDestacados(v => !v)}
            id="switch-destacados"
            label={<span style={{ fontWeight: 500, fontSize: 15 }}>Solo destacados</span>}
            style={{ minWidth: 110, marginTop: 4 }}
          />
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => { setBusqueda(""); setPrecioMin(""); setPrecioMax(""); setSoloDestacados(false); }}
            style={{ fontWeight: 500, borderRadius: "1.1rem" }}
          >
            Limpiar
          </Button>
        </div>
      </Container>

      <Container fluid="md">
        {mensaje && (
          <Alert
            variant={tipoMsg}
            className="mt-2 mb-1 text-center py-2"
            style={{ fontSize: "1.05rem", letterSpacing: ".3px" }}
          >
            {mensaje}
          </Alert>
        )}
      </Container>

      <div style={{
        flex: 1,
        background: "transparent",
        padding: "18px 0 54px 0",
        minHeight: "60vh"
      }}>
        <Container fluid="md">
          <div className="text-center mb-3">
            <span style={{ color: "#2563eb", fontSize: "2rem", marginRight: 10, verticalAlign: "middle" }}>
              <FaTools />
            </span>
            <span className="fw-bold" style={{ fontSize: "2.07rem", letterSpacing: "1.2px" }}>
              Productos disponibles
            </span>
          </div>

          {cargando && (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" /> <br />
              <span className="text-secondary">Cargando productos...</span>
            </div>
          )}
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="ferremas-grid">
            {productosFiltrados.length === 0 && !cargando && !error && (
              <div className="text-center text-muted mb-5">No hay productos disponibles</div>
            )}
            {productosFiltrados.map((producto, idx) => (
              <ProductoCard key={producto.id_producto} producto={producto} esNuevo={producto.id_producto === productos[0]?.id_producto} />
            ))}
          </div>
        </Container>
      </div>

      <style>{`
        .ferremas-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 32px 22px;
          justify-items: center;
        }
        .nuevo-card-ferremas {
          width: 330px;
          background: #fff;
          border-radius: 2.1rem;
          box-shadow: 0 6px 40px #2563eb11, 0 1.5px 10px #2563eb12;
          transition: box-shadow .16s, transform .16s;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: stretch;
        }
        .nuevo-card-ferremas:hover {
          box-shadow: 0 20px 52px #2563eb22, 0 8px 24px #0002 !important;
          transform: translateY(-8px) scale(1.028);
        }
        .img-container-ferremas {
          position: relative;
          width: 100%;
          height: 200px;
          background: #f2f4f9;
          border-top-left-radius: 2.1rem;
          border-top-right-radius: 2.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .img-ferremas {
          object-fit: cover;
          width: 100%;
          height: 100%;
          border-radius: 2.1rem 2.1rem 0 0;
          box-shadow: 0 8px 16px #2563eb10;
          transition: transform .18s, box-shadow .14s;
        }
        .nuevo-card-ferremas:hover .img-ferremas {
          transform: scale(1.05);
          box-shadow: 0 12px 32px #2563eb18;
        }
        .badge-nuevo-ferremas {
          position: absolute;
          top: 13px;
          left: 15px;
          font-weight: 600;
          font-size: 1rem;
          letter-spacing: .2px;
          padding: 4px 10px;
          border-radius: 1.3rem;
          box-shadow: 0 1.5px 7px #2563eb21;
        }
        .badge-stock-ferremas {
          position: absolute;
          top: 13px;
          right: 15px;
          font-size: .99rem;
          padding: 4px 10px;
          border-radius: 1.3rem;
          opacity: .93;
        }
        .body-ferremas {
          display: flex;
          flex-direction: column;
          flex: 1;
          padding: 16px 20px 20px 20px;
          gap: 6px;
        }
        .info-ferremas {
          flex: 1;
        }
        .title-ferremas {
          font-size: 1.14rem;
          font-weight: 700;
          color: #1b232e;
          margin-bottom: 3px;
        }
        .desc-ferremas {
          color: #6e7787;
          font-size: 1.02rem;
          min-height: 33px;
        }
        .price-btn-ferremas {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 14px;
          gap: 10px;
        }
        .price-ferremas {
          color: #2563eb;
          font-size: 1.19rem;
          font-weight: 800;
          letter-spacing: .7px;
        }
        .add-btn-ferremas {
          border-radius: 1.4rem;
          font-size: 1.02rem;
          font-weight: 600;
          background: linear-gradient(90deg,#2563eb 0,#38b6ff 100%);
          box-shadow: 0 3px 11px #38b6ff26;
          padding: 9px 17px;
          border: none;
        }
        .add-btn-ferremas:hover, .add-btn-ferremas:focus {
          background: linear-gradient(90deg,#12a4fd 0,#38b6ff 100%) !important;
          box-shadow: 0 8px 18px #38b6ff37;
        }
        @media (max-width: 640px) {
          .nuevo-card-ferremas { width: 98vw; min-width: 0; }
          .ferremas-grid { grid-template-columns: 1fr; gap: 16px 0; }
        }
      `}</style>
    </div>
  );
}

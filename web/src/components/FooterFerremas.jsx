import React from 'react';

export default function FooterFerremas() {
  return (
    <footer
      className="text-white text-center pt-3 pb-2"
      style={{
        background: "linear-gradient(180deg, #38b6ff 0 8%, #222 45%)",
        letterSpacing: "1px",
        fontWeight: 400,
        fontSize: "1rem"
      }}
    >
      <div>© 2025 <span style={{ color: "#FFD600" }}>FERREMAS</span>. Todos los derechos reservados.</div>
      <div style={{ fontSize: "0.92rem", opacity: 0.75 }}>
        Proyecto académico - Integración de Plataformas
      </div>
    </footer>
  );
}

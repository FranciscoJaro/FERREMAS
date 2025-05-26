import React, { useEffect, useState } from "react";
import { Container, Card, Button } from "react-bootstrap";

export default function AdminPage() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem("usuario");
    if (data) setUsuario(JSON.parse(data));
  }, []);

  if (!usuario) return <div className="text-center mt-5">Cargando...</div>;

  return (
    <Container className="mt-5">
      <Card className="shadow-sm">
        <Card.Body>
          <h2 className="text-primary mb-3">Panel de Administración</h2>
          <p>Bienvenido, <b>{usuario.nombre}</b> (Administrador)</p>
          <hr />
          <Button variant="outline-primary" className="me-2" href="/admin/usuarios">
            Gestionar Usuarios
          </Button>
          <Button variant="outline-primary" className="me-2" href="/admin/productos">
            Gestionar Productos
          </Button>
          <Button variant="outline-primary" className="me-2" href="/admin/reportes">
            Ver Reportes
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
}

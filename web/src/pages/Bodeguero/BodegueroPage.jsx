import React, { useEffect, useState } from "react";
import { Container, Card, Button } from "react-bootstrap";

export default function BodegueroPage() {
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
          <h2 className="text-primary mb-3">Panel de Bodeguero</h2>
          <p>Bienvenido, <b>{usuario.nombre}</b> (Bodeguero)</p>
          <hr />
          <Button variant="outline-primary" className="me-2" href="/bodeguero/inventario">
            Gestionar Inventario
          </Button>
          <Button variant="outline-primary" className="me-2" href="/bodeguero/entregas">
            Ver Entregas Pendientes
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
}

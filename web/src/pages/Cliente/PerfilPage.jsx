import React, { useEffect, useState } from "react";
import { Container, Card } from "react-bootstrap";

export default function PerfilPage() {
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
          <h2 className="text-info mb-3">Mi Perfil</h2>
          <p>Bienvenido, <b>{usuario.nombre}</b> (Cliente)</p>
          <hr />
          <p>Aquí podrás ver tu perfil, historial de compras y gestionar tu carrito. (Próximamente)</p>
        </Card.Body>
      </Card>
    </Container>
  );
}

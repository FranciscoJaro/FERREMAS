import React, { useEffect, useState } from "react";
import { Container, Table, Spinner } from "react-bootstrap";

export default function ReportesFinancierosPage() {
  const [reportes, setReportes] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch("http://localhost:4000/reportes-financieros")
      .then(res => res.json())
      .then(data => {
        setReportes(data);
        setCargando(false);
      });
  }, []);

  return (
    <Container className="my-5">
      <h2 className="fw-bold mb-4 text-primary">Reportes Financieros</h2>
      {cargando ? (
        <Spinner animation="border" />
      ) : (
        <Table bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Fecha</th>
              <th>Detalle</th>
              <th>Contador</th>
            </tr>
          </thead>
          <tbody>
            {reportes.map((rep, idx) => (
              <tr key={rep.id_reporte}>
                <td>{idx + 1}</td>
                <td>{new Date(rep.fecha).toLocaleDateString("es-CL", { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                <td>{rep.detalle}</td>
                <td>{rep.nombre_contador}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}

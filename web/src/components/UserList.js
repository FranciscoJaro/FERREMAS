import { useEffect, useState } from "react";

function UserList() {
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/usuarios/") 
      .then(res => {
        if (!res.ok) throw new Error("No se pudo obtener la lista de usuarios");
        return res.json();
      })
      .then(data => setUsuarios(data))
      .catch(err => setError(err.message));
  }, []);

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div>
      <h2>Lista de Usuarios</h2>
      <ul>
        {usuarios.map((usuario) => (
          <li key={usuario.rut}>
            <b>{usuario.primer_nombre} {usuario.apellido_paterno}</b> — {usuario.correo}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;

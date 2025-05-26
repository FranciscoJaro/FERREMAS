import React from "react";
import { Navigate } from "react-router-dom";

// rolesPermitidos:
export default function PrivateRoute({ children, rolesPermitidos }) {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (!usuario) {
    // Si no está logeado, redirige al login
    return <Navigate to="/login" />;
  }
  if (rolesPermitidos && !rolesPermitidos.includes(usuario.tipo_usuario)) {
    // Si está logeado pero no tiene permiso
    return <Navigate to="/" />;
  }
  return children;
}

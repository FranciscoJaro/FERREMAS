import { useEffect, useState } from "react";

function ProductList() {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/productos")
      .then(res => res.json())
      .then(data => setProductos(data))
      .catch(err => console.error("Error:", err));
  }, []);

  return (
    <div>
      <h2>Productos</h2>
      <ul>
        {productos.map((prod, idx) => (
          <li key={idx}>
            <b>{prod.nombre}</b> - {prod.descripcion} (${prod.precio})
            <br />
            {prod.imagen && (
              <img src={prod.imagen} alt={prod.nombre} style={{ maxWidth: 120, margin: "10px 0" }} />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProductList;

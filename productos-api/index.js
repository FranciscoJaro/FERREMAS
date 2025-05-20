// productos-api/index.js
const express = require('express');
const oracledb = require('oracledb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de Oracle DB (ajusta si tu clave es otra)
const dbConfig = {
  user: 'ferremas',
  password: 'ferremas123',
  connectString: 'localhost:1521/xe'
};

// Endpoint: Obtener todos los productos
app.get('/productos', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `SELECT id_producto, nombre, descripcion, precio, stock, imagen FROM PRODUCTO`
    );
    // Mapea los productos para enviarlos como JSON amigable
    const productos = result.rows.map(row => ({
      id_producto: row[0],
      nombre: row[1],
      descripcion: row[2],
      precio: row[3],
      stock: row[4],
      imagen: row[5] // Aquí va la url de la imagen
    }));
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});

// Puerto
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`API de productos corriendo en http://localhost:${PORT}`);
});

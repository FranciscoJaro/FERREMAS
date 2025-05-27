const express = require('express');
const oracledb = require('oracledb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
  user: 'ferremas',
  password: 'ferremas123',
  connectString: 'localhost:1521/xe'
};
// Puerto
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`API de productos corriendo en http://localhost:${PORT}`);
});

// Listar sucursales 
app.get('/sucursales', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    // <-- OJO el cambio aquí -->
    const result = await connection.execute("SELECT id_sucursal, descripcion FROM sucursal");
    const sucursales = Array.isArray(result.rows)
      ? result.rows.map(row => ({
          id_sucursal: row[0],
          nombre: row[1] // Se llama "nombre" en el frontend pero es "descripcion" en la tabla
        }))
      : [];
    res.json(sucursales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Listar modelos
app.get('/modelos', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute("SELECT id_modelo, nombre FROM modelo");
    const modelos = Array.isArray(result.rows)
      ? result.rows.map(row => ({
          id_modelo: row[0],
          nombre: row[1]
        }))
      : [];
    res.json(modelos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Obtener todos los productos
app.get('/productos', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `SELECT id_producto, nombre, descripcion, precio, stock, id_sucursal, id_modelo, imagen FROM PRODUCTO`
    );
    const productos = Array.isArray(result.rows)
      ? result.rows.map(row => ({
          id_producto: row[0],
          nombre: row[1],
          descripcion: row[2],
          precio: row[3],
          stock: row[4],
          id_sucursal: row[5],
          id_modelo: row[6],
          imagen: row[7]
        }))
      : [];
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Agregar producto
app.post('/productos', async (req, res) => {
  const { nombre, descripcion, precio, stock, id_sucursal, id_modelo, imagen } = req.body;
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const resultId = await connection.execute(
      "SELECT NVL(MAX(id_producto),0)+1 FROM producto"
    );
    const nextId = resultId.rows[0][0];
    await connection.execute(
      `INSERT INTO producto 
       (id_producto, nombre, descripcion, precio, stock, id_sucursal, id_modelo, imagen) 
       VALUES (:id, :nombre, :descripcion, :precio, :stock, :id_sucursal, :id_modelo, :imagen)`,
      {
        id: nextId,
        nombre,
        descripcion,
        precio,
        stock,
        id_sucursal,
        id_modelo,
        imagen: imagen || null
      },
      { autoCommit: true }
    );
    res.status(201).json({ mensaje: "Producto agregado", id_producto: nextId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Editar producto
app.put('/productos/:id_producto', async (req, res) => {
  const { id_producto } = req.params;
  const { nombre, descripcion, precio, stock, id_sucursal, id_modelo, imagen } = req.body;
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `UPDATE producto 
       SET nombre=:nombre, descripcion=:descripcion, precio=:precio, stock=:stock, 
           id_sucursal=:id_sucursal, id_modelo=:id_modelo, imagen=:imagen
       WHERE id_producto=:id_producto`,
      {
        nombre,
        descripcion,
        precio,
        stock,
        id_sucursal,
        id_modelo,
        imagen: imagen || null,
        id_producto
      },
      { autoCommit: true }
    );
    if (result.rowsAffected === 0) {
      res.status(404).json({ error: "Producto no encontrado" });
    } else {
      res.json({ mensaje: "Producto actualizado" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Eliminar producto
app.delete('/productos/:id_producto', async (req, res) => {
  const { id_producto } = req.params;
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      "DELETE FROM producto WHERE id_producto=:id_producto",
      { id_producto },
      { autoCommit: true }
    );
    if (result.rowsAffected === 0) {
      res.status(404).json({ error: "Producto no encontrado" });
    } else {
      res.json({ mensaje: "Producto eliminado" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});
/////////////////////////////////////////////////////////////

// Obtener reportes financieros
app.get('/reportes-financieros', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(`
      SELECT 
        r.ID_REPORTE,
        r.FECHA,
        r.DETALLE,
        u.PRIMER_NOMBRE || ' ' || u.APELLIDO_PATERNO AS nombre_contador
      FROM REPORTE_FINANCIERO r
      JOIN USUARIO u ON r.CONTADOR_ID_USUARIO = u.ID_USUARIO
      ORDER BY r.FECHA DESC
    `);
    const reportes = result.rows.map(row => ({
      id_reporte: row[0],
      fecha: row[1],
      detalle: row[2],
      nombre_contador: row[3]
    }));
    res.json(reportes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});
//////////////////////////////////////////////////////////////

// OBTENER PEDIDOS DE UN VENDEDOR (incluye detalle)
app.get('/pedidos', async (req, res) => {
  const vendedor_id = req.query.vendedor_id;
  if (!vendedor_id) return res.status(400).json({ error: "Falta vendedor_id" });

  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);

    // Usa los nombres de columna REALES
    const pedidosRes = await connection.execute(
      `SELECT 
         p.id_pedido, p.fecha, p.estado_entrega,
         c.nombre AS cliente_nombre
       FROM pedido p
       JOIN cliente c ON p.cliente_id_usuario = c.id_usuario
       WHERE p.vendedor_id_usuario = :vendedor_id
       ORDER BY p.fecha DESC`,
      { vendedor_id }
    );

    const pedidos = [];
    for (const row of pedidosRes.rows) {
      // Trae los productos del pedido
      const productosRes = await connection.execute(
        `SELECT pr.nombre, dp.cantidad 
         FROM detalle_pedido dp
         JOIN producto pr ON dp.producto_id_producto = pr.id_producto
         WHERE dp.pedido_id_pedido = :id_pedido`,
        { id_pedido: row[0] }
      );
      pedidos.push({
        id_pedido: row[0],
        fecha: row[1],
        estado: row[2], // <--- OJO: Este campo viene de estado_entrega
        cliente_nombre: row[3],
        productos: productosRes.rows.map(rp => ({
          nombre: rp[0],
          cantidad: rp[1]
        }))
      });
    }
    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});



// CAMBIAR ESTADO DEL PEDIDO
app.put('/pedidos/:id_pedido/estado', async (req, res) => {
  const { id_pedido } = req.params;
  const { estado } = req.body;
  if (!estado) return res.status(400).json({ error: "Falta estado" });

  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `UPDATE pedido SET estado_entrega=:estado WHERE id_pedido=:id_pedido`,
      { estado, id_pedido },
      { autoCommit: true }
    );
    if (result.rowsAffected === 0) {
      res.status(404).json({ error: "Pedido no encontrado" });
    } else {
      res.json({ mensaje: "Estado actualizado" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

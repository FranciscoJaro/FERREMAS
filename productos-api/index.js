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

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`API de productos corriendo en http://localhost:${PORT}`);
});

// ========== SUCURSALES ==========
app.get('/sucursales', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute("SELECT id_sucursal, descripcion FROM sucursal");
    const sucursales = Array.isArray(result.rows)
      ? result.rows.map(row => ({
          id_sucursal: row[0],
          nombre: row[1]
        }))
      : [];
    res.json(sucursales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// ========== MODELOS ==========
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

// ========== PRODUCTOS ==========
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

app.post('/productos', async (req, res) => {
  const { nombre, descripcion, precio, stock, id_sucursal, id_modelo, imagen } = req.body;
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const resultId = await connection.execute("SELECT NVL(MAX(id_producto),0)+1 FROM producto");
    const nextId = resultId.rows[0][0];
    await connection.execute(
      `INSERT INTO producto (id_producto, nombre, descripcion, precio, stock, id_sucursal, id_modelo, imagen)
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

// ========== REPORTES FINANCIEROS ==========
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

// ========== PEDIDOS ==========
app.get('/pedidos', async (req, res) => {
  const vendedor_id = req.query.vendedor_id;
  if (!vendedor_id) return res.status(400).json({ error: "Falta vendedor_id" });

  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);

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
        estado: row[2],
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

//////////////////////////////////

// Obtener pedidos de un cliente por id_usuario
app.get('/pedidos-cliente/:id_usuario', async (req, res) => {
  const { id_usuario } = req.params;
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);

    // Busca pedidos del cliente, con suma total y productos
    const pedidosRes = await connection.execute(
      `SELECT p.id_pedido, p.fecha, p.estado_entrega, p.tipo_entrega
        FROM pedido p
        WHERE p.cliente_id_usuario = :id_usuario
        ORDER BY p.fecha DESC`,
      { id_usuario }
    );
    const pedidos = [];
    for (const row of pedidosRes.rows) {
      // Productos y total de cada pedido
      const productosRes = await connection.execute(
        `SELECT pr.nombre, dp.cantidad, dp.precio_unitario
         FROM detalle_pedido dp
         JOIN producto pr ON dp.producto_id_producto = pr.id_producto
         WHERE dp.pedido_id_pedido = :id_pedido`,
        { id_pedido: row[0] }
      );
      const productos = productosRes.rows.map(r => ({
        nombre: r[0],
        cantidad: r[1],
        precio_unitario: r[2]
      }));
      // Calcular total
      const total = productos.reduce((sum, p) => sum + (p.cantidad * p.precio_unitario), 0);
      pedidos.push({
        id_pedido: row[0],
        fecha: row[1],
        estado: row[2],
        tipo_entrega: row[3],
        total,
        productos
      });
    }
    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});





// ========== CARRITO ==========
app.get('/carrito/:id_usuario', async (req, res) => {
  const { id_usuario } = req.params;
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);

    const carritoRes = await connection.execute(
      `SELECT id_carrito, fecha_creacion, estado FROM carrito 
        WHERE cliente_id_usuario = :id_usuario AND estado = 'CREADO'
        ORDER BY fecha_creacion DESC`,
      { id_usuario }
    );
    if (carritoRes.rows.length === 0) {
      return res.json({ carrito: null, productos: [] });
    }
    const carrito = {
      id_carrito: carritoRes.rows[0][0],
      fecha_creacion: carritoRes.rows[0][1],
      estado: carritoRes.rows[0][2]
    };

    const productosRes = await connection.execute(
      `SELECT dc.id_detalle_carrito, p.nombre, p.descripcion, dc.cantidad, dc.precio_unitario, p.imagen, p.stock
        FROM detalle_carrito dc
        JOIN producto p ON dc.producto_id = p.id_producto
        WHERE dc.carrito_id = :carrito_id`,
      { carrito_id: carrito.id_carrito }
    );
    const productos = productosRes.rows.map(row => ({
      id_detalle_carrito: row[0],
      nombre: row[1],
      descripcion: row[2],
      cantidad: row[3],
      precio_unitario: row[4],
      imagen: row[5],
      stock: row[6]      // <<--- STOCK ACTUAL DE PRODUCTO
    }));

    res.json({ carrito, productos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

app.post('/carrito/agregar', async (req, res) => {
  const { id_usuario, id_producto, cantidad } = req.body;
  if (!id_usuario || !id_producto || !cantidad) {
    return res.status(400).json({ error: "Faltan datos para agregar al carrito" });
  }

  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);

    let result = await connection.execute(
      "SELECT id_carrito FROM carrito WHERE cliente_id_usuario=:id_usuario AND estado='CREADO'",
      { id_usuario }
    );
    let id_carrito;
    if (result.rows.length === 0) {
      const resMax = await connection.execute("SELECT NVL(MAX(id_carrito),0)+1 FROM carrito");
      id_carrito = resMax.rows[0][0];
      await connection.execute(
        "INSERT INTO carrito (id_carrito, fecha_creacion, estado, cliente_id_usuario) VALUES (:id_carrito, SYSDATE, 'CREADO', :id_usuario)",
        { id_carrito, id_usuario },
        { autoCommit: false }
      );
    } else {
      id_carrito = result.rows[0][0];
    }

    result = await connection.execute(
      "SELECT id_detalle_carrito, cantidad FROM detalle_carrito WHERE carrito_id=:id_carrito AND producto_id=:id_producto",
      { id_carrito, id_producto }
    );
    if (result.rows.length === 0) {
      const resMaxDet = await connection.execute("SELECT NVL(MAX(id_detalle_carrito),0)+1 FROM detalle_carrito");
      const id_detalle_carrito = resMaxDet.rows[0][0];

      const precioRes = await connection.execute(
        "SELECT precio FROM producto WHERE id_producto=:id_producto",
        { id_producto }
      );
      const precio_unitario = precioRes.rows[0][0];

      await connection.execute(
        `INSERT INTO detalle_carrito (id_detalle_carrito, carrito_id, producto_id, cantidad, precio_unitario)
         VALUES (:id_detalle_carrito, :id_carrito, :id_producto, :cantidad, :precio_unitario)`,
        { id_detalle_carrito, id_carrito, id_producto, cantidad, precio_unitario },
        { autoCommit: true }
      );
    } else {
      const nuevaCantidad = result.rows[0][1] + cantidad;
      await connection.execute(
        "UPDATE detalle_carrito SET cantidad=:nuevaCantidad WHERE id_detalle_carrito=:id_detalle_carrito",
        { nuevaCantidad, id_detalle_carrito: result.rows[0][0] },
        { autoCommit: true }
      );
    }

    res.json({ mensaje: "Producto agregado al carrito", id_carrito });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

app.delete('/carrito/eliminar/:id_detalle_carrito', async (req, res) => {
  const { id_detalle_carrito } = req.params;
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `DELETE FROM detalle_carrito WHERE id_detalle_carrito = :id_detalle_carrito`,
      { id_detalle_carrito },
      { autoCommit: true }
    );
    if (result.rowsAffected === 0) {
      res.status(404).json({ error: "Producto no encontrado en el carrito" });
    } else {
      res.json({ mensaje: "Producto eliminado del carrito" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

app.delete('/carrito/vaciar/:id_usuario', async (req, res) => {
  const { id_usuario } = req.params;
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);

    const carritoRes = await connection.execute(
      `SELECT id_carrito FROM carrito WHERE cliente_id_usuario = :id_usuario AND estado = 'CREADO'`,
      { id_usuario }
    );
    if (carritoRes.rows.length === 0) {
      return res.status(404).json({ error: "No se encontró un carrito activo" });
    }
    const id_carrito = carritoRes.rows[0][0];

    await connection.execute(
      `DELETE FROM detalle_carrito WHERE carrito_id = :id_carrito`,
      { id_carrito },
      { autoCommit: true }
    );
    res.json({ mensaje: "Carrito vaciado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

app.put('/carrito/actualizar-cantidad/:id_detalle_carrito', async (req, res) => {
  const { id_detalle_carrito } = req.params;
  const { cantidad } = req.body;
  if (!cantidad || cantidad < 1) {
    return res.status(400).json({ error: "Cantidad inválida" });
  }
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `UPDATE detalle_carrito SET cantidad = :cantidad WHERE id_detalle_carrito = :id_detalle_carrito`,
      { cantidad, id_detalle_carrito },
      { autoCommit: true }
    );
    if (result.rowsAffected === 0) {
      res.status(404).json({ error: "Detalle no encontrado" });
    } else {
      res.json({ mensaje: "Cantidad actualizada" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// ========== PEDIDOS BODEGUERO ==========
app.get('/pedidos-bodega', async (req, res) => {
  const bodeguero_id = req.query.bodeguero_id;
  if (!bodeguero_id) return res.status(400).json({ error: "Falta bodeguero_id" });

  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const pedidosRes = await connection.execute(
      `SELECT 
         p.id_pedido, p.fecha, p.estado_entrega, 
         c.nombre AS cliente_nombre
       FROM pedido p
       JOIN cliente c ON p.cliente_id_usuario = c.id_usuario
       WHERE (p.estado_entrega = 'APROBADO' OR p.estado_entrega = 'EN PREPARACIÓN')
       ORDER BY p.fecha DESC`
    );
    const pedidos = [];
    for (const row of pedidosRes.rows) {
      const productosRes = await connection.execute(
        `SELECT pr.nombre, dp.cantidad 
         FROM detalle_pedido dp
         JOIN producto pr ON dp.producto_id_producto = pr.id_producto
         WHERE dp.pedido_id_pedido = :id_pedido`,
        { id_pedido: row[0] }
      );
      pedidos.push({
        id_pedido: row[0],
        fecha: row[1] ? new Date(row[1]).toLocaleDateString() : "",
        estado: row[2],
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

// ========== CREAR PEDIDO DESDE CARRITO ==========
app.post('/pedido/crear-desde-carrito', async (req, res) => {
  const { id_usuario, tipo_entrega } = req.body;
  if (!id_usuario) return res.status(400).json({ error: "Falta id_usuario" });

  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);

    // 1. Buscar carrito ACTIVO
    const carritoRes = await connection.execute(
      "SELECT id_carrito FROM carrito WHERE cliente_id_usuario=:id_usuario AND estado='CREADO'",
      { id_usuario }
    );
    if (carritoRes.rows.length === 0) {
      return res.status(400).json({ error: "No hay carrito activo para este usuario" });
    }
    const id_carrito = carritoRes.rows[0][0];

    // 2. Traer productos del carrito
    const detallesRes = await connection.execute(
      `SELECT producto_id, cantidad, precio_unitario FROM detalle_carrito WHERE carrito_id = :id_carrito`,
      { id_carrito }
    );
    const productos = detallesRes.rows;

    if (!productos.length) {
      return res.status(400).json({ error: "El carrito está vacío" });
    }

    // 3. Generar ID de pedido
    const pedidoRes = await connection.execute("SELECT NVL(MAX(id_pedido),0)+1 FROM pedido");
    const id_pedido = pedidoRes.rows[0][0];

    // 4. Traer datos de roles asignados automáticamente
    const id_vendedor = 5;    // ejemplo
    const id_bodeguero = 4;   // ejemplo
    const id_contador = 3;    // ejemplo
    const id_sucursal = 1;    // ejemplo

    // 5. Elegir tipo de entrega
    const tipo = (tipo_entrega && (tipo_entrega === "DOMICILIO" || tipo_entrega === "RETIRO")) ? tipo_entrega : "DOMICILIO";

    // 6. Crear el pedido
    await connection.execute(
      `INSERT INTO pedido (id_pedido, fecha, estado_entrega, tipo_entrega,
        cliente_id_usuario, bodeguero_id_usuario, contador_id_usuario,
        carrito_id_carrito, vendedor_id_usuario, sucursal_id_sucursal)
      VALUES (:id_pedido, SYSDATE, 'PENDIENTE', :tipo_entrega,
        :cliente, :bodeguero, :contador, :carrito, :vendedor, :sucursal)`,
      {
        id_pedido,
        tipo_entrega: tipo,
        cliente: id_usuario,
        bodeguero: id_bodeguero,
        contador: id_contador,
        carrito: id_carrito,
        vendedor: id_vendedor,
        sucursal: id_sucursal,
      }
    );

    // 7. Crear los detalles y restar stock
    for (const [producto_id, cantidad, precio_unitario] of productos) {
      const id_detalleRes = await connection.execute("SELECT NVL(MAX(id_detalle_pedido),0)+1 FROM detalle_pedido");
      const id_detalle_pedido = id_detalleRes.rows[0][0];
      await connection.execute(
        `INSERT INTO detalle_pedido (id_detalle_pedido, pedido_id_pedido, producto_id_producto, cantidad, precio_unitario)
         VALUES (:id_detalle_pedido, :id_pedido, :producto_id, :cantidad, :precio_unitario)`,
        { id_detalle_pedido, id_pedido, producto_id, cantidad, precio_unitario }
      );
      await connection.execute(
        `UPDATE producto SET stock = stock - :cantidad WHERE id_producto = :producto_id`,
        { cantidad, producto_id }
      );
    }

    // ========== AGREGADO: INSERTAR EL PAGO ==========
    const pagoRes = await connection.execute("SELECT NVL(MAX(id_pago),0)+1 FROM pago");
    const id_pago = pagoRes.rows[0][0];
    await connection.execute(
      `INSERT INTO pago (
        id_pago, metodo_pago, estado_pago, fecha_pago,
        confirmar_por, pedido_id_pedido, usuario_id_usuario, cliente_id_usuario
      ) VALUES (
        :id_pago, :metodo_pago, :estado_pago, SYSDATE,
        :confirmar_por, :pedido_id_pedido, :usuario_id_usuario, :cliente_id_usuario
      )`,
      {
        id_pago,
        metodo_pago: 'PAYPAL',
        estado_pago: 'CONFIRMADO',
        confirmar_por: id_contador,
        pedido_id_pedido: id_pedido,
        usuario_id_usuario: id_usuario,
        cliente_id_usuario: id_usuario
      }
    );
    // ========== FIN INSERTAR EL PAGO ==========

    // 8. Cambia estado del carrito a USADO
    await connection.execute(
      `UPDATE carrito SET estado='USADO' WHERE id_carrito=:id_carrito`,
      { id_carrito }
    );

    // 9. Borra detalles del carrito para limpiar (opcional)
    await connection.execute(
      `DELETE FROM detalle_carrito WHERE carrito_id = :id_carrito`,
      { id_carrito }
    );

    await connection.commit();
    res.json({ mensaje: "Pedido creado correctamente", id_pedido });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

////////////////////////////////


// Crear nuevo reporte financiero (guarda ventas_mes y concatena en el detalle)
app.post('/reportes-financieros', async (req, res) => {
  const { detalle, contador_id_usuario } = req.body;
  if (!detalle || !contador_id_usuario) return res.status(400).json({ error: "Faltan datos" });
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);

    // 1. Calcula ventas totales del mes actual
    const ventasMesRes = await connection.execute(`
      SELECT NVL(SUM(dp.cantidad * dp.precio_unitario), 0)
      FROM pedido p
      JOIN detalle_pedido dp ON p.id_pedido = dp.pedido_id_pedido
      WHERE TO_CHAR(p.fecha, 'MM-YYYY') = TO_CHAR(SYSDATE, 'MM-YYYY')
    `);
    const total_ventas_mes = ventasMesRes.rows[0][0];

    // 2. Genera nuevo id_reporte
    const idRes = await connection.execute("SELECT NVL(MAX(id_reporte),0)+1 FROM REPORTE_FINANCIERO");
    const id_reporte = idRes.rows[0][0];

    // 3. Prepara detalle (opcional: muestra ventas también en detalle)
    const detalleConVentas = `${detalle} | Ventas totales del mes: $${Number(total_ventas_mes).toLocaleString("es-CL")}`;

    // 4. Inserta reporte con ventas_mes
    await connection.execute(
      `INSERT INTO REPORTE_FINANCIERO (id_reporte, fecha, detalle, ventas_mes, contador_id_usuario)
       VALUES (:id_reporte, SYSDATE, :detalle, :ventas_mes, :contador_id_usuario)`,
      { id_reporte, detalle: detalleConVentas, ventas_mes: total_ventas_mes, contador_id_usuario },
      { autoCommit: true }
    );
    res.json({ mensaje: "Reporte creado correctamente", id_reporte });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});


// Endpoint para total de ventas del mes actual
app.get('/reportes-financieros/ventas-mes', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);

    // Ventas de pedidos CONFIRMADOS del mes actual (puedes ajustar el filtro si quieres)
    const result = await connection.execute(`
      SELECT NVL(SUM(dp.cantidad * dp.precio_unitario), 0) AS total_ventas
      FROM pedido p
      JOIN detalle_pedido dp ON p.id_pedido = dp.pedido_id_pedido
      WHERE 
        EXTRACT(MONTH FROM p.fecha) = EXTRACT(MONTH FROM SYSDATE)
        AND EXTRACT(YEAR FROM p.fecha) = EXTRACT(YEAR FROM SYSDATE)
        AND p.estado_entrega != 'ANULADO'
    `);

    const total = result.rows[0][0];
    res.json({ total_ventas_mes: total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});




// ========== FIN ==========

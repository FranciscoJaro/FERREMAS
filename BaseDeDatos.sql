SET DEFINE OFF;
-- DETALLE_PEDIDO
BEGIN
  EXECUTE IMMEDIATE 'DROP TABLE DETALLE_PEDIDO CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN
  IF SQLCODE != -942 THEN RAISE; END IF;
END;
/
-- DETALLE_CARRITO
BEGIN
  EXECUTE IMMEDIATE 'DROP TABLE DETALLE_CARRITO CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN
  IF SQLCODE != -942 THEN RAISE; END IF;
END;
/
-- PAGO
BEGIN
  EXECUTE IMMEDIATE 'DROP TABLE PAGO CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN
  IF SQLCODE != -942 THEN RAISE; END IF;
END;
/
-- INFORME_VENTA
BEGIN
  EXECUTE IMMEDIATE 'DROP TABLE INFORME_VENTA CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN
  IF SQLCODE != -942 THEN RAISE; END IF;
END;
/
-- REPORTE_FINANCIERO
BEGIN
  EXECUTE IMMEDIATE 'DROP TABLE REPORTE_FINANCIERO CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN
  IF SQLCODE != -942 THEN RAISE; END IF;
END;
/
-- PEDIDO
BEGIN
  EXECUTE IMMEDIATE 'DROP TABLE PEDIDO CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN
  IF SQLCODE != -942 THEN RAISE; END IF;
END;
/
-- CARRITO
BEGIN
  EXECUTE IMMEDIATE 'DROP TABLE CARRITO CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN
  IF SQLCODE != -942 THEN RAISE; END IF;
END;
/
-- PRODUCTO
BEGIN
  EXECUTE IMMEDIATE 'DROP TABLE PRODUCTO CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN
  IF SQLCODE != -942 THEN RAISE; END IF;
END;
/
-- MODELO
BEGIN
  EXECUTE IMMEDIATE 'DROP TABLE MODELO CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN
  IF SQLCODE != -942 THEN RAISE; END IF;
END;
/
-- MARCA
BEGIN
  EXECUTE IMMEDIATE 'DROP TABLE MARCA CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN
  IF SQLCODE != -942 THEN RAISE; END IF;
END;
/
-- SUCURSAL
BEGIN
  EXECUTE IMMEDIATE 'DROP TABLE SUCURSAL CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN
  IF SQLCODE != -942 THEN RAISE; END IF;
END;
/
-- COMUNA
BEGIN
  EXECUTE IMMEDIATE 'DROP TABLE COMUNA CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN
  IF SQLCODE != -942 THEN RAISE; END IF;
END;
/
-- REGION
BEGIN
  EXECUTE IMMEDIATE 'DROP TABLE REGION CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN
  IF SQLCODE != -942 THEN RAISE; END IF;
END;
/
-- VENDEDOR
BEGIN
  EXECUTE IMMEDIATE 'DROP TABLE VENDEDOR CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN
  IF SQLCODE != -942 THEN RAISE; END IF;
END;
/
-- BODEGUERO
BEGIN
  EXECUTE IMMEDIATE 'DROP TABLE BODEGUERO CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN
  IF SQLCODE != -942 THEN RAISE; END IF;
END;
/
-- CONTADOR
BEGIN
  EXECUTE IMMEDIATE 'DROP TABLE CONTADOR CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN
  IF SQLCODE != -942 THEN RAISE; END IF;
END;
/
-- CLIENTE
BEGIN
  EXECUTE IMMEDIATE 'DROP TABLE CLIENTE CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN
  IF SQLCODE != -942 THEN RAISE; END IF;
END;
/
-- ADMINISTRADOR
BEGIN
  EXECUTE IMMEDIATE 'DROP TABLE ADMINISTRADOR CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN
  IF SQLCODE != -942 THEN RAISE; END IF;
END;
/
-- USUARIO
BEGIN
  EXECUTE IMMEDIATE 'DROP TABLE USUARIO CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN
  IF SQLCODE != -942 THEN RAISE; END IF;
END;
/
  
-- =========================================
-- 2) CREATE de las 19 tablas en orden
-- =========================================

CREATE TABLE REGION (
  id_region NUMBER PRIMARY KEY,
  nombre    VARCHAR2(100) NOT NULL
);

CREATE TABLE COMUNA (
  id_comuna NUMBER PRIMARY KEY,
  nombre    VARCHAR2(100) NOT NULL,
  id_region NUMBER       NOT NULL,
  CONSTRAINT fk_comuna_region FOREIGN KEY(id_region)
    REFERENCES REGION(id_region)
);

CREATE TABLE SUCURSAL (
  id_sucursal NUMBER PRIMARY KEY,
  descripcion VARCHAR2(100) NOT NULL,
  id_comuna   NUMBER       NOT NULL,
  CONSTRAINT fk_sucursal_comuna FOREIGN KEY(id_comuna)
    REFERENCES COMUNA(id_comuna)
);

CREATE TABLE MARCA (
  id_marca NUMBER PRIMARY KEY,
  nombre   VARCHAR2(100) NOT NULL
);

CREATE TABLE MODELO (
  id_modelo NUMBER PRIMARY KEY,
  nombre    VARCHAR2(100) NOT NULL,
  id_marca  NUMBER       NOT NULL,
  CONSTRAINT fk_modelo_marca FOREIGN KEY(id_marca)
    REFERENCES MARCA(id_marca)
);

CREATE TABLE USUARIO (
  id_usuario       NUMBER PRIMARY KEY,
  correo           VARCHAR2(100) NOT NULL UNIQUE,
  contrasena       VARCHAR2(100) NOT NULL,
  tipo_usuario     VARCHAR2(50)  NOT NULL,
  rut              VARCHAR2(20)  NOT NULL UNIQUE,
  primer_nombre    VARCHAR2(50)  NOT NULL,
  segundo_nombre   VARCHAR2(50),
  apellido_paterno VARCHAR2(50)  NOT NULL,
  apellido_materno VARCHAR2(50)  NOT NULL,
  cambiar_contrasena NUMBER(1) DEFAULT 1
);

CREATE TABLE ADMINISTRADOR (
  id_usuario NUMBER PRIMARY KEY,
  CONSTRAINT fk_admin_usuario FOREIGN KEY(id_usuario)
    REFERENCES USUARIO(id_usuario)
);

CREATE TABLE CLIENTE (
  id_usuario INTEGER PRIMARY KEY,
  nombre     VARCHAR2(100) NOT NULL,
  direccion  VARCHAR2(250) NOT NULL,
  telefono   VARCHAR2(100) NOT NULL,
  CONSTRAINT fk_cliente_usuario FOREIGN KEY(id_usuario)
    REFERENCES USUARIO(id_usuario)
);

CREATE TABLE CONTADOR (
  id_usuario INTEGER PRIMARY KEY,
  CONSTRAINT fk_contador_usuario FOREIGN KEY(id_usuario)
    REFERENCES USUARIO(id_usuario)
);

CREATE TABLE BODEGUERO (
  id_usuario  INTEGER PRIMARY KEY,
  id_sucursal INTEGER NOT NULL,
  CONSTRAINT fk_bodeguero_usuario FOREIGN KEY(id_usuario)
    REFERENCES USUARIO(id_usuario),
  CONSTRAINT fk_bodeguero_sucursal FOREIGN KEY(id_sucursal)
    REFERENCES SUCURSAL(id_sucursal)
);

CREATE TABLE VENDEDOR (
  id_usuario  INTEGER PRIMARY KEY,
  id_sucursal INTEGER NOT NULL,
  CONSTRAINT fk_vendedor_usuario FOREIGN KEY(id_usuario)
    REFERENCES USUARIO(id_usuario),
  CONSTRAINT fk_vendedor_sucursal FOREIGN KEY(id_sucursal)
    REFERENCES SUCURSAL(id_sucursal)
);

CREATE TABLE PRODUCTO (
  id_producto   NUMBER PRIMARY KEY,
  nombre        VARCHAR2(100) NOT NULL,
  descripcion   VARCHAR2(250) NOT NULL,
  precio        NUMBER(10,2)  NOT NULL,
  stock         NUMBER        NOT NULL,
  imagen        VARCHAR2(400),
  id_sucursal   NUMBER        NOT NULL,
  id_modelo     NUMBER        NOT NULL,
  CONSTRAINT fk_producto_sucursal FOREIGN KEY(id_sucursal)
    REFERENCES SUCURSAL(id_sucursal),
  CONSTRAINT fk_producto_modelo FOREIGN KEY(id_modelo)
    REFERENCES MODELO(id_modelo)
);

CREATE TABLE CARRITO (
  id_carrito         NUMBER PRIMARY KEY,
  fecha_creacion     DATE   NOT NULL,
  estado             VARCHAR2(20) NOT NULL,
  cliente_id_usuario INTEGER      NOT NULL,
  CONSTRAINT fk_carrito_cliente FOREIGN KEY(cliente_id_usuario)
    REFERENCES CLIENTE(id_usuario)
);

CREATE TABLE DETALLE_CARRITO (
  id_detalle_carrito NUMBER PRIMARY KEY,
  carrito_id         NUMBER NOT NULL,
  producto_id        NUMBER NOT NULL,
  cantidad           INTEGER NOT NULL,
  precio_unitario    NUMBER(10,2) NOT NULL,
  CONSTRAINT fk_dc_carrito FOREIGN KEY(carrito_id)
    REFERENCES CARRITO(id_carrito),
  CONSTRAINT fk_dc_producto FOREIGN KEY(producto_id)
    REFERENCES PRODUCTO(id_producto)
);

CREATE TABLE PEDIDO (
  id_pedido             NUMBER PRIMARY KEY,
  fecha                 DATE   NOT NULL,
  estado_entrega        VARCHAR2(20) NOT NULL,
  tipo_entrega          VARCHAR2(10) NOT NULL,
  cliente_id_usuario    INTEGER      NOT NULL,
  bodeguero_id_usuario  INTEGER      NOT NULL,
  contador_id_usuario   INTEGER      NOT NULL,
  carrito_id_carrito    INTEGER      NOT NULL,
  vendedor_id_usuario   INTEGER      NOT NULL,
  sucursal_id_sucursal  INTEGER      NOT NULL,
  CONSTRAINT fk_pedido_cliente FOREIGN KEY(cliente_id_usuario)
    REFERENCES CLIENTE(id_usuario),
  CONSTRAINT fk_pedido_bodeguero FOREIGN KEY(bodeguero_id_usuario)
    REFERENCES BODEGUERO(id_usuario),
  CONSTRAINT fk_pedido_contador FOREIGN KEY(contador_id_usuario)
    REFERENCES CONTADOR(id_usuario),
  CONSTRAINT fk_pedido_carrito FOREIGN KEY(carrito_id_carrito)
    REFERENCES CARRITO(id_carrito),
  CONSTRAINT fk_pedido_vendedor FOREIGN KEY(vendedor_id_usuario)
    REFERENCES VENDEDOR(id_usuario),
  CONSTRAINT fk_pedido_sucursal FOREIGN KEY(sucursal_id_sucursal)
    REFERENCES SUCURSAL(id_sucursal)
);

CREATE TABLE DETALLE_PEDIDO (
  id_detalle_pedido    NUMBER PRIMARY KEY,
  pedido_id_pedido     NUMBER NOT NULL,
  producto_id_producto NUMBER NOT NULL,
  cantidad             INTEGER NOT NULL,
  precio_unitario      NUMBER(10,2) NOT NULL,
  CONSTRAINT fk_dp_pedido FOREIGN KEY(pedido_id_pedido)
    REFERENCES PEDIDO(id_pedido),
  CONSTRAINT fk_dp_producto FOREIGN KEY(producto_id_producto)
    REFERENCES PRODUCTO(id_producto)
);

CREATE TABLE PAGO (
  id_pago             NUMBER PRIMARY KEY,
  metodo_pago         VARCHAR2(20) NOT NULL,
  estado_pago         VARCHAR2(20) NOT NULL,
  fecha_pago          DATE         NOT NULL,
  confirmar_por       INTEGER      NOT NULL,
  pedido_id_pedido    INTEGER      NOT NULL,
  usuario_id_usuario  INTEGER      NOT NULL,
  cliente_id_usuario  INTEGER      NOT NULL,
  CONSTRAINT fk_pago_pedido FOREIGN KEY(pedido_id_pedido)
    REFERENCES PEDIDO(id_pedido),
  CONSTRAINT fk_pago_usuario FOREIGN KEY(usuario_id_usuario)
    REFERENCES USUARIO(id_usuario),
  CONSTRAINT fk_pago_cliente FOREIGN KEY(cliente_id_usuario)
    REFERENCES CLIENTE(id_usuario)
);

CREATE TABLE INFORME_VENTA (
  id_informe               NUMBER PRIMARY KEY,
  fecha                    DATE         NOT NULL,
  descripcion              VARCHAR2(250) NOT NULL,
  monto_total              NUMBER(10,2)  NOT NULL,
  administrador_id_usuario INTEGER       NOT NULL,
  CONSTRAINT fk_iv_admin FOREIGN KEY(administrador_id_usuario)
    REFERENCES ADMINISTRADOR(id_usuario)
);

CREATE TABLE REPORTE_FINANCIERO (
  id_reporte          NUMBER PRIMARY KEY,
  fecha               DATE         NOT NULL,
  detalle             VARCHAR2(250) NOT NULL,
  contador_id_usuario INTEGER      NOT NULL,
  CONSTRAINT fk_rf_contador FOREIGN KEY(contador_id_usuario)
    REFERENCES CONTADOR(id_usuario)
);

-- =========================================
-- 3) INSERT de datos de ejemplo
-- =========================================

-- 1) Regiones
INSERT INTO REGION (id_region, nombre) VALUES (1, 'Metropolitana');
INSERT INTO REGION (id_region, nombre) VALUES (2, 'Valparaíso');

-- 2) Comunas
INSERT INTO COMUNA (id_comuna, nombre, id_region) VALUES (1, 'Santiago', 1);
INSERT INTO COMUNA (id_comuna, nombre, id_region) VALUES (2, 'Viña del Mar', 2);

-- 3) Sucursales
INSERT INTO SUCURSAL (id_sucursal, descripcion, id_comuna) VALUES (1, 'Central', 1);
INSERT INTO SUCURSAL (id_sucursal, descripcion, id_comuna) VALUES (2, 'Costera', 2);

-- 4) Marcas y Modelos
INSERT INTO MARCA (id_marca, nombre) VALUES (1, 'Bosch');
INSERT INTO MARCA (id_marca, nombre) VALUES (2, 'Makita');
INSERT INTO MODELO (id_modelo, nombre, id_marca) VALUES (1, 'Taladro Percutor', 1);
INSERT INTO MODELO (id_modelo, nombre, id_marca) VALUES (2, 'Sierra Circular', 2);

-- 5) USUARIOS UNO POR UNO
INSERT INTO USUARIO (id_usuario, correo, contrasena, tipo_usuario, rut, primer_nombre, segundo_nombre, apellido_paterno, apellido_materno)
VALUES (1, 'admin@ferremas.cl', 'admin123', 'administrador', '12345678-9', 'Admin', 'Root', 'Sistema', 'Ferremas');
INSERT INTO USUARIO (id_usuario, correo, contrasena, tipo_usuario, rut, primer_nombre, segundo_nombre, apellido_paterno, apellido_materno)
VALUES (2, 'cliente@ferremas.cl', 'cliente123', 'cliente', '98765432-1','Cliente', 'Demo', 'Prueba', 'Usuario');
INSERT INTO USUARIO (id_usuario, correo, contrasena, tipo_usuario, rut, primer_nombre, segundo_nombre, apellido_paterno, apellido_materno)
VALUES (3, 'conta@ferremas.cl', 'conta123', 'contador', '11222333-4','Contador', 'Uno', 'Finanzas', 'UC');
INSERT INTO USUARIO (id_usuario, correo, contrasena, tipo_usuario, rut, primer_nombre, segundo_nombre, apellido_paterno, apellido_materno)
VALUES (4, 'bodega@ferremas.cl', 'bodega123', 'bodeguero', '22333444-5', 'Bodeguero', 'Alfa', 'Inventario', 'Store');
INSERT INTO USUARIO (id_usuario, correo, contrasena, tipo_usuario, rut, primer_nombre, segundo_nombre, apellido_paterno, apellido_materno)
VALUES (5, 'vende@ferremas.cl', 'vende123', 'vendedor', '33444555-6','Vendedor', 'Beta', 'Ventas', 'Shop');

-- 6) Roles internos
INSERT INTO ADMINISTRADOR (id_usuario) VALUES (1);
INSERT INTO CLIENTE (id_usuario, nombre, direccion, telefono)
  VALUES (2, 'Cliente Demo', 'Av. Siempre Viva', '+56912345678');
INSERT INTO CONTADOR (id_usuario) VALUES (3);
INSERT INTO BODEGUERO (id_usuario, id_sucursal) VALUES (4, 1);
INSERT INTO VENDEDOR  (id_usuario, id_sucursal) VALUES (5, 1);

-- 7) Productos
INSERT INTO PRODUCTO (
  id_producto, nombre, descripcion, precio, stock, imagen, id_sucursal, id_modelo
) VALUES (
  1, 'Taladro Bosch', 'Modelo 500W percutor', 59990, 15,'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80', 1, 1
);
INSERT INTO PRODUCTO (
  id_producto, nombre, descripcion, precio, stock, imagen, id_sucursal, id_modelo
) VALUES (
  2, 'Sierra Makita','Circular 185 mm', 74990, 10,'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80', 2, 2
);

-- 8) Carrito y su detalle
INSERT INTO CARRITO (id_carrito, fecha_creacion, estado, cliente_id_usuario)
  VALUES (1, SYSDATE, 'CREADO', 2);
INSERT INTO DETALLE_CARRITO (
  id_detalle_carrito, carrito_id, producto_id, cantidad, precio_unitario
) VALUES (
  1, 1, 1, 2, 59990
);

-- 9) Pedido y detalle
INSERT INTO PEDIDO (
  id_pedido, fecha, estado_entrega, tipo_entrega,
  cliente_id_usuario, bodeguero_id_usuario, contador_id_usuario,
  carrito_id_carrito, vendedor_id_usuario, sucursal_id_sucursal
) VALUES (
  1, SYSDATE, 'PENDIENTE', 'DOMICILIO',
  2, 4, 3, 1, 5, 1
);
INSERT INTO DETALLE_PEDIDO (
  id_detalle_pedido, pedido_id_pedido, producto_id_producto, cantidad, precio_unitario
) VALUES (
  1, 1, 1, 1, 59990
);

-- 10) Pagos e informes
INSERT INTO PAGO (
  id_pago, metodo_pago, estado_pago, fecha_pago,
  confirmar_por, pedido_id_pedido, usuario_id_usuario, cliente_id_usuario
) VALUES (
  1, 'TARJETA', 'CONFIRMADO', SYSDATE,
  3, 1, 1, 2
);

INSERT INTO INFORME_VENTA (
  id_informe, fecha, descripcion, monto_total, administrador_id_usuario
) VALUES (
  1, SYSDATE, 'Reporte mensual', 119980, 1
);

INSERT INTO REPORTE_FINANCIERO (
  id_reporte, fecha, detalle, contador_id_usuario
) VALUES (
  1, SYSDATE, 'Balance mensual', 3
);


SET DEFINE ON;
COMMIT;













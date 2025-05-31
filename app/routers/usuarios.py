from fastapi import APIRouter, HTTPException
from app.database import get_conexion
from typing import Optional
from pydantic import BaseModel

router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"]
)

# ---------- MODELOS ----------
class LoginData(BaseModel):
    correo: str
    contrasena: str

class UsuarioRegistro(BaseModel):
    rut: str
    correo: str
    contrasena: str
    primer_nombre: str
    segundo_nombre: Optional[str] = None
    apellido_paterno: str
    apellido_materno: str
    tipo_usuario: str = "cliente"  # El admin puede elegirlo

class UsuarioUpdate(BaseModel):
    correo: Optional[str] = None
    contrasena: Optional[str] = None
    primer_nombre: Optional[str] = None
    segundo_nombre: Optional[str] = None
    apellido_paterno: Optional[str] = None
    apellido_materno: Optional[str] = None
    # tipo_usuario: Optional[str] = None # NO se debe editar el tipo
    

class CambioContrasenaModel(BaseModel):
    contrasena: str
# ---------- ENDPOINTS PRINCIPALES ----------

@router.get("/")
def obtener_usuarios():
    """
    Retorna todos los usuarios (sin mostrar contraseña por seguridad).
    """
    try:
        conn = get_conexion()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT rut, correo, primer_nombre, segundo_nombre, apellido_paterno, apellido_materno, tipo_usuario
            FROM usuario
        """)
        usuarios = []
        for rut, correo, pn, sn, ap, am, tu in cursor:
            usuarios.append({
                "rut": rut,
                "correo": correo,
                "primer_nombre": pn,
                "segundo_nombre": sn,
                "apellido_paterno": ap,
                "apellido_materno": am,
                "tipo_usuario": tu
            })
        cursor.close()
        conn.close()
        return usuarios
    except Exception as ex:
        raise HTTPException(status_code=500, detail=str(ex))

@router.get("/{rut_buscar}")
def obtener_usuario(rut_buscar: str):
    """
    Retorna un usuario por su RUT.
    """
    try:
        conn = get_conexion()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT rut, correo, primer_nombre, segundo_nombre, apellido_paterno, apellido_materno, tipo_usuario
            FROM usuario
            WHERE rut = :rut
        """, {"rut": rut_buscar})
        fila = cursor.fetchone()
        cursor.close()
        conn.close()
        if not fila:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        return {
            "rut": fila[0],
            "correo": fila[1],
            "primer_nombre": fila[2],
            "segundo_nombre": fila[3],
            "apellido_paterno": fila[4],
            "apellido_materno": fila[5],
            "tipo_usuario": fila[6]
        }
    except Exception as ex:
        raise HTTPException(status_code=500, detail=str(ex))

@router.post("/")
def agregar_usuario(usuario: UsuarioRegistro):
    """
    Agrega un nuevo usuario del tipo seleccionado por el admin.
    Inserta también en la subtabla correspondiente (valores por defecto).
    """
    try:
        conn = get_conexion()
        cursor = conn.cursor()
        cursor.execute("SELECT NVL(MAX(ID_USUARIO), 0) + 1 FROM usuario")
        next_id = cursor.fetchone()[0]

        # Insertar usuario en la tabla principal
        cursor.execute("""
            INSERT INTO usuario (
                id_usuario, correo, contrasena, tipo_usuario,
                rut, primer_nombre, segundo_nombre, apellido_paterno, apellido_materno
            ) VALUES (
                :id_usuario, :correo, :contrasena, :tipo_usuario,
                :rut, :primer_nombre, :segundo_nombre, :apellido_paterno, :apellido_materno
            )
        """, {
            "id_usuario": next_id,
            "correo": usuario.correo,
            "contrasena": usuario.contrasena,
            "tipo_usuario": usuario.tipo_usuario,
            "rut": usuario.rut,
            "primer_nombre": usuario.primer_nombre,
            "segundo_nombre": usuario.segundo_nombre,
            "apellido_paterno": usuario.apellido_paterno,
            "apellido_materno": usuario.apellido_materno
        })

        # Insertar en la subtabla correspondiente (valores por defecto simples)
        if usuario.tipo_usuario == "vendedor":
            cursor.execute("INSERT INTO vendedor (id_usuario, id_sucursal) VALUES (:id, 1)", {"id": next_id})
        elif usuario.tipo_usuario == "bodeguero":
            cursor.execute("INSERT INTO bodeguero (id_usuario, id_sucursal) VALUES (:id, 1)", {"id": next_id})
        elif usuario.tipo_usuario == "contador":
            cursor.execute("INSERT INTO contador (id_usuario) VALUES (:id)", {"id": next_id})
        elif usuario.tipo_usuario == "cliente":
            cursor.execute("INSERT INTO cliente (id_usuario, nombre, direccion, telefono) VALUES (:id, 'Sin nombre', 'Sin dirección', '0')", {"id": next_id})
        elif usuario.tipo_usuario == "administrador":
            cursor.execute("INSERT INTO administrador (id_usuario) VALUES (:id)", {"id": next_id})

        conn.commit()
        cursor.close()
        conn.close()
        return {"mensaje": "Usuario agregado con éxito", "id_usuario": next_id}
    except Exception as ex:
        raise HTTPException(status_code=500, detail=str(ex))

@router.put("/{rut_actualizar}")
def actualizar_usuario(rut_actualizar: str, usuario: UsuarioUpdate):
    """
    Actualiza los datos personales de un usuario (NO permite cambiar el tipo de usuario).
    """
    try:
        campos = []
        valores = {"rut": rut_actualizar}
        for field, value in usuario.dict(exclude_unset=True).items():
            if field == "tipo_usuario":  # Proteger integridad
                continue
            campos.append(f"{field} = :{field}")
            valores[field] = value
        if not campos:
            raise HTTPException(status_code=400, detail="No hay datos para actualizar")
        sql = f"UPDATE usuario SET {', '.join(campos)} WHERE rut = :rut"
        conn = get_conexion()
        cursor = conn.cursor()
        cursor.execute(sql, valores)
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        conn.commit()
        cursor.close()
        conn.close()
        return {"mensaje": "Usuario actualizado con éxito"}
    except Exception as ex:
        raise HTTPException(status_code=500, detail=str(ex))

@router.delete("/{rut_eliminar}")
def eliminar_usuario(rut_eliminar: str):
    """
    Elimina un usuario y todas sus dependencias respetando las claves foráneas.
    """
    try:
        conn = get_conexion()
        cursor = conn.cursor()
        cursor.execute("SELECT id_usuario, tipo_usuario FROM usuario WHERE rut = :rut", {"rut": rut_eliminar})
        fila = cursor.fetchone()
        if not fila:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        id_usuario, tipo_usuario = fila

        if tipo_usuario == "cliente":
            cursor.execute("""
                DELETE FROM detalle_pedido 
                WHERE pedido_id_pedido IN (
                    SELECT id_pedido FROM pedido WHERE cliente_id_usuario = :id
                )""", {"id": id_usuario})
            cursor.execute("""
                DELETE FROM detalle_carrito 
                WHERE carrito_id IN (
                    SELECT id_carrito FROM carrito WHERE cliente_id_usuario = :id
                )""", {"id": id_usuario})
            cursor.execute("""
                DELETE FROM pago
                WHERE pedido_id_pedido IN (
                    SELECT id_pedido FROM pedido WHERE cliente_id_usuario = :id
                )""", {"id": id_usuario})
            cursor.execute("DELETE FROM pago WHERE cliente_id_usuario = :id", {"id": id_usuario})
            cursor.execute("DELETE FROM pedido WHERE cliente_id_usuario = :id", {"id": id_usuario})
            cursor.execute("DELETE FROM carrito WHERE cliente_id_usuario = :id", {"id": id_usuario})
            cursor.execute("DELETE FROM cliente WHERE id_usuario = :id", {"id": id_usuario})

        elif tipo_usuario == "vendedor":
            cursor.execute("""
                DELETE FROM detalle_pedido 
                WHERE pedido_id_pedido IN (
                    SELECT id_pedido FROM pedido WHERE vendedor_id_usuario = :id
                )""", {"id": id_usuario})
            cursor.execute("""
                DELETE FROM pago
                WHERE pedido_id_pedido IN (
                    SELECT id_pedido FROM pedido WHERE vendedor_id_usuario = :id
                )""", {"id": id_usuario})
            cursor.execute("DELETE FROM pedido WHERE vendedor_id_usuario = :id", {"id": id_usuario})
            cursor.execute("DELETE FROM vendedor WHERE id_usuario = :id", {"id": id_usuario})

        elif tipo_usuario == "bodeguero":
            cursor.execute("""
                DELETE FROM detalle_pedido 
                WHERE pedido_id_pedido IN (
                    SELECT id_pedido FROM pedido WHERE bodeguero_id_usuario = :id
                )""", {"id": id_usuario})
            cursor.execute("""
                DELETE FROM pago
                WHERE pedido_id_pedido IN (
                    SELECT id_pedido FROM pedido WHERE bodeguero_id_usuario = :id
                )""", {"id": id_usuario})
            cursor.execute("DELETE FROM pedido WHERE bodeguero_id_usuario = :id", {"id": id_usuario})
            cursor.execute("DELETE FROM bodeguero WHERE id_usuario = :id", {"id": id_usuario})

        elif tipo_usuario == "contador":
            cursor.execute("DELETE FROM pago WHERE confirmar_por = :id", {"id": id_usuario})
            cursor.execute("""
                DELETE FROM pago
                WHERE pedido_id_pedido IN (
                    SELECT id_pedido FROM pedido WHERE contador_id_usuario = :id
                )""", {"id": id_usuario})
            cursor.execute("""
                DELETE FROM detalle_pedido 
                WHERE pedido_id_pedido IN (
                    SELECT id_pedido FROM pedido WHERE contador_id_usuario = :id
                )""", {"id": id_usuario})
            cursor.execute("DELETE FROM pedido WHERE contador_id_usuario = :id", {"id": id_usuario})
            cursor.execute("DELETE FROM reporte_financiero WHERE contador_id_usuario = :id", {"id": id_usuario})
            cursor.execute("DELETE FROM contador WHERE id_usuario = :id", {"id": id_usuario})

        elif tipo_usuario == "administrador":
            cursor.execute("DELETE FROM informe_venta WHERE administrador_id_usuario = :id", {"id": id_usuario})
            cursor.execute("DELETE FROM administrador WHERE id_usuario = :id", {"id": id_usuario})

        cursor.execute("DELETE FROM usuario WHERE id_usuario = :id", {"id": id_usuario})

        conn.commit()
        cursor.close()
        conn.close()
        return {"mensaje": "Usuario eliminado correctamente"}
    except Exception as ex:
        raise HTTPException(status_code=500, detail=str(ex))

@router.patch("/{rut_actualizar}")
def actualizar_parcial(rut_actualizar: str, usuario: UsuarioUpdate):
    """
    Actualiza parcialmente los datos de un usuario (llama al mismo PUT).
    """
    return actualizar_usuario(rut_actualizar, usuario)

@router.post("/login")
def login(data: LoginData):
    """
    Login de usuario (devuelve id_usuario, rut, nombre, correo y tipo si es válido).
    """
    try:
        conn = get_conexion()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id_usuario, rut, primer_nombre, correo, tipo_usuario, cambiar_contrasena
            FROM usuario
            WHERE correo = :correo AND contrasena = :contrasena
        """, {
            "correo": data.correo,
            "contrasena": data.contrasena
        })
        usuario = cursor.fetchone()
        cursor.close()
        conn.close()
        if usuario:
            return {
                "mensaje": "Login exitoso",
                "usuario": {
                    "id_usuario": usuario[0],
                    "rut": usuario[1],
                    "nombre": usuario[2],
                    "correo": usuario[3],  # <-- ahora sí
                    "tipo_usuario": usuario[4],
                    "cambiar_contrasena": usuario[5]
                }
            }
        else:
            raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    except Exception as ex:
        raise HTTPException(status_code=500, detail=str(ex))




@router.put("/{id_usuario}/cambiar_contrasena")
def cambiar_contrasena(id_usuario: int, datos: CambioContrasenaModel):
    try:
        conn = get_conexion()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE usuario
            SET contrasena = :contrasena, cambiar_contrasena = 0
            WHERE id_usuario = :id_usuario
        """, {
            "contrasena": datos.contrasena,
            "id_usuario": id_usuario
        })
        conn.commit()
        cursor.close()
        conn.close()
        return {"mensaje": "Contraseña actualizada"}
    except Exception as ex:
        raise HTTPException(status_code=500, detail=str(ex))
    
    
    

@router.put("/recuperar/{rut}")
def recuperar_contrasena(rut: str, datos: CambioContrasenaModel):
    """
    Permite solo a clientes recuperar la contraseña por RUT.
    """
    try:
        conn = get_conexion()
        cursor = conn.cursor()
        # Verifica que exista y sea cliente
        cursor.execute("SELECT id_usuario FROM usuario WHERE rut=:rut AND tipo_usuario='cliente'", {"rut": rut})
        fila = cursor.fetchone()
        if not fila:
            raise HTTPException(status_code=404, detail="Solo los clientes pueden recuperar su contraseña")
        id_usuario = fila[0]
        cursor.execute(
            "UPDATE usuario SET contrasena = :contrasena WHERE id_usuario = :id_usuario",
            {"contrasena": datos.contrasena, "id_usuario": id_usuario}
        )
        conn.commit()
        cursor.close()
        conn.close()
        return {"mensaje": "Contraseña actualizada"}
    except Exception as ex:
        raise HTTPException(status_code=500, detail=str(ex))

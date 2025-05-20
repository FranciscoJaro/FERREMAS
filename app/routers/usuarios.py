from fastapi import APIRouter, HTTPException
from app.database import get_conexion
from typing import Optional

router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"]
)

@router.get("/")
def obtener_usuarios():
    try:
        conn = get_conexion()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT rut,
                   correo,
                   contrasena,
                   primer_nombre,
                   segundo_nombre,
                   apellido_paterno,
                   apellido_materno,
                   tipo_usuario
              FROM usuario
        """)
        usuarios = []
        for rut, correo, contrasena, pn, sn, ap, am, tu in cursor:
            usuarios.append({
                "rut": rut,
                "correo": correo,
                "contrasena": contrasena,
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
    try:
        conn = get_conexion()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT rut,
                   correo,
                   contrasena,
                   primer_nombre,
                   segundo_nombre,
                   apellido_paterno,
                   apellido_materno,
                   tipo_usuario
              FROM usuario
             WHERE rut = :rut
        """, {"rut": rut_buscar})
        fila = cursor.fetchone()
        cursor.close()
        conn.close()
        if not fila:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        return {
            "rut":             fila[0],
            "correo":          fila[1],
            "contrasena":      fila[2],
            "primer_nombre":   fila[3],
            "segundo_nombre":  fila[4],
            "apellido_paterno":fila[5],
            "apellido_materno":fila[6],
            "tipo_usuario":    fila[7]
        }
    except Exception as ex:
        raise HTTPException(status_code=500, detail=str(ex))





@router.put("/{rut_actualizar}")
def actualizar_usuario(
    rut_actualizar: str,
    correo: str,
    contrasena: str,
    primer_nombre: str,
    segundo_nombre: Optional[str] = None,
    apellido_paterno: str = "",
    apellido_materno: str = "",
    tipo_usuario: str = ""
):
    try:
        conn = get_conexion()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE usuario SET
                correo           = :correo,
                contrasena       = :contrasena,
                primer_nombre    = :primer_nombre,
                segundo_nombre   = :segundo_nombre,
                apellido_paterno = :apellido_paterno,
                apellido_materno = :apellido_materno,
                tipo_usuario     = :tipo_usuario
            WHERE rut = :rut
        """, {
            "rut": rut_actualizar,
            "correo": correo,
            "contrasena": contrasena,
            "primer_nombre": primer_nombre,
            "segundo_nombre": segundo_nombre,
            "apellido_paterno": apellido_paterno,
            "apellido_materno": apellido_materno,
            "tipo_usuario": tipo_usuario
        })
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
    try:
        conn = get_conexion()
        cursor = conn.cursor()
        cursor.execute(
            "DELETE FROM usuario WHERE rut = :rut",
            {"rut": rut_eliminar}
        )
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        conn.commit()
        cursor.close()
        conn.close()
        return {"mensaje": "Usuario eliminado con éxito"}
    except Exception as ex:
        raise HTTPException(status_code=500, detail=str(ex))


@router.patch("/{rut_actualizar}")
def actualizar_parcial(
    rut_actualizar: str,
    correo: Optional[str] = None,
    contrasena: Optional[str] = None,
    primer_nombre: Optional[str] = None,
    segundo_nombre: Optional[str] = None,
    apellido_paterno: Optional[str] = None,
    apellido_materno: Optional[str] = None,
    tipo_usuario: Optional[str] = None
):
    try:
        campos = []
        valores = {"rut": rut_actualizar}

        if correo is not None:
            campos.append("correo = :correo")
            valores["correo"] = correo
        if contrasena is not None:
            campos.append("contrasena = :contrasena")
            valores["contrasena"] = contrasena
        if primer_nombre is not None:
            campos.append("primer_nombre = :primer_nombre")
            valores["primer_nombre"] = primer_nombre
        if segundo_nombre is not None:
            campos.append("segundo_nombre = :segundo_nombre")
            valores["segundo_nombre"] = segundo_nombre
        if apellido_paterno is not None:
            campos.append("apellido_paterno = :apellido_paterno")
            valores["apellido_paterno"] = apellido_paterno
        if apellido_materno is not None:
            campos.append("apellido_materno = :apellido_materno")
            valores["apellido_materno"] = apellido_materno
        if tipo_usuario is not None:
            campos.append("tipo_usuario = :tipo_usuario")
            valores["tipo_usuario"] = tipo_usuario

        if not campos:
            raise HTTPException(status_code=400, detail="Debe enviar al menos un campo")

        sql = f"UPDATE usuario SET {', '.join(campos)} WHERE rut = :rut"
        conn = get_conexion()
        cursor = conn.cursor()
        cursor.execute(sql, valores)
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        conn.commit()
        cursor.close()
        conn.close()
        return {"mensaje": "Usuario actualizado parcialmente"}
    except Exception as ex:
        raise HTTPException(status_code=500, detail=str(ex))


####################################################################

from pydantic import BaseModel


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
   

@router.post("/login")
def login(data: LoginData):
    try:
        conn = get_conexion()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT rut, primer_nombre, tipo_usuario
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
                    "rut": usuario[0],
                    "nombre": usuario[1],
                    "tipo_usuario": usuario[2]
                }
            }
        else:
            raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    except Exception as ex:
        raise HTTPException(status_code=500, detail=str(ex))
    
    
    
    ######################################################
    
@router.post("/")
def agregar_usuario(usuario: UsuarioRegistro):
    try:
        conn = get_conexion()
        cursor = conn.cursor()

        # OBTENER EL SIGUIENTE ID
        cursor.execute("SELECT NVL(MAX(ID_USUARIO), 0) + 1 FROM usuario")
        next_id = cursor.fetchone()[0]

        # Insertar usuario
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
            **usuario.dict(),
            "tipo_usuario": "cliente"
        })
        conn.commit()
        cursor.close()
        conn.close()
        # Devuelve el id_usuario para usarlo en la tabla cliente
        return {"mensaje": "Usuario agregado con éxito", "id_usuario": next_id}
    except Exception as ex:
        raise HTTPException(status_code=500, detail=str(ex))
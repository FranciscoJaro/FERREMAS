from fastapi import APIRouter, HTTPException
from app.database import get_conexion
from pydantic import BaseModel

router = APIRouter(
    prefix="/clientes",
    tags=["Clientes"]
)

class ClienteRegistro(BaseModel):
    id_usuario: int
    nombre: str
    direccion: str
    telefono: str

class ClienteUpdate(BaseModel):
    direccion: str
    telefono: str

@router.post("/")
def registrar_cliente(cliente: ClienteRegistro):
    try:
        conn = get_conexion()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO cliente (id_usuario, nombre, direccion, telefono)
            VALUES (:id_usuario, :nombre, :direccion, :telefono)
        """, cliente.dict())
        conn.commit()
        cursor.close()
        conn.close()
        return {"mensaje": "Cliente registrado con éxito"}
    except Exception as ex:
        raise HTTPException(status_code=500, detail=str(ex))

@router.get("/usuario/{id_usuario}")
def obtener_cliente_por_usuario(id_usuario: int):
    try:
        conn = get_conexion()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT nombre, direccion, telefono
            FROM cliente
            WHERE id_usuario = :id_usuario
        """, {"id_usuario": id_usuario})
        fila = cursor.fetchone()
        cursor.close()
        conn.close()
        if not fila:
            raise HTTPException(status_code=404, detail="Cliente no encontrado")
        return {
            "nombre": fila[0],
            "direccion": fila[1],
            "telefono": fila[2]
        }
    except Exception as ex:
        raise HTTPException(status_code=500, detail=str(ex))

@router.put("/{id_usuario}")
def actualizar_cliente(id_usuario: int, update: ClienteUpdate):
    try:
        conn = get_conexion()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE cliente
            SET direccion = :direccion, telefono = :telefono
            WHERE id_usuario = :id_usuario
        """, {
            "direccion": update.direccion,
            "telefono": update.telefono,
            "id_usuario": id_usuario
        })
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Cliente no encontrado")
        conn.commit()
        cursor.close()
        conn.close()
        return {"mensaje": "Datos del cliente actualizados con éxito"}
    except Exception as ex:
        raise HTTPException(status_code=500, detail=str(ex))

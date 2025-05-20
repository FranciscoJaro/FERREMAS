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

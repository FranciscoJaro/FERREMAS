from fastapi import APIRouter, HTTPException
from app.database import get_conexion

router = APIRouter(
    prefix="/productos",
    tags=["Productos"]
)

# Modelo para el producto (opcional, pero recomendado)
from pydantic import BaseModel
from typing import Optional

class Producto(BaseModel):
    id_producto: int
    nombre: str
    descripcion: str
    precio: float
    stock: int
    id_sucursal: int
    id_modelo: int

@router.get("/", response_model=list[Producto])
def listar_productos():
    try:
        conn = get_conexion()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id_producto, nombre, descripcion, precio, stock, id_sucursal, id_modelo
            FROM producto
        """)
        productos = []
        for fila in cursor:
            productos.append({
                "id_producto": fila[0],
                "nombre": fila[1],
                "descripcion": fila[2],
                "precio": float(fila[3]),
                "stock": fila[4],
                "id_sucursal": fila[5],
                "id_modelo": fila[6],
            })
        cursor.close()
        conn.close()
        return productos
    except Exception as ex:
        raise HTTPException(status_code=500, detail=str(ex))

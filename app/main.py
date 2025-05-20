from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import usuarios,clientes

app = FastAPI(
    title="API de gestión de usuarios",
    version="1.0.0",
    description="API para gestionar usuario usando FastAPI y Oracle"
)

# Traer routers
app.include_router(usuarios.router)
app.include_router(clientes.router)

# Agregar CORS DESPUÉS de crear la app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # O solo ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

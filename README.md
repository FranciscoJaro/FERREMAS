# FERREMAS - Sistema de Gestión de Ferretería

Proyecto de integración de plataformas para el ramo de Ingeniería en Informática.  
Incluye: Backend (Express + OracleDB), Backend (FastAPI), y Frontend (React).

---

## ⚙️ Estructura del Proyecto

- `/backend-express` → Backend Node.js (Express) con conexión OracleDB (gestión productos, pedidos, pagos, reportes)
- `/backend-fastapi` → Backend FastAPI (gestión usuarios, clientes y login)
- `/frontend` → Frontend React (interfaces para clientes, vendedores, admin, contador, bodeguero, etc.)

---

## 🚀 ¿Cómo correr el proyecto?
Ejecutar script en base de datos oracle.
git clone [URL_DEL_REPO]
cd ferremas
(api express)
cd productos-api
npm install
node index.js
cd ..
(frontend)
cd web
npm install
npm run start
cd ..
(api fastapi)
dektop/ferremas
python -m venv venv
source venv/Scripts/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

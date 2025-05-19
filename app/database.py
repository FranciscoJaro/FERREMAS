import oracledb

def get_conexion():
    return oracledb.connect(
        user="ferremas",
        password="ferremas123",
        dsn="localhost:1521/xe"
    )

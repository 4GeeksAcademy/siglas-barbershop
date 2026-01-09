import os
from sqlalchemy import create_engine, text


def main():
    # Forzamos SQLite sí o sí para salir del lío
    sqlite_url = "sqlite:////tmp/test.db"

    # Borra DB sqlite para empezar limpio
    try:
        os.remove("/tmp/test.db")
        print("✅ Borrado /tmp/test.db")
    except FileNotFoundError:
        print("ℹ️ /tmp/test.db no existía")

    engine = create_engine(sqlite_url)

    # En SQLite no hay schemas, solo borramos la tabla alembic_version si existe (por si acaso)
    with engine.begin() as conn:
        conn.execute(text("DROP TABLE IF EXISTS alembic_version;"))
        print("✅ Dropeada alembic_version (si existía)")

    print("✅ Reset listo (SQLite). Ahora corre flask db init/migrate/upgrade.")


if __name__ == "__main__":
    main()

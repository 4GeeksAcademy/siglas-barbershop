# src/api/auth.py

from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from api.models import db, Usuario


def get_current_user():
    """
    Devuelve el usuario autenticado según el JWT.
    En tu login usas identity=str(user_id), por eso convertimos a int.
    """
    user_id = get_jwt_identity()
    if not user_id:
        return None

    try:
        user_id = int(user_id)
    except ValueError:
        return None

    return db.session.get(Usuario, user_id)


def require_roles(*allowed_roles):
    """
    Decorador para proteger rutas por rol.
    Ejemplo:
        @require_roles("admin")
        def ruta_admin(): ...
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()  # valida que exista un JWT válido
            user = get_current_user()

            if not user:
                return jsonify({"ok": False, "message": "Usuario no autenticado"}), 401

            if user.role not in allowed_roles:
                return jsonify({
                    "ok": False,
                    "message": "No autorizado",
                    "required_roles": allowed_roles
                }), 403

            return fn(*args, **kwargs)
        return wrapper
    return decorator

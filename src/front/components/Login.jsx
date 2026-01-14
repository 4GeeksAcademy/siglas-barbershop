import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { getUserFromToken } from "../../utils/auth";

const Login = () => {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    dispatch({ type: "clear_error" }); // si empiezas a escribir, limpia el error
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  useEffect(() => {
    if (store.token) {
      dispatch({
        type: "set_error",
        payload: "Ya estás logueado, redirigiendo...",
      });
      const timer = setTimeout(() => {
        if (store.is_admin) {
          navigate("/admindashboard", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [store.token, navigate, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch({ type: "clear_error" });
    dispatch({ type: "set_loading", payload: true });
    try {
      const res = await fetch(`${store.backendUrl}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await res.json()
      //.catch(() => ({}));
      if (!res.ok || !data?.access_token) {
        dispatch({
          type: "set_error",
          payload: data?.message || "Credenciales inválidas",
        });
        setTimeout(() => {
          dispatch({ type: "clear_error" });
          setFormData({ email: "", password: "" });
        }, 2000);
        return;
      }
      localStorage.setItem("access_token", data.access_token);
      dispatch({ type: "set_token", payload: data.access_token });
      const { user_id, role, is_admin } = getUserFromToken(data.access_token);
      dispatch({ type: "set_user", payload: { user_id, role, is_admin } });
      localStorage.setItem("role", role);
      localStorage.setItem("user_id", user_id)
      localStorage.setItem("is_admin", is_admin)
      if (is_admin) {
        navigate("/admindashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      dispatch({
        type: "set_error",
        payload: "Error de conexión con el servidor",
      });
    } finally {
      dispatch({ type: "set_loading", payload: false });
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center py-5 min-vh-100">
      <div className="row justify-content-center w-100">
        <div className="col-12 col-sm-10 col-md-7 col-lg-5">
          <div
            className="card border-0 shadow-lg"
            style={{
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
            }}
          >
            <div className="card-body p-4 p-md-5">
              <h1 className="h4 fw-bold mb-1">Iniciar sesión</h1>
              <p className="text-muted mb-4">
                Accede para agendar y gestionar tus citas.
              </p>
              {store.error && (
                <div className="alert alert-danger py-2 mb-3">{store.error}</div>
              )}
              <form onSubmit={handleSubmit} className="d-grid gap-3">
                <div>
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={store.loading}
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label className="form-label">Contraseña</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={store.loading}
                    autoComplete="current-password"
                  />
                </div>
                <button className="btn btn-dark" disabled={store.loading}>
                  {store.loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Ingresando...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </button>
                <div className="text-center mt-4">
                  <button
                    type="button"
                    className="btn btn-link text-muted"
                    onClick={() => navigate(-1)}
                  >
                    ← Volver
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

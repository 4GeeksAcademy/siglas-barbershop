import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const Registrarse = () => {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: "", message: "" }), 3000);
  };

  const handleChange = (e) => {
    setAlert({ show: false, type: "", message: "" });
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();


    if (
      formData.name.trim().length < 2 ||
      !formData.email.trim() ||
      formData.phone.trim().length < 7 ||
      formData.address.trim().length < 4
    ) {
      return showAlert("danger", "Completa los campos obligatorios correctamente.");
    }

    if (formData.password.length < 6) {
      return showAlert("danger", "La contraseña debe tener al menos 6 caracteres.");
    }

    if (formData.password !== formData.confirmPassword) {
      return showAlert("danger", "Las contraseñas no coinciden.");
    }

    setLoading(true);

    try {
      const res = await fetch(`${store.backendUrl}/api/usuario/cliente`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          password: formData.password,
        }),
      });

      const data = await res.json()

      if (!data.ok) {
        return showAlert("danger", data?.message || "Error al registrar usuario.");
      }

      showAlert("success", "Cuenta creada correctamente. Redirigiendo…");
      setTimeout(() => navigate("/login", { replace: true }), 900);
    } catch {
      dispatch({
        type: "set_error",
        payload: "Error de conexión con el servidor",
      });
      //showAlert("danger", "Error de conexión con el servidor.");
    } finally {
      dispatch({ type: "set_loading", payload: false });
      //setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100 py-5">
      <div className="row w-100 justify-content-center">
        <div className="col-12 col-md-9 col-lg-7 col-xl-6">

          <div
            className="card border-0 shadow-lg"
            style={{
              background: "rgba(255,255,255,0.93)",
              backdropFilter: "blur(6px)",
            }}
          >
            <div className="card-header bg-white border-0 text-center py-4">

              <h4 className="fw-bold mb-1">Registro de Cliente</h4>
              <p className="text-muted mb-0 small">
                Crea tu cuenta para gestionar citas y servicios
              </p>
            </div>

            {alert.show && (
              <div className={`alert alert-${alert.type} rounded-0 mb-0`}>
                {alert.message}
              </div>
            )}

            <div className="card-body px-4 px-md-5 py-4">
              <form onSubmit={handleSubmit} className="row g-3" noValidate>

                <div className="col-12">
                  <label className="form-label">Nombre</label>
                  <input
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Teléfono</label>
                  <input
                    className="form-control"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Dirección</label>
                  <input
                    className="form-control"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                <hr className="my-3" />

                <div className="col-md-6">
                  <label className="form-label">Contraseña</label>
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Confirmar</label>
                  <input
                    type="password"
                    className="form-control"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                <div className="col-12 d-grid mt-4">
                  <button className="btn btn-dark" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Registrando…
                      </>
                    ) : (
                      "Crear cuenta"
                    )}
                  </button>
                </div>

                <div className="col-12 text-center small text-muted">
                  ¿Ya tienes cuenta?{" "}
                  <span
                    role="button"
                    className="text-decoration-underline"
                    onClick={() => navigate("/login")}
                  >
                    Inicia sesión
                  </span>
                </div>
              </form>
            </div>

            <div className="text-center mt-3">
              <button className="btn btn-link text-muted" onClick={() => navigate("/")}>
                ← Volver al inicio
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
export default Registrarse;

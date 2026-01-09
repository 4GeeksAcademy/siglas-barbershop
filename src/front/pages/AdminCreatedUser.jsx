import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminCrearUsuario = () => {
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [loading, setLoading] = useState(false);
  const [showOptional, setShowOptional] = useState(false);
  const [showSpecialties, setShowSpecialties] = useState(false);

  const [alert, setAlert] = useState({ show: false, type: "", message: "" });

  const [formData, setFormData] = useState({
    // En tu modelo: role + is_admin
    role: "cliente",
    is_admin: false,

    // Campos del modelo
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",

    photo_url: "",
    bio: "",
    specialties: "",
  });

  const showAlertMsg = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: "", message: "" }), 3000);
  };

  const handleChange = (e) => {
    setAlert({ show: false, type: "", message: "" });

    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRoleChange = (e) => {
    const role = e.target.value;

    setFormData((prev) => ({
      ...prev,
      role,
    }));

    // si cambia a cliente, oculto specialties visualmente (no borro por si luego vuelve a barbero)
    if (role === "cliente") {
      setShowSpecialties(false);
    }
  };

  const validate = () => {
    if (formData.name.trim().length < 2) return "Nombre inválido (mínimo 2).";
    if (!formData.email.trim()) return "Email obligatorio.";
    if (formData.password.length < 6) return "Contraseña mínimo 6 caracteres.";
    if (formData.password !== formData.confirmPassword) return "Las contraseñas no coinciden.";

    // Si el usuario será barbero (por role o por checkbox visual), exigir specialties
    const willBeBarber = formData.role === "barbero" || showSpecialties;
    if (willBeBarber && formData.specialties.trim().length < 2) {
      return "Indica especialidades (ej: fade, barba).";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const err = validate();
    if (err) return showAlertMsg("danger", err);

    setLoading(true);

    try {
      // Si un usuario es admin pero también barbero:
      // - is_admin = true
      // - role puede quedar "barbero" o "cliente" según tu preferencia.
      // Yo recomiendo: si marcaste “admin” y también quieres que atienda citas, pon role="barbero".
      const willBeBarber = formData.role === "barbero" || showSpecialties;

      const payload = {
        // modelo
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,

        role: willBeBarber ? "barbero" : "cliente",
        is_admin: formData.is_admin,

        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,

        photo_url: formData.photo_url.trim() || null,
        bio: formData.bio.trim() || null,

        // specialties: solo si es barbero (o admin-barbero)
        specialties: willBeBarber ? (formData.specialties.trim() || null) : null,
      };

      const res = await fetch(`${backendUrl}/api/usuario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data?.ok === false) {
        return showAlertMsg("danger", data?.message || "Error al crear usuario.");
      }

      showAlertMsg("success", "Usuario creado correctamente.");
      setTimeout(() => navigate("/dashboard", { replace: true }), 900);
    } catch {
      showAlertMsg("danger", "Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const willShowSpecialties = formData.role === "barbero" || showSpecialties;

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100 py-5">
      <div className="col-12 col-md-10 col-lg-8 col-xl-7">
        <div
          className="card border-0 shadow-lg"
          style={{
            background: "rgba(255,255,255,0.93)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
          }}
        >
          {/* Header */}
          <div className="card-header bg-white text-center py-4 border-0">
            <div className="fs-1">👤</div>
            <h4 className="fw-bold mb-1">Admin · Crear Usuario</h4>
            <p className="text-muted small mb-0">
              Compatible con: role, is_admin, specialties, photo_url, bio
            </p>
          </div>

          {/* Alert */}
          {alert.show && (
            <div className={`alert alert-${alert.type} rounded-0 mb-0`}>
              {alert.message}
            </div>
          )}

          <div className="card-body p-4">
            <form onSubmit={handleSubmit} className="row g-3">
              {/* Rol base */}
              <div className="col-12">
                <label className="form-label">Rol (base)</label>
                <select
                  className="form-select"
                  value={formData.role}
                  onChange={handleRoleChange}
                  disabled={loading}
                >
                  <option value="cliente">Cliente</option>
                  <option value="barbero">Barbero</option>
                </select>
                <div className="form-text">
                  El rol define si aparecerá como barbero para citas.
                </div>
              </div>

              {/* Admin */}
              <div className="col-12">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="isAdmin"
                    name="is_admin"
                    checked={!!formData.is_admin}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <label className="form-check-label" htmlFor="isAdmin">
                    Es administrador (is_admin = true)
                  </label>
                </div>

                {formData.is_admin && formData.role !== "barbero" && (
                  <div className="form-text">
                    Si este admin también atiende clientes, activa abajo “También es barbero”.
                  </div>
                )}
              </div>

              {/* Admin también barbero (solo si es admin y rol base no es barbero) */}
              {formData.is_admin && formData.role !== "barbero" && (
                <div className="col-12">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="adminAlsoBarber"
                      checked={showSpecialties}
                      onChange={(e) => setShowSpecialties(e.target.checked)}
                      disabled={loading}
                    />
                    <label className="form-check-label" htmlFor="adminAlsoBarber">
                      También es barbero (mostrar especialidades)
                    </label>
                  </div>
                </div>
              )}

              {/* Campos principales */}
              <div className="col-md-6">
                <label className="form-label">Nombre</label>
                <input
                  className="form-control"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="col-md-6">
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

              {/* Especialidades si es barbero o admin-barbero */}
              {willShowSpecialties && (
                <div className="col-12">
                  <label className="form-label">Especialidades</label>
                  <input
                    className="form-control"
                    name="specialties"
                    value={formData.specialties}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Fade, barba, diseño..."
                  />
                  <div className="form-text">
                    Se guarda en <b>specialties</b> (tu modelo lo permite).
                  </div>
                </div>
              )}

              {/* Password */}
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
                <div className="form-text">Mínimo 6 caracteres.</div>
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

              {/* Perfil opcional */}
              <div className="col-12">
                <button
                  type="button"
                  className="btn btn-outline-secondary w-100 d-flex justify-content-between align-items-center"
                  onClick={() => setShowOptional((v) => !v)}
                  disabled={loading}
                >
                  Perfil opcional (foto / bio)
                  <span className="small">{showOptional ? "▲" : "▼"}</span>
                </button>

                {showOptional && (
                  <div className="border rounded p-3 bg-light mt-3">
                    <div className="mb-3">
                      <label className="form-label">Foto (URL)</label>
                      <input
                        className="form-control"
                        name="photo_url"
                        value={formData.photo_url}
                        onChange={handleChange}
                        disabled={loading}
                        placeholder="https://..."
                      />
                    </div>

                    <div>
                      <label className="form-label">Bio</label>
                      <textarea
                        className="form-control"
                        name="bio"
                        rows="3"
                        value={formData.bio}
                        onChange={handleChange}
                        disabled={loading}
                        placeholder="Descripción opcional..."
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Botón submit */}
              <div className="col-12 d-grid mt-3">
                <button className="btn btn-dark" disabled={loading}>
                  {loading ? "Creando..." : "Crear usuario"}
                </button>
              </div>

              <div className="col-12 text-center">
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

          <div className="card-footer bg-white border-0 text-center small text-muted">
            Sugerencia: <b>admin-barbero</b> = is_admin true + role barbero + specialties.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCrearUsuario;

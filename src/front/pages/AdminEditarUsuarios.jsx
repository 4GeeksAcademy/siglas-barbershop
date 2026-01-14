import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const AdminEditarUsuario = () => {
  const { store, dispatch } = useGlobalReducer();
  const { id } = useParams();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showOptional, setShowOptional] = useState(false);
  const [showSpecialties, setShowSpecialties] = useState(false);

  const [alert, setAlert] = useState({ show: false, type: "", message: "" });

  const [formData, setFormData] = useState({
    user_id: null,
    role: "cliente",
    is_admin: false,
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

    if (role === "cliente") {
      setShowSpecialties(false);
    }
  };

  const validate = () => {
    if (formData.name.trim().length < 2) return "Nombre inválido (mínimo 2).";
    if (!formData.email.trim()) return "Email obligatorio.";

    // password opcional en editar: si escribe algo, validamos
    if (formData.password) {
      if (formData.password.length < 6) return "Contraseña mínimo 6 caracteres.";
      if (formData.password !== formData.confirmPassword)
        return "Las contraseñas no coinciden.";
    }

    const willBeBarber = formData.role === "barbero" || showSpecialties;
    if (willBeBarber && (formData.specialties || "").trim().length < 2) {
      return "Indica especialidades (ej: fade, barba).";
    }
    return null;
  };

  const loadUsuario = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/usuario/${id}`);
      const data = await res.json();

      if (!data.ok) {
        showAlertMsg("danger", data?.message || "No se pudo cargar el usuario.");
        setLoading(false);
        return;
      }

      const u = data.result;

      setFormData((prev) => ({
        ...prev,
        user_id: u.user_id,
        name: u.name || "",
        email: u.email || "",
        role: u.role || "cliente",
        is_admin: !!u.is_admin,
        phone: u.phone || "",
        address: u.address || "",
        photo_url: u.photo_url || "",
        bio: u.bio || "",
        specialties: u.specialties || "",
        password: "",
        confirmPassword: "",
      }));

      // lógica visual (igual que crear)
      const isBarber = (u.role || "cliente") === "barbero";
      setShowSpecialties(isBarber); // si es barbero, muestro specialties
      setShowOptional(!!(u.photo_url || u.bio)); // si tiene algo, abro opcional

    } catch {
      showAlertMsg("danger", "Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return showAlertMsg("danger", err);

    setSaving(true);
    try {
      const willBeBarber = formData.role === "barbero" || showSpecialties;

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        is_admin: formData.is_admin,
        phone: formData.phone.trim() || "",
        address: formData.address.trim() || "",
        photo_url: formData.photo_url.trim() || "",
        bio: formData.bio.trim() || "",
        specialties: formData.specialties.trim() || "",
      };
      console.log("payload", payload)
      // password solo si viene (editar)
      if (formData.password) payload.password = formData.password;

      const res = await fetch(`${backendUrl}/api/admin/usuario/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${store.token}`
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("res.ok", res.ok)
      if (!data.ok) {
        return showAlertMsg("danger", data?.message || "Error al actualizar usuario.");
      }

      showAlertMsg("success", "Usuario actualizado correctamente.");
      setTimeout(() => navigate("/adminusuarios", { replace: true }), 900);
    } catch {
      showAlertMsg("danger", "Error de conexión con el servidor.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const ok = confirm("¿Seguro que deseas eliminar este usuario?");
    if (!ok) return;

    try {
      const res = await fetch(`${backendUrl}/api/usuario/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!data.ok) {
        return showAlertMsg("danger", data?.message || "No se pudo eliminar.");
      }

      showAlertMsg("success", "Usuario eliminado.");
      setTimeout(() => navigate("/adminusuarios", { replace: true }), 700);
    } catch {
      showAlertMsg("danger", "Error de conexión con el servidor.");
    }
  };

  useEffect(() => {
    loadUsuario();
  }, [id]);

  const willShowSpecialties = formData.role === "barbero" || showSpecialties;

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" role="status" />
        <div className="mt-2 text-muted">Cargando usuario...</div>
      </div>
    );
  }

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
          <div className="card-header bg-white text-center py-4 border-0">
            <h4 className="fw-bold mb-1">Admin · Editar Usuario</h4>
            <p className="text-muted small mb-0">
              ID: <b>{formData.user_id}</b>
            </p>
          </div>

          {alert.show && (
            <div className={`alert alert-${alert.type} rounded-0 mb-0`}>
              {alert.message}
            </div>
          )}

          <div className="card-body p-4">
            <form onSubmit={handleSubmit} className="row g-3">
              <div className="col-12">
                <label className="form-label">Rol (base)</label>
                <select
                  className="form-select"
                  name="role"
                  value={formData.role}
                  onChange={handleRoleChange}
                  disabled={saving}
                >
                  <option value="cliente">Cliente</option>
                  <option value="barbero">Barbero</option>
                </select>
              </div>

              <div className="col-12">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="isAdmin"
                    name="is_admin"
                    checked={!!formData.is_admin}
                    onChange={handleChange}
                    disabled={saving}
                  />
                  <label className="form-check-label" htmlFor="isAdmin">
                    Es administrador (is_admin = true)
                  </label>
                </div>
              </div>

              {formData.is_admin && formData.role !== "barbero" && (
                <div className="col-12">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="adminAlsoBarber"
                      checked={showSpecialties}
                      onChange={(e) => setShowSpecialties(e.target.checked)}
                      disabled={saving}
                    />
                    <label className="form-check-label" htmlFor="adminAlsoBarber">
                      También es barbero (mostrar especialidades)
                    </label>
                  </div>
                </div>
              )}

              <div className="col-md-6">
                <label className="form-label">Nombre</label>
                <input
                  className="form-control"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={saving}
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
                  disabled={saving}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Teléfono</label>
                <input
                  className="form-control"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={saving}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Dirección</label>
                <input
                  className="form-control"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={saving}
                />
              </div>

              {willShowSpecialties && (
                <div className="col-12">
                  <label className="form-label">Especialidades</label>
                  <input
                    className="form-control"
                    name="specialties"
                    value={formData.specialties}
                    onChange={handleChange}
                    disabled={saving}
                    placeholder="Fade, barba, diseño..."
                  />
                </div>
              )}

              <div className="col-md-6">
                <label className="form-label">Nueva contraseña (opcional)</label>
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={saving}
                />
                <div className="form-text">Déjala vacía si no deseas cambiarla.</div>
              </div>

              <div className="col-md-6">
                <label className="form-label">Confirmar</label>
                <input
                  type="password"
                  className="form-control"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={saving}
                />
              </div>

              <div className="col-12">
                <button
                  type="button"
                  className="btn btn-outline-secondary w-100 d-flex justify-content-between align-items-center"
                  onClick={() => setShowOptional((v) => !v)}
                  disabled={saving}
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
                        disabled={saving}
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
                        disabled={saving}
                        placeholder="Descripción opcional..."
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="col-12 d-grid mt-3">
                <button className="btn btn-dark" disabled={saving}>
                  {saving ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>

              <div className="col-12 d-grid">
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={handleDelete}
                  disabled={saving}
                >
                  Eliminar usuario
                </button>
              </div>

              <div className="col-12 text-center">
                <button
                  type="button"
                  className="btn btn-link text-muted"
                  onClick={() => navigate("/adminusuarios")}
                >
                  ← Volver
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEditarUsuario;

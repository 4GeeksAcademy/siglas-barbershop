import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const AdminEditarServicio = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });

  const [formData, setFormData] = useState({
    service_id: null,
    name: "",
    price: "",
    duration_minutes: 30,
  });

  const showAlertMsg = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: "", message: "" }), 3000);
  };

  const authHeaders = () => {
    const token = localStorage.getItem("access_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleChange = (e) => {
    setAlert({ show: false, type: "", message: "" });
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (formData.name.trim().length < 2) return "Nombre inválido (mínimo 2).";
    const price = Number(formData.price);
    if (isNaN(price) || price <= 0) return "Precio inválido (debe ser mayor a 0).";
    const dur = Number(formData.duration_minutes);
    if (isNaN(dur) || dur < 5) return "Duración inválida (mínimo 5 min).";
    return null;
  };

  const loadServicio = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/services`);
      const data = await res.json();

      if (!data.ok) {
        showAlertMsg("danger", data?.message || "No se pudo cargar servicios.");
        return;
      }

      const s = (data.data || []).find((x) => Number(x.service_id) === Number(id));
      if (!s) {
        showAlertMsg("danger", "Servicio no encontrado.");
        return;
      }

      setFormData({
        service_id: s.service_id,
        name: s.name || "",
        price: String(s.price ?? ""),
        duration_minutes: Number(s.duration_minutes ?? 30),
      });
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
      const payload = {
        name: formData.name.trim(),
        price: Number(formData.price),
        duration_minutes: Number(formData.duration_minutes),
      };

      const res = await fetch(`${backendUrl}/api/services/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!data.ok) {
        return showAlertMsg("danger", data?.message || "Error al actualizar servicio.");
      }

      showAlertMsg("success", "Servicio actualizado correctamente.");
      setTimeout(() => navigate("/adminservicios", { replace: true }), 900);
    } catch {
      showAlertMsg("danger", "Error de conexión con el servidor.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const ok = confirm("¿Seguro que deseas eliminar este servicio?");
    if (!ok) return;

    try {
      const res = await fetch(`${backendUrl}/api/services/${id}`, {
        method: "DELETE",
        headers: { ...authHeaders() },
      });
      const data = await res.json();

      if (!data.ok) {
        return showAlertMsg("danger", data?.message || "No se pudo eliminar.");
      }

      showAlertMsg("success", "Servicio eliminado.");
      setTimeout(() => navigate("/adminservicios", { replace: true }), 700);
    } catch {
      showAlertMsg("danger", "Error de conexión con el servidor.");
    }
  };

  useEffect(() => {
    loadServicio();
  }, [id]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" role="status" />
        <div className="mt-2 text-muted">Cargando servicio...</div>
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
            <h4 className="fw-bold mb-1">Admin · Editar Servicio</h4>
            <p className="text-muted small mb-0">
              ID: <b>{formData.service_id}</b>
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
                <label className="form-label">Precio</label>
                <input
                  className="form-control"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  disabled={saving}
                  inputMode="decimal"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Duración (min)</label>
                <input
                  type="number"
                  className="form-control"
                  name="duration_minutes"
                  value={formData.duration_minutes}
                  onChange={handleChange}
                  disabled={saving}
                  min="5"
                />
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
                  Eliminar servicio
                </button>
              </div>

              <div className="col-12 text-center">
                <button
                  type="button"
                  className="btn btn-link text-muted"
                  onClick={() => navigate("/adminservicios")}
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

export default AdminEditarServicio;

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const MyPerfilCliente = () => {
  const { store } = useGlobalReducer();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });
  const [id, setId] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    email: "",
  });

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: "", message: "" }), 2500);
  };

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  useEffect(() => {
    (async () => {
      try {

        const data = await fetch(`${store.backendUrl}/api/miperfil/cliente`, {
          headers: { Authorization: `Bearer ${store.token}` }
        });
        const res = await data.json()
        const u = res.user || res; // por si devuelves directo usuario
        setId(u.user_id)
        setForm({
          name: u.name || "",
          phone: u.phone || "",
          address: u.address || "",
          email: u.email || "",
        });
      } catch (e) {
        showAlert("danger", e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [store.backendUrl]);

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
        email: form.email,
      };

      await fetch(`${store.backendUrl}/api/miperfil/${id}/modify`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${store.token}`
        },
        body: JSON.stringify(payload),
      });
      showAlert("success", "Perfil actualizado.");
    } catch (e) {
      showAlert("danger", e.message);
    } finally {
      setSaving(false);
      navigate(-1)
    }
  };

  if (loading) return <div className="container py-5 text-center"><div className="spinner-border" /></div>;

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-7 col-xl-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h1 className="h4 fw-bold mb-1">Mi perfil</h1>
              <p className="text-muted mb-4">Actualiza tus datos.</p>

              {alert.show && <div className={`alert alert-${alert.type} py-2`}>{alert.message}</div>}

              <form onSubmit={onSave} className="row g-3">
                <div className="col-12">
                  <label className="form-label">Nombre</label>
                  <input className="form-control" name="name" value={form.name} onChange={handleChange} />
                </div>
                <div className="col-md-12">
                  <label className="form-label">Email</label>
                  <input className="form-control" name="email" value={form.email} onChange={handleChange} />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Teléfono</label>
                  <input className="form-control" name="phone" value={form.phone} onChange={handleChange} />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Dirección</label>
                  <input className="form-control" name="address" value={form.address} onChange={handleChange} />
                </div>




                <div className="col-12 d-grid mt-2">
                  <button className="btn btn-dark" disabled={saving}>
                    {saving ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>

                <div className="col-12 text-center">
                  <button
                    type="button"
                    className="btn btn-link text-muted"
                    onClick={() => navigate("/dashboard")}
                  >
                    ← Volver
                  </button>
                </div>              </form>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPerfilCliente;

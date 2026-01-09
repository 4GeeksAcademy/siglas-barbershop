import { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

const MyPerfilCliente = () => {
  const { store } = useGlobalReducer();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    photo_url: "",
    bio: "",
    specialties: "",
  });

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: "", message: "" }), 2500);
  };

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  console.log("cono akika el token", store.token)

  useEffect(() => {
    (async () => {
      try {
        // RECOMENDADO: /api/me
        const data = await fetch(`${store.backendUrl}/api/me`, {
          headers: { Authorization: `Bearer ${store.token}` }
      } );
    const res = await data.json()      
     const u = res.user || res; // por si devuelves directo usuario
     console.log("data",res.user)
        setForm({
          name: u.name || "",
          phone: u.phone || "",
          address: u.address || "",
          photo_url: u.photo_url || "",
          bio: u.bio || "",
          specialties: u.specialties || "",
        });
      } catch (e) {
        showAlert("danger", e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [store.backendUrl]);

  const role = store.user?.role || store.role; // según cómo guardes
  const isBarber = role === "barbero";

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // cliente: no necesita specialties
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
        photo_url: form.photo_url.trim() || null,
        bio: form.bio.trim() || null,
      };

      if (isBarber) payload.specialties = form.specialties.trim() || null;

      await apiFetch(`${store.backendUrl}/api/me`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      showAlert("success", "Perfil actualizado.");
    } catch (e) {
      showAlert("danger", e.message);
    } finally {
      setSaving(false);
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

                <div className="col-md-6">
                  <label className="form-label">Teléfono</label>
                  <input className="form-control" name="phone" value={form.phone} onChange={handleChange} />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Dirección</label>
                  <input className="form-control" name="address" value={form.address} onChange={handleChange} />
                </div>

                {isBarber && (
                  <div className="col-12">
                    <label className="form-label">Especialidades</label>
                    <input className="form-control" name="specialties" value={form.specialties} onChange={handleChange} placeholder="Fade, barba, diseño..." />
                    <div className="form-text">Solo barberos.</div>
                  </div>
                )}

                <div className="col-12">
                  <label className="form-label">Foto (URL)</label>
                  <input className="form-control" name="photo_url" value={form.photo_url} onChange={handleChange} placeholder="https://..." />
                </div>

                <div className="col-12">
                  <label className="form-label">Bio</label>
                  <textarea className="form-control" name="bio" rows="3" value={form.bio} onChange={handleChange} />
                </div>

                <div className="col-12 d-grid mt-2">
                  <button className="btn btn-dark" disabled={saving}>
                    {saving ? "Guardando..." : "Guardar cambios"}
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

export default MyPerfilCliente;

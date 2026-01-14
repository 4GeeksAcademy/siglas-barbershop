import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminCrearServicio = () => {
    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, type: "", message: "" });

    const [formData, setFormData] = useState({
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const err = validate();
        if (err) return showAlertMsg("danger", err);

        setLoading(true);
        try {
            const payload = {
                name: formData.name.trim(),
                price: Number(formData.price),
                duration_minutes: Number(formData.duration_minutes),
            };

            const res = await fetch(`${backendUrl}/api/services`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...authHeaders(),
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!data.ok) {
                return showAlertMsg("danger", data?.message || "Error al crear servicio.");
            }

            showAlertMsg("success", "Servicio creado correctamente.");
            setTimeout(() => navigate("/adminservicios", { replace: true }), 900);
        } catch {
            showAlertMsg("danger", "Error de conexión con el servidor.");
        } finally {
            setLoading(false);
        }
    };

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
                        <h4 className="fw-bold mb-1">Admin · Crear Servicio</h4>
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
                                    disabled={loading}
                                    placeholder="Corte clásico, Barba..."
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">Precio</label>
                                <input
                                    className="form-control"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    disabled={loading}
                                    placeholder="Ej: 15.00"
                                    inputMode="decimal"
                                />
                                <div className="form-text">Guarda con 2 decimales (Numeric 10,2).</div>
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">Duración (min)</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="duration_minutes"
                                    value={formData.duration_minutes}
                                    onChange={handleChange}
                                    disabled={loading}
                                    min="5"
                                />
                            </div>

                            <div className="col-12 d-grid mt-3">
                                <button className="btn btn-dark" disabled={loading}>
                                    {loading ? "Creando..." : "Crear servicio"}
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

export default AdminCrearServicio;

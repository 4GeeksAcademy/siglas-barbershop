import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const AdminServicios = () => {
  const { store, dispatch } = useGlobalReducer();
      const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState({ show: false, type: "", message: "" });

    const showAlertMsg = (type, message) => {
        setAlert({ show: true, type, message });
        setTimeout(() => setAlert({ show: false, type: "", message: "" }), 3000);
    };

    const authHeaders = () => {
        const token = localStorage.getItem("access_token");
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const loadServicios = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${backendUrl}/api/services`);
            const data = await res.json();

            if (!data.ok) {
                showAlertMsg("danger", data?.message || "Error cargando servicios.");
                setServicios([]);
                return;
            }

            setServicios(data.data || []);
        } catch {
            showAlertMsg("danger", "Error de conexión con el servidor.");
            setServicios([]);
        } finally {
            setLoading(false);
        }
    };

    const deleteServicio = async (service_id) => {
        const ok = confirm("¿Seguro que deseas eliminar este servicio?");
        if (!ok) return;

        try {
            const res = await fetch(`${backendUrl}/api/services/${service_id}`, {
                method: "DELETE",
                headers: {
                    ...authHeaders(),
                },
            });
            const data = await res.json();

            if (!data.ok) {
                return showAlertMsg("danger", data?.message || "No se pudo eliminar.");
            }

            showAlertMsg("success", "Servicio eliminado.");
            loadServicios();
        } catch {
            showAlertMsg("danger", "Error de conexión con el servidor.");
        }
    };

    const money = (v) => {
        const n = Number(v ?? 0);
        return isNaN(n) ? v : n.toFixed(2);
    };

    useEffect(() => {
        if(store.is_admin!=true) navigate("/login")
        loadServicios();
    }, []);

    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100 py-5">
            <div className="col-12 col-md-11 col-lg-10 col-xl-9">
                <div
                    className="card border-0 shadow-lg"
                    style={{
                        background: "rgba(255,255,255,0.93)",
                        backdropFilter: "blur(6px)",
                        WebkitBackdropFilter: "blur(6px)",
                    }}
                >
                    <div className="card-header bg-white py-4 border-0">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
                            <div className="text-center text-md-start">
                                <h4 className="fw-bold mb-1">Admin · Servicios</h4>
                                <p className="text-muted small mb-0">
                                    Lista, edita y elimina servicios del sistema
                                </p>
                            </div>

                            <div className="d-flex gap-2 justify-content-center justify-content-md-end">
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={loadServicios}
                                    disabled={loading}
                                >
                                    {loading ? "Actualizando..." : "Actualizar"}
                                </button>

                                <button
                                    className="btn btn-dark"
                                    onClick={() => navigate("/admin/servicios")}
                                    disabled={loading}
                                >
                                    + Crear servicio
                                </button>
                            </div>
                        </div>
                    </div>

                    {alert.show && (
                        <div className={`alert alert-${alert.type} rounded-0 mb-0`}>
                            {alert.message}
                        </div>
                    )}

                    <div className="card-body p-4">
                        {loading ? (
                            <div className="text-center py-4">
                                <div className="spinner-border" role="status" />
                                <div className="mt-2 text-muted">Cargando servicios...</div>
                            </div>
                        ) : servicios.length === 0 ? (
                            <div className="text-center py-4 text-muted">
                                No hay servicios registrados.
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-striped align-middle mb-0">
                                    <thead>
                                        <tr>
                                            <th>Servicio</th>
                                            <th>Precio</th>
                                            <th className="d-none d-md-table-cell">Duración</th>
                                            <th className="text-end">Acciones</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {servicios.map((s) => (
                                            <tr key={s.service_id}>
                                                <td>
                                                    <div className="fw-semibold">{s.name}</div>
                                                    <div className="small text-muted d-md-none">
                                                        {s.duration_minutes} min
                                                    </div>
                                                </td>

                                                <td>${money(s.price)}</td>

                                                <td className="d-none d-md-table-cell">
                                                    {s.duration_minutes} min
                                                </td>

                                                <td className="text-end">
                                                    <div className="d-flex justify-content-end gap-2 flex-wrap">
                                                        <button
                                                            className="btn btn-sm btn-outline-primary"
                                                            onClick={() =>
                                                                navigate(`/admin/servicios/${s.service_id}`)
                                                            }
                                                        >
                                                            Editar
                                                        </button>

                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => deleteServicio(s.service_id)}
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="text-center mt-4">
                            <button
                                type="button"
                                className="btn btn-link text-muted"
                                onClick={() => navigate("/admindashboard")}
                            >
                                ← Volver
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminServicios;

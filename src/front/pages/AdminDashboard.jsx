import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

function parseJwt(token) {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
}

export default function AdminDashboard() {
    const { store } = useGlobalReducer();
    const navigate = useNavigate();

    const token = store.token;
    const backendUrl = store.backendUrl;

    const claims = useMemo(() => (token ? parseJwt(token) : null), [token]);
    const role = claims?.sub ? (claims?.role || store.role) : store.role;
    const isAdmin = Boolean(claims?.is_admin) || role === "admin" || store.is_admin === true;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [appointments, setAppointments] = useState([]);
    const [salesToday, setSalesToday] = useState({ total: 0, count: 0, date: "", payments: [] });
    const [recentPayments, setRecentPayments] = useState([]);

    const urlAdminAppointments = `${backendUrl}/api/admin/appointments`;
    const urlSalesToday = `${backendUrl}/api/admin/sales/today`;
    const urlRecentPayments = `${backendUrl}/api/admin/payments/recent?limit=8`;

    useEffect(() => {
        if (!token) {
            navigate("/login", { replace: true });
            return;
        }
        if (!isAdmin) {
            navigate("/dashboard", { replace: true });
            return;
        }
    }, [token, isAdmin, navigate]);

    const loadAll = async () => {
        setError("");
        setLoading(true);
        try {
            // 1) appointments
            try {
                const res = await fetch(urlAdminAppointments, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (!res.ok || data.ok === false) {
                    setAppointments([]);
                    setError(data.message || "No se pudieron cargar las reservas.");
                } else {
                    setAppointments(data.data || []);
                }
            } catch {
                setAppointments([]);
                setError("Error de red cargando reservas.");
            }

            // 2) sales today
            try {
                const res = await fetch(urlSalesToday, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (res.ok && data.ok) setSalesToday(data.data);
            } catch (e) {
                console.log("verificar el error", e, e.message)
                // no bloquea el dashboard
            }

            // 3) recent payments
            try {
                const res = await fetch(urlRecentPayments, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (res.ok && data.ok) setRecentPayments(data.data || []);
            } catch {
                // no bloquea
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token && isAdmin) loadAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, isAdmin]);

    const stats = useMemo(() => {
        const total = appointments.length;
        const pendientes = appointments.filter((a) => a.status === "pendiente").length;
        const confirmadas = appointments.filter((a) => a.status === "confirmada").length;
        const completadas = appointments.filter((a) => a.status === "completada").length;
        const canceladas = appointments.filter((a) => a.status === "cancelada").length;
        return { total, pendientes, confirmadas, completadas, canceladas };
    }, [appointments]);

    const lastAppointments = useMemo(() => {
        return [...appointments]
            .sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date))
            .slice(0, 10);
    }, [appointments]);

    return (
        <div className="container py-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <div>
                    <h1 className="h4 fw-bold mb-1">Admin Dashboard</h1>
                    <div className="text-muted">
                        Acceso: <span className="fw-semibold">Administrador</span>
                    </div>
                </div>

                <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-dark" onClick={loadAll} disabled={loading}>
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Actualizando...
                            </>
                        ) : (
                            "Refrescar"
                        )}
                    </button>

                    <Link to="/logout" className="btn btn-outline-dark">
                        Salir
                    </Link>
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {/* KPIs */}
            <div className="row g-3 mb-3">
                <StatCard title="Total reservas" value={stats.total} />
                <StatCard title="Ventas hoy" value={`$ ${Number(salesToday.total || 0).toFixed(2)}`} />
                <StatCard title="Pagos hoy" value={salesToday.count || 0} />
            </div>

            <div className="row g-3 mb-4">
                <StatCard title="Pendientes" value={stats.pendientes} />
                <StatCard title="Confirmadas" value={stats.confirmadas} />
                <StatCard title="Completadas" value={stats.completadas} />
            </div>

            {/* Accesos rápidos */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                    <h2 className="h6 fw-bold mb-3">Accesos rápidos</h2>
                    <div className="d-flex flex-wrap gap-2">
                        <Link to="/adminusuarios" className="btn btn-dark">
                            Usuarios
                        </Link>
                        <Link to="/adminservicios" className="btn btn-outline-dark">
                            Servicios
                        </Link>
                        <Link to="/procesarpagos" className="btn btn-outline-dark">
                            Procesar pagos
                        </Link>
                    </div>
                    <div className="text-muted small mt-2">
                        aca falta  “Inventario” , “Comisiones por barbero” cuando tengas pagos + completadas., otras funciones
                    </div>
                </div>
            </div>

            <div className="row g-3">
                {/* Últimas reservas */}
                <div className="col-12 col-lg-8">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-4">
                            <h2 className="h6 fw-bold mb-3">Últimas reservas</h2>

                            {loading ? (
                                <div className="text-muted">
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Cargando...
                                </div>
                            ) : lastAppointments.length === 0 ? (
                                <div className="text-muted">No hay reservas.</div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table align-middle">
                                        <thead>
                                            <tr>
                                                <th>Fecha</th>
                                                <th>Servicio</th>
                                                <th>Cliente</th>
                                                <th>Barbero</th>
                                                <th>Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {lastAppointments.map((a) => (
                                                <tr key={a.appointment_id}>
                                                    <td>{formatDateTime(a.appointment_date)}</td>
                                                    <td>{a.service?.name || "-"}</td>
                                                    <td>{a.client?.name || "-"}</td>
                                                    <td>{a.barber?.name || "-"}</td>
                                                    <td>
                                                        <StatusBadge status={a.status} />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Pagos recientes */}
                <div className="col-12 col-lg-4">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body p-4">
                            <h2 className="h6 fw-bold mb-3">Pagos recientes</h2>

                            {recentPayments.length === 0 ? (
                                <div className="text-muted small">Aún no hay pagos registrados.</div>
                            ) : (
                                <div className="d-grid gap-2">
                                    {recentPayments.map((p) => (
                                        <div key={p.payment_id} className="border rounded-3 p-2">
                                            <div className="d-flex justify-content-between">
                                                <div className="fw-semibold">$ {Number(p.amount).toFixed(2)}</div>
                                                <span className="badge text-bg-secondary">{p.method}</span>
                                            </div>
                                            <div className="text-muted small">
                                                #{p.appointment_id} · {p.created_by_name || "—"}
                                            </div>
                                            <div className="text-muted small">{formatDateTime(p.paid_at)}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="mt-3">
                                <Link className="btn btn-sm btn-outline-dark" to="/admin/payments">
                                    Ver todos los pagos
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* --- UI helpers --- */
function StatCard({ title, value }) {
    return (
        <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                    <div className="text-muted small">{title}</div>
                    <div className="h3 fw-bold mb-0">{value}</div>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const map = {
        pendiente: "text-bg-warning",
        confirmada: "text-bg-primary",
        completada: "text-bg-success",
        cancelada: "text-bg-danger",
    };
    const cls = map[status] || "text-bg-secondary";
    return <span className={`badge ${cls}`}>{status}</span>;
}

function formatDateTime(dt) {
    if (!dt) return "-";
    return String(dt).replace("T", " ").slice(0, 16);
}

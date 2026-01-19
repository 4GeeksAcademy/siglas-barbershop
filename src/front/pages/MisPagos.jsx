import React, { useEffect, useState } from "react";

export default function MisPagos() {
    const [data, setData] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError("");
            try {
                const token = localStorage.getItem("access_token");
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/payments/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const json = await res.json();
                if (!res.ok || !json.ok) throw new Error(json.message || "No se pudieron cargar pagos");
                setData(json.data || []);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <div className="container py-4">
            <h1 className="h4 mb-3">Mis pagos</h1>

            {loading && <div className="alert alert-info">Cargando...</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            {!loading && !error && data.length === 0 && (
                <div className="alert alert-warning">Aún no tienes pagos registrados.</div>
            )}

            {!loading && !error && data.length > 0 && (
                <div className="table-responsive">
                    <table className="table table-sm align-middle">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Fecha</th>
                                <th>Monto</th>
                                <th>Método</th>
                                <th>Estado</th>
                                <th>Cita</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(p => (
                                <tr key={p.payment_id}>
                                    <td>{p.payment_id}</td>
                                    <td>{p.paid_at ? new Date(p.paid_at).toLocaleString() : "-"}</td>
                                    <td>${Number(p.amount).toFixed(2)}</td>
                                    <td>{p.method}</td>
                                    <td>
                                        <span className={`badge ${p.status === "pagado" ? "text-bg-success" : "text-bg-secondary"}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td>{p.appointment_id ?? "—"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

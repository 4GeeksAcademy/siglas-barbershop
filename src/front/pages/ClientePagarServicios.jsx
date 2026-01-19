import React, { useEffect, useState } from "react";
import PayDirectServiceButton from "../components/PayDirectServiceButton";

export default function ClientePagarServicios() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/services`);
        const data = await res.json();

        if (!res.ok || !data.ok) throw new Error(data.message || "No se pudieron cargar servicios");
        setServices(data.data || []);
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
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h1 className="h4 mb-0">Pagar servicios</h1>
        <span className="badge text-bg-secondary">Pago directo</span>
      </div>

      {loading && <div className="alert alert-info">Cargando servicios...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && services.length === 0 && (
        <div className="alert alert-warning">No hay servicios disponibles.</div>
      )}

      <div className="row g-3">
        {services.map((s) => (
          <div key={s.service_id} className="col-12 col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-1">{s.name}</h5>
                <p className="text-muted mb-2">
                  Duración: {s.duration_minutes} min
                </p>
                <div className="d-flex align-items-center justify-content-between">
                  <strong>${Number(s.price).toFixed(2)}</strong>
                  <PayDirectServiceButton serviceId={s.service_id} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

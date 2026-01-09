import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export default function Dashboard() {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  const token = store.token || localStorage.getItem("access_token");
  const role = store.role || JSON.parse(localStorage.getItem("role") || "null");
  //const backendUrl = store.backendUrl || import.meta.env.VITE_BACKEND_URL;

  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");

  // ✅ Ajusta a tus rutas reales:
  // Cliente: mis citas
  const urlMine = `${store.backendUrl}/api/appointments/mine`;
  // Barbero: mis citas como barbero (si no la tienes aún, dime cuál es o la creamos)
  const urlBarberMine = `${store.backendUrl}/api/appointments/mine`;

  useEffect(() => {
    if (!token) navigate("/login", { replace: true });
  }, [token, navigate]);

  const loadAppointments = async () => {
    setError("");
    setLoading(true);

    try {
      const url = role === "barbero" ? urlBarberMine : urlMine;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        setAppointments([]);
        setError(data.message || "No se pudieron cargar las citas.");
        return;
      }

      setAppointments(data.data || []);
    } catch {
      setError("Error de red cargando citas.");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && role) loadAppointments();
    // eslint-disable-next-line
  }, [token, role]);

  // --- Acciones (cliente) ---
  const cancelAppointment = async (appointment_id) => {
    // ✅ si tienes una ruta para cancelar, ponla aquí
    // Ejemplo: PUT /api/appointments/<id>/cancel
    const url = `${store.backendUrl}/api/appointments/${appointment_id}/cancel`;

    try {
      setLoading(true);
      const res = await fetch(url, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "No se pudo cancelar.");
        return;
      }
      await loadAppointments();
    } catch {
      setError("Error de red cancelando la cita.");
    } finally {
      setLoading(false);
    }
  };

  // --- Acciones (barbero/admin) ---
  const confirmDisabledReason = "Acción pendiente (endpoint no implementado aún)";

  const titleByRole = useMemo(() => {
    if (role === "admin") return "Dashboard Admin";
    if (role === "barbero") return "Dashboard Barbero";
    return "Dashboard Cliente";
  }, [role]);

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h1 className="h4 fw-bold mb-1">{titleByRole}</h1>
          <div className="text-muted">
            Rol: <span className="fw-semibold">{role || "—"}</span>
          </div>
        </div>

        <div className="d-flex gap-2">
          <Link to="/book" className="btn btn-dark">
            Agendar cita
          </Link>
          <Link to="/logout" className="btn btn-outline-dark">
            Salir
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Quick stats */}
      <div className="row g-3 mb-3">
        <StatCard title="Total" value={appointments.length} />
        <StatCard
          title="Pendientes"
          value={appointments.filter((a) => a.status === "pendiente").length}
        />
        <StatCard
          title="Confirmadas"
          value={appointments.filter((a) => a.status === "confirmada").length}
        />
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
            <h2 className="h6 fw-bold mb-0">
              {role === "barbero" ? "Citas asignadas" : "Mis citas"}
            </h2>
            <button
              className="btn btn-sm btn-outline-dark"
              onClick={loadAppointments}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Actualizando...
                </>
              ) : (
                "Refrescar"
              )}
            </button>
          </div>

          {loading ? (
            <div className="text-muted">
              <span className="spinner-border spinner-border-sm me-2"></span>
              Cargando...
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-muted">No hay citas para mostrar.</div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Servicio</th>
                    <th>{role === "barbero" ? "Cliente" : "Barbero"}</th>
                    <th>Estado</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((a) => (
                    <tr key={a.appointment_id}>
                      <td>{formatDateTime(a.appointment_date)}</td>
                      <td>{a.service?.name || a.service_name || "-"}</td>

                      <td>
                        {role === "barbero"
                          ? (a.client?.name || a.client_name || "-")
                          : (a.barber?.name || a.barber_name || "-")}
                      </td>

                      <td>
                        <StatusBadge status={a.status} />
                      </td>

                      <td className="text-end">
                        <div className="d-inline-flex gap-2">
                          {/* CLIENTE */}
                          {role === "cliente" && (
                            <>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                disabled={loading || a.status === "cancelada" || a.status === "completada"}
                                onClick={() => cancelAppointment(a.appointment_id)}
                              >
                                Cancelar
                              </button>

                              <button
                                className="btn btn-sm btn-outline-primary"
                                disabled
                                title="Luego hacemos la edición (ruta y página)"
                              >
                                Modificar
                              </button>
                            </>
                          )}

                          {/* BARBERO */}
                          {role === "barbero" && (
                            <>
                              <button
                                className="btn btn-sm btn-outline-success"
                                disabled
                                title={confirmDisabledReason}
                              >
                                Confirmar
                              </button>

                              <button
                                className="btn btn-sm btn-outline-secondary"
                                disabled
                                title="Endpoint pendiente"
                              >
                                Completar
                              </button>
                            </>
                          )}

                          {/* ADMIN */}
                          {role === "admin" && (
                            <>
                              <Link to="/admin/users" className="btn btn-sm btn-outline-dark">
                                Usuarios
                              </Link>
                              <Link to="/admin/services" className="btn btn-sm btn-outline-dark">
                                Servicios
                              </Link>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="text-muted small mt-2">
                * Si tu API devuelve campos con otros nombres, me dices el JSON exacto y lo adapto.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
  return dt.replace("T", " ").slice(0, 16);
}

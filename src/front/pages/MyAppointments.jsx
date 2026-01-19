import { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

export default function MyAppointments() {
  const { store, dispatch } = useGlobalReducer();

  const [busyId, setBusyId] = useState(null);
  const [msg, setMsg] = useState("");

  const loadMyAppointments = async () => {
    if (!store.token) return;
    try {
      const res = await fetch(`${store.backendUrl}/api/appointments/mine`, {
        headers: { Authorization: `Bearer ${store.token}` }
      });
      const data = await res.json();
      if (res.ok) dispatch({ type: "set_my_appointments", payload: data.data || [] });
    } catch {}
  };

  useEffect(() => {
    loadMyAppointments();
  }, []);

  const badgeClass = (status) => {
    if (status === "confirmada") return "text-bg-success";
    if (status === "pendiente") return "text-bg-warning";
    if (status === "cancelada") return "text-bg-secondary";
    if (status === "completada") return "text-bg-dark";
    return "text-bg-light";
  };

  const updateStatus = async (appointmentId, status) => {
    setMsg("");
    setBusyId(appointmentId);
    try {
      const res = await fetch(`${store.backendUrl}/api/appointments/${appointmentId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${store.token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.message || "No se pudo actualizar");
        setBusyId(null);
        return;
      }
      await loadMyAppointments();
    } catch {
      setMsg("Error de red");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-3">
        <div>
          <h1 className="h4 fw-bold mb-1">Mis citas</h1>
          <div className="text-muted">Gestiona el estado de tus citas.</div>
        </div>

        <button className="btn btn-outline-dark" onClick={loadMyAppointments}>
          Actualizar
        </button>
      </div>

      {msg && <div className="alert alert-danger py-2">{msg}</div>}

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th className="ps-3">Fecha</th>
                  <th>Servicio</th>
                  <th>Cliente</th>
                  <th>Barbero</th>
                  <th>Estado</th>
                  <th className="text-end pe-3">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {store.myAppointments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
                      No tienes citas todavía.
                    </td>
                  </tr>
                ) : (
                  store.myAppointments.map((a) => (
                    <tr key={a.appointment_id}>
                      <td className="ps-3">
                        <div className="fw-semibold">
                          {new Date(a.appointment_date).toLocaleDateString()}
                        </div>
                        <div className="text-muted small">
                          {new Date(a.appointment_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>

                      <td>
                        <div className="fw-semibold">{a.service?.name || "Servicio"}</div>
                        <div className="text-muted small">{a.service?.duration_minutes ? `${a.service.duration_minutes} min` : ""}</div>
                      </td>

                      <td className="text-muted">{a.client?.name || "-"}</td>
                      <td className="text-muted">{a.barber?.name || "-"}</td>

                      <td>
                        <span className={`badge ${badgeClass(a.status)}`}>{a.status}</span>
                      </td>

                      <td className="text-end pe-3">
                        <div className="d-inline-flex gap-2 flex-wrap justify-content-end">
                          {/* Cliente normalmente solo puede cancelar. Barbero/admin confirm/completar */}
                          <button
                            className="btn btn-sm btn-outline-danger"
                            disabled={busyId === a.appointment_id || a.status === "cancelada" || a.status === "completada"}
                            onClick={() => updateStatus(a.appointment_id, "cancelada")}
                          >
                            {busyId === a.appointment_id ? (
                              <span className="spinner-border spinner-border-sm"></span>
                            ) : (
                              "Cancelar"
                            )}
                          </button>

                          <button
                            className="btn btn-sm btn-outline-success"
                            disabled={busyId === a.appointment_id || a.status !== "pendiente"}
                            onClick={() => updateStatus(a.appointment_id, "confirmada")}
                          >
                            Confirmar
                          </button>

                          <button
                            className="btn btn-sm btn-outline-dark"
                            disabled={busyId === a.appointment_id || a.status !== "confirmada"}
                            onClick={() => updateStatus(a.appointment_id, "completada")}
                          >
                            Completar
                          </button>
                        </div>

 
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

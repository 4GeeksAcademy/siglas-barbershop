import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export default function Dashboard() {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  const token = store.token
  const role = store.role

  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  
  

  const urlMine = `${store.backendUrl}/api/appointments/mine`;
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
      if (!data.ok) {
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

  const loadHomeData = async () => {
    setError("");
    setLoading(true);
    try {
      const loadServices = async () => {
        try {
          const res = await fetch(`${store.backendUrl}/api/services`);
          const data = await res.json();
          setServices(data.data || []);

        } catch (e) {
          console.log("error", e);
        }
      };
      await loadServices();

      const loadBarbers = async () => {
        try {
          const res = await fetch(`${store.backendUrl}/api/barbers`, {
            headers: { Authorization: `Bearer ${store.token}` }
          });
          const data = await res.json();
          setBarbers(data.data || []);
        } catch (e) {
          console.log("error", e);
        }
      };
      await loadBarbers();
    } catch (e) {
      console.log("error", e);
      setError("No se pudo cargar la información.");
      setServices([]);
      setBarbers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (store.token) navigate("/dashboard")
    loadHomeData();
  }, []);




  useEffect(() => {
    if (token && role) loadAppointments();
  }, [token, role]);

  const cancelAppointment = async (appointment_id) => {
    console.log("appointment_id", appointment_id)
    const url = `${store.backendUrl}/api/appointments/${appointment_id}/delete`;
    console.log("url", url)

    try {
      setLoading(true);
      const res = await fetch(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "No se pudo cancelar.");
        return;
      }
      if (res.ok) console.log("no me llego res.ok")
      await loadAppointments();
    } catch (e) {
      setError("Error de red cancelando la cita.");
      //console.error("Fetch error details:", e.message, e.name, e.stack);      
    } finally {
      setLoading(false);
    }
  };

  const modificarAppointment = async (appointment_id) => {
    const url = `${store.backendUrl}/api/appointments/${appointment_id}/modificar`;
    try {
      setLoading(true);
      const res = await fetch(url, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "confirmada"
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "No se pudo confirmar.");
        return;
      }
      if (res.ok) console.log("no me llego res.ok")
      await loadAppointments();
    } catch (e) {
      setError("Error de red confirmando la cita...");
      //console.error("Fetch error details:", e.message, e.name, e.stack);      
    } finally {
      setLoading(false);
    }
  };
async function pagarCita(appointment_id) {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/stripe/checkout/appointment/${appointment_id}`, {
    method: "POST"
  });
  const data = await res.json();
  if (data.ok) window.location.href = data.checkout_url;
}


async function completarYCobrar(appointmentId) {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/appointments/${appointmentId}/complete-and-pay`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();
  if (data.ok) window.location.href = data.checkout_url;
}


async function pagarServicioDirecto(service_id) {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/stripe/checkout/direct`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ service_id })
  });
  const data = await res.json();
  if (data.ok) window.location.href = data.checkout_url;
}


  const initials = (name = "") => {
    const parts = name.trim().split(" ").filter(Boolean);
    const a = parts[0]?.[0] || "B";
    const b = parts[1]?.[0] || "";
    return (a + b).toUpperCase();
  };

  const BarberAvatar = ({ barber }) => {
    const url = barber?.photo_url;
    if (url) {
      return (
        <img
          src={url}
          alt={barber.name}
          className="rounded-circle border"
          style={{ width: 56, height: 56, objectFit: "cover" }}
        />
      );
    }

    return (
      <div
        className="rounded-circle border d-flex align-items-center justify-content-center fw-bold"
        style={{ width: 56, height: 56, background: "#f1f3f5" }}
        title="Sin foto"
      >
        {initials(barber?.name)}
      </div>
    );
  };



  const confirmDisabledReason = "Acción pendiente (endpoint no implementado aún)";


  return (
    <>
    <div className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h1 className="h4 fw-bold mb-1">Dashboard</h1>
          <div className="text-muted">
            Acceso: <span className="fw-semibold">{store.role || "—"}</span>
          </div>
        </div>

        <div className="d-flex gap-2">
         {role === "barbero"
           ? 
          <Link to="/procesarpagos" className="btn btn-dark">
            Procesar Pago
          </Link>
           :
          <Link to="/bookappointment" className="btn btn-dark">
            Agendar cita
          </Link>
         }
          <Link to="/logout" className="btn btn-outline-dark">
            Salir
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

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

      <div className="card border-0 shadow-sm">
        <div className="card-body p-4 ">
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
                                disabled={loading || a.status === "cancelada" || a.status === "completada" || a.status === "confirmada"}
                                title={confirmDisabledReason}
                                onClick={() => modificarAppointment(a.appointment_id)}
                              >
                                Confirmar
                              </button>

                              <button
                                className="btn btn-sm btn-outline-secondary"
                                title="Endpoint pendiente"
                                onClick={() => completarYCobrar(a.appointment_id)}
                              >
                                Completar
                              </button>

                            </>
                          )}

 
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
<Link to="/mis-pagos" className="btn btn-outline-dark">
  Mis pagos
</Link>
            </div>
          )}
        </div>
      </div>
    
      {role === "cliente" && 
      <div className="card border-0 shadow-sm mt-5">
        {barbers.length === 0 ? (
          <div className="text-muted">No hay barberos disponibles.</div>
        ) : (
          <div className="d-grid gap-2 mt-5">
            <h4 className="ps-4">Barberos</h4>
            {barbers.map((b) => {
              return (
                <button
                  key={b.user_id}
                  type="button"
                  className={`btn text-start p-3 border rounded-3 `}
                >
                  <div className="d-flex gap-3 align-items-center">
                    <BarberAvatar barber={b} />
                    <div className="flex-grow-1">
                      <div className="fw-semibold">{b.name}</div>
                      <div className="text-muted small">
                        {b.specialties ? b.specialties : "Barbero profesional"}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
      }
      {role === "cliente" && 
      <div className="card border-0 shadow-sm mt-5">
        {services.length === 0 ? (
          <div className="text-muted">No hay servicios.</div>
        ) : (

          <div className="table-responsive">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
              <h2 className="h6 fw-bold mb-0 ps-2 mt-3">
                {role === "barbero" ? "Citas asignadas" : "Servicios"}
              </h2>
            </div>
            <table className="table align-middle">
              <thead>
                <tr >
                  <th>Descripcion</th>
                  <th>Precio</th>
                  <th>Duracion</th>
                </tr>
              </thead>
              <tbody>
                {services.map((a) => (
                  <tr key={a.service_id}>
                    <td>{a.name}</td>
                    <td>{a.price}</td>

                    <td>
                      {a.duration_minutes}
                    </td>


                  </tr>
                ))}
              </tbody>
            </table>

          </div>
        )}
      </div>
}

    </div>
  </>
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

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export default function BookAppointment() {
  const todayStr = new Date().toISOString().slice(0, 10);

  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    barber_id: null,
    service_id: "",
    date: "",
    segment: "",  // morning | afternoon | evening
    time: ""      // "HH:MM"
  });

  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  // ---------- HELPERS ----------
  const pad2 = (n) => String(n).padStart(2, "0");
  const toMinutes = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };
  const toHHMM = (mins) => `${pad2(Math.floor(mins / 60))}:${pad2(mins % 60)}`;

  // Segmentos
  const SEGMENTS = {
    morning: { label: "Mañana", start: "09:00", end: "12:00" },
    afternoon: { label: "Tarde", start: "13:00", end: "17:00" },
    evening: { label: "Noche", start: "17:00", end: "20:00" }
  };

  const selectedService = useMemo(() => {
    return store.services.find(s => String(s.service_id) === String(form.service_id)) || null;
  }, [store.services, form.service_id]);

  const duration = selectedService?.duration_minutes ? Number(selectedService.duration_minutes) : 30;

  const isoString = useMemo(() => {
    if (!form.date || !form.time) return "";
    return `${form.date}T${form.time}:00`;
  }, [form.date, form.time]);

  const slots = useMemo(() => {
    if (!form.segment) return [];
    const seg = SEGMENTS[form.segment];
    if (!seg) return [];

    const start = toMinutes(seg.start);
    const end = toMinutes(seg.end);

    const result = [];
    for (let t = start; t + duration <= end; t += duration) {
      result.push(toHHMM(t));
    }
    return result;
  }, [form.segment, duration]);

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

  const loadServices = async () => {
    try {
      const res = await fetch(`${store.backendUrl}/api/services`);
      const data = await res.json();
      if (res.ok) dispatch({ type: "set_services", payload: data.data || [] });
    } catch { }
  };

  const loadBarbers = async () => {
    if (!store.token) return;
    try {
      const res = await fetch(`${store.backendUrl}/api/barbers`, {
        headers: { Authorization: `Bearer ${store.token}` }
      });
      const data = await res.json();
      if (res.ok) dispatch({ type: "set_barbers", payload: data.data || [] });
    } catch { }
  };

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    if (!store.token) return;
    loadBarbers();
  }, [store.token]);

  const selectBarber = (barberId) => {
    setForm(prev => ({
      ...prev,
      barber_id: barberId,
      segment: "",
      time: ""
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    if (!form.barber_id) return setMsg({ type: "danger", text: "Selecciona un barbero." });
    if (!form.service_id) return setMsg({ type: "danger", text: "Selecciona un servicio." });
    if (!form.date) return setMsg({ type: "danger", text: "Selecciona una fecha." });
    if (!form.segment) return setMsg({ type: "danger", text: "Selecciona un segmento (mañana/tarde/noche)." });
    if (!form.time) return setMsg({ type: "danger", text: "Selecciona un horario." });

    setSubmitting(true);
    try {
      const res = await fetch(`${store.backendUrl}/api/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${store.token}`
        },
        body: JSON.stringify({
          barber_id: Number(form.barber_id),
          service_id: Number(form.service_id),
          appointment_date: isoString
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setMsg({ type: "danger", text: data.message || "No se pudo crear la cita." });
        setSubmitting(false);
        return;
      }

      setMsg({ type: "success", text: "¡Cita creada! Queda en estado pendiente." });

      try {
        const r2 = await fetch(`${store.backendUrl}/api/appointments/mine`, {
          headers: { Authorization: `Bearer ${store.token}` }
        });
        const d2 = await r2.json();
        if (r2.ok) dispatch({ type: "set_my_appointments", payload: d2.data || [] });
      } catch { }

      setTimeout(() => navigate("/dashboard"), 900);
    } catch {
      setMsg({ type: "danger", text: "Error de red." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h1 className="h4 fw-bold mb-1">Agendar cita</h1>
        <div className="text-muted">Elige barbero, servicio y horario.</div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="h6 fw-bold mb-0">Barberos</h2>
                <span className="badge text-bg-dark">{store.barbers.length}</span>
              </div>

              {store.barbers.length === 0 ? (
                <div className="text-muted">No hay barberos disponibles.</div>
              ) : (
                <div className="d-grid gap-2">
                  {store.barbers.map((b) => {
                    const selected = String(form.barber_id) === String(b.user_id);
                    return (
                      <button
                        key={b.user_id}
                        type="button"
                        className={`btn text-start p-3 border rounded-3 ${selected ? "border-dark" : "border-light"} ${selected ? "bg-light" : "bg-white"}`}
                        onClick={() => selectBarber(b.user_id)}
                      >
                        <div className="d-flex gap-3 align-items-center">
                          <BarberAvatar barber={b} />
                          <div className="flex-grow-1">
                            <div className="fw-semibold">{b.name}</div>
                            <div className="text-muted small">
                              {b.specialties ? b.specialties : "Barbero profesional"}
                            </div>
                          </div>
                          {selected && <span className="badge text-bg-dark">Seleccionado</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              {msg.text && <div className={`alert alert-${msg.type} py-2`}>{msg.text}</div>}

              <form onSubmit={onSubmit} className="row g-3">
                <div className="col-12">
                  <label className="form-label">Servicio</label>
                  <select
                    className="form-select"
                    value={form.service_id}
                    onChange={(e) =>
                      setForm(prev => ({
                        ...prev,
                        service_id: e.target.value,
                        // si cambio servicio, recalculo slots => resetea hora
                        time: ""
                      }))
                    }
                    disabled={submitting}
                    required
                  >
                    <option value="">Selecciona un servicio...</option>
                    {store.services.map((s) => (
                      <option key={s.service_id} value={s.service_id}>
                        {s.name} - ${Number(s.price).toFixed(2)} ({s.duration_minutes} min)
                      </option>
                    ))}
                  </select>

                  {selectedService && (
                    <div className="text-muted small mt-1">
                      Duración seleccionada: <span className="fw-semibold">{duration} min</span>
                    </div>
                  )}
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">Fecha</label>
                  <input
                    type="date"
                    className="form-control"
                    min={todayStr}
                    value={form.date}
                    onChange={(e) =>
                      setForm(prev => ({
                        ...prev,
                        date: e.target.value,
                        time: "" // si cambia fecha, resetea hora
                      }))
                    }
                    disabled={submitting}
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">Segmento</label>
                  <select
                    className="form-select"
                    value={form.segment}
                    onChange={(e) =>
                      setForm(prev => ({
                        ...prev,
                        segment: e.target.value,
                        time: "" // al cambiar segmento, resetea hora
                      }))
                    }
                    disabled={submitting || !form.date}
                    required
                  >
                    <option value="">Elige (mañana/tarde/noche)...</option>
                    <option value="morning">Mañana</option>
                    <option value="afternoon">Tarde</option>
                    <option value="evening">Noche</option>
                  </select>

                  {!form.date && (
                    <div className="text-muted small mt-1">Primero elige una fecha.</div>
                  )}
                </div>

                <div className="col-12">
                  <label className="form-label">Horarios disponibles</label>

                  {!form.segment ? (
                    <div className="text-muted">Selecciona un segmento para ver horarios.</div>
                  ) : slots.length === 0 ? (
                    <div className="text-muted">No hay horarios para este segmento.</div>
                  ) : (
                    <div className="d-flex flex-wrap gap-2">
                      {slots.map((t) => {
                        const active = form.time === t;
                        return (
                          <button
                            type="button"
                            key={t}
                            className={`btn btn-sm ${active ? "btn-dark" : "btn-outline-dark"}`}
                            onClick={() => setForm(prev => ({ ...prev, time: t }))}
                            disabled={submitting}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {form.time && (
                    <div className="text-muted small mt-2">
                      Seleccionado: <span className="fw-semibold">{form.date} {form.time}</span>
                    </div>
                  )}
                </div>

                <div className="col-12 d-flex gap-2 flex-wrap">
                  <button className="btn btn-dark" type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Creando...
                      </>
                    ) : (
                      "Crear cita"
                    )}
                  </button>

                  <button
                    className="btn btn-outline-dark"
                    type="button"
                    disabled={submitting}
                    onClick={() => navigate("/dashboard")}
                  >
                    Volver
                  </button>
                </div>

                {isoString && (
                  <div className="col-12 text-muted small">
                    Se enviará como: <span className="fw-semibold">{isoString}</span>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

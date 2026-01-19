import React, { useState } from "react";

export default function PayAppointmentButton({ appointmentId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pay = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}api/stripe/checkout/appointment/${appointmentId}`,
        { method: "POST" }
      );
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || "No se pudo iniciar el pago");
      window.location.href = data.checkout_url;
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="btn btn-dark" onClick={pay} disabled={loading}>
        {loading ? "Redirigiendo..." : "Pagar con Stripe"}
      </button>
      {error && <div className="alert alert-danger mt-2 mb-0">{error}</div>}
    </>
  );
}

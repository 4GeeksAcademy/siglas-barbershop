import React, { useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

export default function PayDirectServiceButton({ serviceId, className = "btn btn-dark" }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { store } = useGlobalReducer();

    const pay = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/stripe/checkout/direct`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${store.token}`, // clave para quitar el 401
                },
                body: JSON.stringify({ service_id: serviceId })
            });

            const data = await res.json();
            if (!res.ok || !data.ok) throw new Error(data.error || "No se pudo iniciar el pago");

            window.location.href = data.checkout_url; // Stripe Checkout
        } catch (e) {
            setError(e.message, e.err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button className={className} onClick={pay} disabled={loading}>
                {loading ? "Redirigiendo..." : "Pagar servicio"}
            </button>
            {error && <div className="alert alert-danger mt-2 mb-0">{error}</div>}
        </>
    );
}

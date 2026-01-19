import React from "react";
import { Link, useSearchParams } from "react-router-dom";

export default function PagoExitoso() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");

  return (
    <div className="container py-5">
      <h1 className="h3">✅ Pago exitoso</h1>
      <p className="text-muted">
        Tu pago fue procesado. (session_id: {sessionId})
      </p>
      <Link to="/admindashboard" className="btn btn-dark">Retornar</Link>
    </div>
  );
}

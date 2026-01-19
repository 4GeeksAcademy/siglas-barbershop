import React from "react";
import { Link } from "react-router-dom";

export default function PagoCancelado() {
  return (
    <div className="container py-5">
      <h1 className="h3">⚠️ Pago cancelado</h1>
      <p className="text-muted">No se realizó el cobro. Puedes intentarlo nuevamente.</p>
      <Link to="/dashboard" className="btn btn-outline-dark">Volver</Link>
    </div>
  );
}

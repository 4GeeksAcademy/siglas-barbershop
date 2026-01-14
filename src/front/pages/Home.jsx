import React, { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";

export const Home = () => {
  const { store, dispatch } = useGlobalReducer();
  const [error, setError] = useState("");
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate()
  // Horarios hardcoded
  const schedules = {
    morning: ["9:00 AM - 10:00 AM", "10:00 AM - 11:00 AM", "11:00 AM - 12:00 PM"],
    afternoon: ["1:00 PM - 2:00 PM", "2:00 PM - 3:00 PM", "3:00 PM - 4:00 PM", "4:00 PM - 5:00 PM"],
    night: ["6:00 PM - 7:00 PM", "7:00 PM - 8:00 PM"]
  };

  // Información de la barbería hardcoded
  const shopInfo = {
    address: "Calle Principal 123, Ciudad Ejemplo",
    phone: "+1 234 567 890",
    email: "info@barberiaejemplo.com",
    openingHours: "Lunes a Viernes: 9:00 AM - 8:00 PM\nSábados: 10:00 AM - 6:00 PM\nDomingos: Cerrado",
    additionalInfo: "Estacionamiento disponible, WiFi gratis, aceptamos tarjetas de crédito."
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
    if (store.token) {
      if (store.is_admin) {
        navigate("/admindashboard")
      } else {
        navigate("/dashboard")
      }
    }
    loadHomeData();
  }, []);

  return (
    <>
      <main className="container my-5">
        {loading ? (
          <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        ) : (
          <>
            {error && <div className="alert alert-danger text-center">{error}</div>}

            {/* Sección Hero */}
            <div className="row justify-content-center mb-5">
              <div className="col-md-10 col-lg-8">
                <div className="card shadow text-center">
                  <div className="card-body p-5">
                    <h1 className="fw-bold mb-3">Sistema de Gestión para Barberías</h1>
                    <p className="text-muted mb-4">
                      Administra citas, barberos, clientes y servicios desde una sola plataforma.
                    </p>
                    <div className="d-flex justify-content-center gap-3 flex-wrap">
                      <a href="/login" className="btn btn-dark px-4">Iniciar sesión</a>
                      <a href="/registrarse" className="btn btn-outline-dark px-4">Crear cuenta</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Secciones Principales */}
            <div className="row g-4">
              {/* Sección Servicios */}
              <div className="col-md-6 col-lg-4">
                <div className="card shadow h-100">
                  <div className="card-header bg-light">
                    <h5 className="mb-0">Servicios Disponibles</h5>
                  </div>
                  <div className="card-body">
                    {services.length === 0 ? (
                      <p className="text-center text-muted">No hay servicios disponibles.</p>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-striped table-bordered table-hover">
                          <thead>
                            <tr>
                              <th>Servicio</th>
                              <th>Precio</th>
                            </tr>
                          </thead>
                          <tbody>
                            {services.map((service) => (
                              <tr key={service.service_id}>
                                <td>{service.name}</td>
                                <td>{service.price}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sección Barberos */}
              <div className="col-md-6 col-lg-4">
                <div className="card shadow h-100">
                  <div className="card-header bg-light">
                    <h5 className="mb-0">Barberos</h5>
                  </div>
                  <div className="card-body">
                    {barbers.length === 0 ? (
                      <p className="text-center text-muted">No hay barberos disponibles.</p>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-striped table-bordered table-hover">
                          <thead>
                            <tr>
                              <th>Barbero</th>
                            </tr>
                          </thead>
                          <tbody>
                            {barbers.map((barber) => (
                              <tr key={barber.user_id}>
                                <td>{barber.name}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sección Horarios */}
              <div className="col-md-6 col-lg-4">
                <div className="card shadow h-100">
                  <div className="card-header bg-light">
                    <h5 className="mb-0">Horarios Disponibles</h5>
                  </div>
                  <div className="card-body">
                    <ul className="list-group list-group-flush">
                      <li className="list-group-item">
                        <strong>Mañana:</strong> {schedules.morning.length > 0 ? schedules.morning.join(', ') : 'No disponibles'}
                      </li>
                      <li className="list-group-item">
                        <strong>Tarde:</strong> {schedules.afternoon.length > 0 ? schedules.afternoon.join(', ') : 'No disponibles'}
                      </li>
                      <li className="list-group-item">
                        <strong>Noche:</strong> {schedules.night.length > 0 ? schedules.night.join(', ') : 'No disponibles'}
                      </li>
                    </ul>
                    <small className="text-muted">Horarios sujetos a disponibilidad. Reserva tu cita para confirmar.</small>
                  </div>
                </div>
              </div>

              {/* Sección Información de la Barbería */}
              <div className="col-md-6 col-lg-12">
                <div className="card shadow">
                  <div className="card-header bg-light">
                    <h5 className="mb-0">Información de la Barbería</h5>
                  </div>
                  <div className="card-body">
                    <p><strong>Dirección:</strong> {shopInfo.address}</p>
                    <p><strong>Teléfono:</strong> {shopInfo.phone}</p>
                    <p><strong>Email:</strong> {shopInfo.email}</p>
                    <p><strong>Horario de Apertura:</strong><br />{shopInfo.openingHours}</p>
                    <p className="text-muted">{shopInfo.additionalInfo}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
};
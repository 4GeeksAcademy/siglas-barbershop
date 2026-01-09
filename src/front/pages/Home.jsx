import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Home = () => {
  const { store } = useGlobalReducer();
  const token = store.token;
  //const backendUrl = store.backendUrl || import.meta.env.VITE_BACKEND_URL;

  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const loadHomeData = async () => {
    setError("");
    setLoading(true);
    try {
      // Ajusta estas rutas a las tuyas reales:
      const servicesUrl = `${store.backendUrl}/api/services`;
      const barbersUrl = `${store.backendUrl}/api/barbers`; // o `${backendUrl}/api/usuarios?role=barbero`

      const [resS, resB] = await Promise.all([
        fetch(servicesUrl),
        fetch(barbersUrl),
      ]);

      const dataS = await resS.json();
      const dataB = await resB.json();

      if (resS.ok) setServices(dataS.data || []);
      else setServices([]);

      if (resB.ok) setBarbers(dataB.data || []);
      else setBarbers([]);

    } catch (e) {
      setError("No se pudo cargar la información. Revisa tu backend.");
      setServices([]);
      setBarbers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHomeData();
    // eslint-disable-next-line
  }, []);

  return (
    <>
 <main className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-10 col-lg-8">
          <div className="bg-white rounded shadow p-5 text-center">
            <h1 className="fw-bold mb-3">Sistema de Gestión para Barberías</h1>
            <p className="text-muted mb-4">
              Administra citas, barberos, clientes y servicios desde una sola
              plataforma.
            </p>

            <div className="d-flex justify-content-center gap-3 flex-wrap">
              <a href="/login" className="btn btn-dark px-4">
                Iniciar sesión
              </a>
              <a href="/registrarse" className="btn btn-outline-dark px-4">
                Crear cuenta
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>    </>
  );
};

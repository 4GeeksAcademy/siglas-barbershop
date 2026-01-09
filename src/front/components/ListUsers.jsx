import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ListUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {

    const users = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("No autorizado, token no encontrado");
        setLoading(false);
        return;
      }     
      try {
      const response = await fetch("https://bug-free-goggles-5gpg7pwgjqwrf4vpq-3001.app.github.dev/api/users",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, 
          },
        })
      const data = await response.json()
      if (!data.ok) {
          setError(data.message || "Error al obtener usuarios");
          setLoading(false);
          return;
      }
      setUsers(data.users);      
   } catch (err) {
        setError("Error de conexión con el servidor");
      } finally {
        setLoading(false);
      } 

    }
    users()
    return () => {
    };
  }, []);

  return (
<div className="container mt-4">
  <div className="d-flex justify-content-between align-items-center mb-3">
  <h3>Lista de usuarios</h3>
  <button
    className="btn btn-secondary"
    onClick={() => navigate(-1)}
  >
    ← Volver
  </button>
</div>

      {loading && (
        <div className="text-center">
          <div className="spinner-border"></div>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Nombre</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center">
                    No hay usuarios
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.user_id}>
                    <td>{user.user_id}</td>
                    <td>{user.email}</td>
                    <td>{user.name}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
      )
}

export default ListUsers

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
const AdminUsuarios = () => {
    const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });

  const showAlertMsg = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: "", message: "" }), 3000);
  };

  const authHeaders = () => {
    const token = localStorage.getItem("access_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const loadUsuarios = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/usuarios`);
      const data = await res.json();

      if (!data.ok) {
        showAlertMsg("danger", data?.message || "Error cargando usuarios.");
        setUsuarios([]);
        return;
      }

      setUsuarios(data.data || []);
    } catch {
      showAlertMsg("danger", "Error de conexión con el servidor.");
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteUsuario = async (id) => {
    const ok = confirm("¿Seguro que deseas eliminar este usuario?");
    if (!ok) return;

    try {
      console.log("id",id)
      const res = await fetch(`${backendUrl}/api/admin/user/${id}`, {
        method: "DELETE",
        headers: {
          ...authHeaders(),
        },
      });
      const data = await res.json();

      if (!data.ok) {
        return showAlertMsg("danger", data?.message || "No se pudo eliminar.");
      }

      showAlertMsg("success", "Usuario eliminado.");
      loadUsuarios();
    } catch (e) {
      showAlertMsg("danger", "Error de conexión con el servidor.");
      console.error("akika error adminusuarios", e)
    }
  };

  useEffect(() => {
    if(store.is_admin!=true) navigate("/login")
    loadUsuarios();
  }, []);

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100 py-5">
      <div className="col-12 col-md-11 col-lg-10 col-xl-9">
        <div
          className="card border-0 shadow-lg"
          style={{
            background: "rgba(255,255,255,0.93)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
          }}
        >
          <div className="card-header bg-white py-4 border-0">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
              <div className="text-center text-md-start">
                <h4 className="fw-bold mb-1">Admin · Usuarios</h4>
                <p className="text-muted small mb-0">
                  Lista, edita y elimina usuarios del sistema
                </p>
              </div>

              <div className="d-flex gap-2 justify-content-center justify-content-md-end">
                <button
                  className="btn btn-outline-secondary"
                  onClick={loadUsuarios}
                  disabled={loading}
                >
                  {loading ? "Actualizando..." : "Actualizar"}
                </button>

                <button
                  className="btn btn-dark"
                  onClick={() => navigate("/admin/usuarios")}
                  disabled={loading}
                >
                  + Crear usuario
                </button>
              </div>
            </div>
          </div>

          {alert.show && (
            <div className={`alert alert-${alert.type} rounded-0 mb-0`}>
              {alert.message}
            </div>
          )}

          <div className="card-body p-4">
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border" role="status" />
                <div className="mt-2 text-muted">Cargando usuarios...</div>
              </div>
            ) : usuarios.length === 0 ? (
              <div className="text-center py-4 text-muted">
                No hay usuarios registrados.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th className="d-none d-md-table-cell">Email</th>
                      <th>Rol</th>
                      <th className="d-none d-sm-table-cell">Admin</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {usuarios.map((u) => (
                      <tr key={u.user_id}>
                        <td>
                          <div className="fw-semibold">{u.name}</div>
                          <div className="small text-muted d-md-none">
                            {u.email}
                          </div>
                        </td>

                        <td className="d-none d-md-table-cell">{u.email}</td>

                        <td>
                          <span
                            className={`badge ${u.role === "barbero"
                                ? "text-bg-dark"
                                : "text-bg-secondary"
                              }`}
                          >
                            {u.role}
                          </span>
                        </td>

                        <td className="d-none d-sm-table-cell">
                          {u.is_admin ? "Sí" : "No"}
                        </td>

                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-2 flex-wrap">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() =>
                                navigate(`/admin/usuarios/${u.user_id}`)
                              }
                            >
                              Editar
                            </button>

                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => deleteUsuario(u.user_id)}
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="text-center mt-4">
              <button
                type="button"
                className="btn btn-link text-muted"
                onClick={() => navigate("/admindashboard")}
              >
                ← Volver
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsuarios;

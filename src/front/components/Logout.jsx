import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const Logout = () => {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("access_token")
    dispatch({ type: "logout" })
    navigate("/login");
  }, [navigate]);

  return (
    <div className="container text-center mt-5">
      <div className="spinner-border"></div>
      <p className="mt-3">Cerrando sesión...</p>
    </div>
  );
};

export default Logout;

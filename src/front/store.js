export const initialStore = () => {
  return {
    message: null,
    token: localStorage.getItem("access_token") || "",
    user_id: "", // puede ser null
    role: localStorage.getItem("role") || "null",
    is_admin: localStorage.getItem("is_admin") || "null",
    services: localStorage.getItem("barbers") || [],
    barbers: localStorage.getItem("services") || [],
    myAppointments: [],
    loading: false,
    error: null,
    backendUrl:
      "https://bug-free-goggles-5gpg7pwgjqwrf4vpq-3001.app.github.dev",
  };
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case "set_hello":
      return {
        ...store,
        message: action.payload,
      };
    case "set_loading":
      return { ...store, loading: action.payload };

    case "set_error":
      return { ...store, error: action.payload };

    case "clear_error":
      return { ...store, error: null };

    case "set_token":
      return { ...store, token: action.payload };

    case "set_user":
      return {
        ...store,
        user_id: action.payload.user_id,
        role: action.payload.role,
        is_admin: action.payload.is_admin,
      };

    case "logout":
      return {
        ...store,
        token: "",
        role: "",
        user_id: "",
        is_admin: "",
        services: [],
        barbers: [],
        myAppointments: [],
        loading: false,
        error: null,
      };

    case "set_services":
      return { ...store, services: action.payload };

    case "set_barbers":
      return { ...store, barbers: action.payload };

    case "set_my_appointments":
      return { ...store, myAppointments: action.payload };

    case "set_hello":
      return { ...store, message: action.payload };

    default:
      return store;
  }
}

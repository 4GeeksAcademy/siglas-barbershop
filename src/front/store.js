export const initialStore = () => {
  return {
    message: null,
    token: localStorage.getItem("access_token") || "",
    //token: "",
    user: JSON.parse(localStorage.getItem("user") || "null"), // puede ser null
    role : JSON.parse(localStorage.getItem("role") || "null"),
    services: [],
    barbers: [],
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
      return { ...store, user: action.payload.user_id, role: action.payload.role };

    case "logout":
      return {
        ...store,
        token: "",
        user: null,
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

import axios from "axios";

// 🔥 Detecta la URL correctamente (con fallback)
const baseURL =
  import.meta.env.VITE_API_URL ||
  "https://gameadmin-backend-1.onrender.com/api";

console.log("🌐 API URL usada:", baseURL);

const api = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("studio_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;

      if (status === 404) {
        console.warn("⚠️ Recurso no encontrado:", error.config.url);
      }

      if (status === 401 || status === 403) {
        console.warn("🚫 Acceso no autorizado. Verifica el token o el rol.");
      }
    } else {
      console.error("❌ Error de conexión con el servidor");
    }

    return Promise.reject(error);
  }
);

export default api;

import axios from "axios";

// 🔥 URL fija
const API_URL = "https://gameadmin-backend-1.onrender.com/api";

// 👀 Debug
console.log("🌐 API URL usada:", API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Interceptor para agregar token JWT automáticamente
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

      console.error("❌ ERROR AXIOS:");
      console.error("URL:", error.config.url);
      console.error("STATUS:", status);
      console.error("DATA:", error.response.data);

      // 404: endpoint no existe
      if (status === 404) {
        console.warn("⚠️ Recurso no encontrado:", error.config.url);
      }

      // 401 o 403: problema de auth
      if (status === 401 || status === 403) {
        console.warn("🚫 No autorizado. Token inválido o sin permisos.");
      }

      // 500: error backend
      if (status === 500) {
        console.error("💥 Error interno del servidor");
      }

    } else {
      console.error("❌ No hay conexión con el servidor");
    }

    return Promise.reject(error);
  }
);

export default api;

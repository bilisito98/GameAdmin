import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://gameadmin-backend-1.onrender.com/api",
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

// ✅ Interceptor para manejar errores globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;

      // 404: No redirigir a /Account/Login
      if (status === 404) {
        console.warn("⚠️ Recurso no encontrado:", error.config.url);
      }

      // 401 o 403: Token inválido o sin permiso
      if (status === 401 || status === 403) {
        console.warn("🚫 Acceso no autorizado. Verifica el token o el rol.");
        // Aquí no redirigimos ni alertamos — solo avisamos en consola
      }
    }
    return Promise.reject(error);
  }
);

export default api;


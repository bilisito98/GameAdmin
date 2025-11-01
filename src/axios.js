import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5147", // cambia automáticamente
});

// Agregar token si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("studio_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;


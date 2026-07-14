import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3333/api",
  headers: { "Content-Type": "application/json" },
});

// Injeta token JWT em todas as requisições autenticadas
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cifrastudio:token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Trata 401 globalmente — redireciona para login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("cifrastudio:token");
      localStorage.removeItem("cifrastudio:user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

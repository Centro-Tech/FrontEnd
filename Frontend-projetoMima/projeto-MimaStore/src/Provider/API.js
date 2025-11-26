import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");

      // Verifica de onde veio a requisição
      const requestUrl = error.config?.url || "";
      const currentPath = window.location.pathname;

    if (currentPath === "/login") {
  setTimeout(() => window.location.href = "/login", 2000);
    } else if (currentPath === "/primeiro-acesso") {
  setTimeout(() => window.location.href = "/primeiro-acesso", 2000);
  }
}

    return Promise.reject(error);
  }
);





export default API;
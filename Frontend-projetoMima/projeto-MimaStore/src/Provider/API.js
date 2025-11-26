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

// API.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401 || 
//         error.response?.data?.message?.includes('JWT signature does not match')) {
//       localStorage.removeItem("token");
//       window.location.href = "/login";
//     }
//     return Promise.reject(error);
//   }
// );

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 || 
      error.response?.data?.message?.includes("JWT signature does not match")
    ) {
      localStorage.removeItem("token");

      // espera 5 segundos antes de redirecionar
      setTimeout(() => {
        window.location.href = "/primeiro-acesso";
      }, 2000);
    }
    return Promise.reject(error);
  }
);


export default API;
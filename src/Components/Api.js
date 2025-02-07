import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api", // Replace with your API's base URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api; // Ensure this is exported as 'api'

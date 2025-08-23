import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL, 
  withCredentials: true,
});

const token = localStorage.getItem("token");
if (token) instance.defaults.headers.common.Authorization = `Bearer ${token}`;

export default instance;

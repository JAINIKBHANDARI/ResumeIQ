import axios from "axios";
import { clearAuthStorage } from "../utils/auth";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    withCredentials: true
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isUnauthorized = error.response?.status === 401;
        const isAuthRequest = error.config?.url?.startsWith("/auth/");

        if (isUnauthorized && !isAuthRequest) {
            clearAuthStorage();

            if (window.location.pathname !== "/login") {
                window.location.replace("/login");
            }
        }

        return Promise.reject(error);
    }
);

export default api;

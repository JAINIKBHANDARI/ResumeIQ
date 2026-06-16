import axios from "axios";
import { getApiBaseUrl, getConfiguredApiUrl, getFinalApiUrl } from "./config";
import { clearAuthStorage } from "../utils/auth";

const HEALTH_PING_COOLDOWN_MS = 60000;

export const REQUEST_TIMEOUTS = {
    auth: 60000,
    upload: 180000,
    health: 60000
};

const api = axios.create({
    baseURL: getApiBaseUrl(),
    withCredentials: true
});

let healthPingPromise = null;
let lastHealthPingAt = 0;

export const isTimeoutError = (error) => (
    error.code === "ECONNABORTED"
    || error.code === "ETIMEDOUT"
    || error.message?.toLowerCase().includes("timeout")
);

export const isNetworkError = (error) => !error.response;

export const logSafeApiError = (label, error) => {
    console.warn(`${label} failed`, {
        viteApiUrl: getConfiguredApiUrl(),
        axiosBaseURL: error.config?.baseURL || api.defaults.baseURL,
        finalRequestURL: getFinalApiUrl(error.config?.baseURL || api.defaults.baseURL, error.config?.url),
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
        hasResponse: Boolean(error.response),
        hasRequest: Boolean(error.request)
    });
};

export const logSafeApiRequest = (label, url) => {
    console.log("API baseURL:", api.defaults.baseURL);
    console.log(`${label} final URL:`, getFinalApiUrl(api.defaults.baseURL, url));
};

export const pingServerHealth = ({ force = false, timeout = REQUEST_TIMEOUTS.health } = {}) => {
    const now = Date.now();

    if (!force && healthPingPromise) {
        return healthPingPromise;
    }

    if (!force && now - lastHealthPingAt < HEALTH_PING_COOLDOWN_MS) {
        return Promise.resolve(false);
    }

    lastHealthPingAt = now;
    healthPingPromise = api.get("/health", { timeout })
        .then(() => true)
        .catch(() => false)
        .finally(() => {
            healthPingPromise = null;
        });

    return healthPingPromise;
};

export const postWithWakeRetry = async (url, data, config = {}) => {
    try {
        return await api.post(url, data, config);
    } catch (error) {
        if (!isNetworkError(error) && !isTimeoutError(error)) {
            throw error;
        }

        const isHealthy = await pingServerHealth({ force: true });
        error.__healthChecked = true;
        error.__serverHealthy = isHealthy;

        if (!isHealthy) {
            throw error;
        }

        try {
            return await api.post(url, data, config);
        } catch (retryError) {
            retryError.__healthChecked = true;
            retryError.__serverHealthy = true;
            throw retryError;
        }
    }
};

export const getAuthErrorMessage = async (error, fallbackMessage) => {
    if (error.response?.data?.message) {
        return error.response.data.message;
    }

    if (isTimeoutError(error)) {
        const isHealthy = error.__healthChecked
            ? error.__serverHealthy
            : await pingServerHealth({ force: true });

        return isHealthy
            ? "Server is reachable, but the request timed out. Please try again."
            : "Connecting to server is taking longer than expected. Please wait and try again.";
    }

    if (isNetworkError(error)) {
        const isHealthy = error.__healthChecked
            ? error.__serverHealthy
            : await pingServerHealth({ force: true });

        return isHealthy
            ? "Server is reachable, but the request failed. Please try again."
            : "Connecting to server... This may take a few seconds on first request.";
    }

    if (error.response?.status >= 500) {
        return "Server error. Please try again in a few minutes.";
    }

    return fallbackMessage;
};

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

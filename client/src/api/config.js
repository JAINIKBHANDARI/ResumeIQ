const LOCAL_API_URL = "http://localhost:5000/api";
const PRODUCTION_API_URL = "https://resumeiq-backend-fl1v.onrender.com/api";

const isLocalApiUrl = (url) => (
    url.startsWith("http://localhost")
    || url.startsWith("http://127.0.0.1")
);

export const getApiBaseUrl = () => {
    const fallbackUrl = import.meta.env.PROD ? PRODUCTION_API_URL : LOCAL_API_URL;
    const configuredUrl = (import.meta.env.VITE_API_URL || fallbackUrl).trim();
    let normalizedUrl = configuredUrl
        .replace(/\/+$/, "")
        .replace(/\/api\/api$/i, "/api");

    if (import.meta.env.PROD && isLocalApiUrl(normalizedUrl)) {
        normalizedUrl = PRODUCTION_API_URL;
    }

    const apiUrl = normalizedUrl.endsWith("/api")
        ? normalizedUrl
        : `${normalizedUrl}/api`;

    if (
        import.meta.env.PROD
        && apiUrl.startsWith("http://")
        && !isLocalApiUrl(apiUrl)
    ) {
        return apiUrl.replace("http://", "https://");
    }

    return apiUrl;
};

export const getConfiguredApiUrl = () => import.meta.env.VITE_API_URL || "";

export const getFinalApiUrl = (baseURL, url = "") => {
    if (/^https?:\/\//i.test(url)) {
        return url;
    }

    const normalizedBaseUrl = (baseURL || getApiBaseUrl()).replace(/\/+$/, "");
    const normalizedPath = String(url).replace(/^\/+/, "");

    return `${normalizedBaseUrl}/${normalizedPath}`;
};

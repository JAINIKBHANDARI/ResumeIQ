const LOCAL_API_URL = "http://localhost:5000/api";
const PRODUCTION_API_URL = "https://resumeiq-backend-fl1v.onrender.com/api";

const isLocalApiUrl = (url) => (
    url.startsWith("http://localhost")
    || url.startsWith("http://127.0.0.1")
);

export const getApiBaseUrl = () => {
    const fallbackUrl = import.meta.env.PROD ? PRODUCTION_API_URL : LOCAL_API_URL;
    const configuredUrl = (import.meta.env.VITE_API_URL || fallbackUrl).trim();
    const normalizedUrl = configuredUrl.replace(/\/+$/, "");

    if (
        import.meta.env.PROD
        && normalizedUrl.startsWith("http://")
        && !isLocalApiUrl(normalizedUrl)
    ) {
        return normalizedUrl.replace("http://", "https://");
    }

    return normalizedUrl;
};

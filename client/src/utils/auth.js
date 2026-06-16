import { getApiBaseUrl } from "../api/config";

const AUTH_STORAGE_KEYS = [
    "token",
    "user",
    "authToken",
    "accessToken",
    "jwt",
    "resumeiqUser",
    "googleCredential",
    "googleId",
    "googleUser"
];

const isBrowser = () => typeof window !== "undefined";

const getStorageValue = (storage, key) => {
    try {
        return storage?.getItem(key) || null;
    } catch {
        return null;
    }
};

const setStorageValue = (storage, key, value) => {
    try {
        storage?.setItem(key, value);
    } catch {
        // Private/incognito storage can fail in some browsers. Auth should fail safely.
    }
};

const removeStorageValue = (storage, key) => {
    try {
        storage?.removeItem(key);
    } catch {
        // Ignore storage removal failures and continue clearing anything else available.
    }
};

const removeAuthKeys = (storage) => {
    if (!storage) return;

    AUTH_STORAGE_KEYS.forEach((key) => removeStorageValue(storage, key));

    const dynamicKeys = [];

    try {
        for (let index = 0; index < storage.length; index += 1) {
            dynamicKeys.push(storage.key(index));
        }
    } catch {
        return;
    }

    dynamicKeys.filter(Boolean).forEach((key) => {
        const normalizedKey = key.toLowerCase();

        if (
            normalizedKey.includes("google") ||
            normalizedKey.includes("credential") ||
            normalizedKey.includes("auth") ||
            normalizedKey.includes("jwt")
        ) {
            removeStorageValue(storage, key);
        }
    });
};

const decodeJwtPayload = (token) => {
    const payload = token.split(".")[1];

    if (!payload) return null;

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(
        normalizedPayload.length + ((4 - normalizedPayload.length % 4) % 4),
        "="
    );

    return JSON.parse(atob(paddedPayload));
};

export const getAuthToken = () => {
    if (!isBrowser()) return null;

    const token = (
        getStorageValue(localStorage, "token") ||
        getStorageValue(localStorage, "authToken") ||
        getStorageValue(localStorage, "accessToken") ||
        getStorageValue(localStorage, "jwt")
    );

    if (!token) return null;

    try {
        const payload = decodeJwtPayload(token);

        if (!payload || (payload.exp && payload.exp * 1000 < Date.now())) {
            clearAuthStorage();
            return null;
        }
    } catch {
        clearAuthStorage();
        return null;
    }

    return token;
};

export const storeAuthData = ({ token, user }) => {
    if (!isBrowser()) return;

    if (token) {
        setStorageValue(localStorage, "token", token);
    }

    if (user) {
        setStorageValue(localStorage, "user", JSON.stringify(user));
    }
};

export const getStoredUser = () => {
    if (!isBrowser()) return null;

    try {
        const user = getStorageValue(localStorage, "user");

        return user ? JSON.parse(user) : null;
    } catch {
        removeStorageValue(localStorage, "user");
        return null;
    }
};

export const getStoredTheme = () => {
    if (!isBrowser()) return "light";

    return getStorageValue(localStorage, "theme") || "light";
};

export const storeTheme = (theme) => {
    if (!isBrowser()) return;

    setStorageValue(localStorage, "theme", theme);
};

export const clearAuthStorage = () => {
    if (!isBrowser()) return;

    removeAuthKeys(localStorage);
    removeAuthKeys(sessionStorage);

    if (window.google?.accounts?.id) {
        window.google.accounts.id.disableAutoSelect();
    }
};

export const logoutUser = async (navigate) => {
    try {
        await fetch(`${getApiBaseUrl()}/auth/logout`, {
            method: "POST",
            credentials: "include"
        });
    } catch (error) {
        console.log(error.message || "Logout request failed");
    } finally {
        clearAuthStorage();
        navigate("/login", { replace: true });
    }
};

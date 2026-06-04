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

const removeAuthKeys = (storage) => {
    AUTH_STORAGE_KEYS.forEach((key) => storage.removeItem(key));

    const dynamicKeys = [];

    for (let index = 0; index < storage.length; index += 1) {
        dynamicKeys.push(storage.key(index));
    }

    dynamicKeys.filter(Boolean).forEach((key) => {
        const normalizedKey = key.toLowerCase();

        if (
            normalizedKey.includes("google") ||
            normalizedKey.includes("credential") ||
            normalizedKey.includes("auth") ||
            normalizedKey.includes("jwt")
        ) {
            storage.removeItem(key);
        }
    });
};

export const getAuthToken = () => {
    const token = (
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("jwt")
    );

    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));

        if (payload.exp && payload.exp * 1000 < Date.now()) {
            clearAuthStorage();
            return null;
        }
    } catch (error) {
        clearAuthStorage();
        return null;
    }

    return token;
};

export const storeAuthData = ({ token, user }) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
};

export const clearAuthStorage = () => {
    removeAuthKeys(localStorage);
    removeAuthKeys(sessionStorage);

    if (window.google?.accounts?.id) {
        window.google.accounts.id.disableAutoSelect();
    }
};

export const logoutUser = async (navigate) => {
    try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

        await fetch(`${apiUrl}/auth/logout`, {
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

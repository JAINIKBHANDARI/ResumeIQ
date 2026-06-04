import { useEffect, useMemo, useState } from "react";
import {
    clearAuthStorage,
    getAuthToken,
    getStoredUser,
    storeAuthData
} from "../utils/auth";
import { AuthContext } from "./authState";

export function AuthProvider({ children }) {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            const storedToken = getAuthToken();

            setToken(storedToken);
            setUser(storedToken ? getStoredUser() : null);
            setLoading(false);
        }, 0);

        return () => window.clearTimeout(timer);
    }, []);

    const login = (authData) => {
        storeAuthData(authData);
        setToken(authData?.token || getAuthToken());
        setUser(authData?.user || getStoredUser());
    };

    const logout = () => {
        clearAuthStorage();
        setToken(null);
        setUser(null);
    };

    const refreshAuth = () => {
        const storedToken = getAuthToken();

        setToken(storedToken);
        setUser(storedToken ? getStoredUser() : null);
    };

    const value = useMemo(() => ({
        token,
        user,
        loading,
        isAuthenticated: Boolean(token),
        login,
        logout,
        refreshAuth
    }), [loading, token, user]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

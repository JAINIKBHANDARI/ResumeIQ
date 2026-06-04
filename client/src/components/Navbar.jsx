import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import { getStoredTheme, logoutUser, storeTheme } from "../utils/auth";

function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, logout } = useAuth();

    const [theme, setTheme] = useState(
        getStoredTheme()
    );

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        storeTheme(theme);
    }, [theme]);

    const isActive = (path) => location.pathname === path;

    const handleLogout = async () => {
        logout();
        await logoutUser(navigate);
    };

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    return (
        <header className="navbar">
            <div className="nav-container">
                <Link to={isAuthenticated ? "/dashboard" : "/login"} className="brand">
                   <img src="/logo.svg" alt="ResumeIQ Logo" className="brand-logo" />
                    <div>
                        <h2>ResumeIQ</h2>
                        <span>AI Resume Reviewer</span>
                    </div>
                </Link>

                <nav className="nav-links">
                    {isAuthenticated ? (
                        <>
                            <Link
                                className={isActive("/dashboard") ? "active" : ""}
                                to="/dashboard"
                            >
                                Dashboard
                            </Link>

                            <Link
                                className={isActive("/upload") ? "active" : ""}
                                to="/upload"
                            >
                                Upload
                            </Link>

                            <Link
                                className={isActive("/history") ? "active" : ""}
                                to="/history"
                            >
                                History
                            </Link>

                            <button
                                className={`theme-switch ${theme === "dark" ? "dark" : "light"}`}
                                onClick={toggleTheme}
                                aria-label="Toggle theme"
                            >
                                <span className="theme-icon">
                                    {theme === "light" ? "☀" : "☾"}
                                </span>
                                <span className="theme-text">
                                    {theme === "light" ? "Light Mode" : "Dark Mode"}
                                </span>
                            </button>

                            <button className="nav-button" onClick={handleLogout}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                className={isActive("/") || isActive("/login") ? "active" : ""}
                                to="/login"
                            >
                                Login
                            </Link>

                            <Link
                                className={isActive("/register") ? "active" : ""}
                                to="/register"
                            >
                                Register
                            </Link>

                            <button
                                className={`theme-switch ${theme === "dark" ? "dark" : "light"}`}
                                onClick={toggleTheme}
                                aria-label="Toggle theme"
                            >
                                <span className="theme-icon">
                                    {theme === "light" ? "☀" : "☾"}
                                </span>
                                <span className="theme-text">
                                    {theme === "light" ? "Light Mode" : "Dark Mode"}
                                </span>
                            </button>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}

export default Navbar;

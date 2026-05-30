import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    const [theme, setTheme] = useState(
        localStorage.getItem("theme") || "light"
    );

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    return (
        <header className="navbar">
            <div className="nav-container">
                <Link to={token ? "/dashboard" : "/"} className="brand">
                    <div className="brand-mark">RIQ</div>
                    <div>
                        <h2>ResumeIQ</h2>
                        <span>AI Resume Reviewer</span>
                    </div>
                </Link>

                <nav className="nav-links">
                    {token ? (
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
                                className={isActive("/") ? "active" : ""}
                                to="/"
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
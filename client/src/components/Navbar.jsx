import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import { getStoredTheme, logoutUser, storeTheme } from "../utils/auth";

const MobileNavIcon = ({ name }) => {
    const icons = {
        dashboard: (
            <>
                <path d="M4 4h7v7H4z" />
                <path d="M13 4h7v4h-7z" />
                <path d="M13 10h7v10h-7z" />
                <path d="M4 13h7v7H4z" />
            </>
        ),
        upload: (
            <>
                <path d="M12 4v11" />
                <path d="M7 9l5-5 5 5" />
                <path d="M5 18h14" />
            </>
        ),
        history: (
            <>
                <path d="M4 12a8 8 0 1 0 2.35-5.65" />
                <path d="M4 5v5h5" />
                <path d="M12 8v5l3 2" />
            </>
        ),
        more: (
            <>
                <path d="M5 12h.01" />
                <path d="M12 12h.01" />
                <path d="M19 12h.01" />
            </>
        )
    };

    return (
        <svg
            aria-hidden="true"
            className="mobile-nav-icon"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
        >
            {icons[name]}
        </svg>
    );
};

const ThemeToggleIcon = ({ mode }) => {
    if (mode === "dark") {
        return (
            <svg
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
            >
                <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 7 7 0 1 0 20.5 14.5z" />
            </svg>
        );
    }

    return (
        <svg
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
        >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
        </svg>
    );
};

function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, logout, user } = useAuth();

    const [theme, setTheme] = useState(getStoredTheme());
    const [isMoreOpen, setIsMoreOpen] = useState(false);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        storeTheme(theme);
    }, [theme]);

    useEffect(() => {
        document.body.classList.toggle("has-mobile-bottom-nav", isAuthenticated);

        return () => {
            document.body.classList.remove("has-mobile-bottom-nav");
        };
    }, [isAuthenticated]);

    const isActive = (path) => location.pathname === path;
    const nextTheme = theme === "light" ? "dark" : "light";
    const nextThemeLabel = nextTheme === "dark" ? "Dark Mode" : "Light Mode";

    const handleLogout = async () => {
        setIsMoreOpen(false);
        logout();
        await logoutUser(navigate);
    };

    const toggleTheme = () => {
        setTheme(nextTheme);
    };

    const themeToggleButton = (
        <button
            className={`theme-switch ${theme === "dark" ? "dark" : "light"}`}
            onClick={toggleTheme}
            aria-label="Toggle theme"
        >
            <span className="theme-icon">
                <ThemeToggleIcon mode={nextTheme} />
            </span>
            <span className="theme-text">
                {nextThemeLabel}
            </span>
        </button>
    );

    return (
        <>
            <header className={`navbar ${isAuthenticated ? "has-mobile-nav" : ""}`}>
                <div className="nav-container">
                    <Link to={isAuthenticated ? "/dashboard" : "/login"} className="brand">
                        <img src="/logo.svg" alt="ResumeIQ Logo" className="brand-logo" />
                        <div>
                            <h2>ResumeIQ</h2>
                            <span>AI Resume Reviewer</span>
                        </div>
                    </Link>

                    <nav className={`nav-links ${isAuthenticated ? "authenticated-links" : ""}`}>
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

                                {themeToggleButton}

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

                                {themeToggleButton}
                            </>
                        )}
                    </nav>
                </div>
            </header>

            {isAuthenticated && (
                <>
                    {isMoreOpen && (
                        <button
                            className="mobile-more-backdrop"
                            type="button"
                            aria-label="Close menu"
                            onClick={() => setIsMoreOpen(false)}
                        />
                    )}

                    <div
                        className={`mobile-more-sheet ${isMoreOpen ? "open" : ""}`}
                        id="mobile-more-menu"
                    >
                        <div className="mobile-more-handle" aria-hidden="true"></div>

                        {user && (
                            <div className="mobile-profile-summary">
                                <span>Profile</span>
                                <strong>{user.name || "ResumeIQ User"}</strong>
                                {user.email && <small>{user.email}</small>}
                            </div>
                        )}

                        {themeToggleButton}

                        <Link
                            className="mobile-more-link"
                            to="/privacy"
                            onClick={() => setIsMoreOpen(false)}
                        >
                            Privacy Policy
                        </Link>

                        <button className="mobile-more-logout" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>

                    <nav className="mobile-bottom-nav" aria-label="Mobile primary navigation">
                        <Link
                            className={isActive("/dashboard") ? "active" : ""}
                            to="/dashboard"
                            onClick={() => setIsMoreOpen(false)}
                        >
                            <MobileNavIcon name="dashboard" />
                            <span>Dashboard</span>
                        </Link>

                        <Link
                            className={isActive("/upload") ? "active" : ""}
                            to="/upload"
                            onClick={() => setIsMoreOpen(false)}
                        >
                            <MobileNavIcon name="upload" />
                            <span>Upload</span>
                        </Link>

                        <Link
                            className={isActive("/history") ? "active" : ""}
                            to="/history"
                            onClick={() => setIsMoreOpen(false)}
                        >
                            <MobileNavIcon name="history" />
                            <span>History</span>
                        </Link>

                        <button
                            className={isMoreOpen ? "active" : ""}
                            type="button"
                            onClick={() => setIsMoreOpen((currentValue) => !currentValue)}
                            aria-expanded={isMoreOpen}
                            aria-controls="mobile-more-menu"
                        >
                            <MobileNavIcon name="more" />
                            <span>More</span>
                        </button>
                    </nav>
                </>
            )}
        </>
    );
}

export default Navbar;

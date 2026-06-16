import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    getAuthErrorMessage,
    logSafeApiError,
    logSafeApiRequest,
    pingServerHealth,
    postWithWakeRetry,
    REQUEST_TIMEOUTS
} from "../api/axios";
import GoogleAuthButton from "../components/GoogleAuthButton";
import { useAuth } from "../context/useAuth";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        pingServerHealth();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) {
            return;
        }

        setError("");
        setLoading(true);

        try {
            logSafeApiRequest("Login", "/auth/login");

            const response = await postWithWakeRetry("/auth/login", formData, {
                timeout: REQUEST_TIMEOUTS.auth
            });

            login(response.data);

            navigate("/dashboard");
        } catch (error) {
            logSafeApiError("Login", error);
            setError(await getAuthErrorMessage(error, "Login failed. Please try again."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-hero">
                <div className="auth-badge">AI Powered Career Toolkit</div>

                <h1>
                    Improve your resume.
                    <br />
                    Prepare for interviews.
                    <br />
                    Get job-ready faster.
                </h1>

                <p>
                    ResumeIQ reviews your resume, generates ATS score, gives smart
                    suggestions, and creates interview questions based on your profile.
                </p>

                <div className="auth-feature-grid">
                    <div className="auth-feature-card">
                        <span>01</span>
                        <h3>ATS Score</h3>
                        <p>Check how resume-friendly your profile is for recruiters.</p>
                    </div>

                    <div className="auth-feature-card">
                        <span>02</span>
                        <h3>AI Review</h3>
                        <p>Get strengths, weaknesses, and improvement suggestions.</p>
                    </div>

                    <div className="auth-feature-card">
                        <span>03</span>
                        <h3>Interview Prep</h3>
                        <p>Generate technical, project, and HR questions instantly.</p>
                    </div>
                </div>

                <div className="auth-trust-row">
                    <div>
                        <strong>Fast</strong>
                        <span>analysis</span>
                    </div>
                    <div>
                        <strong>Smart</strong>
                        <span>feedback</span>
                    </div>
                    <div>
                        <strong>Clean</strong>
                        <span>reports</span>
                    </div>
                </div>
            </section>

            <section className="auth-card-wrap">
                <div className="auth-card">
                    <div className="auth-card-header">
                        <div className="auth-logo">RIQ</div>
                        <div>
                            <h2>Welcome back</h2>
                            <p>Login to continue your resume analysis.</p>
                        </div>
                    </div>

                    {error && <div className="alert-error">{error}</div>}

                    <form className="form" onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label>Email address</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button className="btn-primary auth-submit" type="submit" disabled={loading}>
                            {loading ? "Logging in..." : "Login to Dashboard"}
                        </button>
                        {loading && (
                            <p className="helper-text">
                                Connecting to server... This may take a few seconds on first request.
                            </p>
                        )}
                    </form>

                    <p className="forgot-password-link">
                        <Link to="/forgot-password">Forgot password?</Link>
                    </p>

                    <div className="auth-divider">
                        <span>or</span>
                    </div>

                    <GoogleAuthButton
                        onAuthenticated={login}
                        onSuccess={() => navigate("/dashboard")}
                        onError={setError}
                    />

                    <p className="auth-switch">
                        New to ResumeIQ? <Link to="/register">Create account</Link>
                    </p>

                    <p className="auth-privacy-link">
                        <Link to="/privacy">Privacy Policy</Link>
                    </p>
                </div>
            </section>
        </main>
    );
}

export default Login;

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await api.post("/auth/register", formData);

            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));

            navigate("/dashboard");
        } catch (error) {
            setError(
    error.response?.data?.message ||
    "Server is waking up. Please try again."
);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-hero">
                <div className="auth-badge">Start Free Resume Review</div>

                <h1>
                    Build confidence
                    <br />
                    before your next
                    <br />
                    interview.
                </h1>

                <p>
                    Create your account and get AI-powered resume feedback, ATS score,
                    improvement suggestions, and interview questions in one place.
                </p>

                <div className="auth-feature-grid">
                    <div className="auth-feature-card">
                        <span>01</span>
                        <h3>Upload Resume</h3>
                        <p>Upload a PDF resume and let ResumeIQ read your profile.</p>
                    </div>

                    <div className="auth-feature-card">
                        <span>02</span>
                        <h3>Get AI Report</h3>
                        <p>Receive ATS score, strengths, weaknesses, and suggestions.</p>
                    </div>

                    <div className="auth-feature-card">
                        <span>03</span>
                        <h3>Prepare Better</h3>
                        <p>Practice interview questions based on your own resume.</p>
                    </div>
                </div>

                <div className="auth-trust-row">
                    <div>
                        <strong>1 min</strong>
                        <span>setup</span>
                    </div>
                    <div>
                        <strong>AI</strong>
                        <span>review</span>
                    </div>
                    <div>
                        <strong>PDF</strong>
                        <span>support</span>
                    </div>
                </div>
            </section>

            <section className="auth-card-wrap">
                <div className="auth-card">
                    <div className="auth-card-header">
                        <div className="auth-logo">RIQ</div>
                        <div>
                            <h2>Create account</h2>
                            <p>Start analyzing your resume today.</p>
                        </div>
                    </div>

                    {error && <div className="alert-error">{error}</div>}

                    <form className="form" onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label>Full name</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Enter your name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

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
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button className="btn-primary auth-submit" type="submit" disabled={loading}>
                            {loading ? "Creating account..." : "Create Free Account"}
                        </button>
                        <p className="helper-text">
                            Server may take a few seconds to wake up.
                        </p>
                    </form>

                    <p className="auth-switch">
                        Already have an account? <Link to="/">Login here</Link>
                    </p>
                </div>
            </section>
        </main>
    );
}

export default Register;

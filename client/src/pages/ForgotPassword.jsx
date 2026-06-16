import { useState } from "react";
import { Link } from "react-router-dom";
import api, { getAuthErrorMessage, REQUEST_TIMEOUTS } from "../api/axios";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");
        setLoading(true);

        try {
            const response = await api.post("/auth/forgot-password", { email }, {
                timeout: REQUEST_TIMEOUTS.auth
            });
            setMessage(response.data.message);
        } catch (error) {
            setError(await getAuthErrorMessage(error, "Could not send reset email. Please try again."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-hero">
                <div className="auth-badge">Secure Account Recovery</div>
                <h1>
                    Reset your password.
                    <br />
                    Keep your account safe.
                </h1>
                <p>
                    Enter your ResumeIQ account email. If it exists, we will send a
                    secure reset link that expires in 15 minutes.
                </p>
            </section>

            <section className="auth-card-wrap">
                <div className="auth-card">
                    <div className="auth-card-header">
                        <div className="auth-logo">RIQ</div>
                        <div>
                            <h2>Forgot password</h2>
                            <p>We will email a secure password reset link.</p>
                        </div>
                    </div>

                    {error && <div className="alert-error">{error}</div>}
                    {message && <div className="alert-success">{message}</div>}

                    <form className="form" onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label>Email address</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <button className="btn-primary auth-submit" type="submit" disabled={loading}>
                            {loading ? "Sending reset link..." : "Send Reset Link"}
                        </button>
                    </form>

                    <p className="auth-switch">
                        Remembered your password? <Link to="/login">Login here</Link>
                    </p>
                </div>
            </section>
        </main>
    );
}

export default ForgotPassword;

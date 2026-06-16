import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { getAuthErrorMessage, REQUEST_TIMEOUTS } from "../api/axios";

function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters long");
            return;
        }

        setLoading(true);

        try {
            const response = await api.post(`/auth/reset-password/${token}`, {
                password
            }, {
                timeout: REQUEST_TIMEOUTS.auth
            });

            setMessage(response.data.message);

            setTimeout(() => {
                navigate("/login");
            }, 1500);
        } catch (error) {
            setError(await getAuthErrorMessage(error, "Password reset failed. Please request a new link."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-hero">
                <div className="auth-badge">Create New Password</div>
                <h1>
                    Choose a new password.
                    <br />
                    Keep it strong.
                </h1>
                <p>
                    This link is verified by the server and expires quickly for your
                    account safety.
                </p>
            </section>

            <section className="auth-card-wrap">
                <div className="auth-card">
                    <div className="auth-card-header">
                        <div className="auth-logo">RIQ</div>
                        <div>
                            <h2>Reset password</h2>
                            <p>Create a new password for your account.</p>
                        </div>
                    </div>

                    {error && <div className="alert-error">{error}</div>}
                    {message && <div className="alert-success">{message}</div>}

                    <form className="form" onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label>New password</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Enter new password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Confirm password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button className="btn-primary auth-submit" type="submit" disabled={loading}>
                            {loading ? "Resetting password..." : "Create New Password"}
                        </button>
                    </form>

                    <p className="auth-switch">
                        Need a new link? <Link to="/forgot-password">Request again</Link>
                    </p>
                </div>
            </section>
        </main>
    );
}

export default ResetPassword;

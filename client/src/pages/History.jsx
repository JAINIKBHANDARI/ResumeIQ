import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/useAuth";

function History() {
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deleteLoading, setDeleteLoading] = useState("");
    const { token } = useAuth();

    useEffect(() => {
        const fetchHistory = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await api.get("/resume/history", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setResumes(response.data.resumes);
            } catch (error) {
                setError(
                    error.response?.data?.message || "Failed to fetch history"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [token]);

    const handleDelete = async (resumeId) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this report?"
        );

        if (!confirmDelete) return;

        try {
            setDeleteLoading(resumeId);

            await api.delete(`/resume/${resumeId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setResumes(resumes.filter((resume) => resume._id !== resumeId));

        } catch (error) {
            alert(error.response?.data?.message || "Failed to delete report");
        } finally {
            setDeleteLoading("");
        }
    };

    if (loading) {
        return (
            <main className="page">
                <section className="empty-state">
                    <h2>Loading history...</h2>
                    <p>Please wait while we fetch your previous resume reports.</p>
                </section>
            </main>
        );
    }

    if (error) {
        return (
            <main className="page">
                <section className="empty-state">
                    <h2>Something went wrong</h2>
                    <p>{error}</p>
                </section>
            </main>
        );
    }

    return (
        <main className="page">
            <section className="section-header">
                <div>
                    <div className="eyebrow">Analysis History</div>
                    <h1>Your previous resume reports</h1>
                    <p>View or delete your earlier AI-generated resume analysis reports.</p>
                </div>
            </section>

            {resumes.length === 0 ? (
                <section className="empty-state">
                    <h2>No reports yet</h2>
                    <p>Upload a resume to generate your first AI report.</p>
                </section>
            ) : (
                <section className="history-grid">
                    {resumes.map((resume) => (
                        <article className="history-card" key={resume._id}>
                            <div>
                                <span className="history-date">
                                    {new Date(resume.createdAt).toLocaleDateString()}
                                </span>

                                <h2>{resume.originalName || resume.filename}</h2>

                                <p>
                                    ATS Score: <strong>{resume.atsScore}/100</strong>
                                </p>
                            </div>

                            <div className="history-actions">
                                <Link className="btn-secondary" to={`/result/${resume._id}`}>
                                    View Report
                                </Link>

                                <button
                                    className="btn-danger"
                                    onClick={() => handleDelete(resume._id)}
                                    disabled={deleteLoading === resume._id}
                                >
                                    {deleteLoading === resume._id ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </article>
                    ))}
                </section>
            )}
        </main>
    );
}

export default History;

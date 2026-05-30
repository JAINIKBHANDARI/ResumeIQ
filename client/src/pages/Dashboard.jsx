import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

function Dashboard() {
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await api.get("/resume/history", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setResumes(response.data.resumes);
            } catch (error) {
                console.log(error.response?.data?.message || "Failed to load dashboard");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const totalReports = resumes.length;
    const latestReport = resumes[0];
    const latestScore = latestReport?.atsScore || 0;

    return (
        <main className="page">
            <section className="hero-section">
                <div>
                    <div className="eyebrow">Resume Intelligence</div>
                    <h1>
                        Welcome back, {user?.name || "User"}.
                    </h1>
                    <p>
                        Upload resumes, get ATS score, AI suggestions, and interview questions
                        in one clean dashboard.
                    </p>

                    <div className="dashboard-actions">
                        <Link className="btn-primary link-button" to="/upload">
                            Analyze New Resume
                        </Link>

                        <Link className="btn-secondary" to="/history">
                            View History
                        </Link>
                    </div>
                </div>

                <div className="hero-card">
                    <span>Latest ATS Score</span>
                    <h2>{loading ? "..." : `${latestScore}/100`}</h2>
                    <p>
                        {latestReport
                            ? "Based on your most recent resume analysis."
                            : "Upload your first resume to generate a score."}
                    </p>
                </div>
            </section>

            <section className="stats-grid">
                <div className="stat-card">
                    <span>Total Reports</span>
                    <h3>{loading ? "..." : totalReports}</h3>
                    <p>Resume analyses generated till now.</p>
                </div>

                <div className="stat-card">
                    <span>AI Feedback</span>
                    <h3>ATS + Review</h3>
                    <p>Strengths, weaknesses, and suggestions generated using AI.</p>
                </div>

                <div className="stat-card">
                    <span>Interview Prep</span>
                    <h3>Questions</h3>
                    <p>Technical, project-based, and HR questions from resume content.</p>
                </div>
            </section>

            <section className="recent-section">
                <div className="section-title-row">
                    <div>
                        <div className="eyebrow">Recent Reports</div>
                        <h2>Latest resume analyses</h2>
                    </div>

                    <Link className="btn-secondary" to="/history">
                        See All
                    </Link>
                </div>

                {loading ? (
                    <div className="empty-state">
                        <h2>Loading dashboard...</h2>
                        <p>Fetching your latest resume reports.</p>
                    </div>
                ) : resumes.length === 0 ? (
                    <div className="empty-state">
                        <h2>No reports yet</h2>
                        <p>Upload your first resume and generate an AI report.</p>
                    </div>
                ) : (
                    <div className="recent-list">
                        {resumes.slice(0, 3).map((resume) => (
                            <article className="recent-card" key={resume._id}>
                                <div>
                                    <h3>{resume.originalName || resume.filename}</h3>
                                    <p>
                                        {new Date(resume.createdAt).toLocaleDateString()} • ATS Score{" "}
                                        <strong>{resume.atsScore}/100</strong>
                                    </p>
                                </div>

                                <Link className="btn-secondary" to={`/result/${resume._id}`}>
                                    View
                                </Link>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}

export default Dashboard;
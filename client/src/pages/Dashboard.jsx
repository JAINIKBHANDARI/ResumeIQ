import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const getScoreLabel = (score = 0) => {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Needs Improvement";
    return "Poor";
};

const getScoreClass = (score = 0) => {
    if (score >= 85) return "excellent";
    if (score >= 70) return "good";
    if (score >= 50) return "needs-improvement";
    return "poor";
};

const getScoreTone = (score = 0) => {
    if (score >= 70) return "good";
    if (score >= 50) return "improve";
    return "missing";
};

const getBestScore = (reports) => {
    const scores = reports.map((resume) => Number(resume.atsScore) || 0);
    return scores.length > 0 ? Math.max(...scores) : 0;
};

const getAverageScore = (reports) => {
    const scores = reports.map((resume) => Number(resume.atsScore) || 0);

    if (scores.length === 0) return 0;

    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
};

const mentionsProject = (items = []) => (
    items.some((item) => String(item).toLowerCase().includes("project"))
);

const getReadinessBreakdown = (latestReport) => {
    if (!latestReport) {
        return [
            { label: "Content Quality", value: "Missing", tone: "missing" },
            { label: "Skills Relevance", value: "Missing", tone: "missing" },
            { label: "Project Strength", value: "Missing", tone: "missing" },
            { label: "Interview Readiness", value: "Missing", tone: "missing" }
        ];
    }

    const score = Number(latestReport.atsScore) || 0;
    const hasFeedback = Boolean(
        latestReport.strengths?.length
        || latestReport.weaknesses?.length
        || latestReport.suggestions?.length
    );
    const projectStrengthMentioned = mentionsProject(latestReport.strengths || []);
    const projectImprovementMentioned = mentionsProject([
        ...(latestReport.weaknesses || []),
        ...(latestReport.suggestions || [])
    ]);
    const hasInterviewQuestions = Boolean(
        latestReport.interviewQuestions?.technical?.length
        || latestReport.interviewQuestions?.project?.length
        || latestReport.interviewQuestions?.hr?.length
    );

    return [
        {
            label: "Content Quality",
            value: score >= 70 ? "Good" : "Improve",
            tone: getScoreTone(score)
        },
        {
            label: "Skills Relevance",
            value: hasFeedback ? "Good" : "Missing",
            tone: hasFeedback ? "good" : "missing"
        },
        {
            label: "Project Strength",
            value: projectStrengthMentioned ? "Good" : projectImprovementMentioned ? "Improve" : "Missing",
            tone: projectStrengthMentioned ? "good" : projectImprovementMentioned ? "improve" : "missing"
        },
        {
            label: "Interview Readiness",
            value: hasInterviewQuestions ? "Ready" : "Missing",
            tone: hasInterviewQuestions ? "good" : "missing"
        }
    ];
};

const getImprovementActions = (latestReport) => {
    if (!latestReport) return [];

    const suggestions = latestReport.suggestions?.filter(Boolean).slice(0, 3) || [];

    if (suggestions.length > 0) return suggestions;

    return [
        "Add measurable impact to project descriptions",
        "Add role-specific keywords from target jobs",
        "Add GitHub/live links for important projects"
    ];
};

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
    const latestScore = Number(latestReport?.atsScore);
    const latestScoreAvailable = Number.isFinite(latestScore);
    const bestScore = getBestScore(resumes);
    const averageScore = getAverageScore(resumes);
    const focusItem = latestReport?.weaknesses?.[0]
        || latestReport?.suggestions?.[0]
        || "Upload your first resume to get personalized improvement insights.";
    const healthScore = latestReport && latestScoreAvailable ? latestScore : averageScore;
    const healthLabel = latestReport && latestScoreAvailable ? getScoreLabel(healthScore) : latestReport ? "Unavailable" : "No Reports";
    const healthClass = latestReport && latestScoreAvailable ? getScoreClass(healthScore) : "neutral";
    const readinessBreakdown = getReadinessBreakdown(latestReport);
    const improvementActions = getImprovementActions(latestReport);

    return (
        <main className="page dashboard-page">
            <section className="dashboard-hero">
                <div className="dashboard-hero-copy">
                    <div className="eyebrow">Resume Intelligence</div>
                    <h1>Welcome back, {user?.name || "User"}.</h1>
                    <p>
                        Track your resume performance, spot the next best improvement,
                        and keep every AI report within reach.
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

                <div className={`resume-health-card ${healthClass}`}>
                    <div className="health-card-top">
                        <span>Resume Readiness</span>
                        <strong>{loading ? "..." : healthLabel}</strong>
                    </div>
                    <div className="health-score">
                        {loading ? "..." : latestScoreAvailable || !latestReport ? `${healthScore}/100` : "Unavailable"}
                    </div>
                    <div className="health-meter" aria-hidden="true">
                        <span style={{ width: `${Math.min(healthScore, 100)}%` }}></span>
                    </div>
                    <p>
                        {latestReport
                            ? "A quick readiness snapshot from your latest ATS score, AI feedback, projects, and interview prep."
                            : "Analyze your first resume to calculate readiness."}
                    </p>

                    <ul className="readiness-breakdown">
                        {readinessBreakdown.map((item) => (
                            <li className={item.tone} key={item.label}>
                                {item.label}
                                <span>{item.value}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <section className="dashboard-insights-grid">
                <article className="insight-card">
                    <span>Total Reports</span>
                    <h3>{loading ? "..." : totalReports}</h3>
                    <p>Resume analyses generated so far.</p>
                </article>

                <article className="insight-card accent" title="Based on your latest resume analysis">
                    <span>Latest ATS Score</span>
                    <h3>{loading ? "..." : latestScoreAvailable ? `${latestScore}/100` : "Unavailable"}</h3>
                    <p>{latestReport && latestScoreAvailable ? getScoreLabel(latestScore) : "No report yet"}</p>
                </article>

                <article className="insight-card" title="Highest score across all saved reports">
                    <span>Best ATS Score</span>
                    <h3>{loading ? "..." : `${bestScore}/100`}</h3>
                    <p>Your strongest report score.</p>
                </article>

                <article className="insight-card" title="Average score from your resume history">
                    <span>Average ATS Score</span>
                    <h3>{loading ? "..." : `${averageScore}/100`}</h3>
                    <p>Average across all saved reports.</p>
                </article>
            </section>

            <section className="focus-panel" title="Based on your latest weakness/suggestion">
                <div className="focus-panel-header">
                    <div className="eyebrow">Improvement Focus</div>
                    <h2>Next best upgrade</h2>
                    <span className="focus-badge">High impact</span>
                </div>
                <div className="focus-panel-body">
                    <p>{loading ? "Finding your next focus area..." : focusItem}</p>

                    {latestReport ? (
                        <ol className="focus-actions">
                            {improvementActions.map((action) => (
                                <li key={action}>{action}</li>
                            ))}
                        </ol>
                    ) : (
                        <p className="focus-empty">
                            Upload your first resume to get personalized improvement insights.
                        </p>
                    )}
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
                        <p>Upload your first resume to see ATS trends, AI feedback, interview questions, and downloadable reports here.</p>
                        <Link className="btn-primary link-button empty-action" to="/upload">
                            Analyze New Resume
                        </Link>
                    </div>
                ) : (
                    <div className="recent-list dashboard-recent-list">
                        {resumes.slice(0, 3).map((resume) => {
                            const score = Number(resume.atsScore);
                            const hasScore = Number.isFinite(score);
                            const status = getScoreLabel(score);
                            const scoreClass = hasScore ? getScoreClass(score) : "neutral";

                            return (
                                <article className="recent-card dashboard-recent-card" key={resume._id}>
                                    <div className="recent-report-main">
                                        <h3>{resume.originalName || resume.filename}</h3>
                                        <p>{new Date(resume.createdAt).toLocaleDateString()}</p>
                                    </div>

                                    <div className="recent-report-meta">
                                        <span className={`score-badge ${scoreClass}`}>
                                            {hasScore ? `${score}/100` : "No score"}
                                        </span>
                                        <span className={`status-label ${scoreClass}`}>
                                            {hasScore ? status : "Unavailable"}
                                        </span>
                                        <Link className="btn-secondary" to={`/result/${resume._id}`}>
                                            View
                                        </Link>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </main>
    );
}

export default Dashboard;

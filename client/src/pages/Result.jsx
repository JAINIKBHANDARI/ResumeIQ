import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

function Result() {
    const { id } = useParams();

    const [resume, setResume] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await api.get(`/resume/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setResume(response.data.resume);
            } catch (error) {
                setError(
                    error.response?.data?.message || "Failed to fetch result"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchResult();
    }, [id]);

    if (loading) {
        return (
            <main className="page">
                <section className="empty-state">
                    <h2>Loading analysis...</h2>
                    <p>Please wait while we fetch your resume report.</p>
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
                    <div className="eyebrow">AI Report</div>
                    <h1>Resume Analysis Result</h1>
                    <p>Your ATS score, suggestions, action plan, and interview questions.</p>
                </div>
            </section>

            <section className="result-grid">
                <div className="score-card">
                    <span>ATS Score</span>
                    <h2>{resume.atsScore}/100</h2>
                    <p>Based on resume structure, skills, projects, and clarity.</p>
                </div>

                <div className="result-card">
                    <h2>Strengths</h2>
                    <ul>
                        {resume.strengths?.map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                </div>

                <div className="result-card">
                    <h2>Weaknesses</h2>
                    <ul>
                        {resume.weaknesses?.map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                </div>

                <div className="result-card">
                    <h2>Suggestions</h2>
                    <ul>
                        {resume.suggestions?.map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                </div>
            </section>


            <section className="questions-section">
                <h2>Interview Questions</h2>

                <div className="questions-grid">
                    <div className="result-card">
                        <h3>Technical</h3>
                        <ul>
                            {resume.interviewQuestions?.technical?.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="result-card">
                        <h3>Project Based</h3>
                        <ul>
                            {resume.interviewQuestions?.project?.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="result-card">
                        <h3>HR</h3>
                        <ul>
                            {resume.interviewQuestions?.hr?.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default Result;
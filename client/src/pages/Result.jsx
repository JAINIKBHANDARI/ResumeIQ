import { downloadReportPdf } from "../utils/downloadReportPdf";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

function Result() {
    const { id } = useParams();

    const [resume, setResume] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isSpeaking, setIsSpeaking] = useState(false);

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

    useEffect(() => {
        return () => {
            window.speechSynthesis?.cancel();
        };
    }, []);

    const formatListForSpeech = (title, items = []) => {
        if (!items.length) return `${title}: No data available.`;

        return `${title}: ${items.join(". ")}.`;
    };

    const getReportSpeechText = () => [
        "ResumeIQ Analysis Report.",
        `ATS Score: ${resume.atsScore || 0} out of 100.`,
        "The ATS score is generated based on resume structure, skill relevance, project quality, keyword usage, clarity, completeness, and overall role-readiness.",
        formatListForSpeech("Strengths", resume.strengths),
        formatListForSpeech("Weaknesses", resume.weaknesses),
        formatListForSpeech("Suggestions", resume.suggestions),
        formatListForSpeech("Technical Questions", resume.interviewQuestions?.technical),
        formatListForSpeech("Project Based Questions", resume.interviewQuestions?.project),
        formatListForSpeech("HR Questions", resume.interviewQuestions?.hr)
    ].join(" ");

    const handleReadReport = () => {
        if (!("speechSynthesis" in window)) {
            alert("Read aloud is not supported in this browser.");
            return;
        }

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(getReportSpeechText());
        utterance.rate = 0.95;
        utterance.pitch = 1;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    const handleStopReading = () => {
        window.speechSynthesis?.cancel();
        setIsSpeaking(false);
    };

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

            <div className="result-actions">
                <button
                    onClick={() => downloadReportPdf(resume)}
                    className="download-btn"
                >
                    Download Report as PDF
                </button>

                <button
                    onClick={isSpeaking ? handleStopReading : handleReadReport}
                    className="read-report-btn"
                >
                    {isSpeaking ? "Stop Reading" : "Read Report Aloud"}
                </button>

                {isSpeaking && (
                    <div className="voice-indicator" aria-live="polite">
                        <span className="voice-dot"></span>
                        <span>Reading...</span>
                        <div className="voice-bars" aria-hidden="true">
                            <i></i>
                            <i></i>
                            <i></i>
                        </div>
                    </div>
                )}
            </div>

            <div id="resume-report" className="report-section">
                <section className="result-grid">
                    <div className="score-card">
                        <span>ATS Score</span>
                        <h2>{resume.atsScore}/100</h2>
                        <p>Based on resume structure, skills, projects, and clarity.</p>
                        <p className="ats-score-note">
                            The ATS score is generated based on resume structure, skill relevance,
                            project quality, keyword usage, clarity, completeness, and overall role-readiness.
                        </p>
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
            </div>
        </main>
    );
}

export default Result;

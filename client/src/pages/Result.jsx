import { downloadReportPdf } from "../utils/downloadReportPdf";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/useAuth";

function Result() {
    const { id } = useParams();
    const { token } = useAuth();

    const [resume, setResume] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isSpeaking, setIsSpeaking] = useState(false);
    const speechQueueRef = useRef([]);
    const speechIndexRef = useRef(0);
    const speechStoppedRef = useRef(false);

    useEffect(() => {
        const fetchResult = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
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
    }, [id, token]);

    useEffect(() => {
        return () => {
            speechStoppedRef.current = true;
            window.speechSynthesis?.cancel();
        };
    }, []);

    const hasScore = Number.isFinite(Number(resume?.atsScore));

    const scoreBreakdownItems = [
        ["Contact Information", resume?.scoreBreakdown?.contactInformation, 10],
        ["Resume Sections", resume?.scoreBreakdown?.resumeSections, 15],
        ["Skills and Keywords", resume?.scoreBreakdown?.skillsAndKeywords, 20],
        ["Experience/Projects Quality", resume?.scoreBreakdown?.experienceProjectsQuality, 20],
        ["ATS Formatting", resume?.scoreBreakdown?.atsFormatting, 10],
        ["Quantification and Impact", resume?.scoreBreakdown?.quantificationImpact, 15],
        ["Grammar and Professionalism", resume?.scoreBreakdown?.grammarProfessionalism, 10]
    ].filter(([, value]) => Number.isFinite(Number(value)));

    const resumeHealthItems = [
        ["Section Completeness", resume?.resumeHealth?.sectionCompleteness],
        ["Formatting Quality", resume?.resumeHealth?.formattingQuality],
        ["Keyword Strength", resume?.resumeHealth?.keywordStrength],
        ["Project Impact", resume?.resumeHealth?.projectImpact],
        ["Quantified Achievements", resume?.resumeHealth?.quantifiedAchievements],
        ["Contact Info Status", resume?.resumeHealth?.contactInfoStatus]
    ].filter(([, value]) => value);
    const jobMatchAnalysis = resume?.jobMatchAnalysis;
    const hasJobMatchAnalysis = Boolean(jobMatchAnalysis);
    const jobMatchScore = Number(jobMatchAnalysis?.matchScore);
    const hasJobMatchScore = Number.isFinite(jobMatchScore);

    const renderListItems = (items = []) => {
        const normalizedItems = Array.isArray(items) ? items : [];

        if (!normalizedItems.length) return <li>No data available.</li>;

        return normalizedItems.map((item, index) => (
            <li key={index}>{item}</li>
        ));
    };

    const formatListForSpeech = (title, items = []) => {
        const normalizedItems = Array.isArray(items) ? items : [];

        if (!normalizedItems.length) return `${title}: No data available.`;

        return `${title}: ${normalizedItems.join(". ")}.`;
    };

    const getJobMatchSpeechText = () => {
        if (!hasJobMatchAnalysis) return "";

        return [
            "Job Match Analyzer.",
            hasJobMatchScore
                ? `Match Score: ${jobMatchScore} out of 100.`
                : "Match Score is unavailable.",
            jobMatchAnalysis.targetRole ? `Target Role: ${jobMatchAnalysis.targetRole}.` : "",
            jobMatchAnalysis.readinessLevel ? `Readiness Level: ${jobMatchAnalysis.readinessLevel}.` : "",
            jobMatchAnalysis.summary ? `Summary: ${jobMatchAnalysis.summary}.` : "",
            formatListForSpeech("Matched Skills", jobMatchAnalysis.matchedSkills),
            formatListForSpeech("Missing Skills", jobMatchAnalysis.missingSkills),
            formatListForSpeech("Missing Keywords", jobMatchAnalysis.missingKeywords),
            formatListForSpeech("Role-specific Suggestions", jobMatchAnalysis.roleSpecificSuggestions),
            formatListForSpeech("Resume Rewrite Tips", jobMatchAnalysis.resumeRewriteTips)
        ].filter(Boolean).join(" ");
    };

    const getReportSpeechText = () => [
        "ResumeIQ Analysis Report.",
        hasScore ? `ATS Score: ${resume.atsScore} out of 100.` : "ATS Score is unavailable.",
        "The ATS score is generated based on resume structure, skill relevance, project quality, keyword usage, clarity, completeness, and overall role-readiness.",
        formatListForSpeech("Strengths", resume.strengths),
        formatListForSpeech("Weaknesses", resume.weaknesses),
        formatListForSpeech("Suggestions", resume.suggestions),
        formatListForSpeech("Technical Questions", resume.interviewQuestions?.technical),
        formatListForSpeech("Project Based Questions", resume.interviewQuestions?.project),
        formatListForSpeech("HR Questions", resume.interviewQuestions?.hr),
        getJobMatchSpeechText()
    ].join(" ");

    const splitSpeechText = (text) => {
        const sentences = text
            .replace(/\s+/g, " ")
            .match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
        const chunks = [];
        let currentChunk = "";

        sentences.forEach((sentence) => {
            if (`${currentChunk} ${sentence}`.trim().length > 180 && currentChunk) {
                chunks.push(currentChunk);
                currentChunk = sentence;
            } else {
                currentChunk = `${currentChunk} ${sentence}`.trim();
            }
        });

        if (currentChunk) chunks.push(currentChunk);

        return chunks;
    };

    const speakNextChunk = () => {
        if (speechStoppedRef.current) return;

        const text = speechQueueRef.current[speechIndexRef.current];

        if (!text) {
            setIsSpeaking(false);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;

        utterance.onend = () => {
            speechIndexRef.current += 1;
            speakNextChunk();
        };

        utterance.onerror = () => {
            setIsSpeaking(false);
        };

        window.speechSynthesis.speak(utterance);

        setTimeout(() => {
            window.speechSynthesis?.resume();
        }, 80);
    };

    const handleReadReport = () => {
        if (!("speechSynthesis" in window)) {
            alert("Read aloud is not supported in this browser.");
            return;
        }

        speechStoppedRef.current = true;
        window.speechSynthesis.cancel();
        speechStoppedRef.current = false;
        speechIndexRef.current = 0;
        speechQueueRef.current = splitSpeechText(getReportSpeechText());
        setIsSpeaking(true);
        speakNextChunk();
    };

    const handleStopReading = () => {
        speechStoppedRef.current = true;
        speechQueueRef.current = [];
        speechIndexRef.current = 0;
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
                        <h2>{hasScore ? `${resume.atsScore}/100` : "Score unavailable"}</h2>
                        <p>Based on contact info, sections, keywords, project quality, formatting, impact, and professionalism.</p>
                        <p className="ats-score-note">
                            The ATS score is generated based on resume structure, skill relevance,
                            project quality, keyword usage, clarity, completeness, and overall role-readiness.
                        </p>
                    </div>

                    {scoreBreakdownItems.length > 0 && (
                        <div className="result-card score-breakdown-card">
                            <h2>Score Breakdown</h2>
                            <div className="score-breakdown-list">
                                {scoreBreakdownItems.map(([label, value, max]) => (
                                    <div className="score-breakdown-item" key={label}>
                                        <div>
                                            <span>{label}</span>
                                            <strong>{value}/{max}</strong>
                                        </div>
                                        <div className="score-breakdown-meter" aria-hidden="true">
                                            <span style={{ width: `${Math.min((Number(value) / max) * 100, 100)}%` }}></span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

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

                    {resume.missingKeywords?.length > 0 && (
                        <div className="result-card">
                            <h2>Missing Keywords</h2>
                            <ul>
                                {resume.missingKeywords.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {resumeHealthItems.length > 0 && (
                        <div className="result-card resume-health-result-card">
                            <h2>Resume Health Analysis</h2>
                            <ul>
                                {resumeHealthItems.map(([label, value]) => (
                                    <li key={label}>
                                        <strong>{label}:</strong> {value}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </section>

                {hasJobMatchAnalysis && (
                    <section className="job-match-section">
                        <div className="section-title-row job-match-title-row">
                            <div>
                                <div className="eyebrow">Role Fit Analysis</div>
                                <h2>Job Match Analyzer</h2>
                            </div>
                        </div>

                        <div className="job-match-grid">
                            <div className="score-card job-match-score-card">
                                <span>Match Score</span>
                                <h2>{hasJobMatchScore ? `${jobMatchScore}/100` : "Unavailable"}</h2>
                                <p>
                                    {jobMatchAnalysis.targetRole
                                        ? `Target Role: ${jobMatchAnalysis.targetRole}`
                                        : "Target role was inferred from the provided context."}
                                </p>
                                <p className="ats-score-note">
                                    Job description provided: {jobMatchAnalysis.jobDescriptionProvided ? "Yes" : "No"}
                                </p>
                            </div>

                            <div className="result-card job-match-summary-card">
                                <h3>Readiness Level</h3>
                                <p>{jobMatchAnalysis.readinessLevel || "No readiness level available."}</p>
                                <h3>Summary</h3>
                                <p>{jobMatchAnalysis.summary || "No summary available."}</p>
                            </div>

                            <div className="result-card">
                                <h3>Matched Skills</h3>
                                <ul>{renderListItems(jobMatchAnalysis.matchedSkills)}</ul>
                            </div>

                            <div className="result-card">
                                <h3>Missing Skills</h3>
                                <ul>{renderListItems(jobMatchAnalysis.missingSkills)}</ul>
                            </div>

                            <div className="result-card">
                                <h3>Missing Keywords</h3>
                                <ul>{renderListItems(jobMatchAnalysis.missingKeywords)}</ul>
                            </div>

                            <div className="result-card">
                                <h3>Role-specific Suggestions</h3>
                                <ul>{renderListItems(jobMatchAnalysis.roleSpecificSuggestions)}</ul>
                            </div>

                            <div className="result-card job-match-wide-card">
                                <h3>Resume Rewrite Tips</h3>
                                <ul>{renderListItems(jobMatchAnalysis.resumeRewriteTips)}</ul>
                            </div>
                        </div>
                    </section>
                )}

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

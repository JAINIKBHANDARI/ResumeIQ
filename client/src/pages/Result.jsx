import { downloadReportPdf } from "../utils/downloadReportPdf";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

function Result() {
    const { id } = useParams();

    const [resume, setResume] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isSpeaking, setIsSpeaking] = useState(false);
    const speechQueueRef = useRef([]);
    const speechIndexRef = useRef(0);
    const speechStoppedRef = useRef(false);

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
            speechStoppedRef.current = true;
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

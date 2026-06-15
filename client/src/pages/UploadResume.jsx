import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/useAuth";

const ROLE_OPTIONS = [
    "General Fresher",
    "Frontend Developer",
    "Backend Developer",
    "MERN Developer",
    "Java Developer",
    "Python Developer",
    "Data Analyst",
    "AI/ML Intern",
    "Cyber Security",
    "Other / Custom Role"
];

function UploadResume() {
    const navigate = useNavigate();
    const { token } = useAuth();

    const [file, setFile] = useState(null);
    const [targetRole, setTargetRole] = useState("");
    const [customRole, setCustomRole] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError("");
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!file) {
            setError("Please select a resume PDF first");
            return;
        }

        if (!token) {
            setError("Please login first");
            return;
        }

        const formData = new FormData();
        formData.append("resume", file);

        if (targetRole.trim()) {
            formData.append("targetRole", targetRole.trim());
        }

        if (targetRole === "Other / Custom Role" && customRole.trim()) {
            formData.append("customRole", customRole.trim());
        }

        if (jobDescription.trim()) {
            formData.append("jobDescription", jobDescription.trim());
        }

        setLoading(true);
        setError("");

        try {
            const response = await api.post("/resume/upload", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });

            const resumeId = response.data.resume.id;

            navigate(`/result/${resumeId}`);

        } catch (error) {
            setError(
                error.response?.data?.message ||
        "Analysis failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="page">
            <section className="section-header">
                <div>
                    <div className="eyebrow">Upload Resume</div>
                    <h1>Analyze a resume</h1>
                    <p>Upload a text-based PDF resume to generate AI feedback.</p>
                </div>
            </section>

            <section className="upload-card">
                <form className="upload-box" onSubmit={handleUpload}>
                    <h2>Upload your resume</h2>
                    <p>Choose a PDF resume. ResumeIQ will extract text and generate AI analysis.</p>

                    {error && <div className="alert-error">{error}</div>}

                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                    />

                    {file && (
                        <div className="file-preview">
                            Selected file: <strong>{file.name}</strong>
                        </div>
                    )}

                    <div className="job-match-fields">
                        <div className="job-match-header">
                            <h3>Job Match Analyzer</h3>
                            <p>
                                Adding a target role or job description gives more accurate feedback.
                                You can also skip this for general resume analysis.
                            </p>
                        </div>

                        <label htmlFor="targetRole">Target Role / Domain (Optional)</label>
                        <select
                            id="targetRole"
                            value={targetRole}
                            onChange={(e) => {
                                setTargetRole(e.target.value);

                                if (e.target.value !== "Other / Custom Role") {
                                    setCustomRole("");
                                }
                            }}
                        >
                            <option value="">Select a role</option>
                            {ROLE_OPTIONS.map((role) => (
                                <option value={role} key={role}>
                                    {role}
                                </option>
                            ))}
                        </select>

                        {targetRole === "Other / Custom Role" && (
                            <>
                                <label htmlFor="customRole">Custom Role (Optional)</label>
                                <input
                                    id="customRole"
                                    type="text"
                                    value={customRole}
                                    onChange={(e) => setCustomRole(e.target.value)}
                                    placeholder="Example: DevOps Intern"
                                />
                            </>
                        )}

                        <label htmlFor="jobDescription">Job Description (Optional)</label>
                        <textarea
                            id="jobDescription"
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Paste job description here..."
                            rows="7"
                        />
                    </div>

                    <button className="btn-primary analyze-button" type="submit" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Analyzing Resume...
                            </>
                        ) : (
                            "Analyze Resume"
                        )}
                    </button>
                    {loading && (
                        <p className="helper-text">
                            Analysis may take a few seconds.
                        </p>
                    )}
                </form>
            </section>
        </main>
    );
}

export default UploadResume;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    isTimeoutError,
    logSafeApiError,
    logSafeApiRequest,
    pingServerHealth,
    postWithWakeRetry,
    REQUEST_TIMEOUTS
} from "../api/axios";
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

const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024;
const JOB_DESCRIPTION_LIMIT = 8000;

const isPdfFile = (selectedFile) => {
    if (!selectedFile) return false;

    const hasPdfExtension = selectedFile.name?.toLowerCase().endsWith(".pdf");
    const allowedMimeTypes = [
        "application/pdf",
        "application/x-pdf",
        "application/octet-stream",
        ""
    ];
    const hasPdfType = allowedMimeTypes.includes(selectedFile.type);

    return hasPdfExtension && hasPdfType;
};

const getUploadErrorMessage = async (error) => {
    if (error.response) {
        const status = error.response.status;
        const serverMessage = error.response.data?.message;

        if (serverMessage) {
            return serverMessage;
        }

        if (status === 413) {
            return "File is too large. Please upload a PDF under 5MB.";
        }

        if (status === 400) {
            return "Please upload a valid text-based PDF resume.";
        }

        if (status === 404) {
            return "Upload service route was not found. Please refresh and try again.";
        }

        if (status === 502 || status === 503 || status === 504) {
            return "The analysis server is waking up or busy. Please wait a moment and try again.";
        }

        if (status >= 500) {
            return "AI analysis failed. Please try again in a few minutes.";
        }

        return "Analysis failed. Please try again.";
    }

    if (isTimeoutError(error)) {
        const isHealthy = error.__healthChecked
            ? error.__serverHealthy
            : await pingServerHealth({ force: true });

        return isHealthy
            ? "Server is reachable, but analysis timed out. Please try again."
            : "Analysis is taking longer than expected. Please wait and try again.";
    }

    if (error.request && !error.response) {
        const baseURL = error.config?.baseURL || "";
        const isLocalApiOnDeployedSite = (
            baseURL.includes("localhost")
            || baseURL.includes("127.0.0.1")
        ) && !["localhost", "127.0.0.1"].includes(window.location.hostname);

        if (isLocalApiOnDeployedSite) {
            return "Backend API URL is not configured for production. Please check the deployed frontend API setting.";
        }

        const isHealthy = error.__healthChecked
            ? error.__serverHealthy
            : await pingServerHealth({ force: true });

        return isHealthy
            ? "Server is reachable, but the request failed. Please try again."
            : "Unable to reach the server. Please check your connection and try again.";
    }

    return "Analysis failed. Please try again.";
};

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
        const selectedFile = e.target.files?.[0] || null;

        if (!selectedFile) {
            setFile(null);
            setError("");
            return;
        }

        if (!isPdfFile(selectedFile)) {
            setFile(null);
            e.target.value = "";
            setError("Only PDF resume files are supported.");
            return;
        }

        if (selectedFile.size > MAX_RESUME_SIZE_BYTES) {
            setFile(null);
            e.target.value = "";
            setError("File is too large. Please upload a PDF under 5MB.");
            return;
        }

        setFile(selectedFile);
        setError("");
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        if (loading) {
            return;
        }

        if (!file) {
            setError("Please select a resume PDF first");
            return;
        }

        if (!isPdfFile(file)) {
            setError("Only PDF resume files are supported.");
            return;
        }

        if (file.size > MAX_RESUME_SIZE_BYTES) {
            setError("File is too large. Please upload a PDF under 5MB.");
            return;
        }

        if (!token) {
            setError("Please login first");
            return;
        }

        const formData = new FormData();
        formData.append("resume", file);
        formData.append("authToken", token);
        formData.append("targetRole", targetRole.trim());
        formData.append(
            "customRole",
            targetRole === "Other / Custom Role" ? customRole.trim() : ""
        );
        formData.append("jobDescription", jobDescription.trim().slice(0, JOB_DESCRIPTION_LIMIT));

        setLoading(true);
        setError("");

        try {
            logSafeApiRequest("Upload", "/resume/upload");

            let response;

            try {
                response = await postWithWakeRetry("/resume/upload", formData, {
                    timeout: REQUEST_TIMEOUTS.upload
                });
            } catch (uploadError) {
                if (uploadError.response?.status !== 401) {
                    throw uploadError;
                }

                response = await postWithWakeRetry("/resume/upload", formData, {
                    timeout: REQUEST_TIMEOUTS.upload,
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            }

            const resumeId = response.data.resume.id;

            navigate(`/result/${resumeId}`);

        } catch (error) {
            logSafeApiError("Resume upload", error);

            setError(await getUploadErrorMessage(error));
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
                            Analyzing resume... This may take a few seconds on first request.
                        </p>
                    )}
                </form>
            </section>
        </main>
    );
}

export default UploadResume;

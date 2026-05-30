import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function UploadResume() {
    const navigate = useNavigate();

    const [file, setFile] = useState(null);
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

        const token = localStorage.getItem("token");

        if (!token) {
            setError("Please login first");
            return;
        }

        const formData = new FormData();
        formData.append("resume", file);

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
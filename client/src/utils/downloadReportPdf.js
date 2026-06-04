import jsPDF from "jspdf";

export const downloadReportPdf = (resume) => {
    if (!resume) {
        alert("No resume report found");
        return;
    }

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 16;
    const bottomMargin = 18;
    const contentWidth = pageWidth - margin * 2;
    let y = 20;
    const hasScore = Number.isFinite(Number(resume.atsScore));
    const scoreBreakdownItems = [
        ["Contact Information", resume.scoreBreakdown?.contactInformation, 10],
        ["Resume Sections", resume.scoreBreakdown?.resumeSections, 15],
        ["Skills and Keywords", resume.scoreBreakdown?.skillsAndKeywords, 20],
        ["Experience/Projects Quality", resume.scoreBreakdown?.experienceProjectsQuality, 20],
        ["ATS Formatting", resume.scoreBreakdown?.atsFormatting, 15],
        ["Quantification and Impact", resume.scoreBreakdown?.quantificationImpact, 10],
        ["Grammar and Professionalism", resume.scoreBreakdown?.grammarProfessionalism, 10]
    ].filter(([, value]) => Number.isFinite(Number(value)));

    const addPageIfNeeded = (requiredHeight = 10) => {
        if (y + requiredHeight > pageHeight - bottomMargin) {
            pdf.addPage();
            y = 20;
        }
    };

    const addWrappedText = (text, options = {}) => {
        const {
            font = "normal",
            fontSize = 11,
            lineHeight = 6,
            indent = 0,
            color = [31, 41, 55],
            gapAfter = 3
        } = options;

        pdf.setFont("helvetica", font);
        pdf.setFontSize(fontSize);
        pdf.setTextColor(...color);

        const lines = pdf.splitTextToSize(String(text || ""), contentWidth - indent);

        lines.forEach((line) => {
            addPageIfNeeded(lineHeight);
            pdf.text(line, margin + indent, y);
            y += lineHeight;
        });

        y += gapAfter;
    };

    const addSectionTitle = (title) => {
        addPageIfNeeded(14);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.setTextColor(17, 24, 39);
        pdf.text(title, margin, y);
        y += 8;
    };

    const addList = (items) => {
        const normalizedItems = Array.isArray(items) && items.length > 0
            ? items
            : ["No data available."];

        normalizedItems.forEach((item) => {
            addWrappedText(`- ${item}`, {
                lineHeight: 5.8,
                indent: 2,
                gapAfter: 1
            });
        });

        y += 3;
    };

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    pdf.setTextColor(2, 6, 23);
    pdf.text("ResumeIQ Analysis Report", margin, y);
    y += 10;

    addWrappedText(`Generated date: ${new Date().toLocaleDateString()}`, {
        fontSize: 10,
        color: [107, 114, 128],
        gapAfter: 5
    });

    addSectionTitle("ATS Score");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(26);
    pdf.setTextColor(37, 99, 235);
    pdf.text(hasScore ? `${resume.atsScore}/100` : "Score unavailable", margin, y);
    y += 12;

    addWrappedText(
        "The ATS score is generated based on resume structure, skill relevance, project quality, keyword usage, clarity, completeness, and overall role-readiness."
    );

    if (scoreBreakdownItems.length > 0) {
        addSectionTitle("Score Breakdown");
        scoreBreakdownItems.forEach(([label, value, max]) => {
            addWrappedText(`${label}: ${value}/${max}`, {
                lineHeight: 5.8,
                gapAfter: 1
            });
        });
    }

    addSectionTitle("Strengths");
    addList(resume.strengths);

    addSectionTitle("Weaknesses");
    addList(resume.weaknesses);

    addSectionTitle("Suggestions");
    addList(resume.suggestions);

    addSectionTitle("Technical Questions");
    addList(resume.interviewQuestions?.technical);

    addSectionTitle("Project Based Questions");
    addList(resume.interviewQuestions?.project);

    addSectionTitle("HR Questions");
    addList(resume.interviewQuestions?.hr);

    pdf.save("ResumeIQ_Analysis_Report.pdf");
};

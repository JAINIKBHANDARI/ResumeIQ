const { GoogleGenAI } = require("@google/genai");
const {
    calculateAtsScore,
    calculateJobMatchScore,
    deterministicFallbackJobMatch,
    deterministicFallbackScore,
    validateAnalysis
} = require("./atsScoring");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const hasJobMatchContext = (jobMatchInput = {}) => Boolean(
    jobMatchInput.targetRole || jobMatchInput.jobDescription
);

const buildJobMatchPromptSection = (jobMatchInput = {}, fixedJobMatchAnalysis = null) => {
    if (!hasJobMatchContext(jobMatchInput)) {
        return `
No target role or job description was provided.
Do not include jobMatchAnalysis in the JSON response.
`;
    }

    return `
Job Match Analyzer context:
- Target role/domain: ${jobMatchInput.targetRole || "Not provided. Infer from job description if possible."}
- Job description provided: ${jobMatchInput.jobDescription ? "Yes" : "No"}
- Fixed backend Job Match score: ${fixedJobMatchAnalysis?.matchScore ?? "Not applicable"}
- Fixed matched skills: ${JSON.stringify(fixedJobMatchAnalysis?.matchedSkills || [])}
- Fixed missing skills: ${JSON.stringify(fixedJobMatchAnalysis?.missingSkills || [])}
- Fixed missing keywords: ${JSON.stringify(fixedJobMatchAnalysis?.missingKeywords || [])}
- Job description:
${jobMatchInput.jobDescription || "Not provided."}

Also include this optional object in the JSON response:
"jobMatchAnalysis": {
  "targetRole": "${jobMatchInput.targetRole || ""}",
  "jobDescriptionProvided": ${jobMatchInput.jobDescription ? "true" : "false"},
  "matchScore": 0,
  "matchedSkills": [],
  "missingSkills": [],
  "missingKeywords": [],
  "roleSpecificSuggestions": [],
  "resumeRewriteTips": [],
  "readinessLevel": "",
  "summary": ""
}

Job match rules:
- Generate jobMatchAnalysis because a target role or job description was provided.
- Use the fixed backend Job Match score exactly as given. Do not modify, recalculate, increase, or decrease matchScore.
- If job description is not provided, set jobDescriptionProvided to false and compare against expected role skills and keywords.
- If target role is not provided but job description exists, infer targetRole from the job description if possible.
- Use fixed matchedSkills, missingSkills, and missingKeywords as the source of truth.
- roleSpecificSuggestions and resumeRewriteTips must be practical resume edits for this exact role/JD.
- Keep the analysis strict, specific, and useful for applying to that role.
`;
};

const buildPrompt = (resumeText, jobMatchInput = {}, fixedAtsAnalysis, fixedJobMatchAnalysis) => `
You are ResumeIQ's strict ATS resume evaluator and recruiter-style resume coach for students, freshers, and early-career developers.

Backend has already calculated the final ATS score and score breakdown using deterministic JavaScript logic.
Use the provided ATS score, ATS breakdown, and Job Match score exactly as given.
Do not modify, recalculate, increase, or decrease any numeric score.
Your task is only to generate human-readable analysis, strengths, weaknesses, improvement suggestions, interview questions, and rewrite tips based on the fixed scores.
Be strict but helpful. Do not overpraise weak resumes. Mention specific resume sections, skills, projects, tools, or missing evidence when the resume text supports it.

Fixed backend ATS score:
${fixedAtsAnalysis.atsScore}

Fixed backend ATS breakdown:
${JSON.stringify(fixedAtsAnalysis.scoreBreakdown, null, 2)}

Return JSON only with this exact shape:
{
  "atsScore": ${fixedAtsAnalysis.atsScore},
  "scoreBreakdown": ${JSON.stringify(fixedAtsAnalysis.scoreBreakdown)},
  "strengths": [],
  "weaknesses": [],
  "missingKeywords": [],
  "improvementSuggestions": [
    {
      "title": "",
      "description": ""
    }
  ],
  "resumeHealth": {
    "sectionCompleteness": "",
    "formattingQuality": "",
    "keywordStrength": "",
    "projectImpact": "",
    "quantifiedAchievements": "",
    "contactInfoStatus": ""
  },
  "interviewQuestions": {
    "technical": [],
    "project": [],
    "hr": []
  }
}

Rules:
- Return only valid JSON.
- atsScore and scoreBreakdown must exactly match the fixed backend values above.
- Include 3-5 strengths, 3-5 weaknesses, 3-6 missingKeywords, and 5-7 improvementSuggestions.
- Include exactly 5 technical, 5 project, and 5 HR interview questions.
- Every strength and weakness must be 1-2 full sentences. Avoid short generic lines such as "Skills are present" or "Projects can improve".
- Strengths should explain what is good and why it helps ATS/recruiter review. Example style: "The resume includes relevant technical skills such as React.js, Node.js, and MongoDB, which align well with full-stack development roles."
- Weaknesses should explain what is missing or weak and why it lowers the resume quality. Example style: "Project descriptions should include clearer technical contributions, APIs developed, database usage, authentication flow, and measurable impact."
- Each improvementSuggestions item must have a short title and a 1-2 sentence description explaining what is wrong, why it matters, and how to improve it.
- Resume health fields must be descriptive 1-2 sentence explanations, not only labels such as "Good" or "Weak".
- Missing keywords should be specific skills, tools, role keywords, or resume sections that would improve the user's target fit. Do not invent advanced tools if the resume does not suggest that path.
- Interview questions should be practical and based on the user's resume content when possible. Project questions should ask about architecture, APIs, database design, authentication, trade-offs, measurable outcomes, and ownership.
- Keep feedback detailed but readable. Do not write long essays.
${buildJobMatchPromptSection(jobMatchInput, fixedJobMatchAnalysis)}

Resume Text:
${resumeText}
`;

const parseGeminiJson = (text) => {
    const cleanedText = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    return JSON.parse(cleanedText);
};

const analyzeResumeWithAI = async (resumeText, jobMatchInput = {}) => {
    const fixedAtsAnalysis = calculateAtsScore(resumeText);
    const fixedJobMatchAnalysis = calculateJobMatchScore(
        resumeText,
        jobMatchInput.targetRole,
        jobMatchInput.jobDescription
    );

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: buildPrompt(resumeText, jobMatchInput, fixedAtsAnalysis, fixedJobMatchAnalysis),
            config: {
                responseMimeType: "application/json",
                temperature: 0.1
            }
        });

        const aiResult = parseGeminiJson(response.text.trim());

        return validateAnalysis(aiResult, resumeText, jobMatchInput, {
            atsAnalysis: fixedAtsAnalysis,
            jobMatchAnalysis: fixedJobMatchAnalysis
        });
    } catch (error) {
        console.error("Gemini analysis failed safely:", error.message);
        const fallbackAnalysis = deterministicFallbackScore(resumeText);
        const jobMatchAnalysis = fixedJobMatchAnalysis || deterministicFallbackJobMatch(resumeText, jobMatchInput);
        const fixedFallbackAnalysis = {
            ...fallbackAnalysis,
            atsScore: fixedAtsAnalysis.atsScore,
            scoreBreakdown: fixedAtsAnalysis.scoreBreakdown,
            resumeHealth: fallbackAnalysis.resumeHealth
        };

        return jobMatchAnalysis
            ? { ...fixedFallbackAnalysis, jobMatchAnalysis }
            : fixedFallbackAnalysis;
    }
};

module.exports = analyzeResumeWithAI;

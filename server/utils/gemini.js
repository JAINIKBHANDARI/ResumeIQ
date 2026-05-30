const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const analyzeResumeWithAI = async (resumeText) => {
    const prompt = `
You are an AI resume reviewer and interview assistant.

Analyze the resume text and return valid JSON only.

Return this exact JSON structure:
{
  "atsScore": 75,
  "strengths": ["point 1", "point 2", "point 3"],
  "weaknesses": ["point 1", "point 2", "point 3"],
  "suggestions": ["point 1", "point 2", "point 3"],
  "interviewQuestions": {
    "technical": ["question 1", "question 2", "question 3", "question 4", "question 5"],
    "project": ["question 1", "question 2", "question 3", "question 4", "question 5"],
    "hr": ["question 1", "question 2", "question 3", "question 4", "question 5"]
  }
}

Rules:
- Return only valid JSON.
- Do not use markdown.
- Do not add explanation.
- Do not add comments.
- Every array item must be separated by commas.
- atsScore must be a number between 0 and 100.
- strengths must have 3 to 5 points.
- weaknesses must have 3 to 5 points.
- suggestions must have 3 to 5 points.
- technical must have 5 questions.
- project must have 5 questions.
- hr must have 5 questions.

Resume Text:
${resumeText}
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json"
        }
    });

    let text = response.text.trim();

    text = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    let aiResult;

    try {
        aiResult = JSON.parse(text);
    } catch (error) {
        console.log("AI RAW RESPONSE:", text);
        throw new Error("AI returned invalid JSON. Please try uploading again.");
    }

    return {
        atsScore: aiResult.atsScore || 0,

        strengths: Array.isArray(aiResult.strengths)
            ? aiResult.strengths
            : [],

        weaknesses: Array.isArray(aiResult.weaknesses)
            ? aiResult.weaknesses
            : [],

        suggestions: Array.isArray(aiResult.suggestions)
            ? aiResult.suggestions
            : [],

        actionPlan: {
            priorityFixes: Array.isArray(aiResult.actionPlan?.priorityFixes)
                ? aiResult.actionPlan.priorityFixes
                : [],

            keywordSuggestions: Array.isArray(aiResult.actionPlan?.keywordSuggestions)
                ? aiResult.actionPlan.keywordSuggestions
                : [],

            projectImprovements: Array.isArray(aiResult.actionPlan?.projectImprovements)
                ? aiResult.actionPlan.projectImprovements
                : [],

            estimatedImprovement: aiResult.actionPlan?.estimatedImprovement || ""
        },

        interviewQuestions: {
            technical: Array.isArray(aiResult.interviewQuestions?.technical)
                ? aiResult.interviewQuestions.technical
                : [],

            project: Array.isArray(aiResult.interviewQuestions?.project)
                ? aiResult.interviewQuestions.project
                : [],

            hr: Array.isArray(aiResult.interviewQuestions?.hr)
                ? aiResult.interviewQuestions.hr
                : []
        }
    };
};

module.exports = analyzeResumeWithAI;
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const analyzeResumeWithAI = async (resumeText) => {
    const prompt = `
You are an AI resume reviewer.

Analyze this resume text and return ONLY valid JSON.

The JSON format must be exactly:
{
  "atsScore": 75,
  "strengths": ["point 1", "point 2", "point 3"],
  "weaknesses": ["point 1", "point 2", "point 3"],
  "suggestions": ["point 1", "point 2", "point 3"]
}

Rules:
- atsScore must be a number between 0 and 100.
- strengths must be an array of strings.
- weaknesses must be an array of strings.
- suggestions must be an array of strings.
- Do not include markdown.
- Do not include explanation outside JSON.

Resume Text:
${resumeText}
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
    });

    const text = response.text;

    const cleanedText = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    return JSON.parse(cleanedText);
};

module.exports = analyzeResumeWithAI;
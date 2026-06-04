const { GoogleGenAI } = require("@google/genai");
const {
    deterministicFallbackScore,
    validateAnalysis
} = require("./atsScoring");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const buildPrompt = (resumeText) => `
You are ResumeIQ's strict ATS resume evaluator.

Analyze the resume text using this 100-point rubric. Do not cluster around any default score.
Weak or incomplete resumes should score 30-50. Average student resumes should score 55-70.
Good resumes should score 75-85. Excellent resumes should score 85-95.
Do not score above 90 unless the resume has strong evidence, complete sections, measurable impact, and polished formatting.

Rubric:
1. contactInformation: 0-10
- Name present
- Email present
- Phone present
- LinkedIn/GitHub/portfolio present

2. resumeSections: 0-15
- Education present
- Skills present
- Projects or Experience present
- Achievements/Certifications optional
- Proper section headings

3. skillsAndKeywords: 0-20
- Relevant technical skills
- Tools/frameworks
- Role-related keywords
- No keyword stuffing

4. experienceProjectsQuality: 0-20
- Clear project/experience descriptions
- Uses action verbs
- Shows technical contribution
- Mentions tech stack
- Shows impact or outcome

5. atsFormatting: 0-15
- Simple layout
- No tables/images-heavy text dependency
- Good readability
- Bullet points used properly
- Avoids unnecessary symbols

6. quantificationImpact: 0-10
- Numbers/metrics where possible
- Measurable achievements
- Clear outcomes

7. grammarProfessionalism: 0-10
- No spelling mistakes
- Professional wording
- Consistent formatting

Return JSON only with this exact shape:
{
  "atsScore": 0,
  "scoreBreakdown": {
    "contactInformation": 0,
    "resumeSections": 0,
    "skillsAndKeywords": 0,
    "experienceProjectsQuality": 0,
    "atsFormatting": 0,
    "quantificationImpact": 0,
    "grammarProfessionalism": 0
  },
  "strengths": [],
  "weaknesses": [],
  "missingKeywords": [],
  "improvementSuggestions": [],
  "resumeHealth": {
    "sectionCompleteness": "Good | Average | Weak",
    "formattingQuality": "Good | Average | Needs Improvement",
    "keywordStrength": "Good | Average | Weak",
    "projectImpact": "Good | Average | Needs Improvement",
    "quantifiedAchievements": "Good | Average | Weak",
    "contactInfoStatus": "Good | Average | Weak"
  },
  "interviewQuestions": {
    "technical": [],
    "project": [],
    "hr": []
  }
}

Rules:
- Return only valid JSON.
- atsScore must equal the sum of scoreBreakdown categories.
- Never use a default score.
- If evidence is missing, give low category scores.
- Include 3-5 strengths, 3-5 weaknesses, 3-6 missingKeywords, 3-5 improvementSuggestions.
- Include exactly 5 technical, 5 project, and 5 HR interview questions.

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

const analyzeResumeWithAI = async (resumeText) => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: buildPrompt(resumeText),
            config: {
                responseMimeType: "application/json"
            }
        });

        const aiResult = parseGeminiJson(response.text.trim());

        return validateAnalysis(aiResult, resumeText);
    } catch (error) {
        console.error("Gemini analysis failed safely:", error.message);
        return deterministicFallbackScore(resumeText);
    }
};

module.exports = analyzeResumeWithAI;

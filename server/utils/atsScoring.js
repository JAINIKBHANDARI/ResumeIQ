const SCORE_LIMITS = {
    contactInformation: 10,
    resumeSections: 15,
    skillsAndKeywords: 20,
    experienceProjectsQuality: 20,
    atsFormatting: 15,
    quantificationImpact: 10,
    grammarProfessionalism: 10
};

const normalizeScore = (value, max) => {
    const score = Number(value);

    if (!Number.isFinite(score)) return 0;

    return Math.max(0, Math.min(max, Math.round(score)));
};

const countMatches = (text, patterns) => {
    return patterns.reduce((count, pattern) => count + (pattern.test(text) ? 1 : 0), 0);
};

const hasAny = (text, patterns) => patterns.some((pattern) => pattern.test(text));

const getWordCount = (text) => {
    return text.trim().split(/\s+/).filter(Boolean).length;
};

const buildResumeHealth = (breakdown) => ({
    sectionCompleteness: breakdown.resumeSections >= 12 ? "Good" : breakdown.resumeSections >= 8 ? "Average" : "Weak",
    formattingQuality: breakdown.atsFormatting >= 12 ? "Good" : breakdown.atsFormatting >= 8 ? "Average" : "Needs Improvement",
    keywordStrength: breakdown.skillsAndKeywords >= 16 ? "Good" : breakdown.skillsAndKeywords >= 10 ? "Average" : "Weak",
    projectImpact: breakdown.experienceProjectsQuality >= 16 ? "Good" : breakdown.experienceProjectsQuality >= 10 ? "Average" : "Needs Improvement",
    quantifiedAchievements: breakdown.quantificationImpact >= 8 ? "Good" : breakdown.quantificationImpact >= 4 ? "Average" : "Weak",
    contactInfoStatus: breakdown.contactInformation >= 8 ? "Good" : breakdown.contactInformation >= 5 ? "Average" : "Weak"
});

const calculateScoreFromBreakdown = (scoreBreakdown = {}) => {
    const normalizedBreakdown = Object.keys(SCORE_LIMITS).reduce((result, key) => {
        result[key] = normalizeScore(scoreBreakdown[key], SCORE_LIMITS[key]);
        return result;
    }, {});

    const atsScore = Object.values(normalizedBreakdown)
        .reduce((total, score) => total + score, 0);

    return {
        atsScore: normalizeScore(atsScore, 100),
        scoreBreakdown: normalizedBreakdown
    };
};

const deterministicFallbackScore = (resumeText = "") => {
    const text = resumeText.toLowerCase();
    const wordCount = getWordCount(resumeText);
    const bulletCount = (resumeText.match(/[•\-*]\s+/g) || []).length;
    const numberCount = (resumeText.match(/\b\d+(\.\d+)?%?\b/g) || []).length;

    const technicalKeywords = [
        /javascript/, /typescript/, /react/, /node/, /express/, /mongodb/, /sql/,
        /python/, /java\b/, /api/, /rest/, /git\b/, /docker/, /aws/, /html/, /css/,
        /machine learning/, /data analysis/, /tailwind/, /redux/, /vite/
    ];
    const actionVerbs = [
        /built/, /created/, /developed/, /designed/, /implemented/, /optimized/,
        /improved/, /deployed/, /integrated/, /led/, /managed/, /automated/
    ];

    const contactInformation = Math.min(10,
        (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(resumeText) ? 3 : 0) +
        (/(\+?\d[\d\s().-]{8,}\d)/.test(resumeText) ? 3 : 0) +
        (/(linkedin\.com|github\.com|portfolio|behance\.net|dribbble\.com)/i.test(resumeText) ? 3 : 0) +
        (wordCount > 80 ? 1 : 0)
    );

    const resumeSections = Math.min(15,
        (hasAny(text, [/education/, /degree/, /university/, /college/]) ? 3 : 0) +
        (hasAny(text, [/skills/, /technical skills/, /technologies/]) ? 3 : 0) +
        (hasAny(text, [/projects?/, /experience/, /work experience/, /internship/]) ? 4 : 0) +
        (hasAny(text, [/certifications?/, /achievements?/, /awards?/]) ? 2 : 0) +
        (hasAny(text, [/summary/, /objective/, /profile/]) ? 1 : 0) +
        (wordCount >= 250 ? 2 : wordCount >= 150 ? 1 : 0)
    );

    const keywordMatches = countMatches(text, technicalKeywords);
    const skillsAndKeywords = Math.min(20,
        Math.min(keywordMatches * 2, 14) +
        (hasAny(text, [/framework/, /library/, /tools?/, /database/]) ? 3 : 0) +
        (keywordMatches >= 8 ? 3 : keywordMatches >= 4 ? 2 : keywordMatches >= 2 ? 1 : 0)
    );

    const verbMatches = countMatches(text, actionVerbs);
    const experienceProjectsQuality = Math.min(20,
        (hasAny(text, [/projects?/, /experience/, /internship/]) ? 4 : 0) +
        Math.min(verbMatches * 2, 8) +
        (hasAny(text, [/tech stack/, /technologies used/, /using react/, /using node/, /built with/]) ? 3 : 0) +
        (bulletCount >= 6 ? 3 : bulletCount >= 3 ? 2 : bulletCount >= 1 ? 1 : 0) +
        (numberCount >= 3 ? 2 : numberCount >= 1 ? 1 : 0)
    );

    const atsFormatting = Math.min(15,
        (wordCount >= 180 ? 3 : wordCount >= 100 ? 2 : 1) +
        (bulletCount >= 5 ? 4 : bulletCount >= 2 ? 2 : 0) +
        (!/[|]{3,}/.test(resumeText) ? 2 : 0) +
        (!/(table|image|photo|columns)/i.test(resumeText) ? 2 : 0) +
        (resumeText.length > 600 ? 2 : 1) +
        (hasAny(text, [/education/, /skills/, /projects?/, /experience/]) ? 2 : 0)
    );

    const quantificationImpact = Math.min(10,
        Math.min(numberCount * 2, 6) +
        (hasAny(text, [/%/, /increased/, /reduced/, /improved/, /users?/, /revenue/, /performance/]) ? 3 : 0) +
        (numberCount >= 4 ? 1 : 0)
    );

    const grammarProfessionalism = Math.min(10,
        (wordCount >= 120 ? 3 : 1) +
        (!/(i am|my name is|please hire|hard working)$/i.test(text) ? 2 : 0) +
        (hasAny(text, [/summary/, /skills/, /education/, /projects?/, /experience/]) ? 2 : 0) +
        (resumeText.split("\n").filter((line) => line.trim()).length >= 8 ? 2 : 1) +
        (!/[^\S\r\n]{5,}/.test(resumeText) ? 1 : 0)
    );

    const { atsScore: rawAtsScore, scoreBreakdown } = calculateScoreFromBreakdown({
        contactInformation,
        resumeSections,
        skillsAndKeywords,
        experienceProjectsQuality,
        atsFormatting,
        quantificationImpact,
        grammarProfessionalism
    });
    const atsScore = wordCount >= 8
        ? Math.min(Math.max(rawAtsScore, 35), 90)
        : rawAtsScore;

    return {
        atsScore,
        scoreBreakdown,
        strengths: [
            contactInformation >= 7 ? "Contact information is reasonably complete." : "Resume includes some identifiable profile details.",
            resumeSections >= 10 ? "Core resume sections are present." : "Resume has a starting structure for analysis.",
            skillsAndKeywords >= 10 ? "Relevant skills and keywords are visible." : "Some resume content is available for improvement."
        ],
        weaknesses: [
            quantificationImpact < 6 ? "Add measurable outcomes and metrics to improve impact." : "Keep quantified outcomes consistent across projects.",
            experienceProjectsQuality < 12 ? "Project or experience descriptions need clearer technical contribution." : "Project details can be made more concise and targeted.",
            atsFormatting < 10 ? "Improve readability with simple headings and bullet points." : "Formatting is acceptable but can be further polished."
        ],
        missingKeywords: keywordMatches < 6 ? ["role-specific technical keywords", "tools/frameworks", "impact metrics"] : [],
        improvementSuggestions: [
            "Add role-specific keywords from target job descriptions.",
            "Use action verbs and quantify project outcomes.",
            "Keep sections clear: Summary, Skills, Projects/Experience, Education."
        ],
        actionPlan: {
            priorityFixes: [
                "Improve missing resume sections and contact details.",
                "Add stronger project descriptions with outcomes."
            ],
            keywordSuggestions: keywordMatches < 6 ? ["role-specific keywords", "frameworks", "tools"] : [],
            projectImprovements: [
                "Mention tech stack, contribution, and measurable result for each project."
            ],
            estimatedImprovement: "Improving keywords, structure, and quantified impact can raise the ATS score."
        },
        resumeHealth: buildResumeHealth(scoreBreakdown),
        interviewQuestions: {
            technical: [
                "Which technologies in your resume are you most confident using?",
                "Explain one project architecture from your resume.",
                "How did you debug a difficult technical issue?",
                "Which database or API decisions did you make and why?",
                "How would you improve one project further?"
            ],
            project: [
                "Walk me through your strongest project.",
                "What was your individual contribution?",
                "What trade-offs did you make?",
                "How did you measure success?",
                "What would you rebuild differently?"
            ],
            hr: [
                "Tell me about yourself.",
                "Why are you interested in this role?",
                "Describe a challenge you handled.",
                "How do you learn new technologies?",
                "Where do you see yourself improving?"
            ]
        }
    };
};

const validateAnalysis = (analysis, resumeText) => {
    const { atsScore, scoreBreakdown } = calculateScoreFromBreakdown(analysis.scoreBreakdown || {});

    if (!Number.isFinite(atsScore)) {
        return deterministicFallbackScore(resumeText);
    }

    return {
        atsScore,
        scoreBreakdown,
        strengths: Array.isArray(analysis.strengths) ? analysis.strengths : [],
        weaknesses: Array.isArray(analysis.weaknesses) ? analysis.weaknesses : [],
        missingKeywords: Array.isArray(analysis.missingKeywords) ? analysis.missingKeywords : [],
        improvementSuggestions: Array.isArray(analysis.improvementSuggestions)
            ? analysis.improvementSuggestions
            : Array.isArray(analysis.suggestions)
                ? analysis.suggestions
                : [],
        actionPlan: {
            priorityFixes: Array.isArray(analysis.actionPlan?.priorityFixes)
                ? analysis.actionPlan.priorityFixes
                : [],
            keywordSuggestions: Array.isArray(analysis.actionPlan?.keywordSuggestions)
                ? analysis.actionPlan.keywordSuggestions
                : Array.isArray(analysis.missingKeywords)
                    ? analysis.missingKeywords
                    : [],
            projectImprovements: Array.isArray(analysis.actionPlan?.projectImprovements)
                ? analysis.actionPlan.projectImprovements
                : [],
            estimatedImprovement: analysis.actionPlan?.estimatedImprovement || ""
        },
        resumeHealth: analysis.resumeHealth && typeof analysis.resumeHealth === "object"
            ? analysis.resumeHealth
            : buildResumeHealth(scoreBreakdown),
        interviewQuestions: {
            technical: Array.isArray(analysis.interviewQuestions?.technical)
                ? analysis.interviewQuestions.technical
                : [],
            project: Array.isArray(analysis.interviewQuestions?.project)
                ? analysis.interviewQuestions.project
                : [],
            hr: Array.isArray(analysis.interviewQuestions?.hr)
                ? analysis.interviewQuestions.hr
                : []
        }
    };
};

module.exports = {
    calculateScoreFromBreakdown,
    deterministicFallbackScore,
    validateAnalysis
};

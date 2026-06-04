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
    sectionCompleteness: breakdown.resumeSections >= 12
        ? "The resume includes the major sections recruiters expect, such as education, skills, and project or experience details. Keeping these sections clearly labeled helps ATS systems parse the profile correctly."
        : breakdown.resumeSections >= 8
            ? "The resume has some important sections, but one or more areas need clearer headings or more complete content. Adding distinct sections for skills, projects or experience, education, and achievements will make the profile easier to review."
            : "The resume is missing several core sections or does not present them clearly. A stronger structure with separate headings for summary, skills, projects or experience, education, and contact details is needed before the resume will feel complete.",
    formattingQuality: breakdown.atsFormatting >= 12
        ? "The formatting appears mostly ATS-friendly because the content is readable and organized. Continue using simple headings, consistent bullets, and text-based formatting instead of tables or image-heavy layouts."
        : breakdown.atsFormatting >= 8
            ? "The formatting is usable, but it can be cleaner and more consistent. Improve spacing, bullet alignment, and section hierarchy so recruiters can scan the resume quickly."
            : "The formatting needs improvement for ATS readability and recruiter scanning. Use a simple one-column layout, clear section titles, consistent bullets, and avoid decorative elements that may not parse well.",
    keywordStrength: breakdown.skillsAndKeywords >= 16
        ? "The resume contains a strong set of role-relevant skills and keywords. To improve further, connect those skills directly to project or experience bullets so recruiters can see evidence of usage."
        : breakdown.skillsAndKeywords >= 10
            ? "The resume includes some relevant keywords, but the skill coverage is not yet strong enough for competitive screening. Add tools, frameworks, databases, APIs, and role-specific terms that match target job descriptions."
            : "The resume is weak on role-specific keywords, which can reduce ATS matching. Add a focused technical skills section and repeat important technologies naturally inside project or experience descriptions.",
    projectImpact: breakdown.experienceProjectsQuality >= 16
        ? "The project or experience section shows meaningful technical work and gives recruiters useful evidence of ability. Keep emphasizing your individual contribution, the tech stack, and the outcome of each project."
        : breakdown.experienceProjectsQuality >= 10
            ? "The project or experience section has useful content, but it needs clearer technical depth. Each project should explain what you built, which APIs or database logic you handled, and what result the work produced."
            : "The project or experience section does not yet show enough technical contribution. Add bullets that describe architecture, features built, database usage, authentication flow, integrations, deployment, and measurable results."
    ,
    quantifiedAchievements: breakdown.quantificationImpact >= 8
        ? "The resume uses measurable results well, which helps recruiters understand impact. Keep using numbers such as users, performance gains, reduced time, accuracy, scale, or project outcomes wherever truthful."
        : breakdown.quantificationImpact >= 4
            ? "The resume includes a few measurable details, but impact is still underdeveloped. Add numbers to show scale, performance, efficiency, users, marks, rankings, or before-and-after improvements."
            : "The resume has little measurable impact, so achievements may feel like task descriptions. Add quantified outcomes wherever possible, such as performance improvement, number of users, APIs built, pages created, or time saved.",
    contactInfoStatus: breakdown.contactInformation >= 8
        ? "The contact information is mostly complete and should allow recruiters to reach or verify the candidate easily. Keep email, phone, LinkedIn, GitHub, and portfolio links visible near the top."
        : breakdown.contactInformation >= 5
            ? "The contact information is partially complete, but it should be easier for recruiters to verify the profile. Add missing links such as LinkedIn, GitHub, portfolio, or a clean phone/email line near the header."
            : "The resume does not provide enough clear contact information. Add a professional email, phone number, LinkedIn, GitHub, and portfolio link so recruiters and ATS systems can identify the candidate."
});

const normalizeFeedbackItem = (item) => {
    if (!item) return "";

    if (typeof item === "string") return item.trim();

    if (typeof item === "object") {
        const title = typeof item.title === "string" ? item.title.trim() : "";
        const description = typeof item.description === "string" ? item.description.trim() : "";

        if (title && description) return `${title}: ${description}`;
        if (description) return description;
        if (title) return title;
    }

    return "";
};

const normalizeFeedbackList = (items = [], fallback = []) => {
    const sourceItems = Array.isArray(items) ? items : fallback;

    return sourceItems
        .map(normalizeFeedbackItem)
        .filter(Boolean);
};

const normalizeResumeHealth = (resumeHealth, breakdown) => {
    const fallbackHealth = buildResumeHealth(breakdown);

    if (!resumeHealth || typeof resumeHealth !== "object") return fallbackHealth;

    return Object.keys(fallbackHealth).reduce((result, key) => {
        result[key] = typeof resumeHealth[key] === "string" && resumeHealth[key].trim()
            ? resumeHealth[key].trim()
            : fallbackHealth[key];

        return result;
    }, {});
};

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
            contactInformation >= 7
                ? "The resume includes enough contact information for a recruiter to identify and reach the candidate. This improves basic ATS completeness and makes profile verification easier."
                : "The resume includes some identifiable profile details, but the contact section is not strong enough yet. Add a professional email, phone number, LinkedIn, GitHub, or portfolio link near the top.",
            resumeSections >= 10
                ? "The resume contains core sections such as education, skills, and project or experience information. Clear section coverage helps both ATS parsing and recruiter scanning."
                : "The resume has a starting structure, but several sections need clearer headings and fuller content. A fresher resume should clearly separate skills, education, projects, achievements, and contact details.",
            skillsAndKeywords >= 10
                ? "The resume includes relevant technical keywords that can support ATS matching. These skills should also be reflected inside project bullets to prove hands-on usage."
                : "The resume has some content available for improvement, but the keyword coverage is still weak. Add role-specific technologies, tools, frameworks, databases, and development concepts from target job descriptions."
        ],
        weaknesses: [
            quantificationImpact < 6
                ? "The resume does not show enough measurable outcomes, so the work may read like a list of tasks. Add numbers such as users, APIs built, performance gains, reduced time, accuracy, or project scale wherever truthful."
                : "The resume includes some impact, but quantified outcomes should stay consistent across the strongest projects. Recruiters respond better when every major project shows scale, result, or measurable contribution.",
            experienceProjectsQuality < 12
                ? "Project or experience descriptions need clearer technical contribution. Explain the features built, APIs developed, database usage, authentication flow, deployment, and the candidate's individual ownership."
                : "Project details are useful, but they can be more targeted toward the role. Trim generic wording and emphasize the tech stack, business problem, implementation choices, and outcome.",
            atsFormatting < 10
                ? "The resume formatting needs better readability through simple headings and consistent bullet points. ATS systems and recruiters perform better with clean text-based layouts instead of crowded or decorative formatting."
                : "Formatting is acceptable, but spacing, hierarchy, and bullet consistency can still be polished. A cleaner scan path helps recruiters find skills, projects, and education faster."
        ],
        missingKeywords: keywordMatches < 6 ? ["role-specific technical keywords", "tools/frameworks", "impact metrics"] : [],
        improvementSuggestions: [
            "Add role-specific keywords: The resume needs stronger alignment with target job descriptions. Add relevant technologies, frameworks, databases, APIs, and role terms naturally in the skills and project sections.",
            "Strengthen project bullets: Some project descriptions do not clearly explain the candidate's technical ownership. Rewrite each bullet to show what was built, how it was implemented, and what result it created.",
            "Quantify outcomes: The resume needs more measurable impact to stand out. Add truthful numbers such as users, response time improvement, features delivered, pages built, APIs created, or time saved.",
            "Clarify resume sections: Recruiters should be able to scan the resume quickly. Use clear headings such as Summary, Skills, Projects, Experience, Education, Certifications, and Achievements.",
            "Use stronger action verbs: Several bullets can become more professional with active wording. Start bullets with verbs such as developed, implemented, optimized, integrated, deployed, automated, or improved."
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
        strengths: normalizeFeedbackList(analysis.strengths),
        weaknesses: normalizeFeedbackList(analysis.weaknesses),
        missingKeywords: normalizeFeedbackList(analysis.missingKeywords),
        improvementSuggestions: normalizeFeedbackList(
            analysis.improvementSuggestions,
            Array.isArray(analysis.suggestions) ? analysis.suggestions : []
        ),
        actionPlan: {
            priorityFixes: normalizeFeedbackList(analysis.actionPlan?.priorityFixes),
            keywordSuggestions: normalizeFeedbackList(
                analysis.actionPlan?.keywordSuggestions,
                Array.isArray(analysis.missingKeywords) ? analysis.missingKeywords : []
            ),
            projectImprovements: normalizeFeedbackList(analysis.actionPlan?.projectImprovements),
            estimatedImprovement: analysis.actionPlan?.estimatedImprovement || ""
        },
        resumeHealth: normalizeResumeHealth(analysis.resumeHealth, scoreBreakdown),
        interviewQuestions: {
            technical: Array.isArray(analysis.interviewQuestions?.technical)
                ? analysis.interviewQuestions.technical
                : [],
            project: Array.isArray(analysis.interviewQuestions?.project)
                ? analysis.interviewQuestions.project
                : Array.isArray(analysis.interviewQuestions?.projectBased)
                    ? analysis.interviewQuestions.projectBased
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

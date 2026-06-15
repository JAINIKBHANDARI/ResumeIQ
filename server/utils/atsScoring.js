const SCORE_LIMITS = {
    contactInformation: 10,
    resumeSections: 15,
    skillsAndKeywords: 20,
    experienceProjectsQuality: 20,
    atsFormatting: 10,
    quantificationImpact: 15,
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

const normalizeSearchText = (text = "") => (
    String(text)
        .toLowerCase()
        .replace(/[^a-z0-9+#.\s/-]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
);

const uniqueList = (items = []) => (
    [...new Set(items.map((item) => String(item || "").trim()).filter(Boolean))]
);

const KEYWORD_ALIASES = {
    "Basic Programming": ["programming", "coding", "c language", "c++", "java", "python", "javascript"],
    "Problem Solving": ["problem solving", "problem-solving", "debugging", "troubleshooting"],
    "Responsive Design": ["responsive design", "mobile responsive", "media query", "responsive ui"],
    "API Integration": ["api integration", "integrated api", "fetch api", "axios", "rest api"],
    "REST API": ["rest api", "restful", "api", "apis"],
    "Node.js": ["node.js", "node js", "node"],
    "Express.js": ["express.js", "express js", "express"],
    "MongoDB": ["mongodb", "mongo db"],
    "GitHub": ["github", "git hub"],
    "JWT": ["jwt", "json web token"],
    "Authentication": ["authentication", "auth", "login", "signup", "authorization"],
    "Spring Boot": ["spring boot", "springboot"],
    "Power BI": ["power bi", "powerbi"],
    "Scikit-learn": ["scikit-learn", "scikit learn", "sklearn"],
    "Machine Learning": ["machine learning", "ml"],
    "Data Preprocessing": ["data preprocessing", "preprocessing"],
    "Model Training": ["model training", "trained model"],
    "Threat Analysis": ["threat analysis", "threat detection"],
    "OWASP": ["owasp", "owasp top 10"],
    "File Handling": ["file handling", "files"],
    "Data Structures": ["data structures", "dsa"],
    "Exception Handling": ["exception handling", "exceptions"],
    "JDBC": ["jdbc"],
    "DBMS": ["dbms", "database management"],
    "OOP": ["oop", "object oriented", "object-oriented"],
    "UI": ["ui", "user interface"],
    "Deployment": ["deployment", "deployed", "hosting", "vercel", "render", "netlify"],
    "Database": ["database", "db", "mongodb", "sql", "mysql", "postgresql"],
    "Security": ["security", "secure", "vulnerability"]
};

const keywordMatchesText = (text, keyword) => {
    const normalizedText = normalizeSearchText(text);
    const aliases = uniqueList([keyword, ...(KEYWORD_ALIASES[keyword] || [])]);

    return aliases.some((alias) => {
        const normalizedAlias = normalizeSearchText(alias);

        if (!normalizedAlias) return false;

        return normalizedText.includes(normalizedAlias);
    });
};

const countKeywordMatches = (text, keywords = []) => (
    uniqueList(keywords).filter((keyword) => keywordMatchesText(text, keyword)).length
);

const ROLE_SKILL_MAP = {
    "general fresher": ["Communication", "Problem Solving", "Teamwork", "Projects", "Internship", "Git", "Basic Programming", "Database", "OOP"],
    "frontend developer": ["HTML", "CSS", "JavaScript", "React", "Responsive Design", "API Integration", "Git", "GitHub", "UI", "Deployment"],
    "backend developer": ["Node.js", "Express.js", "REST API", "Database", "MongoDB", "SQL", "Authentication", "JWT", "Security", "Deployment"],
    "mern developer": ["HTML", "CSS", "JavaScript", "React", "Node.js", "Express.js", "MongoDB", "REST API", "JWT", "Authentication", "Git", "GitHub", "Deployment"],
    "java developer": ["Java", "OOP", "Collections", "Exception Handling", "JDBC", "SQL", "DBMS", "Spring Boot", "REST API", "Git"],
    "python developer": ["Python", "OOP", "File Handling", "APIs", "Flask", "Django", "SQL", "Data Structures", "Git"],
    "data analyst": ["Python", "SQL", "Excel", "Power BI", "Pandas", "NumPy", "Data Cleaning", "Visualization", "Statistics"],
    "ai/ml intern": ["Python", "Machine Learning", "Pandas", "NumPy", "Scikit-learn", "Data Preprocessing", "Model Training", "Evaluation"],
    "cyber security": ["Networking", "Linux", "Security", "Vulnerability", "OWASP", "Cryptography", "Firewall", "Threat Analysis"]
};

const TECHNICAL_KEYWORDS = uniqueList([
    "HTML", "CSS", "JavaScript", "TypeScript", "React", "Redux", "Tailwind", "Node.js", "Express.js",
    "MongoDB", "SQL", "MySQL", "PostgreSQL", "REST API", "APIs", "Authentication", "JWT", "Git",
    "GitHub", "Deployment", "Docker", "AWS", "Java", "Spring Boot", "Python", "Django", "Flask",
    "Pandas", "NumPy", "Scikit-learn", "Machine Learning", "Data Analysis", "Power BI", "Excel",
    "Testing", "Linux", "OWASP", "Security", "Database", "OOP", "Data Structures"
]);

const IMPLEMENTATION_KEYWORDS = [
    "REST API", "APIs", "Database", "MongoDB", "SQL", "Authentication", "JWT",
    "Deployment", "Testing", "Security", "Docker", "Cloud"
];

const ACTION_VERBS = [
    "built", "created", "developed", "designed", "implemented", "optimized",
    "improved", "deployed", "integrated", "led", "managed", "automated",
    "analyzed", "tested", "collaborated", "configured"
];

const buildResumeHealth = (breakdown) => ({
    sectionCompleteness: breakdown.resumeSections >= 12
        ? "The resume includes the major sections recruiters expect, such as education, skills, and project or experience details. Keeping these sections clearly labeled helps ATS systems parse the profile correctly."
        : breakdown.resumeSections >= 8
            ? "The resume has some important sections, but one or more areas need clearer headings or more complete content. Adding distinct sections for skills, projects or experience, education, and achievements will make the profile easier to review."
            : "The resume is missing several core sections or does not present them clearly. A stronger structure with separate headings for summary, skills, projects or experience, education, and contact details is needed before the resume will feel complete.",
    formattingQuality: breakdown.atsFormatting >= 8
        ? "The formatting appears mostly ATS-friendly because the content is readable and organized. Continue using simple headings, consistent bullets, and text-based formatting instead of tables or image-heavy layouts."
        : breakdown.atsFormatting >= 5
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
    quantifiedAchievements: breakdown.quantificationImpact >= 11
        ? "The resume uses measurable results well, which helps recruiters understand impact. Keep using numbers such as users, performance gains, reduced time, accuracy, scale, or project outcomes wherever truthful."
        : breakdown.quantificationImpact >= 6
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

const hasJobMatchContext = (jobMatchInput = {}) => Boolean(
    jobMatchInput.targetRole || jobMatchInput.jobDescription
);

const getRoleExpectedSkills = (targetRole = "") => {
    const role = normalizeSearchText(targetRole);

    if (ROLE_SKILL_MAP[role]) return ROLE_SKILL_MAP[role];

    if (/frontend|front-end|react/.test(role)) {
        return ROLE_SKILL_MAP["frontend developer"];
    }

    if (/backend|back-end|node|express/.test(role)) {
        return ROLE_SKILL_MAP["backend developer"];
    }

    if (/mern|full stack|full-stack/.test(role)) {
        return ROLE_SKILL_MAP["mern developer"];
    }

    if (/java/.test(role)) {
        return ROLE_SKILL_MAP["java developer"];
    }

    if (/python/.test(role)) {
        return ROLE_SKILL_MAP["python developer"];
    }

    if (/data/.test(role)) {
        return ROLE_SKILL_MAP["data analyst"];
    }

    if (/ai|ml|machine learning/.test(role)) {
        return ROLE_SKILL_MAP["ai/ml intern"];
    }

    if (/cyber|security/.test(role)) {
        return ROLE_SKILL_MAP["cyber security"];
    }

    return ROLE_SKILL_MAP["general fresher"];
};

const extractContextSkills = (contextText = "") => {
    return TECHNICAL_KEYWORDS.filter((skill) => keywordMatchesText(contextText, skill));
};

const extractImportantKeywords = (contextText = "") => {
    const stopWords = new Set([
        "and", "the", "for", "with", "you", "your", "our", "are", "will", "this", "that",
        "from", "have", "has", "work", "role", "candidate", "experience", "skills", "good",
        "strong", "using", "must", "should", "ability", "knowledge", "team", "job", "about",
        "into", "their", "they", "them", "who", "can", "all", "any", "more", "such",
        "need", "needs", "developer", "engineer", "looking", "required"
    ]);
    const words = normalizeSearchText(contextText)
        .split(" ")
        .map((word) => word.replace(/^[^a-z0-9+#]+|[^a-z0-9+#]+$/g, ""))
        .filter((word) => word.length >= 4 && !stopWords.has(word) && !/^\d+$/.test(word));
    const counts = words.reduce((result, word) => {
        result[word] = (result[word] || 0) + 1;
        return result;
    }, {});

    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, 18)
        .map(([word]) => word);
};

const calculateJobMatchScore = (resumeText = "", targetRole = "", jobDescription = "") => {
    const normalizedRole = normalizeSearchText(targetRole);
    const normalizedDescription = normalizeSearchText(jobDescription);

    if (!normalizedRole && !normalizedDescription) return null;

    const roleSkills = normalizedRole ? getRoleExpectedSkills(targetRole) : [];
    const jdSkills = normalizedDescription ? extractContextSkills(jobDescription) : [];
    const requiredSkills = uniqueList([
        ...(normalizedDescription ? jdSkills : []),
        ...roleSkills
    ]).slice(0, 18);
    const keywordPool = uniqueList([
        ...(normalizedDescription ? extractImportantKeywords(jobDescription) : []),
        ...roleSkills.map((skill) => normalizeSearchText(skill)).filter(Boolean)
    ]).slice(0, 24);
    const matchedSkills = requiredSkills.filter((skill) => keywordMatchesText(resumeText, skill));
    const missingSkills = requiredSkills.filter((skill) => !keywordMatchesText(resumeText, skill));
    const matchedKeywords = keywordPool.filter((keyword) => keywordMatchesText(resumeText, keyword));
    const missingKeywords = keywordPool.filter((keyword) => !keywordMatchesText(resumeText, keyword));
    const skillScore = requiredSkills.length
        ? Math.round((matchedSkills.length / requiredSkills.length) * 45)
        : 0;
    const keywordScore = keywordPool.length
        ? Math.round((matchedKeywords.length / keywordPool.length) * 25)
        : Math.round((matchedSkills.length / Math.max(requiredSkills.length, 1)) * 18);
    const implementationMatches = countKeywordMatches(resumeText, IMPLEMENTATION_KEYWORDS);
    const actionVerbMatches = countMatches(normalizeSearchText(resumeText), ACTION_VERBS.map((verb) => new RegExp(`\\b${verb}\\b`, "i")));
    const hasProjectOrExperience = hasAny(normalizeSearchText(resumeText), [/projects?/, /experience/, /internship/, /work history/]);
    const projectExperienceScore = Math.min(20,
        (hasProjectOrExperience ? 5 : 0) +
        Math.min(implementationMatches * 3, 9) +
        Math.min(actionVerbMatches, 4) +
        (/\b(deployed|live|hosted|production|users?|clients?)\b/i.test(resumeText) ? 2 : 0)
    );
    const roleSkillRatio = requiredSkills.length ? matchedSkills.length / requiredSkills.length : 0;
    const roleMentioned = normalizedRole && keywordMatchesText(resumeText, targetRole);
    const roleDomainAlignment = Math.min(10,
        (roleMentioned ? 3 : 0) +
        Math.round(roleSkillRatio * 7)
    );
    const matchScore = normalizeScore(
        skillScore + keywordScore + projectExperienceScore + roleDomainAlignment,
        100
    );
    const inferredRole = targetRole || (jdSkills[0] ? `${jdSkills[0]} Role` : "Inferred from job description");

    return {
        targetRole: inferredRole,
        jobDescriptionProvided: Boolean(normalizedDescription),
        matchScore,
        matchedSkills: matchedSkills.slice(0, 12),
        missingSkills: missingSkills.slice(0, 12),
        missingKeywords: missingKeywords.slice(0, 12),
        roleSpecificSuggestions: [
            `Add the strongest missing ${inferredRole} skills naturally in the skills and project sections.`,
            "Mirror important job description keywords only where they honestly match your experience.",
            "Strengthen project bullets with implementation details such as APIs, database work, authentication, deployment, or measurable outcomes."
        ],
        resumeRewriteTips: [
            "Rewrite project bullets with action verb + technical task + tool + measurable result.",
            "Place the most relevant matched skills near the top of the skills section.",
            "Add missing role keywords to project descriptions only when the project actually used them."
        ],
        readinessLevel: matchScore >= 75
            ? "Strong match - ready to apply with minor polishing"
            : matchScore >= 55
                ? "Moderate match - needs improvement before applying"
                : "Low match - add stronger role-specific evidence before applying",
        summary: `The resume matches ${matchedSkills.length} of ${requiredSkills.length || "the"} expected role skills and ${matchedKeywords.length} important keywords. The score is based on deterministic skill overlap, keyword overlap, project relevance, and role alignment.`
    };
};

const deterministicFallbackJobMatch = (resumeText = "", jobMatchInput = {}) => (
    calculateJobMatchScore(resumeText, jobMatchInput.targetRole, jobMatchInput.jobDescription)
);

const normalizeJobMatchAnalysis = (jobMatchAnalysis, resumeText = "", jobMatchInput = {}, fixedJobMatchAnalysis = null) => {
    if (!hasJobMatchContext(jobMatchInput)) return null;

    const fixedAnalysis = fixedJobMatchAnalysis
        || calculateJobMatchScore(resumeText, jobMatchInput.targetRole, jobMatchInput.jobDescription);

    if (!fixedAnalysis) return null;

    const safeJobMatchAnalysis = jobMatchAnalysis && typeof jobMatchAnalysis === "object"
        ? jobMatchAnalysis
        : {};

    return {
        targetRole: fixedAnalysis.targetRole,
        jobDescriptionProvided: fixedAnalysis.jobDescriptionProvided,
        matchScore: fixedAnalysis.matchScore,
        matchedSkills: fixedAnalysis.matchedSkills,
        missingSkills: fixedAnalysis.missingSkills,
        missingKeywords: fixedAnalysis.missingKeywords,
        roleSpecificSuggestions: normalizeFeedbackList(
            safeJobMatchAnalysis.roleSpecificSuggestions,
            fixedAnalysis.roleSpecificSuggestions
        ).slice(0, 8),
        resumeRewriteTips: normalizeFeedbackList(
            safeJobMatchAnalysis.resumeRewriteTips,
            fixedAnalysis.resumeRewriteTips
        ).slice(0, 8),
        readinessLevel: typeof safeJobMatchAnalysis.readinessLevel === "string" && safeJobMatchAnalysis.readinessLevel.trim()
            ? safeJobMatchAnalysis.readinessLevel.trim()
            : fixedAnalysis.readinessLevel,
        summary: typeof safeJobMatchAnalysis.summary === "string" && safeJobMatchAnalysis.summary.trim()
            ? safeJobMatchAnalysis.summary.trim()
            : fixedAnalysis.summary
    };
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

const calculateAtsScore = (resumeText = "") => {
    const text = normalizeSearchText(resumeText);
    const wordCount = getWordCount(resumeText);
    const lineCount = String(resumeText).split("\n").filter((line) => line.trim()).length;
    const bulletCount = (resumeText.match(/[\u2022\-*]\s+/g) || []).length;
    const numberCount = (resumeText.match(/\b\d+(\.\d+)?%?\b/g) || []).length;
    const technicalMatches = countKeywordMatches(resumeText, TECHNICAL_KEYWORDS);
    const implementationMatches = countKeywordMatches(resumeText, IMPLEMENTATION_KEYWORDS);
    const actionVerbMatches = countMatches(text, ACTION_VERBS.map((verb) => new RegExp(`\\b${verb}\\b`, "i")));
    const hasEmail = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(resumeText);
    const hasPhone = /(\+?\d[\d\s().-]{8,}\d)/.test(resumeText);
    const hasLinkedIn = /linkedin\.com|linkedin/i.test(resumeText);
    const hasGithubOrPortfolio = /github\.com|github|portfolio|vercel\.app|netlify\.app|behance\.net|dribbble\.com/i.test(resumeText);

    const contactInformation = Math.min(10,
        (hasEmail ? 3 : 0) +
        (hasPhone ? 2 : 0) +
        (hasLinkedIn ? 2 : 0) +
        (hasGithubOrPortfolio ? 2 : 0) +
        (wordCount > 80 ? 1 : 0)
    );

    const resumeSections = Math.min(15,
        (hasAny(text, [/education/, /degree/, /university/, /college/, /bachelor/, /master/]) ? 3 : 0) +
        (hasAny(text, [/skills/, /technical skills/, /technologies/]) ? 3 : 0) +
        (hasAny(text, [/projects?/, /project work/]) ? 3 : 0) +
        (hasAny(text, [/experience/, /internship/, /work experience/, /employment/]) ? 2 : 0) +
        (hasAny(text, [/certifications?/, /certificate/]) ? 1 : 0) +
        (hasAny(text, [/achievements?/, /awards?/, /honors?/]) ? 1 : 0) +
        (hasAny(text, [/summary/, /objective/, /profile/]) ? 1 : 0) +
        (wordCount >= 250 ? 1 : 0)
    );

    const skillsAndKeywords = Math.min(20,
        Math.min(technicalMatches * 1.5, 15) +
        (hasAny(text, [/framework/, /library/, /tools?/, /database/, /cloud/, /version control/]) ? 3 : 0) +
        (technicalMatches >= 8 ? 2 : technicalMatches >= 4 ? 1 : 0)
    );

    const experienceProjectsQuality = Math.min(20,
        (hasAny(text, [/projects?/, /experience/, /internship/]) ? 4 : 0) +
        Math.min(implementationMatches * 2, 8) +
        Math.min(actionVerbMatches, 4) +
        (hasAny(text, [/tech stack/, /technologies used/, /built with/, /using react/, /using node/, /using python/]) ? 2 : 0) +
        (hasAny(text, [/deployed/, /live/, /hosted/, /production/, /users?/, /clients?/]) ? 2 : 0)
    );

    const quantificationImpact = Math.min(15,
        Math.min(numberCount * 2, 8) +
        (hasAny(text, [/%/, /increased/, /reduced/, /improved/, /optimized/, /performance/, /accuracy/, /latency/]) ? 3 : 0) +
        (hasAny(text, [/users?/, /clients?/, /records?/, /files?/, /requests?/, /apis?/, /score/, /cgpa/, /gpa/]) ? 3 : 0) +
        (numberCount >= 5 ? 1 : 0)
    );

    const symbolRatio = resumeText.length
        ? (resumeText.match(/[^a-zA-Z0-9\s.,:;()/%@+\-#]/g) || []).length / resumeText.length
        : 1;
    const atsFormatting = Math.min(10,
        (wordCount >= 180 ? 2 : wordCount >= 90 ? 1 : 0) +
        (lineCount >= 8 ? 2 : lineCount >= 4 ? 1 : 0) +
        (hasAny(text, [/education/, /skills/, /projects?/, /experience/]) ? 2 : 0) +
        (bulletCount >= 4 ? 1 : 0) +
        (!/[|]{3,}/.test(resumeText) ? 1 : 0) +
        (!/(image-only|scanned|photo|table table)/i.test(resumeText) ? 1 : 0) +
        (symbolRatio < 0.08 ? 1 : 0)
    );

    const fillerMatches = countMatches(text, [/hard working/g, /very good/g, /i am/g, /my name is/g, /please hire/g]);
    const grammarProfessionalism = Math.min(10,
        (wordCount >= 160 ? 2 : wordCount >= 90 ? 1 : 0) +
        (actionVerbMatches >= 5 ? 3 : actionVerbMatches >= 2 ? 2 : actionVerbMatches >= 1 ? 1 : 0) +
        (fillerMatches === 0 ? 2 : fillerMatches === 1 ? 1 : 0) +
        (lineCount >= 8 ? 1 : 0) +
        (!/[^\S\r\n]{5,}/.test(resumeText) ? 1 : 0) +
        (technicalMatches >= 4 ? 1 : 0)
    );

    const { atsScore, scoreBreakdown } = calculateScoreFromBreakdown({
        contactInformation,
        resumeSections,
        skillsAndKeywords,
        experienceProjectsQuality,
        atsFormatting,
        quantificationImpact,
        grammarProfessionalism
    });

    return {
        atsScore,
        atsBreakdown: scoreBreakdown,
        scoreBreakdown
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

    const fixedAnalysis = calculateAtsScore(resumeText);

    return {
        atsScore: fixedAnalysis.atsScore,
        scoreBreakdown: fixedAnalysis.scoreBreakdown,
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
        resumeHealth: buildResumeHealth(fixedAnalysis.scoreBreakdown),
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

const validateAnalysis = (analysis = {}, resumeText, jobMatchInput = {}, fixedScores = {}) => {
    const fixedAtsAnalysis = fixedScores.atsAnalysis || calculateAtsScore(resumeText);
    const atsScore = fixedAtsAnalysis.atsScore;
    const scoreBreakdown = fixedAtsAnalysis.scoreBreakdown;

    const normalizedAnalysis = {
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

    const jobMatchAnalysis = normalizeJobMatchAnalysis(
        analysis.jobMatchAnalysis,
        resumeText,
        jobMatchInput,
        fixedScores.jobMatchAnalysis
    );

    return jobMatchAnalysis
        ? { ...normalizedAnalysis, jobMatchAnalysis }
        : normalizedAnalysis;
};

module.exports = {
    calculateAtsScore,
    calculateJobMatchScore,
    calculateScoreFromBreakdown,
    deterministicFallbackScore,
    deterministicFallbackJobMatch,
    validateAnalysis
};

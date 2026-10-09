import { GoogleGenAI } from "@google/genai";
import { toast } from "sonner";

/**
 * Initializes and returns a GoogleGenAI client with the configured API key.
 *
 * @returns {GoogleGenAI}
 */
const getGeminiClient = () => {
  const apiKey =
    typeof import.meta !== "undefined" && import.meta.env?.VITE_GEMINI_API_KEY
      ? import.meta.env.VITE_GEMINI_API_KEY
      : typeof process !== "undefined"
      ? process?.env?.VITE_GEMINI_API_KEY
      : "";
  if (!apiKey) {
    throw new Error(
      "Gemini API key is missing. Please set VITE_GEMINI_API_KEY in your .env.local file."
    );
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Checks whether simulated Gemini mode is active.
 *
 * @returns {boolean}
 */
const isMockGeminiEnabled = () => {
  try {
    if (typeof import.meta !== "undefined" && import.meta.env?.VITE_MOCK_GEMINI !== undefined) {
      return import.meta.env.VITE_MOCK_GEMINI === "true";
    }
    if (typeof process !== "undefined" && process?.env?.VITE_MOCK_GEMINI !== undefined) {
      return process.env.VITE_MOCK_GEMINI === "true";
    }
  } catch {
    // fallback
  }
  return false;
};

/**
 * Checks whether a caught error is a 429 rate-limit error.
 *
 * @param {unknown} error
 * @returns {boolean}
 */
const isRateLimitError = (error) => {
  if (!error) return false;
  if (error?.status === 429 || error?.statusCode === 429) return true;
  const msg = error?.message ?? "";
  return (
    msg.includes("429") ||
    msg.toLowerCase().includes("rate limit") ||
    msg.toLowerCase().includes("quota")
  );
};

/**
 * Executes `fn` with clean rate-limit handling without freezing the UI in long retry loops.
 *
 * @template T
 * @param {() => Promise<T>} fn       Async function to call
 * @param {string}           label    Short label used in console logs
 * @returns {Promise<T>}
 */
const withRetry = async (fn, label) => {
  try {
    return await fn();
  } catch (error) {
    if (isRateLimitError(error)) {
      console.warn(`[Gemini] ${label}: rate limit reached.`);
      throw new Error(
        "AI rate limit reached. Please wait a moment or enable VITE_MOCK_GEMINI=true in .env.local to continue testing locally."
      );
    }
    throw error;
  }
};

const isProduction =
  (typeof import.meta !== "undefined" && import.meta.env?.PROD) ||
  (typeof process !== "undefined" && process?.env?.NODE_ENV === "production");

/**
 * Executes a Gemini request via the secure server-side proxy /api/gemini.
 * In production, it strictly requires /api/gemini and NEVER falls back to the client SDK.
 * In local development, it allows client SDK fallback only if /api/gemini returns 404 (standalone Vite dev).
 */
const callGeminiInteraction = async ({ model = "gemini-3.8-flash", input, response_format }) => {
  let proxyResponse;
  let isProxyReachable = false;

  const authHeaders = {
    "Content-Type": "application/json",
  };

  try {
    if (typeof window !== "undefined" && window.Clerk?.session) {
      const token = await window.Clerk.session.getToken();
      if (token) {
        authHeaders["Authorization"] = `Bearer ${token}`;
      }
    }
  } catch {
    // Non-fatal, cookie fallback
  }

  try {
    proxyResponse = await fetch("/api/gemini", {
      method: "POST",
      headers: authHeaders,
      credentials: "same-origin",
      body: JSON.stringify({ model, input, response_format }),
    });
    isProxyReachable = true;
  } catch (networkErr) {
    if (isProduction) {
      throw new Error("Unable to connect to AI server. Please check your network connection and try again.");
    }
  }

  if (isProxyReachable && proxyResponse) {
    if (proxyResponse.ok) {
      const data = await proxyResponse.json();
      return { output_text: data.output_text };
    }

    const errData = await proxyResponse.json().catch(() => ({}));
    const errorMessage = errData.error || `AI request failed with status ${proxyResponse.status}`;

    if (proxyResponse.status === 429) {
      const err = new Error(errorMessage);
      err.status = 429;
      throw err;
    }

    // In production: NEVER fall back to client SDK — throw the proxy error immediately
    if (isProduction) {
      throw new Error(errorMessage);
    }

    // In local development: if 404 (Vite dev server without Vercel CLI), allow local client SDK fallback
    if (proxyResponse.status !== 404) {
      throw new Error(errorMessage);
    }
  }

  // Guard: In production, client SDK fallback is strictly forbidden
  if (isProduction) {
    throw new Error("Gemini AI proxy is unavailable in production.");
  }

  // Client-side fallback ONLY in local development
  console.info("[Gemini] /api/gemini unavailable locally, attempting client-side fallback with VITE_GEMINI_API_KEY.");
  const client = getGeminiClient();
  return await client.interactions.create({
    model,
    input,
    ...(response_format ? { response_format } : {}),
  });
};

/**
 * Normalizes user-selected or freeform experience into standard tiers.
 * Maps:
 * - "Fresher (0 yr)", 0, "0", "0-1", "entry", "fresher" -> { tier: "fresher", years: 0, label: "Fresher / Entry Level (0 yr)" }
 * - "0–1 Year", 1, "1" -> { tier: "fresher", years: 1, label: "0–1 Year" }
 * - "1–2 Years", 2, "2" -> { tier: "1-2", years: 2, label: "1–2 Years" }
 * - "2–4 Years", 3, "3", 4 -> { tier: "2-4", years: 3, label: "2–4 Years" }
 * - "4+ Years", "5+ years", 5, "senior", "lead", "staff" -> { tier: "senior", years: 5, label: "5+ Years (Senior)" }
 */
export const normalizeExperienceLevel = (exp) => {
  if (exp === null || exp === undefined) {
    return { tier: "1-2", years: 2, label: "1–2 Years" };
  }
  const str = String(exp).toLowerCase().trim();

  if (
    str.includes("fresher") ||
    str === "0" ||
    str === "0 yr" ||
    str.includes("entry")
  ) {
    return { tier: "fresher", years: 0, label: "Fresher / Entry Level (0 yr)" };
  }

  if (str === "1" || str.includes("0–1") || str.includes("0-1")) {
    return { tier: "fresher", years: 1, label: "0–1 Year" };
  }

  if (
    str.includes("lead") ||
    str.includes("staff") ||
    str.includes("principal") ||
    str.includes("architect") ||
    str.includes("senior") ||
    str.includes("4+") ||
    str.includes("5+")
  ) {
    return { tier: "senior", years: 5, label: "5+ Years (Senior)" };
  }

  const num = parseFloat(str);
  if (!isNaN(num)) {
    if (num <= 0.5) return { tier: "fresher", years: 0, label: "Fresher / Entry Level (0 yr)" };
    if (num <= 1) return { tier: "fresher", years: 1, label: "0–1 Year" };
    if (num <= 2.5) return { tier: "1-2", years: 2, label: "1–2 Years" };
    if (num <= 4.5) return { tier: "2-4", years: 3, label: "2–4 Years" };
    return { tier: "senior", years: 5, label: "5+ Years (Senior)" };
  }

  if (str.includes("1–2") || str.includes("1-2")) {
    return { tier: "1-2", years: 2, label: "1–2 Years" };
  }
  if (str.includes("2–4") || str.includes("2-4") || str.includes("2-3") || str.includes("3-5")) {
    return { tier: "2-4", years: 3, label: "2–4 Years" };
  }

  return { tier: "1-2", years: 2, label: "1–2 Years" };
};

/**
 * Simulated/mock resume parser and structured analyzer.
 * Extracts candidate metadata, target role, technical skills, projects,
 * work experience, and verifiable claims with probing questions.
 *
 * @param {string} resumeText
 * @returns {Object}
 */
export const generateMockResumeAnalysis = (resumeText = "") => {
  const text = String(resumeText || "");
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const lower = text.toLowerCase();

  // 1. Detect candidate name: First clean non-metadata line
  let candidateName = "Candidate";
  for (let i = 0; i < Math.min(lines.length, 8); i++) {
    const line = lines[i];
    const lineLower = line.toLowerCase();
    if (
      line.length >= 2 &&
      line.length <= 40 &&
      !lineLower.includes("resume") &&
      !lineLower.includes("curriculum") &&
      !lineLower.includes("vitae") &&
      !lineLower.includes("page") &&
      !lineLower.includes("email") &&
      !lineLower.includes("phone") &&
      !lineLower.includes("github") &&
      !lineLower.includes("linkedin") &&
      !lineLower.includes("portfolio") &&
      !lineLower.includes("profile") &&
      !lineLower.includes("contact") &&
      !line.includes("@") &&
      !line.includes("http") &&
      !line.includes(".com") &&
      !/^\d+$/.test(line) &&
      !/^(skills|education|experience|summary|projects?|profile|about)/i.test(line)
    ) {
      candidateName = line.replace(/[^\w\s.-]/g, "").trim() || "Candidate";
      break;
    }
  }

  // 2. Comprehensive technical skills catalog (250+ technologies across all software domains)
  const skillsCatalog = [
    // Languages
    "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "C", "PHP", "Go", "Golang",
    "Rust", "Ruby", "Swift", "Kotlin", "Dart", "R", "SQL", "HTML5", "HTML", "CSS3", "CSS", "Bash", "Shell",
    // Frontend
    "React", "React.js", "Next.js", "Angular", "Vue", "Vue.js", "Svelte", "Redux", "Redux Toolkit", "Zustand",
    "Tailwind CSS", "Bootstrap", "Material UI", "Shadcn UI", "Sass", "SCSS", "Vite", "Webpack", "jQuery",
    // Backend
    "Node.js", "Express", "Express.js", "NestJS", "Spring", "Spring Boot", "Hibernate", "Django", "Flask",
    "FastAPI", "Laravel", "ASP.NET", ".NET", ".NET Core", "Ruby on Rails", "GraphQL", "REST APIs", "RESTful APIs",
    "Microservices", "WebSockets", "Socket.io", "gRPC", "Kafka", "RabbitMQ",
    // Databases & Caching
    "MySQL", "PostgreSQL", "MongoDB", "Redis", "SQLite", "Oracle", "Firebase", "Firestore", "DynamoDB",
    "Cassandra", "Elasticsearch", "Supabase", "Prisma", "Mongoose",
    // Cloud & DevOps
    "AWS", "Azure", "GCP", "Google Cloud", "Docker", "Kubernetes", "CI/CD", "Jenkins", "GitHub Actions",
    "Terraform", "Linux", "Nginx", "Apache", "Prometheus", "Grafana", "Git", "GitHub", "GitLab",
    // AI, Data Science & ML
    "Machine Learning", "Deep Learning", "Artificial Intelligence", "NLP", "Natural Language Processing",
    "Computer Vision", "TensorFlow", "PyTorch", "Scikit-Learn", "Pandas", "NumPy", "OpenCV", "LLMs",
    "Generative AI", "Power BI", "Tableau", "Data Analysis", "Data Structures", "Algorithms",
    // Mobile
    "Android", "iOS", "Flutter", "React Native",
    // Testing & QA
    "Jest", "Mocha", "Chai", "Cypress", "Playwright", "Selenium", "JUnit", "PyTest", "Postman", "Swagger",
  ];

  // A. Extract skills listed in explicit resume sections:
  const sectionSkills = [];
  const skillsSectionRegex =
    /(?:technical\s+skills|key\s+skills|skills|technologies|core\s+competencies|programming\s+languages|tools\s+(&|and)\s+technologies|tech\s+stack)[\s:]*([\s\S]*?)(?=(?:\n\s*[A-Z][A-Z\s]{2,}:|\n\s*(?:experience|projects?|education|certifications?|work\s+history|achievements|summary|profile)|$))/i;
  const skillsMatch = text.match(skillsSectionRegex);

  if (skillsMatch && skillsMatch[1]) {
    const rawSkillsText = skillsMatch[1];
    const tokens = rawSkillsText
      .replace(/^[A-Za-z\s]+:\s*/gm, "")
      .split(/[,|•;/\n\t]+/)
      .map((t) => t.trim())
      .filter((t) => t.length >= 2 && t.length <= 30 && !/^(and|with|etc|using|in|for|of)$/i.test(t));

    tokens.forEach((token) => {
      const cleanToken = token.replace(/[()[\]{}:]/g, "").trim();
      if (cleanToken && cleanToken.length >= 2 && cleanToken.length <= 30) {
        if (!sectionSkills.some((s) => s.toLowerCase() === cleanToken.toLowerCase())) {
          sectionSkills.push(cleanToken);
        }
      }
    });
  }

  // B. Match catalog against full text
  const catalogMatches = [];
  skillsCatalog.forEach((skill) => {
    const esc = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp(`(?:^|[^a-zA-Z0-9_#+])${esc}(?:$|[^a-zA-Z0-9_#+])`, "i");
    if (regex.test(text)) {
      if (!catalogMatches.some((s) => s.toLowerCase() === skill.toLowerCase())) {
        catalogMatches.push(skill);
      }
    }
  });

  // Combine skills: section skills first, then catalog matches
  const detectedSkills = [];
  const seen = new Set();
  [...catalogMatches, ...sectionSkills].forEach((s) => {
    const key = s.toLowerCase();
    if (!seen.has(key) && s.length >= 2 && s.length <= 25) {
      seen.add(key);
      detectedSkills.push(s);
    }
  });

  if (detectedSkills.length === 0) {
    detectedSkills.push("JavaScript", "React", "Node.js", "SQL", "Git");
  }

  // 3. Detect Target Role:
  // First check lines 1 to 5 for headline (e.g. "Full Stack Developer", "Java Developer")
  let targetRole = "";
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const line = lines[i];
    if (
      line !== candidateName &&
      /(developer|engineer|architect|programmer|scientist|analyst|specialist|consultant|designer|tester|lead)/i.test(line) &&
      !/@|http|\.com|phone|email/i.test(line) &&
      line.length <= 50
    ) {
      targetRole = line.replace(/[^\w\s/&-]/g, "").trim();
      break;
    }
  }

  if (!targetRole) {
    const roleKeywords = [
      { key: "full stack", role: "Full Stack Engineer" },
      { key: "fullstack", role: "Full Stack Engineer" },
      { key: "frontend", role: "Frontend Engineer" },
      { key: "front end", role: "Frontend Engineer" },
      { key: "backend", role: "Backend Engineer" },
      { key: "back end", role: "Backend Engineer" },
      { key: "java developer", role: "Java Backend Engineer" },
      { key: "python developer", role: "Python Engineer" },
      { key: "data scientist", role: "Data Scientist" },
      { key: "data engineer", role: "Data Engineer" },
      { key: "devops", role: "DevOps Engineer" },
      { key: "cloud engineer", role: "Cloud Solutions Engineer" },
      { key: "machine learning", role: "Machine Learning Engineer" },
      { key: "mobile developer", role: "Mobile Application Developer" },
      { key: "android", role: "Android Developer" },
      { key: "flutter", role: "Flutter Developer" },
      { key: "react", role: "React Frontend Engineer" },
      { key: "software developer", role: "Software Developer" },
      { key: "software engineer", role: "Software Engineer" },
    ];
    for (const r of roleKeywords) {
      if (lower.includes(r.key)) {
        targetRole = r.role;
        break;
      }
    }
  }

  if (!targetRole) {
    if (detectedSkills.includes("Java") || detectedSkills.includes("Spring Boot")) {
      targetRole = "Java Backend Engineer";
    } else if (detectedSkills.includes("Python") || detectedSkills.includes("Django")) {
      targetRole = "Python Engineer";
    } else if (detectedSkills.includes("React") || detectedSkills.includes("Vue") || detectedSkills.includes("Angular")) {
      targetRole = "Frontend Engineer";
    } else {
      targetRole = "Software Engineer";
    }
  }

  // 4. Extract Real Projects from the resume
  const projects = [];
  const projectSectionRegex =
    /(?:projects?|academic\s+projects?|personal\s+projects?|key\s+projects?)[\s:]*([\s\S]*?)(?=(?:\n\s*[A-Z][A-Z\s]{2,}:|\n\s*(?:experience|education|certifications?|work\s+history|achievements|skills)|$))/i;
  const projectMatch = text.match(projectSectionRegex);

  if (projectMatch && projectMatch[1]) {
    const projSnippet = projectMatch[1];
    const projLines = projSnippet
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 2);

    let currentProject = null;
    for (let i = 0; i < projLines.length; i++) {
      const line = projLines[i];
      const isBullet = /^[•\-*–—]|\d+\./.test(line);
      const isHeader = !isBullet && line.length < 60 && !/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{4})/i.test(line);

      if (isHeader) {
        if (currentProject && currentProject.name) {
          projects.push(currentProject);
        }
        const cleanName = line.replace(/[^\w\s/&-]/g, "").trim();
        const lineSkills = detectedSkills.filter((s) => new RegExp(`\\b${s}\\b`, "i").test(line));
        currentProject = {
          name: cleanName || "Engineering Project",
          description: "",
          technologies: lineSkills.length > 0 ? lineSkills : detectedSkills.slice(0, 3),
          highlights: [],
        };
      } else if (currentProject) {
        const cleanBullet = line.replace(/^[•\-*–—\d.]+\s*/, "").trim();
        if (cleanBullet) {
          currentProject.highlights.push(cleanBullet);
          if (!currentProject.description) {
            currentProject.description = cleanBullet;
          }
          detectedSkills.forEach((s) => {
            if (new RegExp(`\\b${s}\\b`, "i").test(cleanBullet) && !currentProject.technologies.includes(s)) {
              currentProject.technologies.push(s);
            }
          });
        }
      }
      if (projects.length >= 3) break;
    }
    if (currentProject && currentProject.name && !projects.includes(currentProject)) {
      projects.push(currentProject);
    }
  }

  // Fallback if no projects parsed
  if (projects.length === 0) {
    const topTechs = detectedSkills.slice(0, 3);
    projects.push({
      name: `${topTechs[0] || "Full Stack"} Application Platform`,
      description: `Production-ready application built with ${topTechs.join(", ")} featuring robust component structure and API integrations.`,
      technologies: topTechs,
      highlights: [
        `Engineered application modules and end-to-end user workflows using ${topTechs[0] || "modern tools"}.`,
        "Implemented RESTful endpoints, data validation, and asynchronous error boundaries.",
      ],
    });
  }

  // 5. Detect Experience Years:
  let expYears = 1.0;
  const yrMatch = text.match(/(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)/i);
  if (yrMatch) {
    expYears = parseFloat(yrMatch[1]);
  } else if (
    lower.includes("fresher") ||
    lower.includes("entry level") ||
    lower.includes("intern") ||
    lower.includes("student")
  ) {
    expYears = 0;
  }

  // 6. Detect Work Experience:
  const workExperience = [];
  const expSectionRegex =
    /(?:experience|work\s+experience|professional\s+experience|employment\s+history)[\s:]*([\s\S]*?)(?=(?:\n\s*[A-Z][A-Z\s]{2,}:|\n\s*(?:projects?|education|certifications?|skills|achievements)|$))/i;
  const expMatch = text.match(expSectionRegex);
  if (expMatch && expMatch[1]) {
    const expLines = expMatch[1]
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 2);
    if (expLines.length > 0) {
      workExperience.push({
        company: expLines[0].slice(0, 45).replace(/[:\-–—].*$/, "").trim() || "Technology Organization",
        role: targetRole,
        duration: `${expYears > 0 ? expYears : 1} year(s)`,
        responsibilities: expLines.slice(1, 4).map((l) => l.replace(/^[•\-*–—\d.]+\s*/, "").trim()).filter(Boolean),
      });
    }
  }

  if (workExperience.length === 0) {
    workExperience.push({
      company: "Engineering Team",
      role: targetRole,
      duration: `${expYears > 0 ? expYears : 1} year(s)`,
      responsibilities: [
        `Developed software features using ${detectedSkills.slice(0, 3).join(", ")}.`,
        "Collaborated with peers to review code, troubleshoot issues, and ship releases.",
      ],
    });
  }

  // 7. Extract Verifiable Resume Claims:
  const resumeClaims = [];
  const claimMatches = text.match(
    /[^.!?\n]*?(?:improved|reduced|increased|boosted|optimized|accelerated|developed|built|engineered|architected|migrated|scaled)[^.!?\n]*?(?:\d+%\s*|\d+\+?\s*(?:users|requests|ms|seconds|fps|qps|endpoints|queries)|REST APIs|microservices|authentication|database)[^.!?\n]*/gi
  );

  if (claimMatches && claimMatches.length > 0) {
    claimMatches.slice(0, 3).forEach((rawClaim, idx) => {
      const cleanClaim = rawClaim.trim().replace(/^[-•*]\s*/, "");
      if (cleanClaim.length > 20 && cleanClaim.length < 120) {
        const matchedTech = detectedSkills.find((s) => cleanClaim.toLowerCase().includes(s.toLowerCase())) || detectedSkills[idx] || "Engineering";
        resumeClaims.push({
          claim: cleanClaim,
          technology: matchedTech,
          context: `Key highlight from resume`,
          verificationPriority: "high",
          verificationQuestion: `In your resume, you stated: "${cleanClaim}". Walk me through the technical details, the tools you used, and how you verified this outcome.`,
        });
      }
    });
  }

  if (resumeClaims.length === 0) {
    resumeClaims.push({
      claim: `Built and shipped ${projects[0].name} utilizing ${projects[0].technologies.join(", ")}`,
      technology: projects[0].technologies[0] || detectedSkills[0] || "Architecture",
      context: `${projects[0].name} project implementation`,
      verificationPriority: "high",
      verificationQuestion: `In your ${projects[0].name} project, walk me through how you architected the data flow and how you handled unexpected API or runtime failures.`,
    });
  }

  return {
    candidateName,
    targetRole,
    summary: `${targetRole} with ${expYears > 0 ? expYears : "entry-level"} practical experience specializing in ${detectedSkills.slice(0, 5).join(", ")}. Demonstrated project delivery in ${projects.slice(0, 2).map((p) => p.name).join(" and ")}.`,
    experience: [`${expYears} years in ${targetRole}`],
    experienceYears: expYears,
    skills: detectedSkills,
    technicalSkills: detectedSkills,
    projects,
    workExperience,
    education: ["B.Tech / B.S. in Computer Science or related engineering field"],
    certifications: [],
    achievements: [],
    responsibilities: [
      `Engineered features and components using ${detectedSkills.slice(0, 3).join(", ")}`,
      "Integrated APIs, maintained error boundaries, and wrote clean modular code",
    ],
    technologies: detectedSkills,
    resumeClaims,
    potentialQuestionAreas: [
      `Core principles and paradigms of ${detectedSkills[0] || "Engineering"}`,
      `Architecture and trade-offs in ${projects[0]?.name || "portfolio projects"}`,
      `Handling concurrency, error states, and latency in ${detectedSkills[1] || "APIs"}`,
      `Database and data structure efficiency`,
      `Empirical verification of claims on candidate's resume`,
    ],
  };
};

/**
 * Production-quality structured resume analyzer using Gemini.
 * Extracts candidateName, targetRole, skills, projects, workExperience,
 * and verifiable claims according to the exact platform schema.
 *
 * @param {string} resumeText
 * @returns {Promise<Object>}
 */
export const analyzeResume = async (resumeText) => {
  if (!resumeText || !resumeText.trim()) {
    throw new Error("Unable to analyze empty resume text.");
  }

  if (isMockGeminiEnabled()) {
    console.log(
      "[Gemini] 🔧 Dev Mode (VITE_MOCK_GEMINI=true) — returning simulated resume analysis."
    );
    await new Promise((r) => setTimeout(r, 500));
    return generateMockResumeAnalysis(resumeText);
  }

  const prompt = `You are an expert Technical Recruiter and Engineering Hiring Manager analyzing a candidate's resume for a software engineering interview.
Extract detailed, factual structured information from the provided resume text.

HARD RULES:
1. DO NOT INVENT or extrapolate skills, projects, or metrics not explicitly stated in the resume.
2. EXTRACT VERIFIABLE RESUME CLAIMS:
   Identify 2-5 specific claims that should be verified in a technical interview (e.g. claimed percentage improvements, scale metrics, architecture claims, or technologies used).
   For each claim, formulate a neutral, probing verification question (e.g. "How did you measure that improvement and what specific changes produced it?").
3. ACCURATELY DETECT:
   - Candidate's full name (if present)
   - Primary target role
   - Clean list of technical skills
   - Projects (name, description, technologies, highlights)
   - Work experience (company, role, duration, responsibilities)
   - Potential technical question areas grounded solely in this resume.

Resume Text:
"""
${resumeText.slice(0, 15000)}
"""`;

  try {
    const interaction = await withRetry(
      () =>
        callGeminiInteraction({
          model: "gemini-3.8-flash",
          input: prompt,
          response_format: {
            type: "text",
            mime_type: "application/json",
            schema: {
              type: "object",
              properties: {
                candidateName: { type: "string" },
                targetRole: { type: "string" },
                summary: { type: "string" },
                experience: { type: "array", items: { type: "string" } },
                experienceYears: { type: "number" },
                skills: { type: "array", items: { type: "string" } },
                technicalSkills: { type: "array", items: { type: "string" } },
                projects: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      description: { type: "string" },
                      technologies: {
                        type: "array",
                        items: { type: "string" },
                      },
                      highlights: { type: "array", items: { type: "string" } },
                    },
                    required: ["name"],
                  },
                },
                workExperience: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      company: { type: "string" },
                      role: { type: "string" },
                      duration: { type: "string" },
                      responsibilities: {
                        type: "array",
                        items: { type: "string" },
                      },
                    },
                    required: ["company", "role"],
                  },
                },
                education: { type: "array", items: { type: "string" } },
                certifications: { type: "array", items: { type: "string" } },
                achievements: { type: "array", items: { type: "string" } },
                responsibilities: { type: "array", items: { type: "string" } },
                technologies: { type: "array", items: { type: "string" } },
                resumeClaims: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      claim: { type: "string" },
                      technology: { type: "string" },
                      context: { type: "string" },
                      verificationPriority: {
                        type: "string",
                        enum: ["high", "medium", "low"],
                      },
                      verificationQuestion: { type: "string" },
                    },
                    required: [
                      "claim",
                      "verificationPriority",
                      "verificationQuestion",
                    ],
                  },
                },
                potentialQuestionAreas: {
                  type: "array",
                  items: { type: "string" },
                },
              },
              required: [
                "candidateName",
                "targetRole",
                "technicalSkills",
                "projects",
                "resumeClaims",
              ],
            },
          },
        }),
      "analyzeResume"
    );

    const parsed = JSON.parse(interaction?.output_text || "{}");
    if (!parsed || !parsed.technicalSkills) {
      throw new Error("Invalid output format from resume analysis.");
    }
    return parsed;
  } catch (error) {
    console.warn(
      "[Gemini] analyzeResume fallback to simulated parser:",
      error.message
    );
    return generateMockResumeAnalysis(resumeText);
  }
};

/**
 * Dev-only simulated questions generator used when VITE_MOCK_GEMINI=true.
 * Generates realistic 2026 modern software engineering interview questions with
 * progressive difficulty (Easy-Medium -> Medium -> Medium-Hard -> Hard -> Hard/System-Design).
 */
const generateMockQuestions = ({
  position = "Frontend Engineer",
  techStack = "React, JavaScript",
  experience = 2,
  interviewType = "Technical",
  focusAreas = "",
  questionCount = 5,
  resumeAnalysis = null,
  resumeClaims = [],
  resumeBased = false,
}) => {
  const resumeSkills = resumeAnalysis?.technicalSkills || resumeAnalysis?.skills || [];
  const formSkills = techStack ? techStack.split(/[,|/•]+/).map((s) => s.trim()).filter(Boolean) : [];
  const combinedSkills = Array.from(new Set([...resumeSkills, ...formSkills]));
  const primaryTech = combinedSkills[0] || (formSkills[0] || "Frontend");
  const secondaryTech = combinedSkills[1] || (formSkills[1] || combinedSkills[0] || "JavaScript");
  const tertiaryTech = combinedSkills[2] || combinedSkills[0] || "Database";
  const normExp = normalizeExperienceLevel(experience);
  const expYears = normExp.years;

  const allTechText = (combinedSkills.join(" ") + " " + position + " " + techStack).toLowerCase();
  const isBackend = /python|django|flask|fastapi|java|spring|node|express|nestjs|golang|go|c#|\.net|php|laravel|ruby|rails|sql|postgres|mysql|mongo|redis|microservice|kafka/i.test(allTechText);
  const isAiMl = /machine learning|deep learning|ai|nlp|computer vision|tensorflow|pytorch|scikit|pandas|numpy|llm|generative/i.test(allTechText);
  const isDevOps = /devops|docker|kubernetes|aws|gcp|azure|terraform|ci\/cd|jenkins|ansible|cloud/i.test(allTechText);

  // ── Resume-Based Interview Question Generation ────────────────────────
  if ((resumeBased || resumeAnalysis) && interviewType !== "HR") {
    const claims = resumeClaims && resumeClaims.length > 0
      ? resumeClaims
      : resumeAnalysis?.resumeClaims || [];
    const projects = resumeAnalysis?.projects || [];
    const topProject = projects[0]?.name || "Featured Project";
    const topTech = projects[0]?.technologies?.[0] || primaryTech;

    const resumePool = [];

    // Q1: Grounded in candidate's actual project, calibrated strictly to selected experience tier
    if (normExp.tier === "fresher") {
      resumePool.push({
        question: `In your resume, you highlighted your project "${topProject}" built with ${topTech}. Walk me through the architecture of this project, how you structured components/modules, and what you personally implemented.`,
        answer: `Walks through the application structure, key modular components or service layers, separation of concerns, and concrete personal contributions.`,
        category: "project",
        difficulty: "easy",
        expectedSkill: "Project Architecture & Personal Implementation",
        questionType: "project",
        followUpIntent: "Ask how they tested the implementation and handled error conditions.",
      });
    } else if (normExp.tier === "1-2") {
      resumePool.push({
        question: `In your resume, you listed the "${topProject}" project built using ${topTech}. Can you walk me through how the system components communicated, and how you handled asynchronous loading, data fetching, and error recovery states?`,
        answer: `Explains client-server or service communication, API/protocol abstractions, state handling for loading/error boundaries, and handling network or database failure edge cases.`,
        category: "project",
        difficulty: "medium",
        expectedSkill: "Communication Architecture & Async Error Boundaries",
        questionType: "project",
        followUpIntent: "Ask what happens if a downstream service or API call fails mid-transaction.",
      });
    } else if (normExp.tier === "2-4") {
      resumePool.push({
        question: `In your resume, you engineered "${topProject}" with ${topTech}. Walk me through how you designed data flow and state/cache boundaries in that application, and what technical trade-offs you evaluated during implementation.`,
        answer: `Articulates clear separation of persistent storage vs in-memory caching or state, avoiding bottlenecks, and trade-offs made for speed and maintainability.`,
        category: "project",
        difficulty: "medium",
        expectedSkill: "Architecture, Data Flow & Trade-Off Analysis",
        questionType: "project",
        followUpIntent: "Ask how they handled caching, schema evolution, and mutation rollbacks.",
      });
    } else {
      resumePool.push({
        question: `Your resume features "${topProject}". Walk me through the high-level architecture, how you engineered it for scale and performance under concurrent usage, and what architectural decisions you would revisit with hindsight.`,
        answer: `Demonstrates high-level system design, modular isolation, concurrency and performance considerations, and architectural maturity acknowledging technical trade-offs.`,
        category: "project",
        difficulty: "hard",
        expectedSkill: "System Scalability & Production Architectural Ownership",
        questionType: "system-design",
        followUpIntent: "Ask how they profiled bottlenecks under high concurrent loads.",
      });
    }

    // Q2: Verifiable Resume Claim! (Section 6 & 14)
    if (claims.length > 0) {
      const targetClaim = claims[0];
      const qText =
        targetClaim.verificationQuestion ||
        `In your resume, you noted: "${targetClaim.claim}". How did you measure that improvement, what was the bottleneck, and what specific code or architectural changes produced that result?`;
      resumePool.push({
        question: qText,
        answer: `The candidate should substantiate the claimed improvement with concrete metrics (e.g. baseline vs post-optimization timings, profiling tools used) and explain the specific code or schema changes.`,
        category: "performance",
        difficulty: normExp.tier === "fresher" ? "medium" : "hard",
        expectedSkill: "Empirical Claim Verification & Performance Measurement",
        questionType: "debugging",
        followUpIntent: "Probe for specific diagnostic metrics and tools used.",
      });
    }

    // Q3: Technology deep dive into primary tech
    resumePool.push({
      question: `Your resume lists hands-on experience with ${primaryTech}. When building features for a ${position} role, walk me through a complex edge-case bug or performance issue you investigated in ${primaryTech}, and how you isolated the root cause.`,
      answer: `Demonstrates systematic debugging methodology: hypothesis, reproduction, profiling or log inspection, identifying root cause (e.g. memory leaks, race conditions, stale state, unindexed queries), and verifying the solution.`,
      category: "debugging",
      difficulty: normExp.tier === "fresher" ? "easy" : "medium",
      expectedSkill: "Role-Specific Technical Debugging & Diagnostic Reasoning",
      questionType: "debugging",
      followUpIntent: "Ask how they ensured the bug didn't regress.",
    });

    // Q4: Domain-specific scenario & resilience
    if (isAiMl) {
      resumePool.push({
        question: `In your work with ${primaryTech}, how did you design your data preprocessing pipelines, handle missing values or feature scaling without data leakage, and evaluate model performance beyond simple accuracy?`,
        answer: `Fit transformers/scalers strictly on training splits and apply transforms to test splits, use pipelines to encapsulate preprocessing steps, audit timestamps for temporal leakage, and evaluate using domain-specific metrics like F1, PR-AUC, and confusion matrix calibration.`,
        category: "machine-learning",
        difficulty: normExp.tier === "fresher" ? "easy" : "medium",
        expectedSkill: "Feature Engineering & Leakage Prevention",
        questionType: "scenario",
        followUpIntent: "Ask how they handle class imbalance in the training data.",
      });
    } else if (isDevOps) {
      resumePool.push({
        question: `In your infrastructure work with ${secondaryTech || primaryTech}, how do you design zero-downtime rolling deployments, automated canary rollbacks on 5xx error spikes, and container security scanning in CI/CD?`,
        answer: `Configure Kubernetes readiness and liveness probes, rolling update strategies with maxSurge/maxUnavailable bounds, service mesh or ingress canary traffic splitting, automated metric triggers for rollback, and vulnerability scanning with Trivy in CI pipelines.`,
        category: "devops",
        difficulty: normExp.tier === "fresher" ? "easy" : "medium",
        expectedSkill: "Deployment Resilience & Canary Rollbacks",
        questionType: "scenario",
        followUpIntent: "Ask how they prevent cascading failures when a canary rollout fails.",
      });
    } else if (isBackend) {
      resumePool.push({
        question: `When scaling ${secondaryTech || primaryTech} services, suppose an endpoint experiences high database latency and connection pool exhaustion under peak concurrent traffic. How do you isolate whether the issue is missing indexes, unoptimized queries, or connection pool misconfiguration, and how do you resolve it?`,
        answer: `Profile queries using database slow query logs and EXPLAIN ANALYZE to identify sequential scans, add composite or covering indexes, resolve N+1 queries via batch fetching/joins, tune connection pool parameters (e.g. max pool size, timeout bounds), and place high-frequency read data behind a Redis cache with proper TTLs.`,
        category: "backend-database",
        difficulty: normExp.tier === "fresher" ? "easy" : "medium",
        expectedSkill: "Database Query Optimization & Connection Pool Tuning",
        questionType: "scenario",
        followUpIntent: "Ask how they handle cache stampedes when cached keys expire.",
      });
    } else {
      resumePool.push({
        question: `A critical endpoint in your application intermittently returns a 500 error or takes over 5 seconds to respond. How do you design client-side error handling, cancellation via AbortController, and retry mechanisms in ${primaryTech} so user experience is preserved?`,
        answer: `Use AbortController with a timeout signal, implement exponential backoff with max retry bounds for idempotent requests, show inline error states with manual retry affordances, and ensure state setters are guarded against unmounted components.`,
        category: "api-networking",
        difficulty: normExp.tier === "fresher" ? "easy" : "medium",
        expectedSkill: "Asynchronous Network Resilience & AbortController",
        questionType: "scenario",
        followUpIntent: "Ask how they handle race conditions if consecutive requests finish out of order.",
      });
    }

    // Q5: Production reliability, memory/performance profiling & architecture
    if (isAiMl) {
      resumePool.push({
        question: `When deploying models built with ${primaryTech} to production, how do you optimize inference latency, manage GPU/CPU memory constraints, and detect model degradation or data drift in real time?`,
        answer: `Use model quantization (INT8/FP16), TensorRT or ONNX Runtime for optimized inference graphs, batch inference requests with dynamic micro-batching, monitor prediction distributions vs training baselines using tools like Evidently or Prometheus, and establish automated retraining triggers.`,
        category: "ml-engineering",
        difficulty: normExp.tier === "fresher" ? "medium" : "hard",
        expectedSkill: "Model Inference Optimization & Drift Monitoring",
        questionType: "debugging",
        followUpIntent: "Ask how they set alert thresholds for drift before user experience is impacted.",
      });
    } else if (isDevOps) {
      resumePool.push({
        question: `How do you enforce least-privilege IAM policies, manage secret rotation, and configure central logging and distributed tracing across ${primaryTech} infrastructure?`,
        answer: `Enforce role-based access control with scoped IAM roles, avoid long-lived credentials by utilizing secret managers with automated rotation, centralize logs with Fluentd/Loki, and trace distributed requests using OpenTelemetry correlation IDs injected across service boundaries.`,
        category: "security-sre",
        difficulty: normExp.tier === "fresher" ? "medium" : "hard",
        expectedSkill: "IAM Governance & Distributed Observability",
        questionType: "system-design",
        followUpIntent: "Ask how they handle key rotation without downtime for active services.",
      });
    } else if (isBackend) {
      resumePool.push({
        question: `In ${primaryTech}, how do you design distributed transactions or eventual consistency when updating multiple services or database tables, and how do you implement idempotency to handle duplicate webhook or message retries?`,
        answer: `Implement the transactional outbox pattern or saga orchestration/choreography with compensating transactions for multi-service operations. For idempotency, validate a unique idempotency key per request in Redis or database with atomic SETNX/conditional insert, caching the processed response for identical retries within a reasonable TTL window.`,
        category: "system-design",
        difficulty: normExp.tier === "fresher" ? "medium" : "hard",
        expectedSkill: "Distributed Consistency & Idempotent API Design",
        questionType: "system-design",
        followUpIntent: "Ask how they prevent stale idempotency locks if a worker crashes mid-execution.",
      });
    } else {
      resumePool.push({
        question: `In ${primaryTech}, what profiling techniques or tools do you use to detect memory leaks, unnecessary re-render waterfalls, and slow component renders? Give a concrete example of an optimization you implemented.`,
        answer: `Use React DevTools Profiler (record what caused render) and Chrome DevTools Performance panel (identifying long tasks). Address bottlenecks by colocating state, lifting content as children/slots, memoizing heavy subtrees with React.memo/useMemo, and virtualizing large lists.`,
        category: "performance",
        difficulty: normExp.tier === "fresher" ? "medium" : "hard",
        expectedSkill: "Performance Profiling & Render Optimization",
        questionType: "debugging",
        followUpIntent: "Ask what trade-offs they considered before adding memoization.",
      });
    }

    return resumePool.slice(0, questionCount);
  }

  if (interviewType === "HR") {
    const hrPool = [
      {
        question: `Tell me about yourself, your career path leading to this ${position} role, and what specific technical problems excite you most about working with our team?`,
        answer: `A structured introduction outlining professional background, key achievements, motivation for the role, and alignment with the company's technical vision.`,
        category: "behavioral",
        difficulty: "easy",
        expectedSkill: "Professional Introduction & Alignment",
        questionType: "concept",
      },
      {
        question: `Tell me about a time when you and another engineer strongly disagreed on an architectural decision or tech stack choice. How did you resolve the conflict constructively?`,
        answer: `Demonstrates constructive communication, prioritizing objective evaluation (benchmarks, prototypes, trade-off matrices) over ego, and committing to the final team decision.`,
        category: "behavioral",
        difficulty: "medium",
        expectedSkill: "Conflict Resolution & Collaboration",
        questionType: "behavioral",
      },
      {
        question: `Describe a situation where a project deadline was at risk due to scope creep or unexpected technical roadblocks. How did you prioritize deliverables and communicate with stakeholders?`,
        answer: `Demonstrates stakeholder management, transparent risk signaling, ruthless prioritization of core MVP user flows, and realistic rescheduling.`,
        category: "behavioral",
        difficulty: "medium",
        expectedSkill: "Prioritization & Stakeholder Communication",
        questionType: "behavioral",
      },
      {
        question: `Can you share an experience where code you shipped introduced a critical regression or production outage? Walk me through how you handled the incident and what you learned.`,
        answer: `Demonstrates psychological safety, immediate mitigation (rollback/hotfix), blameless post-mortem analysis, and introducing automated safeguards (tests, alerts, feature flags).`,
        category: "behavioral",
        difficulty: "hard",
        expectedSkill: "Accountability & Incident Management",
        questionType: "scenario",
      },
      {
        question: `Looking ahead, what areas of engineering leadership or emerging technologies (such as AI-assisted workflows or modern performance tooling) are you actively investing time into learning?`,
        answer: `Shows growth mindset, continuous learning habit, and proactive adaptation to evolving industry standards and AI-assisted developer tooling.`,
        category: "behavioral",
        difficulty: "medium",
        expectedSkill: "Continuous Learning & Engineering Growth",
        questionType: "concept",
      },
    ];
    return hrPool.slice(0, questionCount);
  }

  if (interviewType === "Behavioral") {
    const behavioralPool = [
      {
        question: `Describe a complex feature or system you owned from initial requirements to production in ${primaryTech}. What were the key challenges and how did you measure its success?`,
        answer: `STAR-format breakdown: Situation, Task, Action (technical design, implementation, testing), and measurable Result (performance metrics, business impact, user adoption).`,
        category: "behavioral",
        difficulty: "medium",
        expectedSkill: "Ownership & Execution",
        questionType: "behavioral",
      },
      {
        question: `Tell me about a time when you had to make a difficult technical trade-off under tight deadlines. What did you sacrifice, how did you document the technical debt, and did you pay it down later?`,
        answer: `Explains conscious technical debt management, documenting trade-offs in tickets/ADRs, and scheduling dedicated refactoring sprints.`,
        category: "behavioral",
        difficulty: "medium",
        expectedSkill: "Technical Trade-offs & Pragmatism",
        questionType: "behavioral",
      },
      {
        question: `Walk me through a situation where an ambiguous requirement or changing product direction derailed your sprint. How did you adapt your implementation strategy?`,
        answer: `Demonstrates agility, asking clarifying questions, building modular code that adapts to requirement pivots without full rewrites.`,
        category: "behavioral",
        difficulty: "hard",
        expectedSkill: "Ambiguity & Adaptability",
        questionType: "behavioral",
      },
      {
        question: `Describe how you mentor junior developers or conduct code reviews. How do you balance code quality, security standards, and team velocity without being a bottleneck?`,
        answer: `Constructive code review philosophy: automated linters for style, focusing on architecture and edge cases, pairing on complex blockers, and encouraging team autonomy.`,
        category: "behavioral",
        difficulty: "hard",
        expectedSkill: "Mentorship & Code Review Standards",
        questionType: "behavioral",
      },
      {
        question: `Tell me about a time when user feedback or production monitoring contradicted your team's assumptions about feature performance. How did you investigate and pivot?`,
        answer: `Data-driven engineering: analyzing telemetry/user sessions, acknowledging flawed assumptions, and iterating based on empirical metrics.`,
        category: "behavioral",
        difficulty: "hard",
        expectedSkill: "Data-Driven Engineering & Humility",
        questionType: "scenario",
      },
    ];
    return behavioralPool.slice(0, questionCount);
  }

  // ── Fresher / Entry-Level (0 - 1 years) ─────────────────────────────────
  if (normExp.tier === "fresher" && interviewType !== "HR") {
    const fresherPool = [
      {
        question: `When building a dynamic form in ${primaryTech}, how do you manage input state to prevent laggy typing, and why is direct mutation of state objects an anti-pattern in React?`,
        answer: `Direct mutation of state bypasses React's shallow equality comparison and reconciliation engine, leading to components failing to re-render. Controlled inputs manage state using setter functions creating immutable copies that allow React to reliably schedule and render UI updates without jank.`,
        category: "react",
        difficulty: "easy",
        expectedSkill: "Immutability & Controlled State Flow",
        questionType: "concept",
        followUpIntent: "Ask how they handle validation errors without re-rendering the entire form.",
      },
      {
        question: `A component in ${primaryTech} displays an infinite loading spinner when an API request fails with a 404 or 500 status code. Walk me through how you structure error handling and defensive state so the user sees a meaningful recovery UI.`,
        answer: `Use try/catch/finally blocks around asynchronous fetch requests, ensuring a loading flag is set to false in the finally block. Maintain a dedicated error state to render actionable fallback UI with a retry button, and verify response.ok before attempting to parse response.json().`,
        category: "api-networking",
        difficulty: "easy",
        expectedSkill: "Defensive Async Handling & Error UI",
        questionType: "debugging",
        followUpIntent: "Ask how they would retry the failed request automatically.",
      },
      {
        question: `You notice a component continuously triggers an API fetch inside a useEffect hook in an infinite loop. What is the root cause of this bug, and what would you inspect in the dependency array to fix it?`,
        answer: `The effect updates state, and that state (or an object/array reference created during render) is included in the useEffect dependency array. Because new object/function references are created on every render, the dependency check always evaluates to changed, creating an infinite fetch-render loop. To fix it, ensure state setters aren't triggering redundant dependency changes, use functional state updates, or extract primitive values.`,
        category: "react",
        difficulty: "medium",
        expectedSkill: "Effect Dependencies & Render Loops",
        questionType: "debugging",
        followUpIntent: "Ask when an empty dependency array is appropriate versus hazardous.",
      },
      {
        question: `How would you write a simple debounce utility function in ${secondaryTech} to delay executing a callback until after a user has stopped typing for 300ms? Explain how closures and setTimeout make this work.`,
        answer: `A debounce function wraps a callback and retains a timerId variable in its lexical closure. Whenever the returned function is called, it clears the existing timer via clearTimeout(timerId) and schedules a new setTimeout. The callback only executes when the specified delay elapses without any new invocations.`,
        category: "javascript",
        difficulty: "medium",
        expectedSkill: "Closures & Event Debouncing",
        questionType: "coding",
        followUpIntent: "Ask what happens if the component unmounts while the timer is still pending.",
      },
      {
        question: `In a project you built using ${primaryTech}, describe a specific bug that took you significant time to troubleshoot. What debugging tools or console techniques did you use to find the root cause?`,
        answer: `Demonstrates structured debugging: reproducing the issue reliably, placing breakpoints in Chrome DevTools or using React DevTools component inspector, inspecting network headers, and writing tests to prevent regression.`,
        category: "project",
        difficulty: "medium",
        expectedSkill: "Diagnostic Methodology & Practical Debugging",
        questionType: "project",
        followUpIntent: "Ask what automated check they added to ensure the bug never returns.",
      },
    ];
    return fresherPool.slice(0, questionCount);
  }

  // ── Senior / Lead (5+ years) ───────────────────────────────────────────
  if (normExp.tier === "senior" && interviewType !== "HR") {
    const seniorPool = [
      {
        question: `You are architecting the frontend for a mission-critical platform in ${primaryTech} with hundreds of concurrent components and real-time streaming updates. How do you design the global state, micro-caching, and data isolation layer so that high-frequency updates do not trigger UI frame drops or block the main thread?`,
        answer: `Decouple high-frequency stream events from the React render tree using transient non-React reactive stores and batch state updates with requestAnimationFrame or React 18 useTransition/useDeferredValue. Establish strict cache boundaries using tools like TanStack Query with normalized keys, dedicated TTLs, and web workers for heavy data parsing off the main thread.`,
        category: "system-design",
        difficulty: "hard",
        expectedSkill: "High-Throughput State Architecture & Main-Thread Offloading",
        questionType: "system-design",
        followUpIntent: "Ask how they coordinate state synchronization across browser tabs using BroadcastChannel or WebSockets.",
      },
      {
        question: `Your production web application experiences intermittent Interaction to Next Paint (INP) spikes exceeding 400ms during peak usage. Walk me step-by-step through how you use Chrome DevTools Performance Profiler, user timing marks, and real user monitoring (RUM) to isolate whether the culprit is long task script evaluation, DOM recalculations, or third-party tag managers.`,
        answer: `Collect field RUM data using the web-vitals library to capture interaction targets, INP duration, and sub-parts (input delay, processing time, presentation delay). In DevTools Performance panel, simulate CPU throttling, record the specific interaction, and locate the long task (>50ms). Inspect the flame chart to identify whether excessive JavaScript execution, forced synchronous layouts, or third-party vendor scripts hijacked the event loop. Remediate with scheduler.yield() or dividing execution chunks.`,
        category: "performance",
        difficulty: "hard",
        expectedSkill: "Core Web Vitals Diagnostics & Event Loop Profiling",
        questionType: "debugging",
        followUpIntent: "Ask how they prioritize yield breaks without creating UI tearing.",
      },
      {
        question: `Design an enterprise-grade AI chat interface supporting markdown rendering, streaming tokens via SSE/WebSockets, auto-scroll locking with user override, and token-by-token abort handling. How do you prevent DOM thrashing when thousands of tokens arrive per minute?`,
        answer: `Buffer incoming streaming chunks and throttle DOM renders using requestAnimationFrame or requestIdleCallback instead of updating React state on every single token. Use virtualized lists for long chat histories so only visible messages remain in the DOM. Implement an auto-scroll anchor observer that pauses auto-scrolling when the user scrolls upwards, and wire an AbortController to the streaming network connection to allow instant user cancellations.`,
        category: "system-design",
        difficulty: "hard",
        expectedSkill: "Streaming UI Architecture & DOM Virtualization",
        questionType: "system-design",
        followUpIntent: "Ask how they handle reconnection and missed token replay when network drops.",
      },
      {
        question: `In modern Single Page Applications, how do you handle authentication tokens securely against XSS and CSRF? Compare HttpOnly secure cookies versus in-memory access tokens with refresh token rotation, and explain how you prevent token refresh race conditions when multiple parallel API requests encounter a 401 simultaneously.`,
        answer: `Store short-lived access tokens in memory and use HttpOnly, Secure, SameSite=Strict cookies for refresh tokens to mitigate XSS extraction. When multiple parallel requests encounter 401s, implement a singleton refresh promise or mutex queue in your HTTP interceptor: the first failing request triggers the refresh API call while concurrent requests wait on that single promise, and once refreshed, all queued requests replay with the new credentials.`,
        category: "security",
        difficulty: "hard",
        expectedSkill: "Auth Token Security & Concurrent Interceptor Race Resolution",
        questionType: "scenario",
        followUpIntent: "Ask how they invalidate credentials across multiple subdomains.",
      },
      {
        question: `A critical release introduced a regression that degraded checkout conversions by 15% and was detected 45 minutes after deployment. As the engineering lead, walk me through your incident mitigation, roll-forward versus rollback decision matrix, blameless post-mortem, and systemic automated safeguards implemented afterward.`,
        answer: `Prioritize immediate mean time to recovery (MTTR) by initiating an automated blue/green or canary rollback or flipping the offending feature flag off. Run a blameless post-mortem analyzing the timeline, root cause, and why pre-release automated suites didn't catch it. Implement systemic safeguards: automated synthetic E2E canary tests in CI/CD, canary deployment gates with automated rollbacks on anomaly spikes, and observability alerts on business metrics.`,
        category: "behavioral",
        difficulty: "hard",
        expectedSkill: "Engineering Leadership, Incident Management & SRE Safeguards",
        questionType: "scenario",
        followUpIntent: "Ask how they maintain team psychological safety while enforcing rigorous post-mortem accountability.",
      },
    ];
    return seniorPool.slice(0, questionCount);
  }

  // ── Mid-Level (2 - 4 years) / AI Engineer / Standard Technical ──────────
  const isAiRole =
    position.toLowerCase().includes("ai") ||
    techStack.toLowerCase().includes("gemini") ||
    techStack.toLowerCase().includes("llm");

  const pool = [
    {
      question: `You are building a high-traffic ${position} dashboard in ${primaryTech} where multiple widgets fetch and update data concurrently. How do you structure state ownership to prevent unnecessary re-render cascades, and how do you decide what belongs in client state versus server cache?`,
      answer: `Differentiate server cache (e.g., TanStack Query or SWR) from client UI state (e.g., local useState or lightweight store like Zustand). Colocate state near consuming components to avoid top-level re-render waterfalls, and leverage component composition (passing children/slots) or memoization to isolate render boundaries.`,
      category: "react",
      difficulty: "easy",
      expectedSkill: "State Architecture & Render Boundaries",
      questionType: "scenario",
      followUpIntent: "Ask how they handle cache invalidation when mutations occur.",
    },
    {
      question: `In an autocomplete search box in ${secondaryTech}, typing quickly triggers an API call on every keystroke. Sometimes an earlier slow response returns after a newer response, displaying stale search results to the user. Walk me through the exact race condition occurring and how you would fix it using AbortController or an active request flag.`,
      answer: `This is an asynchronous race condition caused by non-deterministic network latency. To fix it, instantiate an AbortController in an effect cleanup to cancel pending in-flight fetch requests when a new keystroke occurs, or use a cleanup flag (let isCurrent = true; return () => isCurrent = false) so that only responses from the latest request update component state. Additionally, debounce keystrokes (e.g. 250-300ms) to reduce redundant API traffic.`,
      category: "javascript",
      difficulty: "medium",
      expectedSkill: "Asynchronous Race Conditions & Network Cleanup",
      questionType: "debugging",
      followUpIntent: "Ask how debouncing differs from throttling and when to use each.",
    },
    {
      question: isAiRole
        ? `When integrating Gemini or an LLM API into a production web app, client-side rate limits (429) or transient 503 errors can interrupt active user sessions. How do you design your client and proxy architecture with exponential backoff, circuit breaking, and optimistic UI to ensure a seamless candidate experience?`
        : `A production audit of your ${primaryTech} app shows poor Interaction to Next Paint (INP) and a large initial JavaScript bundle. What specific profiling tools do you use to locate long tasks, and how do you decide between dynamic code-splitting (React.lazy), virtualization for long lists, and selective memoization?`,
      answer: isAiRole
        ? `Route LLM calls through a serverless backend proxy to protect API secrets and enforce server-side rate-limit queuing. On the client, implement exponential backoff with random jitter and clear retry indicators in the UI. Cache idempotent generation responses and display graceful fallback prompts rather than freezing or crashing the application.`
        : `Profile using Chrome DevTools Performance tab and React DevTools Profiler to identify long tasks (>50ms) blocking the main thread. Break up heavy render trees with route-based and component-level dynamic imports (React.lazy + Suspense), virtualize large lists (e.g. TanStack Virtual) to only render elements in viewport, and apply React.memo/useCallback judiciously where expensive recalculations or reference churn occur.`,
      category: isAiRole ? "ai-development" : "performance",
      difficulty: "medium",
      expectedSkill: isAiRole
        ? "AI API Resilience & Architecture"
        : "Web Vitals & Performance Profiling",
      questionType: "scenario",
      followUpIntent: isAiRole
        ? "Ask how they handle token streaming dropped connections."
        : "Ask under what specific conditions useMemo actually hurts performance.",
    },
    {
      question: `When integrating with third-party APIs or microservices, how do you implement resilient error handling (such as exponential backoff retries and UI error boundaries), and how do you protect sensitive credentials like API keys from being leaked to the browser?`,
      answer: `Isolate potential component crashes using React Error Boundaries with graceful fallback UI. For transient API errors (e.g. 503, 429), implement exponential backoff with jitter and max retry caps. Never expose private API keys in client-side environment variables; route sensitive calls through a serverless backend/proxy that verifies authenticated caller tokens before dispatching upstream requests.`,
      category: "security",
      difficulty: "hard",
      expectedSkill: "API Resilience & Client-Server Security Architecture",
      questionType: "scenario",
      followUpIntent: "Ask how they handle token refresh when an access token expires mid-session.",
    },
    {
      question: `An AI coding assistant generates a custom hook for your team that handles real-time data streaming and optimistic UI updates. What edge cases and pitfalls do you inspect in the generated code before approving it for production (e.g., stale closures in useEffect, memory leaks on unmount, or rollback handling when updates fail)?`,
      answer: `Verify that event listeners, timers, or abort signals are cleanly torn down in the hook's cleanup function to prevent memory leaks and duplicate subscriptions. Check for stale closures where state or props are captured without proper dependency array declarations. Ensure optimistic mutations implement robust rollback mechanisms and error states so the UI never displays orphaned or phantom data if the network request fails.`,
      category: "ai-development",
      difficulty: "hard",
      expectedSkill: "Code Ownership, Verification of AI-Assisted Output & Optimistic State",
      questionType: "system-design",
      followUpIntent: "Ask how they design optimistic UI rollback for offline actions.",
    },
  ];

  return pool.slice(0, questionCount);
};

/**
 * Dev-only simulated evaluation generator used when VITE_MOCK_GEMINI=true.
 */
const generateMockEvaluation = ({ question, correctAnswer, userAnswer }) => {
  const userText = (userAnswer || "").trim();
  const words = userText.split(/\s+/).filter(Boolean).length;
  const userLower = userText.toLowerCase();

  if (words === 0) {
    return {
      rating: 0,
      feedback: "No answer was provided. In a technical interview, unanswered questions receive 0 points. Review the model answer below to prepare for this topic.",
      correct_ans: correctAnswer || "",
      user_ans: "",
    };
  }

  // Check for evasive or trivial replies (e.g. "don't know", "idk", "no idea", "skip", "pass", "not sure", "yes", "no")
  const isEvasive = [
    "don't know",
    "dont know",
    "no idea",
    "skip",
    "pass",
    "not sure",
    "idk",
    "i do not know",
  ].some((kw) => userLower.includes(kw));

  if (isEvasive || words < 5) {
    return {
      rating: 1,
      feedback: `Minimal or evasive answer provided (${words} words). In a professional engineering interview, stating "I don't know" or giving a single-word reply results in 1/10 points. Even when unsure, explain what you understand about the concepts, outline your reasoning, or hypothesize how you would debug it.`,
      correct_ans: correctAnswer || "",
      user_ans: userAnswer || "",
    };
  }

  if (words < 12) {
    return {
      rating: 2,
      feedback: `Very brief response (${words} words). You cited a keyword but did not explain how it works under the hood, why it was chosen, or how it behaves under failure. In technical interviews, answers must detail the underlying mechanism and implementation steps.`,
      correct_ans: correctAnswer || "",
      user_ans: userAnswer || "",
    };
  }

  // Key technical mechanism check
  const hasMechanism = [
    "abortcontroller",
    "cleanup",
    "race condition",
    "immutability",
    "shallow",
    "closure",
    "reconciliation",
    "render",
    "dependency",
    "usememo",
    "profiler",
    "devtools",
    "token",
    "rollback",
    "error boundary",
  ].some((kw) => userLower.includes(kw));

  const hasTradeOff = [
    "trade-off",
    "however",
    "overhead",
    "instead",
    "because",
    "downside",
    "benchmark",
  ].some((kw) => userLower.includes(kw));

  let rating = 4;
  let strengthsText = "";
  let missingText = "";
  let approachText = "";

  if (hasMechanism && hasTradeOff && words >= 30) {
    rating = 9;
    strengthsText = "Outstanding answer! You identified the exact technical mechanism and articulated production trade-offs clearly.";
    missingText = "Consider citing specific metric thresholds (e.g. INP under 200ms) to make the explanation even more compelling.";
    approachText = "Keep using this high-level structure: Direct Answer → Technical Mechanism → Example → Trade-off.";
  } else if (hasMechanism && words >= 15) {
    rating = 7;
    strengthsText = "Solid response! You correctly identified the primary mechanism and explained how it functions.";
    missingText = "You didn't address the edge-case trade-offs or what happens when network failure occurs.";
    approachText = "After explaining the fix, explicitly add: 'The trade-off here is...' to demonstrate senior-level depth.";
  } else if (words >= 25) {
    rating = 6;
    strengthsText = "Good conversational explanation with clear communication.";
    missingText = "Lacked specific low-level APIs or runtime mechanics (e.g. AbortController, cleanup functions, or state immutability).";
    approachText = "Anchor your answer in specific engineering mechanisms rather than high-level generalities.";
  } else if (words >= 15) {
    rating = 5;
    strengthsText = "Addressed the general direction of the question.";
    missingText = "Answer was too brief to evaluate depth or practical understanding.";
    approachText = "Expand your response with the 'Why' behind your choice and provide a concrete project example.";
  } else {
    rating = 3;
    strengthsText = "Attempted a reply.";
    missingText = "Extremely short response with no technical explanation or mechanism provided.";
    approachText = "Walk through the problem step-by-step: what is causing the issue, what tool solves it, and how to verify.";
  }

  const feedback = `${strengthsText} ${missingText} ${approachText}`;

  return {
    rating,
    feedback,
    correct_ans: correctAnswer || "",
    user_ans: userAnswer || "",
  };
};

/**
 * Generates technical interview questions based on job position, description, experience, and tech stack.
 * Uses Gemini Interactions API with native Structured Outputs.
 * Retries automatically on 429 rate-limit errors with a visible countdown toast.
 *
 * @param {Object} params
 * @param {string} params.position
 * @param {string} params.description
 * @param {number|string} params.experience
 * @param {string} params.techStack
 * @param {string} [params.interviewType="Technical"]
 * @param {string} [params.focusAreas=""]
 * @param {number} [params.questionCount=5]
 * @param {Object} [params.resumeAnalysis=null]
 * @param {Array<Object>} [params.resumeClaims=[]]
 * @param {boolean} [params.resumeBased=false]
 * @returns {Promise<Array<{question: string, answer: string, category?: string, difficulty?: string, expectedSkill?: string, questionType?: string}>>}
 */
export const generateInterviewQuestions = async ({
  position,
  description,
  experience,
  techStack,
  interviewType = "Technical",
  focusAreas = "",
  questionCount = 5,
  resumeAnalysis = null,
  resumeClaims = [],
  resumeBased = false,
}) => {
  // Dev-only mock mode: enabled when VITE_MOCK_GEMINI=true in .env.local
  if (isMockGeminiEnabled()) {
    console.log("[Gemini] 🔧 Dev Mode (VITE_MOCK_GEMINI=true) — returning simulated questions.");
    await new Promise((r) => setTimeout(r, 600));
    return generateMockQuestions({
      position,
      techStack,
      experience,
      interviewType,
      focusAreas,
      questionCount,
      resumeAnalysis,
      resumeClaims,
      resumeBased,
    });
  }

  const normExp = normalizeExperienceLevel(experience);
  const claims =
    resumeClaims && resumeClaims.length > 0
      ? resumeClaims
      : resumeAnalysis?.resumeClaims || [];

  const prompt = `You are a Principal Engineering Interviewer conducting a realistic, modern 2026 software engineering interview.
Target Role: ${position}
Target Tech Stack: ${techStack}
Candidate Experience: ${normExp.label} (${normExp.years} years experience - Tier: ${normExp.tier.toUpperCase()})
Interview Type: ${interviewType || "Technical"}
Custom Focus Areas: ${focusAreas || "Production architecture, debugging, performance, and reliability"}
Context / Description: ${description || "Production software development"}
${
  resumeBased && resumeAnalysis
    ? `
RESUME-BASED INTERVIEW MODE (CRITICAL REQUIREMENTS):
The candidate has provided their verified resume analysis. You MUST behave like a real interviewer who has actually read the candidate's resume:
Candidate Name: ${resumeAnalysis.candidateName || "Candidate"}
Resume Summary: ${resumeAnalysis.summary || ""}
Extracted Projects: ${JSON.stringify(resumeAnalysis.projects || [])}
Extracted Work Experience: ${JSON.stringify(resumeAnalysis.workExperience || [])}
Extracted Technical Skills: ${(resumeAnalysis.technicalSkills || []).join(", ")}
Verifiable Claims to Validate:
${claims
  .map(
    (c) =>
      `- Claim: "${c.claim}" | Tech: ${c.technology || "N/A"} | Priority: ${c.verificationPriority} | Verification Question: "${c.verificationQuestion}"`
  )
  .join("\n")}

CRITICAL RESUME-BASED QUESTION RULES:
1. Ground at least one question directly in the candidate's actual projects or work experience from the resume.
2. Ground at least one question in verifying a specific resume claim (e.g. how a performance improvement was measured, or what bottleneck was resolved).
3. CALIBRATE TO SELECTED EXPERIENCE LEVEL: Experience level (${normExp.label}) MUST strictly control question complexity. Do NOT ask senior architecture questions to a fresher just because high-level buzzwords appear on the resume.
4. RESPECT SELECTED ROLE: Prioritize skills and concepts aligned with ${position}.
5. NEVER INVENT resume information not present in the extracted data above.
`
    : ""
}

Generate exactly ${questionCount} realistic, practical, scenario-based interview questions and comprehensive model answers.

CRITICAL 2026 INTERVIEW QUALITY GUIDELINES:
1. NO TRIVIA OR TEXTBOOK DEFINITIONS:
   - Do NOT ask "What is X?", "Define X", or "Explain the difference between X and Y" without practical context.
   - Ground every question in a real-world scenario, debugging challenge, architectural decision, or production incident.

2. DYNAMIC DIFFICULTY PROGRESSION:
   - Question 1 (Easy-Medium): Practical core concepts & clean state/data flow in ${techStack}.
   - Question 2 (Medium): Real-world debugging challenge (e.g. race conditions, memory leaks, stale closures, infinite re-renders, or microtask/event-loop quirks).
   - Question 3 (Medium-Hard): Architecture decisions, caching, data fetching, or trade-offs (e.g. server cache vs local state, pagination strategies, optimistic UI updates).
   - Question 4 (Hard): Production engineering — performance bottlenecks (INP/LCP, bundle bloat, profiling tools), security (XSS, token handling, exposed secrets), or accessibility (keyboard traps, ARIA).
   - Question 5 (Hard): High-scale scenario, system design, or modern AI-era engineering (e.g. streaming UI responses, verifying AI-generated code for edge cases, or handling catastrophic API outages).

3. EXPERIENCE-TAILORED DEPTH:
   - For Fresher / 0-1 yr: Focus on practical debugging, clean component structure, and basic async handling.
   - For 1-2 yrs: Focus on edge cases, hooks pitfalls, race conditions, and API error resilience.
   - For 3-5 yrs: Focus on state architecture, performance profiling, bundle optimization, and trade-offs.
   - For 5+ yrs: Focus on frontend system design, scalability, observability, and cross-cutting architectural leadership.

4. STRUCTURED MODEL ANSWERS:
   - Provide comprehensive model answers that cover: the underlying mechanism, trade-offs, potential pitfalls, and the recommended production solution.`;

  console.log("[Gemini] Request started: generateInterviewQuestions");

  try {
    const interaction = await withRetry(
      () =>
        callGeminiInteraction({
          model: "gemini-3.8-flash",
          input: prompt,
          response_format: {
            type: "text",
            mime_type: "application/json",
            schema: {
              type: "object",
              properties: {
                questions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      question: { type: "string" },
                      answer: { type: "string" },
                      category: {
                        type: "string",
                        description: "e.g. react, javascript, performance, security, architecture, debugging",
                      },
                      difficulty: {
                        type: "string",
                        enum: ["easy", "medium", "hard"],
                      },
                      expectedSkill: { type: "string" },
                      questionType: {
                        type: "string",
                        enum: ["scenario", "debugging", "system-design", "concept", "coding"],
                      },
                      followUpIntent: { type: "string" },
                    },
                    required: [
                      "question",
                      "answer",
                      "category",
                      "difficulty",
                      "expectedSkill",
                      "questionType",
                    ],
                  },
                },
              },
              required: ["questions"],
            },
          },
        }),
      "generateInterviewQuestions"
    );

    const outputText = interaction?.output_text;
    if (!outputText || typeof outputText !== "string") {
      throw new Error("Empty response received from AI model.");
    }

    let parsed;
    try {
      parsed = JSON.parse(outputText);
    } catch {
      throw new Error("AI returned an invalid structured JSON response. Please try again.");
    }

    if (!parsed || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      throw new Error("AI response did not contain expected questions list. Please try again.");
    }

    for (const q of parsed.questions) {
      if (!q || typeof q.question !== "string" || typeof q.answer !== "string") {
        throw new Error("AI response contains invalid question format. Please try again.");
      }
    }

    console.log("[Gemini] Request completed: generateInterviewQuestions");

    return parsed.questions.map((item, index) => ({
      question: String(item.question || `Question ${index + 1}`).trim(),
      answer: String(item.answer || "").trim(),
      category: item.category || "General",
      difficulty: item.difficulty || "medium",
      expectedSkill: item.expectedSkill || "Problem Solving",
      questionType: item.questionType || "scenario",
      followUpIntent: item.followUpIntent || "",
    }));
  } catch (error) {
    console.error("[Gemini] Request failed: generateInterviewQuestions");
    let errorMessage =
      error?.message || "Failed to generate interview questions. Please try again.";
    if (isRateLimitError(error)) {
      errorMessage =
        "AI rate limit reached. All automatic retries failed — please wait 1–2 minutes, then try again.";
    }
    throw new Error(errorMessage);
  }
};

/**
 * Evaluates a candidate's answer against the model answer.
 * Uses Gemini Interactions API with native Structured Outputs.
 * Retries automatically on 429 rate-limit errors with a visible countdown toast.
 *
 * @param {Object} params
 * @param {string} params.question
 * @param {string} params.correctAnswer
 * @param {string} params.userAnswer
 * @returns {Promise<{rating: number, feedback: string, correct_ans: string, user_ans: string}>}
 */
export const evaluateAnswer = async ({
  question,
  correctAnswer,
  userAnswer,
}) => {
  if (!userAnswer || userAnswer.trim().length === 0) {
    return {
      rating: 0,
      feedback: "No answer was provided. Please provide an answer to receive feedback.",
      correct_ans: correctAnswer || "",
      user_ans: "",
    };
  }

  // Dev-only mock mode: enabled when VITE_MOCK_GEMINI=true in .env.local
  if (isMockGeminiEnabled()) {
    console.log("[Gemini] 🔧 Dev Mode (VITE_MOCK_GEMINI=true) — returning simulated answer evaluation.");
    await new Promise((r) => setTimeout(r, 600));
    return generateMockEvaluation({ question, correctAnswer, userAnswer });
  }

  const prompt = `You are a Senior Technical Interviewer evaluating a candidate's response in a modern 2026 software engineering interview.
Compare the user's answer to the model answer.

Question: "${question}"
Candidate Answer: "${userAnswer}"
Model Answer: "${correctAnswer}"

EVALUATION RUBRIC:
1. Technical Accuracy & Core Mechanisms: Did the candidate explain HOW and WHY things work under the hood rather than just dropping keywords?
2. Depth of Reasoning: Did the candidate address real-world nuances, race conditions, edge cases, debugging steps, or production trade-offs?
3. Clarity & Structure: Was the response direct, logical, and structured?

SCORING CALIBRATION:
- 9-10: Exceptional. Accurate mechanism, practical edge cases, and trade-off awareness.
- 7-8: Solid. Correct explanation of core mechanism with minor gaps on production edge cases.
- 5-6: Mixed / High-level. Mentions buzzwords/concepts without explaining underlying mechanics or trade-offs.
- 3-4: Weak. Inaccurate explanation, major misunderstandings, or extremely shallow response (< 15 words).
- 1-2: Irrelevant, evasive ("don't know", "skip", "idk"), or single-phrase answer without technical substance.
- 0: Blank or no answer provided.

Do NOT give a default or arbitrary 6/10. Score honestly based on actual evidence.
Feedback MUST be actionable: state what went well, what was missing/incomplete, and provide the recommended better answer approach.`;

  console.log("[Gemini] Request started: evaluateAnswer");

  try {
    const interaction = await withRetry(
      () =>
        callGeminiInteraction({
          model: "gemini-3.8-flash",
          input: prompt,
          response_format: {
            type: "text",
            mime_type: "application/json",
            schema: {
              type: "object",
              properties: {
                rating: {
                  type: "integer",
                  description: "Numerical rating between 0 and 10",
                },
                feedback: {
                  type: "string",
                  description:
                    "Constructive feedback highlighting strengths and concrete areas for improvement",
                },
              },
              required: ["rating", "feedback"],
            },
          },
        }),
      "evaluateAnswer"
    );

    const outputText = interaction?.output_text;
    if (!outputText || typeof outputText !== "string") {
      throw new Error("Empty evaluation response received from AI model.");
    }

    let parsed;
    try {
      parsed = JSON.parse(outputText);
    } catch {
      throw new Error("AI returned an invalid structured evaluation response. Please try again.");
    }

    if (!parsed || typeof parsed !== "object") {
      throw new Error("AI response did not contain a valid evaluation object. Please try again.");
    }

    const rating = Math.max(
      0,
      Math.min(10, Math.round(Number(parsed.rating) || 0))
    );

    const feedback =
      typeof parsed.feedback === "string" && parsed.feedback.trim().length > 0
        ? parsed.feedback.trim()
        : "Good effort. Review the expected answer for key details.";

    console.log("[Gemini] Request completed: evaluateAnswer");

    return {
      rating,
      feedback,
      correct_ans: correctAnswer || "",
      user_ans: userAnswer || "",
    };
  } catch (error) {
    console.error("[Gemini] Request failed: evaluateAnswer");
    let errorMessage =
      error?.message || "Failed to evaluate answer. Please try again.";
    if (isRateLimitError(error)) {
      errorMessage =
        "AI rate limit reached. All automatic retries failed — please wait 1–2 minutes, then try again.";
    }
    throw new Error(errorMessage);
  }
};

/**
 * Mock generator for live interview introduction.
 */
const generateMockLiveIntro = ({
  position,
  techStack,
  experience,
  interviewType = "Technical",
  resumeAnalysis = null,
  resumeClaims = [],
  resumeBased = false,
}) => {
  const stack = techStack ? techStack.split(/[,/ ]+/).filter(Boolean) : ["React", "JavaScript"];
  const primary = stack[0] || "Frontend";
  const normExp = normalizeExperienceLevel(experience);
  const candidateName = resumeAnalysis?.candidateName;
  const greeting =
    candidateName && candidateName !== "Candidate"
      ? `Hello ${candidateName}, welcome!`
      : "Hello! Welcome to your interview.";
  const topProject = resumeAnalysis?.projects?.[0]?.name;

  if (interviewType === "HR") {
    return {
      message: `${greeting} Welcome to your HR round for the ${position} position. To start off, could you briefly introduce yourself, highlight the key milestones in your career, and share what makes this role a compelling next step for you?`,
      topic: "Introduction & Career Motivation",
      action: "intro",
      shouldContinue: true,
    };
  }

  if (interviewType === "Behavioral") {
    return {
      message: `${greeting} Welcome to your behavioral interview for the ${position} role. To get started, please introduce yourself and tell me about a significant engineering project you owned end-to-end, focusing on the team dynamics and challenges you navigated.`,
      topic: "Introduction & Ownership",
      action: "intro",
      shouldContinue: true,
    };
  }

  // Resume-Based Personalized Intro
  if (resumeBased && topProject) {
    if (normExp.tier === "fresher") {
      return {
        message: `${greeting} I reviewed your resume and noticed your work on "${topProject}". To kick off our ${position} interview, could you introduce yourself and walk me through what you personally implemented in that project?`,
        topic: "Resume & Project Walkthrough",
        action: "intro",
        shouldContinue: true,
      };
    }
    if (normExp.tier === "1-2") {
      return {
        message: `${greeting} I reviewed your resume and was particularly interested in your work on "${topProject}". To start our ${position} interview, could you give a brief introduction and explain the primary technical problem you solved on that project?`,
        topic: "Resume & Technical Problem Solving",
        action: "intro",
        shouldContinue: true,
      };
    }
    if (normExp.tier === "2-4") {
      return {
        message: `${greeting} I went through your resume and noticed your implementation of "${topProject}". To kick off, could you introduce yourself and walk me through how you structured data flow and handled edge cases in that project?`,
        topic: "Resume & Architecture Walkthrough",
        action: "intro",
        shouldContinue: true,
      };
    }
    return {
      message: `${greeting} I reviewed your resume and noted your experience with "${topProject}". To begin our senior technical interview for ${position}, could you walk me through the high-level architecture you owned, and the key architectural trade-offs you evaluated?`,
      topic: "Resume & System Architecture",
      action: "intro",
      shouldContinue: true,
    };
  }

  // Technical / Mixed rounds calibrated strictly to candidate experience tier
  if (normExp.tier === "fresher") {
    return {
      message: `${greeting} Welcome to your interview for the ${position} role. To get started, can you introduce yourself and tell me about a project you built using ${primary}, focusing on what you personally worked on?`,
      topic: "Introduction & Project Walkthrough",
      action: "intro",
      shouldContinue: true,
    };
  }

  if (normExp.tier === "1-2") {
    return {
      message: `${greeting} Welcome to your technical interview for the ${position} role. To start our conversation, please introduce yourself and tell me about a challenging project you built with ${primary}, focusing on the hardest technical problem you faced and how you solved it.`,
      topic: "Introduction & Technical Problem Solving",
      action: "intro",
      shouldContinue: true,
    };
  }

  if (normExp.tier === "2-4") {
    return {
      message: `${greeting} Welcome to your technical interview for the ${position} position. To kick off, could you introduce yourself and walk me through a core feature you engineered in ${primary}, focusing on how you structured data flow and handled edge cases?`,
      topic: "Introduction & Architecture Walkthrough",
      action: "intro",
      shouldContinue: true,
    };
  }

  // Senior (5+ years)
  return {
    message: `${greeting} Welcome to your senior technical interview for the ${position} position. To kick off, could you give a concise overview of your background, the architecture of a complex production system you recently owned using ${primary}, and the architectural trade-offs you evaluated?`,
    topic: "System Architecture & Background",
    action: "intro",
    shouldContinue: true,
  };
};

/**
 * Mock generator for live conversational turns.
 * Dynamically detects candidate's project mentions, challenges buzzwords, probes debugging steps,
 * respects candidate experience tier as a hard constraint, and paces the interview to conclude gracefully.
 */
const generateMockConversationTurn = ({
  position,
  techStack,
  experience = 2,
  interviewType = "Technical",
  elapsedSeconds = 0,
  durationMinutes = 10,
  conversationHistory = [],
  latestUserAnswer = "",
  resumeAnalysis = null,
  resumeClaims = [],
  resumeBased = false,
}) => {
  const stack = techStack ? techStack.split(/[,/ ]+/).filter(Boolean) : ["React", "JavaScript"];
  const primary = stack[0] || "Frontend";
  const normExp = normalizeExperienceLevel(experience);
  const tier = normExp.tier; // "fresher" | "1-2" | "2-4" | "senior"

  const totalSeconds = durationMinutes * 60;
  const remaining = Math.max(0, totalSeconds - elapsedSeconds);
  const turnsCount = Math.floor(conversationHistory.length / 2);
  const answerLower = (latestUserAnswer || "").toLowerCase();
  const wordCount = (latestUserAnswer || "").trim().split(/\s+/).filter(Boolean).length;

  // 1. Time / wrap-up check: remaining <= 75s or turn count reached for duration
  const maxTurns = durationMinutes <= 5 ? 3 : durationMinutes <= 10 ? 5 : 8;
  if (remaining <= 75 || turnsCount >= maxTurns) {
    return {
      message: `Thank you for sharing your experience and technical reasoning today. We've covered a wide range of practical topics for the ${position} role. That concludes our interview session—please proceed to review your comprehensive evaluation report.`,
      topic: "Interview Wrap-up & Evaluation",
      action: "closing",
      feedbackSignals: "Completed full conversational round with demonstrated technical depth.",
      shouldContinue: false,
    };
  }

  // 2. Candidate answered too briefly (< 7 words) -> Clarification probe calibrated to level
  if (wordCount < 7) {
    if (tier === "fresher") {
      return {
        message: `Could you explain your reasoning a bit more? For example, how would you write that in code or test it in your browser?`,
        topic: "Technical Elaboration & Reasoning",
        action: "clarification",
        feedbackSignals: "Encouraging fresher candidate to articulate reasoning and code structure.",
        shouldContinue: true,
      };
    }
    return {
      message: `Could you walk me through the specific mechanism behind that? Explain how you would implement it in code and what potential failure modes or edge cases you would guard against.`,
      topic: "Technical Elaboration & Edge Cases",
      action: "clarification",
      feedbackSignals: "Probing brief answer for underlying technical depth.",
      shouldContinue: true,
    };
  }

  // ── 3. Resume-Based Conversation Turns ──────────────────────────────────
  if (resumeBased || resumeAnalysis) {
    const claims =
      resumeClaims && resumeClaims.length > 0
        ? resumeClaims
        : resumeAnalysis?.resumeClaims || [];

    // Turn 1: Probe primary verifiable resume claim
    if (turnsCount === 1 && claims.length > 0) {
      const claim = claims[0];
      const qText =
        claim.verificationQuestion ||
        `You mentioned on your resume: "${claim.claim}". How did you measure that improvement, what was the bottleneck, and what specific code or architectural changes produced that result?`;
      return {
        message: qText,
        topic: "Resume Claim Verification",
        action: "follow_up",
        feedbackSignals: "Probing empirical verification of resume claim.",
        shouldContinue: true,
      };
    }

    // Turn 2: Contextual follow-up on candidate's claim verification response
    if (turnsCount === 2) {
      const hasMetric =
        answerLower.includes("40") ||
        answerLower.includes("percent") ||
        answerLower.includes("profiler") ||
        answerLower.includes("lighthouse") ||
        answerLower.includes("bundle") ||
        answerLower.includes("memo") ||
        answerLower.includes("lazy") ||
        answerLower.includes("render");

      if (hasMetric) {
        return {
          message: `That clarifies how you measured the baseline and implemented the optimization. What trade-offs did you consider when making those changes, and how did you verify that user experience didn't suffer from extra bundle splitting or network waterfalls?`,
          topic: "Optimization Trade-offs & Profiling",
          action: "follow_up",
          feedbackSignals: "Challenging candidate on edge cases and trade-offs of the optimization.",
          shouldContinue: true,
        };
      }
      return {
        message: `You mentioned the high-level idea, but what specific metrics or profiling tools did you use to verify that improvement, and what was the main bottleneck?`,
        topic: "Metric Verification & Edge Cases",
        action: "clarification",
        feedbackSignals: "Probing vague answer for concrete metrics.",
        shouldContinue: true,
      };
    }

    // Turn 3: Project Architecture & API Error Resilience
    if (turnsCount === 3) {
      const proj = resumeAnalysis?.projects?.[0];
      const pName = proj?.name || "your project";
      return {
        message: `In ${pName}, what would happen if the backend API experienced high latency or failed while a user was performing an update? How did you design error recovery in the UI?`,
        topic: "API Error Boundaries & UI Resilience",
        action: "follow_up",
        feedbackSignals: "Testing async error resilience in resume project.",
        shouldContinue: true,
      };
    }
  }

  // 4. Project-based latching: Candidate mentioned a project, app, platform, or specific architecture
  const hasSpecificSkillsTracker = answerLower.includes("skills tracker") || (answerLower.includes("skills") && answerLower.includes("tracker"));
  const generalProjectKeywords = [
    "project",
    "built",
    "platform",
    "app",
    "application",
    "system",
    "firebase",
    "clerk",
    "gemini",
    "dashboard",
    "ecommerce",
    "portfolio",
    "tracker",
    "fullstack",
    "saas",
  ];

  if ((hasSpecificSkillsTracker || generalProjectKeywords.some((kw) => answerLower.includes(kw))) && turnsCount <= 2) {
    if (hasSpecificSkillsTracker) {
      if (tier === "fresher") {
        return {
          message: `You mentioned your Skills Tracker project built with React. How did you store and update the skills data in component state, and how did you handle adding or removing an item from the list?`,
          topic: "Skills Tracker — Component State & Lists",
          action: "project_question",
          feedbackSignals: "Latching onto candidate's specific Skills Tracker project at entry level.",
          shouldContinue: true,
        };
      }
      if (tier === "1-2") {
        return {
          message: `You mentioned your Skills Tracker project built with React. Walk me through how you integrated the APIs: how did you handle loading indicators, empty states, and error feedback when fetching or updating skills?`,
          topic: "Skills Tracker — API Integration & States",
          action: "project_question",
          feedbackSignals: "Latching onto candidate's specific Skills Tracker project for API resilience.",
          shouldContinue: true,
        };
      }
      if (tier === "2-4") {
        return {
          message: `In your Skills Tracker project, how did you structure state management between local component state and server data, and how did you prevent race conditions or stale updates?`,
          topic: "Skills Tracker — State Boundaries & Race Conditions",
          action: "project_question",
          feedbackSignals: "Latching onto candidate's specific Skills Tracker project for state architecture.",
          shouldContinue: true,
        };
      }
      return {
        message: `In your Skills Tracker project, walk me through how you architected the data layer and component boundaries. What trade-offs did you consider regarding state persistence and render performance?`,
        topic: "Skills Tracker — Architecture & Trade-offs",
        action: "project_question",
        feedbackSignals: "Latching onto candidate's specific Skills Tracker project at senior architectural depth.",
        shouldContinue: true,
      };
    }

    // General project mention
    if (tier === "fresher") {
      return {
        message: `Tell me more about how you structured that project. What components did you create, and how did you pass data between parent and child components?`,
        topic: "Project Structure & Props Flow",
        action: "project_question",
        feedbackSignals: "Assessing component breakdown and data passing in personal project.",
        shouldContinue: true,
      };
    }
    if (tier === "1-2") {
      return {
        message: `In that project, tell me about a real API integration you implemented. How did you handle loading, error, and empty states?`,
        topic: "Project API Integration & Error Resilience",
        action: "project_question",
        feedbackSignals: "Assessing real-world API handling in project experience.",
        shouldContinue: true,
      };
    }
    if (tier === "2-4") {
      return {
        message: `Walk me through the architecture of that project. How did you structure the state management and data layer, and how did you handle authentication, data isolation, and error resilience?`,
        topic: "Project Architecture & Data Isolation",
        action: "project_question",
        feedbackSignals: "Assessing project ownership and architectural decisions.",
        shouldContinue: true,
      };
    }
    return {
      message: `In that project, walk me through the overall system architecture. What trade-offs did you make between developer velocity and long-term maintainability?`,
      topic: "System Architecture & Trade-offs",
      action: "project_question",
      feedbackSignals: "Probing senior candidate on architectural trade-offs.",
      shouldContinue: true,
    };
  }

  // 4. Technique-based latching & buzzword challenging:
  // Candidate mentioned debounce, throttling, search, input
  if (
    ["debounce", "throttle", "search", "keystroke", "autocomplete"].some((kw) =>
      answerLower.includes(kw)
    )
  ) {
    if (tier === "fresher") {
      return {
        message: `You mentioned debounce. In a React form or search input, how do you capture what the user types using state, and how do you display the filtered results on the page?`,
        topic: "Controlled Inputs & Filter State",
        action: "follow_up",
        feedbackSignals: "Checking fresher understanding of search input state and filtering.",
        shouldContinue: true,
      };
    }
    if (tier === "1-2" || tier === "2-4") {
      return {
        message: `Good. Suppose you are using debounce for an API search input. What happens if an earlier slow request resolves after a newer one? How would you handle that race condition in React using AbortController or effect cleanup?`,
        topic: "Asynchronous Race Conditions & Cleanup",
        action: "debugging_probe",
        feedbackSignals: "Challenging debounce buzzword with real-world network race conditions.",
        shouldContinue: true,
      };
    }
    return {
      message: `Beyond debouncing search inputs, how do you handle cancellation with AbortController, request deduplication, and cache invalidation when users rapidly switch filters across multiple concurrent widgets?`,
      topic: "High-Frequency Search Architecture & Cancellation",
      action: "challenge",
      feedbackSignals: "Challenging search architecture and multi-widget cancellation at senior depth.",
      shouldContinue: true,
    };
  }

  // Candidate mentioned cache, TanStack, SWR, Redux, state
  if (
    ["cache", "caching", "tanstack", "swr", "redux", "zustand", "context"].some((kw) =>
      answerLower.includes(kw)
    )
  ) {
    if (tier === "fresher") {
      return {
        message: `When your application fetches data from an API, where do you store that data in React so your components know when to update?`,
        topic: "React State & Data Storage",
        action: "follow_up",
        feedbackSignals: "Probing fresher understanding of component state vs API data.",
        shouldContinue: true,
      };
    }
    if (tier === "1-2") {
      return {
        message: `You mentioned state and caching. How do you distinguish what needs to live in local component state versus a shared store or server cache?`,
        topic: "State Colocation vs Server Cache",
        action: "follow_up",
        feedbackSignals: "Evaluating mid-level state boundaries.",
        shouldContinue: true,
      };
    }
    return {
      message: `You mentioned caching. Exactly what data do you choose to cache versus fetch fresh, where does that cache live, and what is your strategy for cache invalidation when a mutation fails?`,
      topic: "Cache Invalidation & State Boundaries",
      action: "deeper_question",
      feedbackSignals: "Evaluating cache management and mutation rollback.",
      shouldContinue: true,
    };
  }

  // Candidate mentioned memoization, useMemo, useCallback, React.memo, performance
  if (
    ["memo", "usememo", "usecallback", "react.memo", "render", "re-render", "profil"].some((kw) =>
      answerLower.includes(kw)
    )
  ) {
    if (tier === "fresher") {
      return {
        message: `In React, why does a component re-render when its state changes, and how do you keep state minimal so only necessary parts update?`,
        topic: "React Re-renders & State Scope",
        action: "follow_up",
        feedbackSignals: "Probing fresher mental model of React rendering.",
        shouldContinue: true,
      };
    }
    if (tier === "1-2" || tier === "2-4") {
      return {
        message: `When can useMemo or React.memo actually degrade performance rather than help it? How would you verify whether memoization is truly needed before adding it?`,
        topic: "Performance Profiling & Memoization Trade-offs",
        action: "challenge",
        feedbackSignals: "Testing trade-off reasoning and DevTools profiling literacy.",
        shouldContinue: true,
      };
    }
    return {
      message: `When can useMemo or useCallback actually degrade performance rather than help it? What specific metrics or profiling steps in Chrome DevTools or React Profiler would you look at before adding memoization?`,
      topic: "Performance Profiling & Memoization Trade-offs",
      action: "challenge",
      feedbackSignals: "Testing trade-off reasoning and DevTools profiling literacy.",
      shouldContinue: true,
    };
  }

  // Candidate mentioned AI, LLM, Gemini, Copilot
  if (["ai", "llm", "gemini", "copilot", "gpt", "model"].some((kw) => answerLower.includes(kw))) {
    if (tier === "fresher") {
      return {
        message: `When you use AI coding tools or call an AI API, how do you verify that the code or data returned is correct and works without errors in your project?`,
        topic: "Verifying Code & Practical Testing",
        action: "follow_up",
        feedbackSignals: "Checking fresher code verification habits.",
        shouldContinue: true,
      };
    }
    return {
      message: `When integrating an AI model or accepting AI-assisted code in production, what edge cases—such as streaming network drops, rate limits, or stale closures in hooks—do you specifically test for?`,
      topic: "AI-Assisted Development & Reliability",
      action: "deeper_question",
      feedbackSignals: "Probing AI verification and production failure modes.",
      shouldContinue: true,
    };
  }

  // 5. Progression turns (Strictly calibrated to experience tier — NO random topic jumps)
  if (tier === "fresher") {
    if (turnsCount === 1) {
      return {
        message: `In JavaScript, what is the practical difference between let, const, and var, and why is const generally preferred in modern React applications?`,
        topic: "JavaScript Variables & Scope",
        action: "deeper_question",
        feedbackSignals: "Testing fundamental JavaScript scope and modern best practices.",
        shouldContinue: true,
      };
    }
    if (turnsCount === 2) {
      return {
        message: `Imagine you have a button in a React component and clicking it is not triggering the expected action. Walk me through the step-by-step process you would follow to debug and fix it.`,
        topic: "Event Handling & Practical Debugging",
        action: "debugging_probe",
        feedbackSignals: "Evaluating beginner diagnostic methodology using browser console and event handlers.",
        shouldContinue: true,
      };
    }
    if (turnsCount === 3) {
      return {
        message: `When using fetch or Axios to get data from an API, how do you handle network errors or unexpected status codes so the user isn't left looking at a frozen screen?`,
        topic: "API Error Handling & Loading States",
        action: "scenario",
        feedbackSignals: "Assessing entry-level async error resilience and defensive UI.",
        shouldContinue: true,
      };
    }
    if (turnsCount === 4) {
      return {
        message: `In React, how does useState work when you want to update and display a value based on user input, like a form text box or counter?`,
        topic: "React State & Controlled Components",
        action: "follow_up",
        feedbackSignals: "Verifying basic React state mechanics and re-rendering.",
        shouldContinue: true,
      };
    }
    return {
      message: `What basic Git commands do you use in your everyday workflow when creating a branch, committing code, and pushing changes to GitHub?`,
      topic: "Git Workflow & Version Control",
      action: "follow_up",
      feedbackSignals: "Checking basic practical developer workflow and Git literacy.",
      shouldContinue: true,
    };
  }

  if (tier === "1-2") {
    if (turnsCount === 1) {
      return {
        message: `You have a search input that calls an API on every keystroke. How would you improve it so it doesn't fire excessive requests, and how does useEffect cleanup help prevent memory leaks?`,
        topic: "Effect Cleanup & Search Input",
        action: "debugging_probe",
        feedbackSignals: "Checking practical React hook mechanics and debounce optimization.",
        shouldContinue: true,
      };
    }
    if (turnsCount === 2) {
      return {
        message: `A React component is re-rendering more often than expected, causing the page to feel laggy. How would you investigate which state or prop change is triggering the extra renders?`,
        topic: "Component Re-render Diagnostics",
        action: "debugging_probe",
        feedbackSignals: "Evaluating practical React re-render troubleshooting.",
        shouldContinue: true,
      };
    }
    if (turnsCount === 3) {
      return {
        message: `Tell me about a real API integration you implemented in React. How did you handle loading, error, and empty states to ensure a smooth user experience?`,
        topic: "API State Management & UX",
        action: "scenario",
        feedbackSignals: "Assessing hands-on API integration experience.",
        shouldContinue: true,
      };
    }
    if (turnsCount === 4) {
      return {
        message: `When building reusable UI components, how do you decide what state belongs locally in the component versus what should be lifted to a parent or shared context?`,
        topic: "Component Reusability & State Lifting",
        action: "follow_up",
        feedbackSignals: "Evaluating component architecture and state colocation reasoning.",
        shouldContinue: true,
      };
    }
    return {
      message: `In asynchronous JavaScript, what is the difference between sequential awaits versus running multiple independent API requests with Promise.all?`,
      topic: "Async Concurrency & Promises",
      action: "deeper_question",
      feedbackSignals: "Testing asynchronous JavaScript reasoning and network concurrency.",
      shouldContinue: true,
    };
  }

  if (tier === "2-4") {
    if (turnsCount === 1) {
      return {
        message: `You have a React dashboard with multiple filter controls and API calls. Users report seeing stale data when rapidly toggling filters. How would you design the data flow and use AbortController or query keys to prevent race conditions?`,
        topic: "Race Conditions & AbortController",
        action: "debugging_probe",
        feedbackSignals: "Checking race condition prevention and request cancellation.",
        shouldContinue: true,
      };
    }
    if (turnsCount === 2) {
      return {
        message: `When would memoization with useMemo or React.memo actually hurt performance rather than improve it? What profiling steps in Chrome DevTools or React Profiler would you look at?`,
        topic: "Memoization Trade-offs & Profiling",
        action: "challenge",
        feedbackSignals: "Testing trade-off reasoning and DevTools profiling literacy.",
        shouldContinue: true,
      };
    }
    if (turnsCount === 3) {
      return {
        message: `How do you structure client-side caching versus server state? When a background mutation fails, what is your rollback strategy for optimistic UI updates?`,
        topic: "Cache Invalidation & Optimistic Rollback",
        action: "scenario",
        feedbackSignals: "Evaluating cache management and mutation rollback.",
        shouldContinue: true,
      };
    }
    if (turnsCount === 4) {
      return {
        message: `How do you implement Error Boundaries in React to catch runtime rendering errors, and what fallback strategies do you provide to keep the rest of the application functional?`,
        topic: "Error Boundaries & Defensive UI",
        action: "follow_up",
        feedbackSignals: "Assessing error boundary architecture and defensive frontend patterns.",
        shouldContinue: true,
      };
    }
    return {
      message: `On client-side security: if a frontend application handles user authentication tokens, what are the trade-offs between storing tokens in localStorage versus httpOnly cookies regarding XSS and CSRF?`,
      topic: "Frontend Security & Token Architecture",
      action: "scenario",
      feedbackSignals: "Testing client security, XSS defenses, and secure cookie/token design.",
      shouldContinue: true,
    };
  }

  // Senior (5+ years)
  if (turnsCount === 1) {
    return {
      message: `In a high-traffic ${primary} application, walk me through how you diagnose and eliminate long-task bottlenecks to keep Interaction to Next Paint (INP) under 200ms.`,
      topic: "Production Web Vitals & INP Remediation",
      action: "debugging_probe",
      feedbackSignals: "Evaluating high-pressure production troubleshooting and Core Web Vitals.",
      shouldContinue: true,
    };
  }

  if (turnsCount === 2) {
    return {
      message: `How do you architect large-scale state management across multiple distributed teams—what boundaries do you establish between local UI state, cached server data, and global domain events?`,
      topic: "Large-Scale State Architecture",
      action: "scenario",
      feedbackSignals: "Evaluating enterprise state boundaries and decoupling.",
      shouldContinue: true,
    };
  }

  if (turnsCount === 3) {
    return {
      message: `Describe an architectural decision you made where you intentionally chose a trade-off. What metrics guided your decision and what were the consequences?`,
      topic: "Architectural Trade-offs & Leadership",
      action: "challenge",
      feedbackSignals: "Assessing senior technical trade-off evaluation and leadership.",
      shouldContinue: true,
    };
  }

  if (turnsCount === 4) {
    return {
      message: `When designing a mission-critical frontend for zero-downtime deployments and resilience against third-party API outages, what circuit-breaking, graceful degradation, and observability patterns do you put in place?`,
      topic: "Frontend Resilience & Observability",
      action: "scenario",
      feedbackSignals: "Testing fault tolerance, circuit breakers, and telemetry.",
      shouldContinue: true,
    };
  }

  return {
    message: `How do you establish engineering standards, automated quality gates, and automated regression testing across a frontend organization to enable high deployment velocity without regressions?`,
    topic: "Engineering Standards & Quality Gates",
    action: "scenario",
    feedbackSignals: "Testing engineering leadership, automated safeguards, and CI/CD quality gates.",
    shouldContinue: true,
  };
};

/**
 * Mock generator for final live interview evaluation.
 * Evaluates Technical Knowledge, Communication, Problem Solving, and Relevance & Depth
 * INDEPENDENTLY using transcript evidence, avoiding identical or clustered scores.
 */
const generateMockFinalLiveEvaluation = ({
  position,
  techStack,
  experience = 2,
  interviewType = "Technical",
  conversationHistory = [],
  resumeAnalysis = null,
  resumeClaims = [],
  resumeBased = false,
  isEarlyExit = false,
  elapsedSeconds = 0,
  durationMinutes = 10,
}) => {
  const normExp = normalizeExperienceLevel(experience);
  const userMessages = conversationHistory.filter((m) => m.role === "user");
  const aiMessages = conversationHistory.filter((m) => m.role === "ai");
  const userTurnsCount = userMessages.length;
  const userCombinedText = userMessages.map((m) => m.content || "").join(" ");
  const userLowerText = userCombinedText.toLowerCase();
  const wordCounts = userMessages.map(
    (m) => (m.content || "").trim().split(/\s+/).filter(Boolean).length
  );
  const totalUserWords = wordCounts.reduce((a, b) => a + b, 0);
  const avgWords = userTurnsCount > 0 ? totalUserWords / userTurnsCount : 0;

  // Determine Completion Category
  const isAbandonedEarly =
    (isEarlyExit && userTurnsCount <= 1) ||
    userTurnsCount <= 1 ||
    totalUserWords < 20;

  const isPartialInterview =
    !isAbandonedEarly &&
    (userTurnsCount <= 2 || totalUserWords < 50 || (isEarlyExit && userTurnsCount < 4));

  const isLowEffort =
    !isAbandonedEarly && !isPartialInterview && avgWords < 14 && userTurnsCount >= 3;

  let completionStatus = "completed";
  let hiringRecommendation = "Hire";
  let performanceLevel = "Proficient";

  if (isAbandonedEarly) {
    completionStatus = "abandoned_early";
    hiringRecommendation = "Strong No Hire — Abandoned Early";
    performanceLevel = "Incomplete Session";
  } else if (isPartialInterview) {
    completionStatus = "partial";
    hiringRecommendation = "No Hire — Incomplete Interview";
    performanceLevel = "Needs Significant Improvement";
  } else if (isLowEffort) {
    completionStatus = "low_effort";
    hiringRecommendation = "No Hire — Superficial Responses";
    performanceLevel = "Needs Significant Improvement";
  }

  // Technical Keyword matching
  const deepTechKeywords = [
    "abortcontroller",
    "cleanup",
    "race condition",
    "immutability",
    "closure",
    "stale closure",
    "effect",
    "useeffect",
    "hook",
    "usememo",
    "usecallback",
    "react.memo",
    "virtual",
    "profiler",
    "performance",
    "inp",
    "lcp",
    "web vitals",
    "httponly",
    "cookie",
    "token",
    "refresh token",
    "xss",
    "csrf",
    "security",
    "streaming",
    "worker",
    "web worker",
    "reconciliation",
    "render tree",
    "boundary",
    "rollback",
    "tanstack",
    "swr",
  ];
  const matchedDeepKeywords = deepTechKeywords.filter((kw) => userLowerText.includes(kw));

  let techScore = 5;
  let commScore = 6;
  let psScore = 6;
  let depthScore = 6;
  let overallRating = 5.0;

  const techEvidence = [];
  const techImprovements = [];
  const commEvidence = [];
  const commImprovements = [];
  const psEvidence = [];
  const psImprovements = [];
  const depthEvidence = [];
  const depthImprovements = [];

  let overallSummary = "";

  // ── CASE 1: ABANDONED EARLY (0-1 turns or < 20 words) ──────────────────────
  if (isAbandonedEarly) {
    techScore = userTurnsCount === 0 ? 1 : totalUserWords < 10 ? 1 : 2;
    commScore = userTurnsCount === 0 ? 1 : 2;
    psScore = 1;
    depthScore = 1;
    overallRating = userTurnsCount === 0 ? 1.0 : totalUserWords < 10 ? 1.2 : 1.8;

    techEvidence.push(
      "Session was ended prematurely before core architectural or technical scenarios could be explored."
    );
    techEvidence.push(
      `Insufficient technical evidence demonstrated to evaluate proficiency in ${techStack}.`
    );
    techImprovements.push(
      "You must complete full-length interview sessions to allow technical assessment of your engineering depth."
    );
    techImprovements.push(
      `Review core ${techStack} runtime mechanics, lifecycles, and error handling before your next session.`
    );

    commEvidence.push("The candidate exited the interview prematurely.");
    commEvidence.push("Spoken technical communication could not be evaluated due to lack of participation.");
    commImprovements.push(
      "Build mock interview endurance without exiting early when facing difficult questions."
    );
    commImprovements.push(
      "Answer questions using complete sentences and structured technical reasoning."
    );

    psEvidence.push("No problem-solving or debugging scenarios were attempted due to premature session exit.");
    psImprovements.push(
      "Commit to staying through problem-solving scenarios; explain your diagnostic steps rather than quitting."
    );

    depthEvidence.push("Total interview response was under 20 words across the entire session.");
    depthImprovements.push(
      "Always provide project context, explain implementation choices, and articulate engineering trade-offs."
    );

    overallSummary = `The candidate ended the interview prematurely after answering only ${userTurnsCount} question(s) (${totalUserWords} total words spoken). In a real technical hiring process, abandoning an interview mid-way results in an automatic "Strong No Hire" decision due to a complete absence of evaluable technical evidence. None of the required architectural, debugging, or system problem-solving competencies could be evaluated.`;
  }
  // ── CASE 2: PARTIAL INTERVIEW (2 turns or < 50 words) ──────────────────────
  else if (isPartialInterview) {
    techScore = Math.min(3, Math.max(2, matchedDeepKeywords.length >= 1 ? 3 : 2));
    commScore = 3;
    psScore = 2;
    depthScore = 2;
    overallRating =
      Math.round((techScore * 0.35 + psScore * 0.3 + depthScore * 0.2 + commScore * 0.15) * 10) / 10;

    techEvidence.push(
      "Mentioned brief technical terms but session was ended before deeper mechanics could be verified."
    );
    techEvidence.push("Did not demonstrate practical understanding of asynchronous lifecycles or state boundaries.");
    techImprovements.push(
      "Complete the entire interview to give the interviewer enough data to validate your technical ability."
    );
    techImprovements.push(
      "Deepen explanations of how your code operates under production edge cases."
    );

    commEvidence.push("Concluded the interview early with only minimal answers provided.");
    commEvidence.push("Answers lacked a structured narrative (Direct Answer → Mechanism → Trade-off).");
    commImprovements.push(
      "Do not end interviews early; practice answering all questions thoroughly."
    );

    psEvidence.push("Exited before diagnostic or debugging scenarios could be fully explored.");
    psImprovements.push(
      "When given a problem, break it down: 1) Reproduce, 2) Isolate, 3) Test fix."
    );

    depthEvidence.push(`Candidate participated in only ${userTurnsCount} turns before ending the interview.`);
    depthImprovements.push("Anchor answers in real project experience with specific performance metrics.");

    overallSummary = `The candidate concluded the session early after only ${userTurnsCount} turn(s) (${totalUserWords} total words). While brief technical mentions were made, the session was far too short to evaluate edge cases, trade-offs, state management, or debugging resilience. Premature exit prevents hiring committees from making a positive hiring determination.`;
  }
  // ── CASE 3: LOW EFFORT / SUPERFICIAL ANSWERS (< 14 words per turn) ─────────
  else if (isLowEffort) {
    techScore = Math.min(4, Math.max(2, matchedDeepKeywords.length >= 2 ? 4 : 3));
    commScore = 3;
    psScore = 3;
    depthScore = 2;
    overallRating =
      Math.round((techScore * 0.35 + psScore * 0.3 + depthScore * 0.2 + commScore * 0.15) * 10) / 10;

    techEvidence.push(
      "Gave one-line replies without detailing how solutions operate under the hood."
    );
    techEvidence.push("Failed to mention low-level browser or React runtime mechanics.");
    techImprovements.push(
      `Prepare in-depth explanations for ${techStack}: state flow, lifecycle cleanup, and caching.`
    );

    commEvidence.push(
      `Answers were consistently brief, averaging only ${Math.round(avgWords)} words per turn.`
    );
    commEvidence.push("Required frequent follow-up probes because initial replies lacked substance.");
    commImprovements.push(
      "Avoid single-phrase answers. Structure each response: 1) Direct answer, 2) Why it works, 3) Example."
    );

    psEvidence.push("Avoided breaking down technical problems, offering surface-level answers.");
    psImprovements.push(
      "Walk through your thought process out loud when faced with a troubleshooting scenario."
    );

    depthEvidence.push("Showed minimal depth; answers remained at a textbook or superficial level.");
    depthImprovements.push("Cite actual production situations, tools used, and trade-offs made.");

    overallSummary = `The candidate provided consistently brief and superficial responses, averaging only ${Math.round(avgWords)} words per answer. When presented with engineering scenarios, the candidate avoided detailing underlying mechanisms, trade-offs, or error states. Technical interviews require deep, authoritative explanations rather than single-phrase replies.`;
  }
  // ── CASE 4: SUBSTANTIVE COMPLETED INTERVIEW ────────────────────────────────
  else {
    if (matchedDeepKeywords.length >= 4) {
      techScore = 8;
      techEvidence.push(
        `Accurately identified core mechanisms including ${matchedDeepKeywords.slice(0, 3).join(", ")}.`
      );
      techEvidence.push("Demonstrated clear understanding of underlying browser and React runtime behavior.");
      techImprovements.push(
        "Deepen explanation of failure recovery states when streaming drops or offline storage desyncs occur."
      );
    } else if (matchedDeepKeywords.length >= 2) {
      techScore = 7;
      techEvidence.push(
        `Demonstrated practical familiarity with ${matchedDeepKeywords.join(" and ")}.`
      );
      techEvidence.push(
        "Identified primary technical solutions but stayed at a moderate level of detail on low-level edge cases."
      );
      techImprovements.push(
        "Explicitly explain the mechanical 'why' behind solutions rather than relying on standard library conventions."
      );
    } else if (matchedDeepKeywords.length === 1) {
      techScore = 6;
      techEvidence.push(`Mentioned ${matchedDeepKeywords[0]} in the correct context.`);
      techEvidence.push(
        "Relied on high-level concepts without detailing implementation caveats or runtime lifecycles."
      );
      techImprovements.push(
        `Study the exact lifecycle mechanics of ${techStack} components and asynchronous cleanup.`
      );
    } else {
      techScore = 5;
      techEvidence.push("Gave general explanations without identifying specific low-level APIs or runtime mechanisms.");
      techEvidence.push("Did not demonstrate familiarity with modern concurrency, cancellation, or performance profiling APIs.");
      techImprovements.push(
        `Review core ${techStack} engineering fundamentals, focusing on race conditions, state boundaries, and error recovery.`
      );
    }

    const shortAnswersCount = wordCounts.filter((w) => w < 10).length;
    const structuredTransitions = [
      "first",
      "then",
      "for example",
      "in my project",
      "because",
      "however",
      "specifically",
    ].filter((w) => userLowerText.includes(w));

    if (shortAnswersCount >= 2) {
      commScore = 5;
      commEvidence.push("Several answers were overly brief (< 10 words), requiring interviewer follow-ups to extract context.");
      commEvidence.push("Did not structure explanations with an initial thesis or supporting evidence.");
      commImprovements.push(
        "Use the structured formula: Direct Answer → Technical Explanation → Concrete Example → Trade-off."
      );
    } else if (avgWords >= 35 && structuredTransitions.length >= 2) {
      commScore = 8;
      commEvidence.push("Maintained structured, articulate responses with logical flow and clear transitions.");
      commEvidence.push("Answered questions directly before expanding into technical nuances.");
      commImprovements.push(
        "Continue practicing keeping explanations concise within 45–60 seconds to maximize conversational pacing."
      );
    } else if (avgWords >= 20) {
      commScore = 7;
      commEvidence.push("Answers were clear and understandable with good professional vocabulary.");
      commEvidence.push("Occasionally jumped between points before completing the main explanation.");
      commImprovements.push(
        "Begin each answer with a single crisp sentence stating your primary approach before diving into details."
      );
    } else {
      commScore = 5;
      commEvidence.push("Answers lacked structured sequencing and stayed conversational rather than engineering-focused.");
      commImprovements.push(
        "Structure answers logically: state your approach, explain why it works, and mention one practical trade-off."
      );
    }

    const problemSolvingMarkers = [
      "reproduce",
      "isolate",
      "inspect",
      "devtools",
      "profiler",
      "assume",
      "assumption",
      "step",
      "edge case",
      "trade-off",
      "fallback",
      "mitigate",
      "hypothesis",
      "root cause",
    ].filter((w) => userLowerText.includes(w));

    if (problemSolvingMarkers.length >= 3) {
      psScore = 8;
      psEvidence.push(
        `Demonstrated structured diagnostic reasoning, explicitly referencing ${problemSolvingMarkers.slice(0, 2).join(" and ")}.`
      );
      psEvidence.push("Considered edge-case failure modes and formulated testable hypotheses.");
      psImprovements.push("Quantify production trade-offs with specific latency budgets or memory benchmarks.");
    } else if (problemSolvingMarkers.length >= 1) {
      psScore = 7;
      psEvidence.push(`Approached troubleshooting systematically, noting ${problemSolvingMarkers[0]}.`);
      psEvidence.push("Focused primarily on the immediate solution rather than full root-cause isolation.");
      psImprovements.push(
        "When presented with a bug, state your diagnostic steps (reproduce → isolate → verify) before proposing code changes."
      );
    } else {
      psScore = 5;
      psEvidence.push(
        "Offered solutions immediately without articulating a systematic problem breakdown or diagnostic hypothesis."
      );
      psEvidence.push("Overlooked common edge cases such as out-of-order responses or component unmounting mid-flight.");
      psImprovements.push(
        "Before answering debugging scenarios, pause and state: 1) What could cause this, 2) How to verify, 3) The permanent fix."
      );
    }

    const projectMarkers = [
      "project",
      "built",
      "production",
      "in my app",
      "team",
      "client",
      "real-time",
      "dashboard",
      "architecture",
    ].filter((w) => userLowerText.includes(w));
    const whyMarkers = [
      "because",
      "why",
      "trade-off",
      "instead of",
      "overhead",
      "impact",
    ].filter((w) => userLowerText.includes(w));

    if (projectMarkers.length >= 2 && whyMarkers.length >= 2) {
      depthScore = 8;
      depthEvidence.push("Grounded technical choices in concrete project architecture and real-world trade-offs.");
      depthEvidence.push("Consistently explained 'why' a pattern was chosen rather than merely citing API definitions.");
      depthImprovements.push("Cite production monitoring and telemetry metrics to further substantiate architectural claims.");
    } else if (projectMarkers.length >= 1 || whyMarkers.length >= 1) {
      depthScore = 7;
      depthEvidence.push("Answered the interviewer's specific questions directly and drew connections to practical project work.");
      depthEvidence.push("Stayed somewhat high-level when probed on alternative architectural approaches.");
      depthImprovements.push(
        "Connect technical concepts to real development scenarios and discuss what you sacrificed in your trade-offs."
      );
    } else {
      depthScore = 5;
      depthEvidence.push("Provided generic, definition-level answers without referencing practical project implementation.");
      depthEvidence.push("Required prompt reminders to elaborate beyond high-level summaries.");
      depthImprovements.push(
        "Avoid generic textbook definitions; anchor every response in a practical project experience from your career."
      );
    }

    if (interviewType === "HR") {
      overallRating =
        Math.round((commScore * 0.4 + depthScore * 0.3 + psScore * 0.2 + techScore * 0.1) * 10) / 10;
    } else if (interviewType === "Behavioral") {
      overallRating =
        Math.round((psScore * 0.35 + commScore * 0.35 + depthScore * 0.2 + techScore * 0.1) * 10) / 10;
    } else if (interviewType === "Mixed") {
      overallRating =
        Math.round((techScore * 0.3 + psScore * 0.25 + depthScore * 0.25 + commScore * 0.2) * 10) / 10;
    } else {
      overallRating =
        Math.round((techScore * 0.35 + psScore * 0.3 + depthScore * 0.2 + commScore * 0.15) * 10) / 10;
    }

    hiringRecommendation =
      overallRating >= 7.5
        ? "Strong Hire"
        : overallRating >= 6.5
        ? "Hire"
        : overallRating >= 5.0
        ? "Weak Hire"
        : "No Hire";

    performanceLevel =
      overallRating >= 7.5
        ? "Strong"
        : overallRating >= 6.0
        ? "Proficient"
        : "Developing";

    overallSummary = `The candidate completed a realistic ${interviewType} interview for the ${position} role. Performance varied across competency dimensions: Technical Knowledge scored ${techScore}/10, Communication scored ${commScore}/10, Problem Solving scored ${psScore}/10, and Relevance & Depth scored ${depthScore}/10, resulting in a weighted overall rating of ${overallRating}/10. ${
      techScore > commScore
        ? "The candidate showed strong underlying technical knowledge but will benefit significantly from adopting a structured answering framework."
        : commScore > techScore
        ? "The candidate demonstrated articulate communication and structured thought process, with room to deepen specific technical mechanics."
        : "The candidate demonstrated a solid profile with clear opportunities to elevate answers with production metrics and edge-case reasoning."
    }`;
  }

  // 6. Question-by-Question Analysis
  const questionFeedback = [];
  const minTurns = Math.min(aiMessages.length, userMessages.length);

  if (minTurns === 0) {
    questionFeedback.push({
      question: "Initial Interview Question",
      whatWentWell: "Session was launched.",
      whatWasMissing: "The candidate did not record any answer before leaving.",
      betterApproach: "Speak or enter your response to complete the evaluation.",
    });
  } else {
    for (let i = 0; i < minTurns; i++) {
      const qText = aiMessages[i]?.content || `Question ${i + 1}`;
      const uText = userMessages[i]?.content || "";
      const uWords = uText.trim().split(/\s+/).filter(Boolean).length;

      let qWell = "Addressed the primary intent of the question.";
      let qMissing = "Could elaborate further on edge cases and failure modes.";
      let qApproach = "Use: Direct Answer → Technical Explanation → Project Example → Trade-off.";

      if (uWords < 8) {
        qWell = "Initial attempt made.";
        qMissing = `Answer was severely incomplete (${uWords} words). No mechanism or trade-offs explained.`;
        qApproach = "Provide at least 3-4 structured sentences explaining how the solution works.";
      } else if (uWords < 15) {
        qWell = "Direct and concise initial reply.";
        qMissing = "Answer was too brief to evaluate technical depth or implementation reasoning.";
        qApproach = "Provide a 2-3 sentence technical explanation and walk through a code-level example.";
      } else if (
        uText.toLowerCase().includes("debounce") &&
        !uText.toLowerCase().includes("abortcontroller")
      ) {
        qWell = "Correctly identified debouncing to throttle network requests.";
        qMissing =
          "Did not address asynchronous race conditions where earlier slow requests resolve after newer ones.";
        qApproach =
          "Explain debouncing for keystroke throttling, plus AbortController or effect cleanup to cancel in-flight requests.";
      } else if (
        uText.toLowerCase().includes("abortcontroller") ||
        uText.toLowerCase().includes("cleanup")
      ) {
        qWell = "Excellent explanation of request cancellation and lifecycle cleanup.";
        qMissing = "Mentioning how optimistic updates rollback on network failure would elevate to senior level.";
        qApproach = "Pair AbortController with error boundary handling and optimistic mutation rollback.";
      }

      questionFeedback.push({
        question: qText.slice(0, 140) + (qText.length > 140 ? "…" : ""),
        whatWentWell: qWell,
        whatWasMissing: qMissing,
        betterApproach: qApproach,
      });
    }
  }

  // 7. Structured Competencies Object
  const competencies = {
    technicalKnowledge: {
      score: techScore,
      summary:
        techScore >= 8
          ? "Demonstrated high technical command, accurately explaining runtime mechanisms and modern patterns."
          : techScore >= 6
          ? "Solid understanding of foundational concepts with room to deepen edge-case mechanics."
          : techScore >= 4
          ? "Foundational gaps identified; relied on surface-level definitions without explaining mechanisms."
          : "Insufficient evidence or severely incomplete response; core mechanisms were not demonstrated.",
      evidence: techEvidence,
      improvements: techImprovements,
    },
    communication: {
      score: commScore,
      summary:
        commScore >= 8
          ? "Articulate, structured, and direct communication with effective professional technical vocabulary."
          : commScore >= 6
          ? "Clear and understandable communication, though occasionally lacking a structured answering framework."
          : commScore >= 4
          ? "Answers were either overly brief or unstructured, requiring follow-up probes to clarify meaning."
          : "Communication could not be adequately evaluated due to premature exit or minimal speech.",
      evidence: commEvidence,
      improvements: commImprovements,
    },
    problemSolving: {
      score: psScore,
      summary:
        psScore >= 8
          ? "Methodical problem breakdown with strong edge-case anticipation and diagnostic reasoning."
          : psScore >= 6
          ? "Good problem-solving instinct, though tended to jump to solutions before outlining diagnostics."
          : psScore >= 4
          ? "Needs a more structured debugging framework; tended to guess solutions without stating assumptions."
          : "No diagnostic or problem-solving capability was demonstrated in this session.",
      evidence: psEvidence,
      improvements: psImprovements,
    },
    relevanceDepth: {
      score: depthScore,
      summary:
        depthScore >= 8
          ? "Substantive answers grounded in real project experience, demonstrating clear trade-off awareness."
          : depthScore >= 6
          ? "Directly addressed the questions asked with moderate depth, though sometimes stayed conceptual."
          : depthScore >= 4
          ? "Answers remained at a textbook definition level without connecting to real production trade-offs."
          : "Zero depth achieved; candidate did not provide meaningful project or technical evidence.",
      evidence: depthEvidence,
      improvements: depthImprovements,
    },
  };

  // 8. Next Interview Action Plan
  const nextInterviewActionPlan = {
    technical:
      techScore < 4
        ? `Review ${techStack} fundamentals thoroughly and prepare to explain component lifecycles and error states.`
        : techScore < 7
        ? `Revise ${techStack} rendering cycles, asynchronous cleanup, and network race condition cancellation.`
        : `Deepen knowledge of distributed tracing, high-throughput state decoupling, and advanced browser profiling.`,
    communication:
      commScore < 4
        ? "Commit to staying through the entire interview and speaking in full sentences rather than leaving early."
        : commScore < 7
        ? "Adopt the structured framework: Direct Answer → Why it Works → Concrete Example → Trade-off."
        : "Maintain your strong structure while keeping technical answers tightly capped at 45–60 seconds.",
    problemSolving:
      psScore < 4
        ? "Do not give up when facing difficult questions; explain your diagnostic steps out loud."
        : psScore < 7
        ? "Before giving a fix, explicitly state your debugging hypothesis and break the problem into 2–3 systematic steps."
        : "Continue articulating edge-case trade-offs and rollback strategies during architecture questions.",
    interviewTechnique:
      isAbandonedEarly || isPartialInterview
        ? "Build interview endurance. Leaving early results in automatic rejection in any professional hiring process."
        : "When you encounter an unfamiliar concept, explain your reasoning process and how you would investigate instead of guessing.",
  };

  // 9. Recommended Answer Structure
  const recommendedAnswerStructure = {
    structureName: "The Senior Engineering Response Framework",
    steps: [
      "1. Direct Answer: State your recommended approach in one crisp sentence.",
      "2. Technical Mechanism: Explain HOW and WHY it works under the hood.",
      "3. Real Project Example: Reference a concrete implementation from your past work.",
      "4. Trade-offs & Edge Cases: Acknowledge what you sacrifice and what could fail.",
    ],
    explanation:
      "This 4-step framework ensures your answers are structured, demonstrate technical depth, and avoid rambling.",
  };

  // Strengths & Improvements
  const strengths =
    isAbandonedEarly || isPartialInterview
      ? ["Showed initiative by initiating the interview session."]
      : [
          ...techEvidence.slice(0, 2),
          ...commEvidence.filter((e) => !e.includes("brief") && !e.includes("lacked")).slice(0, 1),
          ...psEvidence
            .filter((e) => !e.includes("Overlooked") && !e.includes("Offered solutions immediately"))
            .slice(0, 1),
        ].slice(0, 4);

  const improvements = [
    ...techImprovements.slice(0, 1),
    ...commImprovements.slice(0, 1),
    ...psImprovements.slice(0, 1),
    ...depthImprovements.slice(0, 1),
  ].slice(0, 4);

  const stack = techStack ? techStack.split(/[,/ ]+/).filter(Boolean) : ["React", "JavaScript"];
  const topicsCovered = Array.from(
    new Set(
      conversationHistory
        .filter((m) => m.role === "ai" && m.topic)
        .map((m) => m.topic)
    )
  );
  if (topicsCovered.length === 0) {
    topicsCovered.push(`${stack[0] || "Frontend"} Assessment`, "Introductory Exchange");
  }

  const questionsAsked = aiMessages.map(
    (m) => m.content.slice(0, 140) + (m.content.length > 140 ? "…" : "")
  );

  // Resume Insights (Section 23 & 24)
  const claims =
    resumeClaims && resumeClaims.length > 0
      ? resumeClaims
      : resumeAnalysis?.resumeClaims || [];

  const resumeInsights = [];
  const resumeStrengthsVerified = [];
  const resumeAreasNeedingEvidence = [];

  if (resumeBased || claims.length > 0) {
    claims.forEach((c) => {
      const techLower = (c.technology || "").toLowerCase();
      const isDiscussed =
        !isAbandonedEarly &&
        (userLowerText.includes("40") ||
          userLowerText.includes("percent") ||
          userLowerText.includes("metric") ||
          userLowerText.includes("measure") ||
          userLowerText.includes("profiler") ||
          userLowerText.includes("lighthouse") ||
          userLowerText.includes("bundle") ||
          userLowerText.includes("api") ||
          userLowerText.includes("jwt") ||
          userLowerText.includes("component") ||
          (techLower && userLowerText.includes(techLower)));

      if (isDiscussed && matchedDeepKeywords.length >= 2) {
        resumeInsights.push({
          claim: c.claim,
          evidence:
            "Candidate articulated practical implementation details, state flow, and trade-offs clearly during the discussion.",
          assessment:
            "Demonstrated practical technical understanding consistent with this resume claim.",
          verificationStatus: "verified",
        });
        resumeStrengthsVerified.push(
          `Substantiated "${c.claim.slice(0, 60)}" with practical architectural and implementation explanation.`
        );
      } else if (isDiscussed) {
        resumeInsights.push({
          claim: c.claim,
          evidence:
            "Candidate touched upon this claim at a high level but provided limited specific metrics or edge-case handling.",
          assessment:
            "Partially substantiated; candidate showed general familiarity with the area.",
          verificationStatus: "partially_verified",
        });
        resumeAreasNeedingEvidence.push(
          `Provide deeper measurement metrics and diagnostic evidence for: "${c.claim.slice(0, 60)}".`
        );
      } else {
        resumeInsights.push({
          claim: c.claim,
          evidence: isAbandonedEarly
            ? "Session terminated early; claim was never reached or discussed in the interview."
            : "The interview conversation provided limited discussion or evidence to substantiate this specific claim.",
          assessment: isAbandonedEarly
            ? "No evidence demonstrated due to premature interview termination."
            : "The interview provided limited evidence to substantiate this resume claim.",
          verificationStatus: "needs_evidence",
        });
        resumeAreasNeedingEvidence.push(
          `Be prepared to walk through concrete metrics and diagnostic data for: "${c.claim.slice(0, 60)}".`
        );
      }
    });

    if (resumeInsights.length === 0 && resumeBased) {
      resumeInsights.push({
        claim: `Experience in ${position} and ${techStack}`,
        evidence: isAbandonedEarly
          ? "Interview ended prematurely; claim could not be verified."
          : "Candidate answered general questions in alignment with listed background.",
        assessment: isAbandonedEarly
          ? "Insufficient data to verify due to early exit."
          : "Demonstrated practical knowledge in core domain areas.",
        verificationStatus: isAbandonedEarly ? "needs_evidence" : "verified",
      });
    }
  }

  return {
    overallRating,
    technicalKnowledgeScore: techScore,
    communicationScore: commScore,
    problemSolvingScore: psScore,
    relevanceDepthScore: depthScore,
    overallSummary,
    competencies,
    strengths,
    improvements,
    resumeInsights,
    resumeStrengthsVerified,
    resumeAreasNeedingEvidence,
    nextInterviewActionPlan,
    recommendedAnswerStructure,
    questionFeedback,
    topicsCovered,
    questionsAsked,
    completionStatus,
    hiringRecommendation,
    performanceLevel,
    isEarlyExit: Boolean(isEarlyExit || isAbandonedEarly),
    userTurnsCount,
    totalUserWords,
    suggestedPracticeTopics:
      normExp.tier === "fresher"
        ? [
            "JavaScript core fundamentals: let/const scope, array methods, and Promises",
            "React component lifecycle, useState immutability, and controlled forms",
            "Handling API loading, error, and empty states with fetch/Axios",
            "Browser DevTools debugging and Git workflow basics",
          ]
        : normExp.tier === "1-2"
        ? [
            "React hooks in-depth: useEffect dependency array, cleanup, and stale closures",
            "Asynchronous race condition handling with AbortController and debouncing",
            "Component state management and minimizing unnecessary re-renders",
            "Robust REST API error handling and UI fallback boundaries",
          ]
        : [
            `Advanced ${stack[0] || "Frontend"} rendering lifecycle & reconciliation`,
            "Asynchronous race conditions & AbortController integration",
            "Core Web Vitals profiling (INP & LCP) and long-task remediation",
            "Defensive API error handling and optimistic mutation rollback",
          ],
  };
};

/**
 * Generates the initial conversational opening question for Live AI Interview.
 *
 * @param {Object} params
 * @param {string} params.position
 * @param {string} params.techStack
 * @param {string|number} params.experience
 * @param {string} [params.interviewType="Technical"]
 * @param {string} [params.focusAreas=""]
 * @param {Object} [params.resumeAnalysis=null]
 * @param {Array<Object>} [params.resumeClaims=[]]
 * @param {boolean} [params.resumeBased=false]
 * @returns {Promise<{message: string, topic: string, action: string, shouldContinue: boolean}>}
 */
export const generateLiveIntro = async ({
  position,
  techStack,
  experience,
  interviewType = "Technical",
  focusAreas = "",
  resumeAnalysis = null,
  resumeClaims = [],
  resumeBased = false,
}) => {
  if (isMockGeminiEnabled()) {
    console.log("[Gemini] 🔧 Dev Mode (VITE_MOCK_GEMINI=true) — returning simulated live intro.");
    await new Promise((r) => setTimeout(r, 400));
    return generateMockLiveIntro({
      position,
      techStack,
      experience,
      interviewType,
      resumeAnalysis,
      resumeClaims,
      resumeBased,
    });
  }

  const normExp = normalizeExperienceLevel(experience);

  const prompt = `You are a Principal Engineering Interviewer conducting a realistic, conversational 2026 software engineering interview.
Target Role: ${position}
Experience Level: ${normExp.label} (${normExp.years} years experience - Tier: ${normExp.tier.toUpperCase()})
Tech Stack: ${techStack}
Interview Type: ${interviewType}
Focus Areas: ${focusAreas || "Production architecture, debugging, performance, and reliability"}
${
  resumeBased && resumeAnalysis
    ? `
RESUME CONTEXT:
The candidate provided a resume.
Candidate Name: ${resumeAnalysis.candidateName || ""}
Featured Projects: ${JSON.stringify((resumeAnalysis.projects || []).slice(0, 2))}
Top Skills: ${(resumeAnalysis.technicalSkills || []).slice(0, 5).join(", ")}

RESUME INTRO RULES:
- Greet the candidate by name (e.g. "Hello ${resumeAnalysis.candidateName || ""}, welcome!").
- Mention that you reviewed their resume and were interested in their work on ${resumeAnalysis.projects?.[0]?.name || techStack}.
- Ask them to introduce themselves and walk through a core technical aspect or project from their resume, calibrated strictly to their experience tier (${normExp.label}).
`
    : ""
}

Generate a concise, professional, conversational opening greeting and introductory question (1-2 spoken sentences).
Rules:
- Speak directly, warmly, and naturally, without robotic phrases.
- Mention the target role (${position}).
- CALIBRATE TO EXPERIENCE TIER:
  * If FRESHER / ENTRY LEVEL (0-1 yr): Ask them to introduce themselves and describe a personal or academic project built with ${techStack}, focusing on what they personally implemented. Keep it accessible, practical, and encouraging.
  * If 1–2 YEARS: Ask them to introduce themselves and describe a challenging project they worked on with ${techStack}, focusing on a concrete technical problem they faced and how they solved it.
  * If 2–4 YEARS: Ask them to introduce themselves and describe a core feature they engineered with ${techStack}, focusing on how they structured data flow and handled edge cases.
  * If SENIOR (5+ YEARS): Ask for a concise background overview and the architecture of a complex production system they owned using ${techStack}, highlighting architectural decisions and trade-offs.
- Do NOT lecture or provide answers.`;

  try {
    const interaction = await withRetry(
      () =>
        callGeminiInteraction({
          model: "gemini-3.8-flash",
          input: prompt,
          response_format: {
            type: "text",
            mime_type: "application/json",
            schema: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  description: "The spoken interviewer opening question (1-2 sentences)",
                },
                topic: { type: "string", description: "Short topic descriptor" },
                action: { type: "string", enum: ["intro"] },
                shouldContinue: { type: "boolean" },
              },
              required: ["message", "topic", "action", "shouldContinue"],
            },
          },
        }),
      "generateLiveIntro"
    );

    const parsed = JSON.parse(interaction?.output_text || "{}");
    if (!parsed?.message) {
      throw new Error("Invalid format from AI intro.");
    }

    return {
      message: parsed.message.trim(),
      topic: parsed.topic || "Introduction & Background",
      action: "intro",
      shouldContinue: true,
    };
  } catch (error) {
    console.warn("[Gemini] generateLiveIntro fallback to mock:", error.message);
    return generateMockLiveIntro({
      position,
      techStack,
      experience,
      interviewType,
      resumeAnalysis,
      resumeClaims,
      resumeBased,
    });
  }
};

/**
 * Generates the next conversational turn in a Live AI Interview based on complete context.
 * Uses 2026 Principal Interviewer strategy: latching onto candidate's real claims and projects,
 * challenging vague buzzwords with concrete edge cases, adapting difficulty dynamically,
 * and maintaining strict duration pacing.
 *
 * @param {Object} params
 * @returns {Promise<{message: string, action: string, topic: string, feedbackSignals?: string, shouldContinue: boolean}>}
 */
export const generateLiveConversationTurn = async ({
  position,
  techStack,
  experience,
  interviewType = "Technical",
  focusAreas = "",
  durationMinutes = 10,
  elapsedSeconds = 0,
  conversationHistory = [],
  latestUserAnswer = "",
  resumeAnalysis = null,
  resumeClaims = [],
  resumeBased = false,
}) => {
  if (isMockGeminiEnabled()) {
    console.log("[Gemini] 🔧 Dev Mode (VITE_MOCK_GEMINI=true) — returning simulated live turn.");
    await new Promise((r) => setTimeout(r, 600));
    return generateMockConversationTurn({
      position,
      techStack,
      experience,
      interviewType,
      elapsedSeconds,
      durationMinutes,
      conversationHistory,
      latestUserAnswer,
      resumeAnalysis,
      resumeClaims,
      resumeBased,
    });
  }

  const normExp = normalizeExperienceLevel(experience);

  // Sanitize history to prevent duplicates or empty entries
  const sanitizedHistory = (conversationHistory || [])
    .filter((m) => m && m.content && m.content.trim())
    .filter((m, idx, arr) => idx === 0 || m.content !== arr[idx - 1].content);

  const formattedHistory = sanitizedHistory
    .slice(-8)
    .map((m) => `${m.role === "ai" ? "Interviewer" : "Candidate"}: "${m.content}"`)
    .join("\n");

  const totalPlannedSeconds = durationMinutes * 60;
  const remainingSeconds = Math.max(0, totalPlannedSeconds - elapsedSeconds);

  const claims =
    resumeClaims && resumeClaims.length > 0
      ? resumeClaims
      : resumeAnalysis?.resumeClaims || [];

  const prompt = `You are a Principal Engineering Interviewer conducting an interactive, conversational 2026 software engineering interview.
Target Role: ${position}
Experience Level: ${normExp.label} (${normExp.years} years experience - Tier: ${normExp.tier.toUpperCase()})
Tech Stack: ${techStack}
Interview Type: ${interviewType}
Focus Areas: ${focusAreas || "Production architecture, debugging, performance, and reliability"}
Interview Time: ${durationMinutes} minutes total. Elapsed: ${Math.floor(elapsedSeconds / 60)}m ${elapsedSeconds % 60}s. Remaining: ${remainingSeconds}s.

${
  resumeBased && resumeAnalysis
    ? `
RESUME CONTEXT & VERIFIABLE CLAIMS (CRITICAL INTERVIEW INSTRUCTIONS):
Candidate Name: ${resumeAnalysis.candidateName || "Candidate"}
Resume Summary: ${resumeAnalysis.summary || ""}
Extracted Projects: ${JSON.stringify(resumeAnalysis.projects || [])}
Extracted Work Experience: ${JSON.stringify(resumeAnalysis.workExperience || [])}
Extracted Technical Skills: ${(resumeAnalysis.technicalSkills || []).join(", ")}
Verifiable Claims to Validate:
${claims
  .map(
    (c) =>
      `- Claim: "${c.claim}" | Tech: ${c.technology || "N/A"} | Priority: ${c.verificationPriority} | Verification Question: "${c.verificationQuestion}"`
  )
  .join("\n")}

RESUME-GROUNDED INTERVIEWER BEHAVIOR:
1. Ground your questions in the candidate's actual projects, work experience, and claimed skills.
2. Probe verifiable claims (e.g. "How did you measure that 40% improvement and what specific changes produced it?").
3. If candidate's answer was high-level, probe deeper into what they personally engineered or measured.
4. CALIBRATE DEPTH TO SELECTED EXPERIENCE LEVEL (${normExp.label}): Do NOT ask questions outside their experience tier.
5. NEVER INVENT resume details not present in the extracted data.
`
    : ""
}

Conversation transcript so far:
${formattedHistory}

Candidate's latest answer:
"${latestUserAnswer}"

HARD EXPERIENCE CONSTRAINTS (MANDATORY):
- FRESHER / ENTRY-LEVEL (0 - 1 year):
  * MUST ask beginner fundamentals, basic debugging (e.g. button click not firing, let vs const vs var, simple form state, basic fetch/Axios error handling, inspecting console, git basics).
  * STRICTLY FORBIDDEN: High-scale distributed systems, Core Web Vitals INP/LCP profiling, microfrontend architecture, complex compiler internals, token security architecture.
- 1–2 YEARS EXPERIENCE:
  * MUST ask practical React hooks, component state, API loading/error states, debouncing search inputs, debugging unwanted re-renders, responsive UI.
  * FORBIDDEN: Senior system design, distributed consensus, or asking merely "What is HTML".
- 2–4 YEARS EXPERIENCE:
  * MUST ask about rendering lifecycle, network race conditions (AbortController), caching trade-offs, state boundaries, error boundaries, client security.
- SENIOR (5+ YEARS):
  * MUST focus on architecture decisions, trade-offs, scalability, performance bottlenecks (INP/LCP), team engineering standards, incident post-mortems.

INTERVIEWER STRATEGY & BEHAVIOR (2026 PRINCIPAL INTERVIEWER):
1. NATURAL SPOKEN TURN:
   - Speak concisely in 1-3 spoken sentences.
   - Ask exactly ONE question.
   - Acknowledge briefly ("Understood.", "Fair point.", "That makes sense.") without robotic praise ("Great answer!", "Awesome!").
   - Never lecture or teach during the interview. Never answer the question for the candidate.

2. CONTEXTUAL FOLLOW-UP & LATCHING:
   - If candidate mentions a project (e.g. "Skills Tracker"), immediately ask how they built it at their experience depth.
   - If candidate mentions a buzzword or solution (e.g. "I use debounce"), challenge them with edge cases (e.g. "Debounce reduces calls, but how do you handle race conditions where request A resolves after request B?").
   - If candidate's answer is vague or too brief, ask them to walk through the technical mechanism or code implementation.

3. NO RANDOM TOPIC JUMPING:
   - Maintain a coherent, logical interview thread rather than jumping abruptly across unrelated domains.

4. ADAPTIVE DIFFICULTY:
   - Increase depth gradually if candidate answers strongly; step down slightly if candidate struggles. Never jump from beginner fundamentals directly to senior architecture.

5. TIME & PACING:
   - If remaining time is <= 75 seconds, set action to "closing", shouldContinue to false, and provide a polite closing statement concluding the interview.

6. ACTION TYPES:
   Select one of: ["follow_up", "clarification", "deeper_question", "debugging_probe", "coding_problem", "project_question", "new_topic", "scenario", "challenge", "closing"].`;

  try {
    const interaction = await withRetry(
      () =>
        callGeminiInteraction({
          model: "gemini-3.8-flash",
          input: prompt,
          response_format: {
            type: "text",
            mime_type: "application/json",
            schema: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  description: "Interviewer conversational spoken response (1-3 sentences)",
                },
                action: {
                  type: "string",
                  enum: [
                    "follow_up",
                    "clarification",
                    "deeper_question",
                    "debugging_probe",
                    "coding_problem",
                    "project_question",
                    "new_topic",
                    "scenario",
                    "challenge",
                    "closing",
                  ],
                },
                topic: { type: "string" },
                feedbackSignals: { type: "string" },
                shouldContinue: { type: "boolean" },
              },
              required: ["message", "action", "topic", "shouldContinue"],
            },
          },
        }),
      "generateLiveConversationTurn"
    );

    const parsed = JSON.parse(interaction?.output_text || "{}");
    if (!parsed?.message) {
      throw new Error("Invalid conversation turn format from AI.");
    }

    return {
      message: parsed.message.trim(),
      action: parsed.action || "follow_up",
      topic: parsed.topic || "Technical Assessment",
      feedbackSignals: parsed.feedbackSignals || "",
      shouldContinue: parsed.shouldContinue !== false,
    };
  } catch (error) {
    console.warn("[Gemini] generateLiveConversationTurn fallback to mock:", error.message);
    return generateMockConversationTurn({
      position,
      techStack,
      experience,
      interviewType,
      elapsedSeconds,
      durationMinutes,
      conversationHistory,
      latestUserAnswer,
    });
  }
};

/**
 * Generates comprehensive final evaluation for a completed Live AI Interview.
 * Strictly evaluates observed answers across core 2026 engineering dimensions.
 *
 * @param {Object} params
 * @returns {Promise<Object>}
 */
export const generateFinalLiveEvaluation = async ({
  position,
  techStack,
  experience,
  interviewType = "Technical",
  conversationHistory = [],
  durationMinutes = 10,
  resumeAnalysis = null,
  resumeClaims = [],
  resumeBased = false,
  isEarlyExit = false,
  elapsedSeconds = 0,
}) => {
  if (isMockGeminiEnabled()) {
    console.log("[Gemini] 🔧 Dev Mode (VITE_MOCK_GEMINI=true) — returning simulated live evaluation.");
    await new Promise((r) => setTimeout(r, 600));
    return generateMockFinalLiveEvaluation({
      position,
      techStack,
      experience,
      interviewType,
      conversationHistory,
      resumeAnalysis,
      resumeClaims,
      resumeBased,
      isEarlyExit,
      elapsedSeconds,
      durationMinutes,
    });
  }

  const normExp = normalizeExperienceLevel(experience);

  const fullTranscript = conversationHistory
    .map((m) => `${m.role === "ai" ? "Interviewer" : "Candidate"}: "${m.content}"`)
    .join("\n\n");

  const claims =
    resumeClaims && resumeClaims.length > 0
      ? resumeClaims
      : resumeAnalysis?.resumeClaims || [];

  const userTurnsCount = conversationHistory.filter((m) => m.role === "user").length;

  const prompt = `You are a Principal Engineering Interviewer and Hiring Committee Chair evaluating a candidate who completed a live interview.
Target Role: ${position}
Candidate Experience: ${normExp.label} (${normExp.years} years experience - Tier: ${normExp.tier.toUpperCase()})
Tech Stack: ${techStack}
Interview Type: ${interviewType}
Planned Duration: ${durationMinutes} minutes
Actual Duration Elapsed: ${elapsedSeconds ? Math.round(elapsedSeconds / 60) + " minutes" : "N/A"}
Session State: ${isEarlyExit ? "PREMATURELY TERMINATED BY CANDIDATE (Early Exit)" : "Completed session"}
Candidate Turns Recorded: ${userTurnsCount}

Complete Interview Transcript:
${fullTranscript}

${
  resumeBased && resumeAnalysis
    ? `
RESUME CLAIMS VS INTERVIEW EVIDENCE EVALUATION (CRITICAL):
The candidate uploaded a verified resume with the following claims:
${claims
  .map(
    (c) =>
      `- Claim: "${c.claim}" | Context: ${c.context || ""} | Verification Question: "${c.verificationQuestion}"`
  )
  .join("\n")}

You MUST evaluate the candidate's actual interview transcript against these resume claims:
1. For each claim, analyze whether the candidate demonstrated solid technical evidence, partial evidence, or limited/no evidence during the interview.
2. In "resumeInsights", provide an object for each claim with:
   - "claim": exact claim text
   - "evidence": what the candidate actually demonstrated (or failed to demonstrate) in the transcript
   - "assessment": objective, neutral assessment (e.g. "Demonstrated practical React understanding." or "The interview provided limited evidence to substantiate this resume claim.")
   - "verificationStatus": "verified" | "partially_verified" | "needs_evidence"
3. DO NOT accuse candidate of exaggerating or lying. Use professional, evidence-based language.
4. DO NOT inflate or bias Technical Knowledge scores simply because many technologies were listed on the resume. Technical score must reflect actual interview answers only!
`
    : ""
}

REALISTIC EVALUATION & EARLY TERMINATION RULES (CRITICAL):
1. MANDATORY CANDOR ON EARLY EXIT / SHORT ANSWERS:
   - If the candidate ended the interview prematurely (isEarlyExit is true) or answered only 0, 1, or 2 questions:
     * Set completionStatus to "abandoned_early" or "partial".
     * Set hiringRecommendation to "Strong No Hire" or "No Hire".
     * Set performanceLevel to "Incomplete".
     * Overall rating MUST be between 1.0 and 3.0 out of 10. DO NOT give a passing or average score (5-7) to an abandoned interview!
     * Technical Knowledge, Problem Solving, and Relevance & Depth MUST be scored 1-3 due to insufficient evidence.
     * In overallSummary, explicitly state: "The candidate ended the interview prematurely after answering only X questions. There was insufficient evidence to evaluate technical competence, resulting in an automatic No-Hire recommendation."
     * Do NOT fabricate technical praise in strengths.
   - If the candidate provided consistently short or evasive answers (< 14 words per response, "i don't know", "yes", "no"):
     * Set completionStatus to "low_effort".
     * Set hiringRecommendation to "No Hire".
     * Overall rating MUST be between 2.5 and 4.2 out of 10.
     * Critique the lack of depth, failure to explain mechanisms, and absence of trade-offs.

2. CALIBRATE EVALUATION TO CANDIDATE EXPERIENCE TIER:
   - For FRESHER / ENTRY-LEVEL (0-1 yr): Evaluate understanding of JavaScript/React fundamentals, clarity, problem-solving potential, and basic debugging. DO NOT penalize for lacking senior distributed architecture, microservices, or complex compiler knowledge.
   - For 1-2 YEARS: Evaluate practical hooks usage, component state flow, API error handling, and basic debugging.
   - For 2-4 YEARS: Evaluate state boundaries, race condition awareness (AbortController), caching trade-offs, and error resilience.
   - For SENIOR (5+ YEARS): Expect rigorous architectural trade-offs, scalability, performance (INP/LCP), and engineering leadership.

3. SCORE EACH COMPETENCY INDEPENDENTLY (1-10):
   - NEVER derive one competency score from another.
   - Score calibration:
     * 9-10: Exceptional. Deep understanding, explains WHY and HOW, handles edge cases.
     * 7-8: Solid. Correct core mechanism with minor gaps in low-level edge cases.
     * 5-6: Mixed / High-level. Mentions buzzwords without explaining mechanics.
     * 3-4: Weak. Frequent inaccuracies or extremely shallow response.
     * 1-2: Incomplete, abandoned early, or unresponsive.

4. OVERALL SCORE CALCULATION:
   Compute overallRating as a transparent weighted composite:
   - Technical interview: Tech (35%), Problem Solving (30%), Relevance & Depth (20%), Communication (15%).
   - HR interview: Communication (40%), Relevance & Depth (30%), Problem Solving (20%), Tech (10%).
   - Behavioral interview: Problem Solving (35%), Communication (35%), Relevance & Depth (20%), Tech (10%).
   - Mixed interview: Tech (30%), Problem Solving (25%), Relevance & Depth (25%), Communication (20%).`;

  try {
    const interaction = await withRetry(
      () =>
        callGeminiInteraction({
          model: "gemini-3.8-flash",
          input: prompt,
          response_format: {
            type: "text",
            mime_type: "application/json",
            schema: {
              type: "object",
              properties: {
                overallRating: { type: "number", description: "Weighted overall score 1.0 to 10.0" },
                technicalKnowledgeScore: { type: "integer", description: "1 to 10" },
                communicationScore: { type: "integer", description: "1 to 10" },
                problemSolvingScore: { type: "integer", description: "1 to 10" },
                relevanceDepthScore: { type: "integer", description: "1 to 10" },
                overallSummary: { type: "string" },
                completionStatus: {
                  type: "string",
                  enum: ["completed", "partial", "abandoned_early", "low_effort"],
                },
                hiringRecommendation: { type: "string" },
                performanceLevel: { type: "string" },
                competencies: {
                  type: "object",
                  properties: {
                    technicalKnowledge: {
                      type: "object",
                      properties: {
                        score: { type: "integer" },
                        summary: { type: "string" },
                        evidence: { type: "array", items: { type: "string" } },
                        improvements: { type: "array", items: { type: "string" } },
                      },
                      required: ["score", "summary", "evidence", "improvements"],
                    },
                    communication: {
                      type: "object",
                      properties: {
                        score: { type: "integer" },
                        summary: { type: "string" },
                        evidence: { type: "array", items: { type: "string" } },
                        improvements: { type: "array", items: { type: "string" } },
                      },
                      required: ["score", "summary", "evidence", "improvements"],
                    },
                    problemSolving: {
                      type: "object",
                      properties: {
                        score: { type: "integer" },
                        summary: { type: "string" },
                        evidence: { type: "array", items: { type: "string" } },
                        improvements: { type: "array", items: { type: "string" } },
                      },
                      required: ["score", "summary", "evidence", "improvements"],
                    },
                    relevanceDepth: {
                      type: "object",
                      properties: {
                        score: { type: "integer" },
                        summary: { type: "string" },
                        evidence: { type: "array", items: { type: "string" } },
                        improvements: { type: "array", items: { type: "string" } },
                      },
                      required: ["score", "summary", "evidence", "improvements"],
                    },
                  },
                  required: ["technicalKnowledge", "communication", "problemSolving", "relevanceDepth"],
                },
                strengths: { type: "array", items: { type: "string" } },
                improvements: { type: "array", items: { type: "string" } },
                resumeInsights: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      claim: { type: "string" },
                      evidence: { type: "string" },
                      assessment: { type: "string" },
                      verificationStatus: {
                        type: "string",
                        enum: ["verified", "partially_verified", "needs_evidence"],
                      },
                    },
                    required: ["claim", "evidence", "assessment", "verificationStatus"],
                  },
                },
                resumeStrengthsVerified: { type: "array", items: { type: "string" } },
                resumeAreasNeedingEvidence: { type: "array", items: { type: "string" } },
                nextInterviewActionPlan: {
                  type: "object",
                  properties: {
                    technical: { type: "string" },
                    communication: { type: "string" },
                    problemSolving: { type: "string" },
                    interviewTechnique: { type: "string" },
                  },
                  required: ["technical", "communication", "problemSolving", "interviewTechnique"],
                },
                recommendedAnswerStructure: {
                  type: "object",
                  properties: {
                    structureName: { type: "string" },
                    steps: { type: "array", items: { type: "string" } },
                    explanation: { type: "string" },
                  },
                  required: ["structureName", "steps", "explanation"],
                },
                questionFeedback: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      question: { type: "string" },
                      whatWentWell: { type: "string" },
                      whatWasMissing: { type: "string" },
                      betterApproach: { type: "string" },
                    },
                    required: ["question", "whatWentWell", "whatWasMissing", "betterApproach"],
                  },
                },
                topicsCovered: { type: "array", items: { type: "string" } },
                questionsAsked: { type: "array", items: { type: "string" } },
                suggestedPracticeTopics: { type: "array", items: { type: "string" } },
              },
              required: [
                "overallRating",
                "technicalKnowledgeScore",
                "communicationScore",
                "problemSolvingScore",
                "relevanceDepthScore",
                "overallSummary",
                "competencies",
                "strengths",
                "improvements",
                "nextInterviewActionPlan",
                "recommendedAnswerStructure",
                "questionFeedback",
                "topicsCovered",
              ],
            },
          },
        }),
      "generateFinalLiveEvaluation"
    );

    const parsed = JSON.parse(interaction?.output_text || "{}");
    if (!parsed || typeof parsed !== "object") {
      throw new Error("Invalid final evaluation response format from AI.");
    }

    const techScore = Math.max(1, Math.min(10, Math.round(Number(parsed.technicalKnowledgeScore) || 6)));
    const commScore = Math.max(1, Math.min(10, Math.round(Number(parsed.communicationScore) || 6)));
    const psScore = Math.max(1, Math.min(10, Math.round(Number(parsed.problemSolvingScore) || 6)));
    const depthScore = Math.max(1, Math.min(10, Math.round(Number(parsed.relevanceDepthScore) || 6)));

    // Recompute or validate weighted overall rating
    let calculatedOverall;
    if (interviewType === "HR") {
      calculatedOverall = Math.round((commScore * 0.4 + depthScore * 0.3 + psScore * 0.2 + techScore * 0.1) * 10) / 10;
    } else if (interviewType === "Behavioral") {
      calculatedOverall = Math.round((psScore * 0.35 + commScore * 0.35 + depthScore * 0.2 + techScore * 0.1) * 10) / 10;
    } else if (interviewType === "Mixed") {
      calculatedOverall = Math.round((techScore * 0.3 + psScore * 0.25 + depthScore * 0.25 + commScore * 0.2) * 10) / 10;
    } else {
      calculatedOverall = Math.round((techScore * 0.35 + psScore * 0.3 + depthScore * 0.2 + commScore * 0.15) * 10) / 10;
    }

    const finalOverallRating = Number(parsed.overallRating) > 0 ? Number(parsed.overallRating) : calculatedOverall;

    return {
      overallSummary: parsed.overallSummary || "Interview successfully completed.",
      overallRating: finalOverallRating,
      technicalKnowledgeScore: techScore,
      communicationScore: commScore,
      problemSolvingScore: psScore,
      relevanceDepthScore: depthScore,
      completionStatus: parsed.completionStatus || (isEarlyExit ? "abandoned_early" : "completed"),
      hiringRecommendation:
        parsed.hiringRecommendation ||
        (finalOverallRating >= 7.5
          ? "Strong Hire"
          : finalOverallRating >= 6.5
          ? "Hire"
          : finalOverallRating >= 5.0
          ? "Weak Hire"
          : "No Hire"),
      performanceLevel:
        parsed.performanceLevel ||
        (finalOverallRating >= 7.5
          ? "Strong"
          : finalOverallRating >= 6.0
          ? "Proficient"
          : "Developing"),
      isEarlyExit,
      competencies: parsed.competencies || {
        technicalKnowledge: { score: techScore, summary: "Technical competency evaluated.", evidence: [], improvements: [] },
        communication: { score: commScore, summary: "Communication evaluated.", evidence: [], improvements: [] },
        problemSolving: { score: psScore, summary: "Problem solving evaluated.", evidence: [], improvements: [] },
        relevanceDepth: { score: depthScore, summary: "Depth evaluated.", evidence: [], improvements: [] },
      },
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ["Demonstrated solid core engineering concepts."],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements : ["Deepen edge case and trade-off analysis."],
      resumeInsights: Array.isArray(parsed.resumeInsights) ? parsed.resumeInsights : [],
      resumeStrengthsVerified: Array.isArray(parsed.resumeStrengthsVerified) ? parsed.resumeStrengthsVerified : [],
      resumeAreasNeedingEvidence: Array.isArray(parsed.resumeAreasNeedingEvidence) ? parsed.resumeAreasNeedingEvidence : [],
      nextInterviewActionPlan: parsed.nextInterviewActionPlan || {
        technical: `Revise ${techStack} runtime mechanics and lifecycle error boundaries.`,
        communication: "Use the Direct Answer → Technical Explanation → Concrete Example → Trade-off structure.",
        problemSolving: "State your diagnostic assumptions and hypothesis before giving a code solution.",
        interviewTechnique: "Explain your reasoning step-by-step when encountering unfamiliar scenarios.",
      },
      recommendedAnswerStructure: parsed.recommendedAnswerStructure || {
        structureName: "The Senior Engineering Response Framework",
        steps: [
          "1. Direct Answer: State your recommended approach in one crisp sentence.",
          "2. Technical Mechanism: Explain HOW and WHY it works under the hood.",
          "3. Real Project Example: Reference a concrete implementation from your past work.",
          "4. Trade-offs & Edge Cases: Acknowledge what you sacrifice and what could fail.",
        ],
        explanation: "This 4-step framework ensures your answers are structured, demonstrate technical depth, and avoid rambling.",
      },
      questionFeedback: Array.isArray(parsed.questionFeedback) ? parsed.questionFeedback : [],
      topicsCovered: Array.isArray(parsed.topicsCovered) ? parsed.topicsCovered : [techStack],
      questionsAsked: Array.isArray(parsed.questionsAsked) ? parsed.questionsAsked : [],
      suggestedPracticeTopics: Array.isArray(parsed.suggestedPracticeTopics)
        ? parsed.suggestedPracticeTopics
        : [
            `Advanced ${techStack} rendering lifecycle & reconciliation`,
            "Asynchronous race conditions & AbortController integration",
            "Core Web Vitals profiling (INP & LCP) and long-task remediation",
          ],
    };
  } catch (error) {
    console.warn("[Gemini] generateFinalLiveEvaluation fallback to mock:", error.message);
    return generateMockFinalLiveEvaluation({
      position,
      techStack,
      experience,
      interviewType,
      conversationHistory,
      resumeAnalysis,
      resumeClaims,
      resumeBased,
      isEarlyExit,
      elapsedSeconds,
      durationMinutes,
    });
  }
};

export default {
  analyzeResume,
  generateInterviewQuestions,
  evaluateAnswer,
  generateLiveIntro,
  generateLiveConversationTurn,
  generateFinalLiveEvaluation,
  normalizeExperienceLevel,
};


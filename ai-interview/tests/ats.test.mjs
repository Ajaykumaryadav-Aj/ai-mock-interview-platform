// tests/ats.test.mjs
// Comprehensive test suite for Resume-Only ATS Resume Checker and Scoring Engine.
// Verifies:
// TEST 1: Rejects empty or insufficient resume (< 30 chars)
// TEST 2: Alex Mercer resume -> Extracts real skills, metrics, complete sections, top tier score
// TEST 3: Dr. Priya Sharma resume -> Completely different skills (Python, PyTorch, ML) and different score
// TEST 4: Ajay Kumar resume -> Honestly detects skills (React, Flutter, Socket.io) & flags limited metrics without inventing
// TEST 5: Summary detection -> If resume has summary, does NOT claim it is missing
// TEST 6: Formatting & parser audit -> Differentiates real metrics from dates/tenure/CGPA, detects text artifacts
// TEST 7: Different resumes produce strictly distinct scores, issues, and skills (Zero generic scores)
// TEST 8: Backend API /api/ats?action=analyze requires NO job description
// TEST 9: Backend API /api/ats?action=improve requires NO job description
// TEST 10: Interview bridge questions generated from resume skills with ZERO "[object Object]"
// TEST 11: Candidate Profile Detection correctly detects 5 distinct profiles from resume evidence without assuming a target role
// TEST 12: Deterministic 8-Pillar Scoring strictly calculates overallScore as the exact weighted sum
// TEST 13: Project Analysis evaluates extracted projects with tech, relevance, strengths & suggestions without role assumption
// TEST 14: Poorly formatted / minimal resume loses points on formatting, parseability, structure, and metrics
// TEST 15: Resume with strong achievements scores high on achievement strength
// TEST 16: Backend API /api/ats?action=analytics returns aggregated historical statistics

import test from "node:test";
import assert from "node:assert/strict";

process.env.NODE_ENV = "test";

import {
  containsKeyword,
  extractResumeSkills,
  findQuantifiableAchievements,
  detectResumeTitle,
  auditResumeQuality,
  calculateResumeAtsScore,
  calculateAtsScore,
  detectCandidateProfile,
  TECH_SYNONYMS,
} from "../api/_lib/atsScorer.js";
import { generateAtsInterviewQuestions } from "../api/_lib/atsAi.js";
import atsHandler from "../api/ats.js";

// Helper for mocking req/res
function createMockReqRes({ method = "GET", query = {}, body = {}, headers = {} } = {}) {
  const req = {
    method,
    url: `/api/ats?${new URLSearchParams(query).toString()}`,
    query,
    body,
    headers: {
      host: "localhost:3000",
      "x-test-user-id": "test_ats_user_1",
      ...headers,
    },
  };

  const res = {
    statusCode: 200,
    headers: {},
    data: null,
    setHeader(key, val) {
      this.headers[key.toLowerCase()] = val;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.data = payload;
      return this;
    },
    end() {
      return this;
    },
  };

  return { req, res };
}

// ── Test Resumes ─────────────────────────────────────────────────────────────

const ALEX_MERCER_RESUME = `
Alex Mercer
alex.mercer@example.com | (555) 234-5678 | San Francisco, CA | linkedin.com/in/alexmercer | github.com/alexmercer

PROFESSIONAL SUMMARY
Senior Full Stack Engineer with 6+ years of experience designing scalable web applications. Proficient in React, Node.js, TypeScript, and MongoDB. Demonstrated record of optimizing latency by 35% and scaling systems to 150k+ active users.

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, Python, HTML5, CSS3
Frameworks & Libraries: React, Node.js, Express.js, Redux, Tailwind CSS
Databases: MongoDB, PostgreSQL, Redis
DevOps & Tools: Git, Docker, CI/CD, Jest

PROFESSIONAL EXPERIENCE
Senior Frontend Engineer | TechFlow Systems | 2021 - Present
- Architected modular frontend applications using React and TypeScript, increasing page load speed by 42%.
- Integrated Redis caching and Node.js microservices, handling over 10,000 requests per minute with 99.9% uptime.
- Mentored 4 junior engineers and championed automated testing with Jest, achieving 88% test coverage.

Software Developer | CloudWave Solutions | 2018 - 2021
- Developed REST APIs using Express.js and MongoDB, supporting 50,000+ daily active users.
- Built reusable UI components with React and Tailwind CSS, reducing development cycle time by 25%.

EDUCATION
Bachelor of Science in Computer Science | University of California, Berkeley | 2018
`;

const AJAY_KUMAR_RESUME = `
AJAY KUMAR
Portfolio Software Developer
ajay@example.com | +91 9876543210 | Bangalore, India | github.com/ajaykumar | linkedin.com/in/ajaykumar

SUMMARY
Frontend Developer with 1.5 years of experience building responsive web and mobile applications using React.js and modern JavaScript.

TECHNICAL SKILLS
Languages: JavaScript, Dart
Frameworks & Libraries: React.js, React Router, Tailwind CSS, Express.js, Socket.io, Flutter
Databases & Tools: Core CS Concepts: MongoDB, Git, GitHub, REST APIs, Vercel, Render

PROJECTS
Chat Application | 2020–202
- Built full stack chat appli cations using React.js, Node.js, Socket.io and MongoDB.
- Implemented real-time messaging and authentication features for users.
E-Commerce Store | 2022–2023
- Developed e-commerce frontend with React Router and Tailwind CSS deployed on Vercel.

EDUCATION
Bachelor of Technology in Computer Science | 2020–2024
CGPA: 7.5 CGPA
`;

const PRIYA_SHARMA_RESUME = `
Dr. Priya Sharma
priya.sharma@example.com | (555) 987-6543 | New York, NY | linkedin.com/in/priyasharma

PROFESSIONAL SUMMARY
Lead Data Scientist and Machine Learning Engineer with 7 years of experience in predictive analytics and computer vision. Expert in Python, PyTorch, SQL, and data visualization.

TECHNICAL SKILLS
Languages: Python, SQL, R
ML & Data: TensorFlow, PyTorch, Pandas, NumPy, Scikit-Learn
Databases: PostgreSQL, MySQL
Tools: Git, Linux, Jupyter

PROFESSIONAL EXPERIENCE
Lead Data Scientist | FinMetrics Analytics | 2020 - Present
- Built deep learning fraud detection models using Python and PyTorch, saving $1.2M in unauthorized transactions.
- Automated ETL data pipelines across PostgreSQL data warehouses processing 500GB daily.

EDUCATION
Master of Science in Data Science | Columbia University | 2018
`;

const DATA_ANALYST_RESUME = `
Jane Smith
Data Analyst | jane@example.com | (555) 345-6789 | Chicago, IL
PROFESSIONAL SUMMARY
Data Analyst with 4 years of experience delivering actionable insights using SQL, Tableau, Power BI, and Python.
TECHNICAL SKILLS
SQL, Excel, Tableau, Power BI, Python, Pandas, Data Visualization, ETL
PROFESSIONAL EXPERIENCE
Senior Data Analyst | RetailInsights | 2021 - Present
- Built automated executive dashboards in Tableau and Power BI, reducing weekly reporting cycles by 15 hours.
- Queried multi-table data warehouses in SQL to analyze product churn across 250k accounts.
EDUCATION
BS in Statistics | University of Illinois | 2020
`;

const BACKEND_RESUME = `
Marcus Vance
Backend Developer | marcus@example.com | Seattle, WA
PROFESSIONAL SUMMARY
Backend Software Engineer specializing in distributed microservices with Go, Python, and PostgreSQL.
TECHNICAL SKILLS
Languages: Go, Python, Java, SQL
Backend: FastAPI, Spring Boot, gRPC, REST APIs, Kafka
Databases: PostgreSQL, Redis, Cassandra
Tools: Docker, Kubernetes, Linux
EXPERIENCE
Backend Engineer | CloudGrid | 2020 - Present
- Engineered high-throughput REST and gRPC services in Go and Python, handling 30k requests/second.
- Designed PostgreSQL data partition schemes and implemented Redis caching to cut p99 latency by 45%.
EDUCATION
BS in Computer Science | University of Washington | 2019
`;

const BOB_MINIMAL_RESUME = `
Bob Minimal
Phone: 1234567890
Email: bob@test.com

Worked at company doing coding.
Knows python and html.
Did a project for school website.
Graduated college in 2020.
`;

const FLUTTER_RESUME = `
Rohit Verma
Flutter Developer | Mobile Application Engineer
rohit.verma@example.com | +91 9876543210 | Delhi, India | github.com/rohitverma

PROFESSIONAL SUMMARY
Flutter Developer with 2.5 years of experience architecting cross-platform mobile applications for Android and iOS using Flutter and Dart. Strong expertise in Bloc/Provider state management and clean architecture.

TECHNICAL SKILLS
Languages: Dart, Kotlin
Mobile Frameworks: Flutter, Bloc, Provider, Riverpod, Material UI
Backend & APIs: RESTful APIs, Firebase, SQLite
Tools: Git, Android Studio, Postman

EXPERIENCE
Flutter Developer | AppCraft Studio | 2022 - Present
- Built and published cross-platform mobile applications on Google Play Store with 25,000+ active installs.
- Decreased app cold-start latency by 35% through lazy widget loading and optimized asset bundles.

PROJECTS
Fitness App | Flutter, Firebase, Bloc
- Real-time workout tracking app with offline SQLite sync.

EDUCATION
B.Tech in Computer Science | 2017 - 2021
`;

// ── Tests ────────────────────────────────────────────────────────────────────

test("TEST 1: Rejects empty or insufficient resume (< 30 chars)", async () => {
  // Direct scorer
  assert.throws(() => {
    calculateResumeAtsScore({ resumeText: "Too short" });
  }, /Resume text must be at least 30 characters/i);

  // API endpoint
  const { req, res } = createMockReqRes({
    method: "POST",
    query: { action: "analyze" },
    body: { resumeText: "Short text" },
  });

  await atsHandler(req, res);
  assert.equal(res.statusCode, 400);
  assert.ok(res.data.error.includes("at least 30 characters"));
});

test("TEST 2: Alex Mercer resume -> Extracts real skills, metrics, complete sections, top tier score", () => {
  const report = calculateResumeAtsScore({ resumeText: ALEX_MERCER_RESUME });

  assert.ok(report.overallScore >= 80, `Expected score >= 80, got ${report.overallScore}`);
  assert.ok(report.extractedSkills.length >= 10, `Expected >= 10 skills, got ${report.extractedSkills.length}`);

  const skillNames = report.extractedSkills.map((s) => s.keyword);
  assert.ok(skillNames.includes("React"));
  assert.ok(skillNames.includes("Node.js"));
  assert.ok(skillNames.includes("TypeScript"));
  assert.ok(skillNames.includes("MongoDB"));
  assert.ok(skillNames.includes("Docker"));

  // Verify categories
  assert.ok(report.skillCategories["Frontend"]?.length > 0);
  assert.ok(report.skillCategories["Backend & APIs"]?.length > 0);
  assert.ok(report.skillCategories["Databases"]?.length > 0);

  // Check quantifiable metrics
  assert.ok(report.qualityAudit.metricsCount >= 3, `Expected >= 3 metrics, got ${report.qualityAudit.metricsCount}`);

  // Summary must NOT be marked missing
  assert.equal(report.qualityAudit.hasProfessionalSummary, true);
  const summaryIssue = report.issues.find((i) => i.id === "missing-summary");
  assert.equal(summaryIssue, undefined);
});

test("TEST 3: Dr. Priya Sharma resume -> Completely different skills (Python, PyTorch, ML) and different score", () => {
  const report = calculateResumeAtsScore({ resumeText: PRIYA_SHARMA_RESUME });

  const skillNames = report.extractedSkills.map((s) => s.keyword);
  assert.ok(skillNames.includes("Python"));
  assert.ok(skillNames.includes("PyTorch"));
  assert.ok(skillNames.includes("TensorFlow"));
  assert.ok(skillNames.includes("PostgreSQL"));

  // Must not have frontend skills from Alex's resume
  assert.ok(!skillNames.includes("React Router"));
  assert.ok(!skillNames.includes("Flutter"));

  assert.ok(report.overallScore >= 70);
  assert.ok(report.qualityAudit.metricsCount >= 2); // $1.2M, 500GB
});

test("TEST 4: Ajay Kumar resume -> Honestly detects skills (React, Flutter, Socket.io) & flags limited metrics without inventing", () => {
  const report = calculateResumeAtsScore({ resumeText: AJAY_KUMAR_RESUME });

  const skillNames = report.extractedSkills.map((s) => s.keyword);
  assert.ok(skillNames.includes("React"));
  assert.ok(skillNames.includes("Flutter"));
  assert.ok(skillNames.includes("Dart"));
  assert.ok(skillNames.includes("Tailwind CSS"));
  assert.ok(skillNames.includes("Socket.io"));

  // Check that metrics are honestly reported as limited
  const impactIssue = report.issues.find((i) => i.id === "limited-metrics" || i.id === "no-measurable-achievements");
  assert.ok(impactIssue, "Must honestly flag limited measurable impact metrics");
  assert.equal(impactIssue.severity, "HIGH");

  // Summary IS present in Ajay's resume, so missing-summary issue MUST NOT be present
  assert.equal(report.qualityAudit.hasProfessionalSummary, true);
  const summaryIssue = report.issues.find((i) => i.id === "missing-summary");
  assert.equal(summaryIssue, undefined);

  // Detects candidate title
  assert.ok(report.candidateTitle.toLowerCase().includes("software developer") || report.candidateTitle.toLowerCase().includes("frontend"));
});

test("TEST 5: Summary detection -> If resume has summary, does NOT claim it is missing", () => {
  const auditAlex = auditResumeQuality(ALEX_MERCER_RESUME);
  assert.equal(auditAlex.hasProfessionalSummary, true);

  const auditAjay = auditResumeQuality(AJAY_KUMAR_RESUME);
  assert.equal(auditAjay.hasProfessionalSummary, true);

  const noSummaryResume = `
Jane Doe
jane@example.com | 123-456-7890

EXPERIENCE
Developer at ABC Corp | 2021-2023
- Built React applications

EDUCATION
BS in Computer Science | 2021
`;
  const auditNoSummary = auditResumeQuality(noSummaryResume);
  assert.equal(auditNoSummary.hasProfessionalSummary, false);
});

test("TEST 6: Formatting & parser audit -> Differentiates real metrics from dates/tenure/CGPA, detects text artifacts", () => {
  // Dates, tenure, and CGPA should NOT count as quantifiable business/engineering achievements
  const dateTenureCgpaText = "Frontend Developer with 1.5 years of experience. Attended 2020-2024. CGPA: 7.5 CGPA.";
  const achievements = findQuantifiableAchievements(dateTenureCgpaText);
  assert.equal(achievements.length, 0, "Dates, tenure, and CGPA must not be counted as business outcome metrics");

  // Real engineering outcomes SHOULD be counted
  const realMetricText = "Reduced bundle size by 35% and scaled microservices to 150k+ daily active users.";
  const realAchievements = findQuantifiableAchievements(realMetricText);
  assert.ok(realAchievements.length >= 2, "Expected at least 2 real achievements");

  // Ajay's resume text contains split words ("appli cations") and truncated date ("2020–202")
  const ajayAudit = auditResumeQuality(AJAY_KUMAR_RESUME);
  assert.equal(ajayAudit.hasMalformedExtraction, true);
  assert.ok(ajayAudit.malformedArtifacts.length > 0);
});

test("TEST 7: Different resumes produce strictly distinct scores, issues, and skills (Zero generic scores)", () => {
  const reportAlex = calculateResumeAtsScore({ resumeText: ALEX_MERCER_RESUME });
  const reportAjay = calculateResumeAtsScore({ resumeText: AJAY_KUMAR_RESUME });
  const reportPriya = calculateResumeAtsScore({ resumeText: PRIYA_SHARMA_RESUME });

  // Scores must be distinct
  assert.notEqual(reportAlex.overallScore, reportAjay.overallScore);
  assert.notEqual(reportAlex.overallScore, reportPriya.overallScore);
  assert.notEqual(reportAjay.overallScore, reportPriya.overallScore);

  // Skills count must be distinct
  assert.notEqual(reportAlex.extractedSkills.length, reportAjay.extractedSkills.length);

  // Issues must be distinct
  assert.notEqual(reportAlex.issues.length, reportAjay.issues.length);
});

test("TEST 8: Backend API /api/ats?action=analyze requires NO job description", async () => {
  const { req, res } = createMockReqRes({
    method: "POST",
    query: { action: "analyze" },
    body: {
      resumeText: ALEX_MERCER_RESUME,
      resumeFileName: "Alex_Mercer.pdf",
      resumeFileSize: 1024,
    },
  });

  await atsHandler(req, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.data.success, true);
  assert.ok(res.data.analysis);
  assert.ok(res.data.analysis.overallScore > 0);
  assert.ok(res.data.analysis.extractedSkills.length > 0);
  assert.ok(res.data.analysis.skillCategories);
  assert.ok(res.data.analysis.scoringBreakdown);
  assert.ok(res.data.analysis.detectedProfile);
  assert.equal(typeof res.data.analysis.overallScore, "number");
});

test("TEST 9: Backend API /api/ats?action=improve requires NO job description", async () => {
  const { req, res } = createMockReqRes({
    method: "POST",
    query: { action: "improve" },
    body: {
      resumeText: AJAY_KUMAR_RESUME,
    },
  });

  await atsHandler(req, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.data.success, true);
  assert.ok(res.data.improvedResumeText);
  assert.ok(res.data.recalculatedReport);
  assert.ok(typeof res.data.recalculatedScore === "number");
});

test("TEST 10: Interview bridge questions generated from resume skills with ZERO '[object Object]'", async () => {
  const candidateSkills = ["React", "Dart", "Socket.io", "Tailwind CSS"];
  const questions = await generateAtsInterviewQuestions({
    resumeText: AJAY_KUMAR_RESUME,
    candidateSkills,
    targetRole: "Frontend Developer",
  });

  assert.ok(Array.isArray(questions));
  assert.ok(questions.length >= 3);

  // Stringify check for [object Object]
  const jsonStr = JSON.stringify(questions);
  assert.ok(!jsonStr.includes("[object Object]"), "Questions must not contain '[object Object]' anywhere");

  // Every question must have question, category, and skillFocus
  for (const q of questions) {
    assert.ok(typeof q.question === "string" && q.question.length > 10);
    assert.ok(typeof q.category === "string");
  }
});

test("TEST 11: Candidate Profile Detection correctly detects 5 distinct profiles from resume evidence without assuming a target role", () => {
  // 1. Frontend + Flutter (Ajay Kumar)
  const ajayReport = calculateResumeAtsScore({ resumeText: AJAY_KUMAR_RESUME });
  assert.equal(ajayReport.detectedProfile, "Frontend + Flutter Developer");
  assert.deepEqual(ajayReport.missingSkills, [], "Must not generate missing role skills");

  // 2. Data Analyst
  const daReport = calculateResumeAtsScore({ resumeText: DATA_ANALYST_RESUME });
  assert.equal(daReport.detectedProfile, "Data Analyst");
  assert.deepEqual(daReport.missingSkills, []);

  // 3. Backend Developer
  const backendReport = calculateResumeAtsScore({ resumeText: BACKEND_RESUME });
  assert.equal(backendReport.detectedProfile, "Backend Developer");
  assert.deepEqual(backendReport.missingSkills, []);

  // 4. Data Scientist & ML Engineer
  const mlReport = calculateResumeAtsScore({ resumeText: PRIYA_SHARMA_RESUME });
  assert.equal(mlReport.detectedProfile, "Data Scientist & ML Engineer");
  assert.deepEqual(mlReport.missingSkills, []);

  // 5. Full Stack Developer
  const fullstackReport = calculateResumeAtsScore({ resumeText: ALEX_MERCER_RESUME });
  assert.equal(fullstackReport.detectedProfile, "Full Stack Developer");
  assert.deepEqual(fullstackReport.missingSkills, []);

  // 6. Flutter Developer from Heading
  const flutterReport = calculateResumeAtsScore({ resumeText: FLUTTER_RESUME });
  assert.equal(flutterReport.detectedProfile, "Flutter Developer");
  assert.deepEqual(flutterReport.missingSkills, []);
});

test("TEST 12: Deterministic 8-Pillar Scoring strictly calculates overallScore as the exact weighted sum", () => {
  const report = calculateResumeAtsScore({ resumeText: ALEX_MERCER_RESUME });

  assert.ok(report.scoringBreakdown, "Must have scoringBreakdown object");
  const sb = report.scoringBreakdown;

  assert.equal(typeof sb.atsParseability, "number");
  assert.equal(typeof sb.resumeStructure, "number");
  assert.equal(typeof sb.skillsClarity, "number");
  assert.equal(typeof sb.experienceQuality, "number");
  assert.equal(typeof sb.projectQuality, "number");
  assert.equal(typeof sb.achievementStrength, "number");
  assert.equal(typeof sb.formattingReadability, "number");
  assert.equal(typeof sb.contentConsistency, "number");

  const expectedWeighted = Math.round(
    sb.atsParseability * 0.15 +
    sb.resumeStructure * 0.15 +
    sb.skillsClarity * 0.15 +
    sb.experienceQuality * 0.20 +
    sb.projectQuality * 0.10 +
    sb.achievementStrength * 0.10 +
    sb.formattingReadability * 0.10 +
    sb.contentConsistency * 0.05
  );

  assert.equal(report.overallScore, expectedWeighted, "Overall score must exactly equal 8-pillar weighted sum");
});

test("TEST 13: Project Analysis evaluates extracted projects with tech, relevance, strengths & suggestions without role assumption", () => {
  const report = calculateResumeAtsScore({ resumeText: AJAY_KUMAR_RESUME });

  assert.ok(Array.isArray(report.projects), "report.projects must be an array");
  assert.ok(report.projects.length >= 2, `Expected at least 2 projects, got ${report.projects.length}`);

  const p1 = report.projects[0];
  assert.ok(p1.name.includes("Chat Application") || p1.name.includes("Chat"));
  assert.ok(Array.isArray(p1.technologiesUsed));
  assert.ok(Array.isArray(p1.strengths) && p1.strengths.length > 0);
  assert.ok(Array.isArray(p1.improvementSuggestions) && p1.improvementSuggestions.length > 0);
});

test("TEST 14: Poorly formatted / minimal resume loses points on formatting, parseability, structure and metrics", () => {
  const report = calculateResumeAtsScore({ resumeText: BOB_MINIMAL_RESUME });

  // Minimal resume must score significantly lower than full professional resumes
  assert.ok(report.overallScore < 60, `Minimal resume expected score < 60, got ${report.overallScore}`);

  // Must detect missing summary and limited metrics
  const issueIds = report.issues.map((i) => i.id);
  assert.ok(issueIds.includes("missing-summary"), "Must detect missing summary");
  assert.ok(issueIds.includes("limited-metrics") || issueIds.includes("no-measurable-achievements"), "Must detect lack of metrics");

  // Achievement score must be low
  assert.ok(report.scoringBreakdown.achievementStrength <= 40, "Achievement score must be low for unquantified bullets");
});

test("TEST 15: Resume with strong achievements scores high on achievement strength", () => {
  const report = calculateResumeAtsScore({ resumeText: ALEX_MERCER_RESUME });

  // Alex Mercer has multiple specific engineering metrics (42%, 10,000 req/min, 88%, 50,000+, 25%)
  assert.ok(report.scoringBreakdown.achievementStrength >= 80, `Expected achievement score >= 80, got ${report.scoringBreakdown.achievementStrength}`);
  assert.ok(report.qualityAudit.metricsCount >= 3);
});

test("TEST 16: Backend API /api/ats?action=analytics returns aggregated historical statistics", async () => {
  const { req, res } = createMockReqRes({
    method: "GET",
    query: { action: "analytics" },
  });

  await atsHandler(req, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.data.success, true);
  assert.ok(res.data.analytics);
  assert.equal(typeof res.data.analytics.highestScore, "number");
  assert.equal(typeof res.data.analytics.latestScore, "number");
  assert.equal(typeof res.data.analytics.averageScore, "number");
  assert.equal(typeof res.data.analytics.improvementPercent, "number");
  assert.ok(Array.isArray(res.data.analytics.skillGrowthTracking));
});

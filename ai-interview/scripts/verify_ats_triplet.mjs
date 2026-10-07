// scripts/verify_ats_triplet.mjs
import { calculateAtsScore } from "../api/lib/atsScorer.js";
import { generateAtsSuggestions, generateAtsInterviewQuestions } from "../api/lib/atsAi.js";

const resumeA = `
Alex Mercer (Full Stack)
alex@test.com | 555-0101 | San Francisco
SUMMARY: Full-Stack Engineer with 5 years in React, Node.js, and MongoDB. Scaled web app to 100k users.
SKILLS: React, Node.js, Express, MongoDB, JavaScript, TypeScript, Tailwind CSS, Jest
EXPERIENCE:
Software Engineer at CloudTech (2020-Present)
- Built interactive dashboards in React and TypeScript improving load times by 30%.
- Designed REST APIs in Node.js and MongoDB serving 20,000 requests per minute.
EDUCATION: BS Computer Science, UC Berkeley
`;

const resumeB = `
Sarah Connor (DevOps Infrastructure)
sarah@test.com | 555-0202 | Austin, TX
SUMMARY: Cloud Architect with 7 years managing AWS infrastructure, Docker, and Kubernetes clusters.
SKILLS: AWS, Kubernetes, Docker, Terraform, CI/CD, Python, Linux, Bash, Prometheus
EXPERIENCE:
Site Reliability Engineer at CyberDyne (2019-Present)
- Architected Kubernetes clusters on AWS handling 500k queries per second with 99.99% uptime.
- Automated multi-region infrastructure provisioning using Terraform and GitHub Actions.
EDUCATION: BS Electrical Engineering
`;

const resumeC = `
Junior Dev (Intern)
intern@test.com
Learning HTML, CSS and basic Python.
Made a personal blog.
`;

const jdA = `
Job Title: Senior React & Node.js Engineer
Role Overview:
We are looking for a Senior Full Stack Engineer to lead web application development. You will build highly responsive UI components and develop scalable backend APIs.
Core Requirements & Skills:
- 5+ years building production applications with React, Node.js, and TypeScript.
- Strong experience with MongoDB, Express, and Redux state management.
- Hands-on proficiency in automated testing with Jest.
- Familiarity with containerized deployments using Docker and CI/CD pipelines.
`;

const jdB = `
Job Title: DevOps & Cloud Infrastructure Engineer
Role Overview:
We are seeking an Infrastructure Engineer to manage our high-availability AWS cloud platform, container orchestration, and continuous delivery systems.
Core Requirements & Skills:
- 5+ years administering production AWS cloud infrastructure.
- Deep expertise in Kubernetes (k8s), Docker containers, and Terraform IaC.
- Strong background in Linux systems administration and CI/CD automation.
- Proficient in Python scripting and configuration management with Ansible.
`;

const jdC = `
Job Title: Python Data Engineer
Role Overview:
Join our analytics data platform team to design and build scalable ETL pipelines and high-throughput data processing workflows.
Core Requirements & Skills:
- 3+ years data engineering experience with Python and SQL.
- Strong experience with PostgreSQL database optimization and FastAPI services.
- Hands-on experience with streaming architectures using Apache Spark and Apache Kafka.
- Experience with Docker and workflow orchestration.
`;

async function main() {
  console.log("==================================================");
  console.log("TEST CASE 1: Full-Stack React Resume vs React & Node JD");
  console.log("==================================================");
  const r1 = calculateAtsScore({ resumeText: resumeA, jobDescription: jdA, targetRole: "Senior Full Stack Engineer" });
  const s1 = await generateAtsSuggestions({
    resumeText: resumeA,
    jobDescription: jdA,
    atsReport: r1,
  });
  const q1 = await generateAtsInterviewQuestions({
    resumeText: resumeA,
    jobDescription: jdA,
    targetRole: "Senior Full Stack Engineer",
    matchedSkills: r1.matchedKeywords,
    missingSkills: r1.missingKeywords,
  });
  console.log("ATS Score:", r1.overallScore, "/ 100");
  console.log("Category Scores:", r1.categoryScores);
  console.log("Matched Keywords:", r1.matchedKeywords.map((k) => k.keyword));
  console.log("Missing Keywords:", r1.missingKeywords.map((m) => `${m.keyword} [${m.priority}]`));
  console.log("Issues Detected:", r1.issues.map((i) => i.title));
  console.log("AI Suggestion 1:", s1[0]?.how || "N/A");
  console.log("Sample Interview Question 1:", q1[0]?.question);
  console.log("Sample Interview Question 2 (Gap):", q1[2]?.question);

  console.log("\n==================================================");
  console.log("TEST CASE 2: DevOps Resume vs DevOps & Cloud JD");
  console.log("==================================================");
  const r2 = calculateAtsScore({ resumeText: resumeB, jobDescription: jdB, targetRole: "DevOps Engineer" });
  const s2 = await generateAtsSuggestions({
    resumeText: resumeB,
    jobDescription: jdB,
    atsReport: r2,
  });
  const q2 = await generateAtsInterviewQuestions({
    resumeText: resumeB,
    jobDescription: jdB,
    targetRole: "DevOps Engineer",
    matchedSkills: r2.matchedKeywords,
    missingSkills: r2.missingKeywords,
  });
  console.log("ATS Score:", r2.overallScore, "/ 100");
  console.log("Category Scores:", r2.categoryScores);
  console.log("Matched Keywords:", r2.matchedKeywords.map((k) => k.keyword));
  console.log("Missing Keywords:", r2.missingKeywords.map((m) => `${m.keyword} [${m.priority}]`));
  console.log("Issues Detected:", r2.issues.map((i) => i.title));
  console.log("AI Suggestion 1:", s2[0]?.how || "N/A");
  console.log("Sample Interview Question 1:", q2[0]?.question);
  console.log("Sample Interview Question 2 (Gap):", q2[2]?.question);

  console.log("\n==================================================");
  console.log("TEST CASE 3: Junior Resume vs Python Data Engineer JD");
  console.log("==================================================");
  const r3 = calculateAtsScore({ resumeText: resumeC, jobDescription: jdC, targetRole: "Python Data Engineer" });
  const s3 = await generateAtsSuggestions({
    resumeText: resumeC,
    jobDescription: jdC,
    atsReport: r3,
  });
  const q3 = await generateAtsInterviewQuestions({
    resumeText: resumeC,
    jobDescription: jdC,
    targetRole: "Python Data Engineer",
    matchedSkills: r3.matchedKeywords,
    missingSkills: r3.missingKeywords,
  });
  console.log("ATS Score:", r3.overallScore, "/ 100");
  console.log("Category Scores:", r3.categoryScores);
  console.log("Matched Keywords:", r3.matchedKeywords.map((k) => k.keyword));
  console.log("Missing Keywords:", r3.missingKeywords.map((m) => `${m.keyword} [${m.priority}]`));
  console.log("Issues Detected:", r3.issues.map((i) => i.title));
  console.log("AI Suggestion 1:", s3[0]?.how || "N/A");
  console.log("Sample Interview Question 1:", q3[0]?.question);
  console.log("Sample Interview Question 2 (Gap):", q3[2]?.question);

  // Comparison Assertion
  console.log("\n==================================================");
  console.log("VERIFICATION OF DISTINCT RESULTS (ANTI-HOMOGENIZATION):");
  console.log("Case 1 Score:", r1.overallScore);
  console.log("Case 2 Score:", r2.overallScore);
  console.log("Case 3 Score:", r3.overallScore);
  console.log("Scores distinct:", r1.overallScore !== r2.overallScore && r1.overallScore !== r3.overallScore);
  console.log("Matched keywords distinct:", JSON.stringify(r1.matchedKeywords) !== JSON.stringify(r2.matchedKeywords));
  console.log("Missing keywords distinct:", JSON.stringify(r1.missingKeywords) !== JSON.stringify(r2.missingKeywords));
  console.log("Issues count Case 1 vs Case 3:", r1.issues.length, "vs", r3.issues.length);
  console.log("Suggestions distinct:", s1[0]?.what !== s2[0]?.what);
  console.log("Interview Questions distinct:", q1[0]?.question !== q2[0]?.question && q1[0]?.question !== q3[0]?.question);
  console.log("==================================================");
}

main().catch(console.error);

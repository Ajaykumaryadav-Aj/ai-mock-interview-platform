import { calculateAtsScore, validateJobDescription } from "../api/_lib/atsScorer.js";

const ajayResume = `
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

const reactJd = `
Job Title: Senior React Engineer
About the Role:
We are seeking an experienced Senior React Developer to lead web frontend architecture, implement reusable component libraries, and optimize client-side performance.
Key Responsibilities:
- Lead architecture and development of scalable React web applications with TypeScript.
- Implement complex state management patterns using Redux.
- Write robust unit and integration tests using Jest and Cypress.
- Work closely with backend teams on REST API integrations and microservices.
- Manage containerized environments with Docker and deploy to AWS cloud.
Qualifications & Requirements:
- 5+ years of software engineering experience.
- Deep expertise in React, TypeScript, Redux, Tailwind CSS, and REST APIs.
- Production experience with Jest, Docker, and AWS.
`;

const devopsJd = `
Job Title: Senior DevOps & Cloud Infrastructure Engineer
About the Role:
We are looking for a Senior DevOps Engineer to scale and maintain our high-availability cloud infrastructure and CI/CD pipelines.
Key Responsibilities:
- Manage multi-region AWS cloud infrastructure using Terraform Infrastructure as Code.
- Architect and operate Kubernetes container clusters and Docker deployments.
- Build automated continuous integration and deployment pipelines using Jenkins and GitHub Actions.
- Ensure 99.99% system uptime, disaster recovery, and Prometheus monitoring.
Qualifications & Requirements:
- 5+ years administering production AWS infrastructure.
- Deep expertise in Kubernetes, Docker, Terraform, CI/CD, and Linux systems.
- Scripting proficiency in Python and Bash.
`;

const fiveWordJd = "React Developer - Frontend Web Applications";

console.log("==================================================");
console.log("TEST SCENARIO 1: 5-word / role-only JD");
console.log("Input JD:", fiveWordJd);
console.log("==================================================");
const validation1 = validateJobDescription(fiveWordJd);
console.log("Validation Result:", validation1);
try {
  calculateAtsScore({ resumeText: ajayResume, jobDescription: fiveWordJd });
  console.log("ERROR: Should have been rejected!");
} catch (e) {
  console.log("Correctly Rejected with message:", e.message);
}

console.log("\n==================================================");
console.log("TEST SCENARIO 2: Ajay Resume + Full React JD");
console.log("==================================================");
const reactResult = calculateAtsScore({ resumeText: ajayResume, jobDescription: reactJd, targetRole: "Senior React Engineer" });
console.log("ATS Score:", reactResult.overallScore, "/ 100");
console.log("Assessment:", reactResult.assessment);
console.log("Category Scores:", reactResult.categoryScores);
console.log("Matched Keywords:", reactResult.matchedKeywords.map((k) => k.keyword));
console.log("Missing Keywords:", reactResult.missingKeywords.map((k) => `${k.keyword} [${k.priority}]`));
console.log("Detected Issues:", reactResult.issues.map((i) => i.title));

console.log("\n==================================================");
console.log("TEST SCENARIO 3: Ajay Resume + Full DevOps JD");
console.log("==================================================");
const devopsResult = calculateAtsScore({ resumeText: ajayResume, jobDescription: devopsJd, targetRole: "DevOps Engineer" });
console.log("ATS Score:", devopsResult.overallScore, "/ 100");
console.log("Assessment:", devopsResult.assessment);
console.log("Category Scores:", devopsResult.categoryScores);
console.log("Matched Keywords:", devopsResult.matchedKeywords.map((k) => k.keyword));
console.log("Missing Keywords:", devopsResult.missingKeywords.map((k) => `${k.keyword} [${k.priority}]`));
console.log("Detected Issues:", devopsResult.issues.map((i) => i.title));
console.log("==================================================");

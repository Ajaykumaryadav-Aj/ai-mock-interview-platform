// src/data/atsSampleData.js
// Pre-calibrated sample Resumes for instant testing and demonstration without manual uploads.

export const SAMPLE_RESUMES = [
  {
    id: "alex-fullstack",
    name: "Alex Mercer (Senior Full Stack)",
    fileName: "Alex_Mercer_FullStack_Resume.pdf",
    text: `Alex Mercer
alex.mercer@example.com | (555) 234-5678 | San Francisco, CA | linkedin.com/in/alexmercer | github.com/alexmercer

PROFESSIONAL SUMMARY
Senior Full Stack Engineer with 6+ years of experience building and scaling modern web applications. Expert in React, TypeScript, Node.js, and MongoDB. Demonstrated track record of optimizing page load times by 42% and scaling microservices to 150k+ daily active users.

TECHNICAL SKILLS
- Languages: JavaScript (ES6+), TypeScript, HTML5, CSS3, Python
- Frontend Frameworks: React, Redux, Next.js, Tailwind CSS
- Backend & APIs: Node.js, Express.js, REST APIs, WebSockets
- Databases & Caching: MongoDB, PostgreSQL, Redis
- Tools & DevOps: Git, Docker, CI/CD, Jest, Vite

PROFESSIONAL EXPERIENCE
Senior Frontend Engineer | TechFlow Systems | 2021 - Present
- Architected modular frontend client in React and TypeScript, boosting core web vitals and reducing bundle size by 35%.
- Built Node.js microservices integrated with Redis and MongoDB, handling 12,000 requests per minute with 99.9% uptime.
- Established automated test suite using Jest, raising test coverage from 45% to 88% and eliminating production regressions.
- Mentored 5 junior and mid-level software engineers on modern React architectural patterns.

Software Developer | CloudWave Solutions | 2018 - 2021
- Developed RESTful endpoints using Node.js and Express.js, serving 50,000+ daily active users.
- Implemented responsive user dashboards using React and Tailwind CSS, speeding up customer workflow completion by 25%.
- Automated staging build pipelines using Docker containers and GitHub Actions.

EDUCATION
Bachelor of Science in Computer Science | University of California, Berkeley | 2018`,
  },
  {
    id: "rohit-flutter",
    name: "Rohit Verma (Flutter Developer)",
    fileName: "Rohit_Verma_Flutter_Developer.pdf",
    text: `Rohit Verma
Flutter Developer | Mobile Application Engineer
rohit.verma@example.com | +91 9876543210 | Delhi, India | github.com/rohitverma | linkedin.com/in/rohitverma

PROFESSIONAL SUMMARY
Flutter Developer with 2.5 years of experience architecting cross-platform mobile applications for Android and iOS using Flutter and Dart. Strong expertise in Bloc/Provider state management, REST API integration, and clean architecture.

TECHNICAL SKILLS
Languages: Dart, JavaScript, Kotlin
Mobile Frameworks: Flutter, Flutter SDK, Bloc, Provider, Riverpod, Material UI, Cupertino
Backend & APIs: RESTful APIs, Firebase (Auth, Firestore, Cloud Messaging), SQLite
Tools & DevOps: Git, GitHub, Postman, Android Studio, VS Code, CI/CD, Google Play Console

EXPERIENCE
Flutter Developer | AppCraft Studio | 2022 - Present
- Built and published cross-platform mobile applications on Google Play Store with 25,000+ active installs.
- Implemented real-time workout synchronization and offline caching using SQLite and Firebase Cloud Firestore.
- Decreased app cold-start latency by 35% through lazy widget loading and optimized asset bundle sizing.
- Integrated RESTful APIs with error interception and token refresh handling, cutting API crash rates by 40%.

Junior Mobile Developer | MobileMinds | 2021 - 2022
- Developed responsive mobile UI screens adhering strictly to Figma specifications for both iOS and Android.
- Configured Firebase push notifications and analytics, improving weekly user retention by 18%.

PROJECTS
E-Commerce Mobile Application | Flutter, REST APIs, Provider
- Created full-featured shopping mobile application with cart state management, product filtering, and payment gateway.
- Deployed automated build releases via GitHub Actions to internal tester tracks.

EDUCATION
Bachelor of Technology in Computer Science | 2017 - 2021`,
  },
  {
    id: "ajay-kumar",
    name: "Ajay Kumar (Frontend & Mobile Developer)",
    fileName: "AJAYKUMAR.pdf",
    text: `AJAY KUMAR
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
CGPA: 7.5 CGPA`,
  },
  {
    id: "priya-data-science",
    name: "Dr. Priya Sharma (Data Science & ML)",
    fileName: "Priya_Sharma_DataScience_Resume.pdf",
    text: `Dr. Priya Sharma
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
Master of Science in Data Science | Columbia University | 2018`,
  },
  {
    id: "bob-minimal",
    name: "Bob Minimal (Low Detail & Formatting Issues)",
    fileName: "Bob_Minimal_Resume.txt",
    text: `Bob Minimal
Phone: 1234567890
Email: bob@test.com

Worked at company doing coding.
Knows python and html.
Did a project for school website.
Graduated college in 2020.`,
  },
];

export const SAMPLE_JOB_DESCRIPTIONS = [
  {
    id: "jd-fullstack",
    title: "Senior Full Stack Engineer",
    company: "Nexlify Cloud",
    role: "Senior Full Stack Engineer",
    text: `Job Title: Senior Full Stack Engineer
Company: Nexlify Cloud
Location: Remote / Hybrid

About the Role:
We are looking for an experienced Senior Full Stack Engineer to join our core engineering team. You will build and scale high-performance, distributed web applications and microservices.

Requirements & Core Tech Stack:
- Strong experience with React, TypeScript, JavaScript (ES6+), HTML5, and Tailwind CSS.
- Proven backend engineering with Node.js, Express.js, and REST APIs.
- Experience with distributed databases: MongoDB, Redis caching, and PostgreSQL.
- Cloud & Infrastructure: AWS, Docker containerization, CI/CD pipelines, and Microservices architecture.
- Hands-on experience with unit and integration testing (Jest, Cypress).
- Experience working with Agile/Scrum teams, conducting code reviews, and system design.

Responsibilities:
- Architect reliable and scalable user-facing web applications.
- Design microservices handling high concurrency and asynchronous messaging.
- Build CI/CD deployment pipelines on AWS and Docker.
- Collaborate across cross-functional product, design, and engineering teams.`,
  },
  {
    id: "jd-devops",
    title: "DevOps & Cloud Infrastructure Engineer",
    company: "CloudScale Systems",
    role: "DevOps & Cloud Engineer",
    text: `Job Title: DevOps & Cloud Infrastructure Engineer
Company: CloudScale Systems
Location: San Francisco, CA / Remote

About the Role:
We are seeking a DevOps Engineer to automate, scale, and secure our cloud infrastructure.

Key Requirements:
- Expert in Docker containerization and Kubernetes cluster orchestration.
- Cloud platforms: Amazon Web Services (AWS) or Google Cloud Platform (GCP).
- Infrastructure as Code (IaC) with Terraform.
- CI/CD automation with GitHub Actions and GitLab CI.
- Monitoring and telemetry with Prometheus, Grafana, and Datadog.
- Scripting in Python or Bash.
- Linux systems engineering and security best practices.`,
  },
  {
    id: "jd-python-backend",
    title: "Python Backend & AI Engineer",
    company: "DataVanguard",
    role: "Python Backend Engineer",
    text: `Job Title: Python Backend & AI Engineer
Company: DataVanguard
Location: New York, NY / Remote

About the Role:
Build scalable backend services, asynchronous queues, and AI-powered pipeline integrations.

Key Requirements:
- 3+ years with Python (FastAPI, Flask, or Django).
- PostgreSQL database design, query optimization, and Redis caching.
- Event-driven microservices architecture using Apache Kafka or RabbitMQ.
- Docker containers and cloud deployment on AWS or GCP.
- Familiarity with AI/LLM integrations, vector databases, and REST APIs.
- Strong problem-solving, code reviews, and unit testing practices.`,
  },
];

export default {
  SAMPLE_RESUMES,
  SAMPLE_JOB_DESCRIPTIONS,
};

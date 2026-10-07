// api/lib/roleTemplates.js
// Industry-standard role definitions and benchmark requirements for Role-Based ATS Analysis.
// Each role defines core skills, secondary skills, tools, expected keywords, and default roadmap topics.

export const SUPPORTED_ROLES = [
  {
    id: "frontend-developer",
    name: "Frontend Developer",
    category: "Engineering",
    summary: "Builds user-facing web applications with modern component libraries, responsive designs, and client-side state management.",
    coreSkills: ["JavaScript", "HTML5", "CSS3", "React", "TypeScript", "Tailwind CSS", "Git"],
    secondarySkills: ["Next.js", "Redux", "REST APIs", "Webpack", "Vite", "Responsive Design", "Jest"],
    advancedSkills: ["WebSockets", "CI/CD", "GraphQL", "Performance Optimization", "Micro-frontends", "Cypress"],
    expectedKeywords: [
      "component lifecycle",
      "state management",
      "responsive design",
      "dom manipulation",
      "accessibility",
      "a11y",
      "bundle optimization",
      "web vitals",
      "cross-browser compatibility",
    ],
    detectionKeywords: ["frontend", "front-end", "ui developer", "client-side", "react", "vue", "angular", "html5", "css3"],
    roadmap: [
      { week: 1, skill: "TypeScript", focus: "Static typing, generics, interface declarations, and type safety in components." },
      { week: 2, skill: "Next.js & SSR", focus: "Server-side rendering, static site generation, and App Router architecture." },
      { week: 3, skill: "State Management (Redux/Zustand)", focus: "Centralized state, async middleware, and optimistic UI updates." },
      { week: 4, skill: "Automated Testing (Jest & RTL)", focus: "Unit testing components, mocking API calls, and integration suites." },
      { week: 5, skill: "Performance & Web Vitals", focus: "Code splitting, image optimization, memoization, and LCP/CLS tuning." },
    ],
  },
  {
    id: "react-developer",
    name: "React Developer",
    category: "Engineering",
    summary: "Specializes in building modern Single Page Applications (SPAs) and component architectures using the React ecosystem.",
    coreSkills: ["React", "JavaScript", "TypeScript", "React Router", "Tailwind CSS", "Git", "HTML5"],
    secondarySkills: ["Redux", "Zustand", "Next.js", "REST APIs", "Vite", "Jest", "CSS Modules"],
    advancedSkills: ["React Query / TanStack", "WebSockets", "Docker", "CI/CD", "GraphQL", "Server Components"],
    expectedKeywords: [
      "hooks",
      "custom hooks",
      "virtual dom",
      "react context",
      "component modularity",
      "client state",
      "re-rendering optimization",
    ],
    detectionKeywords: ["react developer", "react.js developer", "reactjs", "react engineer", "redux", "react router"],
    roadmap: [
      { week: 1, skill: "TypeScript for React", focus: "Typing props, hooks, event handlers, and complex generic components." },
      { week: 2, skill: "State Architecture (Zustand / Redux)", focus: "Global store design, selector optimization, and persist middleware." },
      { week: 3, skill: "TanStack Query", focus: "Server-state caching, optimistic mutations, pagination, and background refetching." },
      { week: 4, skill: "Testing with React Testing Library", focus: "User-centric integration tests, mock service worker (MSW), and coverage." },
      { week: 5, skill: "Next.js App Router", focus: "Server components, server actions, caching strategies, and streaming SSR." },
    ],
  },
  {
    id: "backend-developer",
    name: "Backend Developer",
    category: "Engineering",
    summary: "Architects scalable server-side systems, REST/GraphQL APIs, database queries, and distributed microservices.",
    coreSkills: ["Node.js", "Express.js", "REST APIs", "SQL", "MongoDB", "PostgreSQL", "Git"],
    secondarySkills: ["Redis", "Docker", "JWT", "Authentication", "Microservices", "Python", "Linux"],
    advancedSkills: ["Kafka", "RabbitMQ", "AWS", "Kubernetes", "System Design", "CI/CD", "Database Indexing"],
    expectedKeywords: [
      "api contracts",
      "database normalization",
      "query optimization",
      "caching layer",
      "rate limiting",
      "data integrity",
      "concurrency",
      "distributed systems",
    ],
    detectionKeywords: ["backend", "back-end", "server-side", "api developer", "node.js", "express", "fastapi", "django", "spring boot"],
    roadmap: [
      { week: 1, skill: "PostgreSQL & Query Tuning", focus: "Indexing strategies, EXPLAIN ANALYZE, transactions, and foreign keys." },
      { week: 2, skill: "Redis Caching", focus: "Cache-aside pattern, session stores, TTL expiration, and Pub/Sub messaging." },
      { week: 3, skill: "Docker Containerization", focus: "Multi-stage Dockerfiles, container networking, and docker-compose setups." },
      { week: 4, skill: "Message Queues (RabbitMQ/Kafka)", focus: "Asynchronous task workers, event consumers, and message durability." },
      { week: 5, skill: "AWS Cloud Deployment", focus: "EC2 instances, S3 storage, RDS managed databases, and IAM security policies." },
    ],
  },
  {
    id: "nodejs-developer",
    name: "Node.js Developer",
    category: "Engineering",
    summary: "Engineers asynchronous, high-throughput microservices and APIs using Node.js, Express, and event-driven architecture.",
    coreSkills: ["Node.js", "JavaScript", "Express.js", "REST APIs", "MongoDB", "Git", "TypeScript"],
    secondarySkills: ["Socket.io", "PostgreSQL", "Redis", "JWT", "Mongoose", "Docker", "Jest"],
    advancedSkills: ["Microservices", "AWS", "CI/CD", "GraphQL", "NestJS", "Kafka", "Cluster Mode"],
    expectedKeywords: [
      "event loop",
      "asynchronous i/o",
      "streams and buffers",
      "middleware pipeline",
      "jwt authentication",
      "non-blocking",
      "cluster module",
    ],
    detectionKeywords: ["node.js developer", "node developer", "nodejs developer", "express.js", "nestjs", "socket.io"],
    roadmap: [
      { week: 1, skill: "TypeScript for Node.js", focus: "Strict typing, interface contracts, ts-node build workflows, and DTOs." },
      { week: 2, skill: "Redis & Session Cache", focus: "In-memory caching, rate limiters, session stores, and key evictions." },
      { week: 3, skill: "Docker & Container Isolation", focus: "Containerizing Node apps, volume mapping, and environment isolation." },
      { week: 4, skill: "Automated API Testing (Jest & Supertest)", focus: "Integration testing HTTP endpoints, mocking database fixtures, and auth flows." },
      { week: 5, skill: "Microservices & Message Queues", focus: "Decoupled services, RabbitMQ queues, and graceful shutdown handling." },
    ],
  },
  {
    id: "mern-stack-developer",
    name: "MERN Stack Developer",
    category: "Engineering",
    summary: "Delivers end-to-end full stack web applications utilizing MongoDB, Express.js, React, and Node.js.",
    coreSkills: ["MongoDB", "Express.js", "React", "Node.js", "JavaScript", "Tailwind CSS", "Git"],
    secondarySkills: ["TypeScript", "Redux", "REST APIs", "Socket.io", "JWT", "Mongoose", "Vercel"],
    advancedSkills: ["Docker", "Redis", "AWS", "CI/CD", "Next.js", "Microservices", "Jest"],
    expectedKeywords: [
      "full-stack architecture",
      "mern stack",
      "restful services",
      "crud operations",
      "client-server state",
      "nosql schemas",
      "token authentication",
    ],
    detectionKeywords: ["mern", "mern stack", "mongodb express react node", "full stack mern", "react and node"],
    roadmap: [
      { week: 1, skill: "TypeScript Migration", focus: "Add TypeScript across React client and Node/Express API routes." },
      { week: 2, skill: "Redis Caching Layer", focus: "Implement cache-aside for MongoDB queries to reduce database latency by 60%." },
      { week: 3, skill: "Docker Containerization", focus: "Create multi-container Docker compose environments for React, Node, and Mongo." },
      { week: 4, skill: "Automated CI/CD Pipeline", focus: "Set up GitHub Actions to run automated tests and deploy to cloud staging." },
      { week: 5, skill: "AWS Cloud Infrastructure", focus: "Deploy containerized MERN applications using AWS ECS/EC2 and S3 asset buckets." },
    ],
  },
  {
    id: "full-stack-developer",
    name: "Full Stack Developer",
    category: "Engineering",
    summary: "Engineers comprehensive web products spanning responsive browser clients, server services, and persistent databases.",
    coreSkills: ["JavaScript", "React", "Node.js", "TypeScript", "REST APIs", "SQL", "MongoDB", "Git"],
    secondarySkills: ["Tailwind CSS", "Express.js", "PostgreSQL", "Docker", "Next.js", "Redux", "Linux"],
    advancedSkills: ["AWS", "CI/CD", "Redis", "Kubernetes", "System Design", "Microservices", "GraphQL"],
    expectedKeywords: [
      "end-to-end delivery",
      "client-side rendering",
      "server architecture",
      "relational and nosql",
      "cross-functional",
      "continuous deployment",
      "system scalability",
    ],
    detectionKeywords: ["full stack", "fullstack", "full-stack engineer", "full stack software developer", "web developer"],
    roadmap: [
      { week: 1, skill: "TypeScript Mastery", focus: "Full-stack type sharing between API contracts and frontend views." },
      { week: 2, skill: "Relational DB & SQL Optimization", focus: "PostgreSQL query plans, foreign key indexing, and transaction safety." },
      { week: 3, skill: "Docker & Container Orchestration", focus: "Containerizing frontend and backend microservices with networking." },
      { week: 4, skill: "Redis In-Memory Caching", focus: "Speed up high-frequency API queries and manage user session tokens." },
      { week: 5, skill: "AWS Cloud & CI/CD Pipelines", focus: "Build GitHub Actions automated testing and continuous cloud delivery." },
    ],
  },
  {
    id: "software-engineer",
    name: "Software Engineer",
    category: "Engineering",
    summary: "Designs robust algorithmic software, core architectures, modular codebases, and maintainable enterprise services.",
    coreSkills: ["Data Structures", "Algorithms", "Git", "Object-Oriented Programming", "REST APIs", "SQL", "Unit Testing"],
    secondarySkills: ["Java", "Python", "C++", "JavaScript", "TypeScript", "System Design", "Linux"],
    advancedSkills: ["Distributed Systems", "Docker", "Kubernetes", "CI/CD", "Design Patterns", "Microservices"],
    expectedKeywords: [
      "data structures and algorithms",
      "design patterns",
      "clean code",
      "code review",
      "time complexity",
      "system reliability",
      "unit testing",
      "maintainability",
    ],
    detectionKeywords: ["software engineer", "software developer", "sde", "member of technical staff", "systems engineer", "core cs"],
    roadmap: [
      { week: 1, skill: "System Design Fundamentals", focus: "Load balancing, horizontal scaling, database sharding, and CAP theorem." },
      { week: 2, skill: "Concurrency & Multithreading", focus: "Thread safety, race conditions, async queues, and thread pools." },
      { week: 3, skill: "Docker & Production Containerization", focus: "Container build optimization, security scanning, and minimal base images." },
      { week: 4, skill: "Design Patterns in Practice", focus: "Factory, Singleton, Observer, Strategy, and Dependency Injection patterns." },
      { week: 5, skill: "Distributed Caching & Queues", focus: "Redis clusters, Kafka streaming, and eventual consistency models." },
    ],
  },
  {
    id: "data-analyst",
    name: "Data Analyst",
    category: "Analytics",
    summary: "Transforms raw corporate datasets into strategic dashboards, KPIs, business intelligence reports, and statistical insights.",
    coreSkills: ["SQL", "Excel", "Python", "Power BI", "Tableau", "Data Visualization", "Git"],
    secondarySkills: ["Pandas", "NumPy", "PostgreSQL", "Statistics", "Data Cleaning", "Matplotlib", "Seaborn"],
    advancedSkills: ["R", "BigQuery", "Snowflake", "ETL Pipelines", "A/B Testing", "Machine Learning Basics"],
    expectedKeywords: [
      "business intelligence",
      "kpi dashboards",
      "exploratory data analysis",
      "data cleaning",
      "statistical analysis",
      "sql joins",
      "pivot tables",
      "executive reporting",
    ],
    detectionKeywords: ["data analyst", "bi analyst", "business intelligence", "sql excel", "power bi", "tableau", "analytics"],
    roadmap: [
      { week: 1, skill: "Advanced SQL (Window Functions & CTEs)", focus: "Partitioning, lead/lag, row_number, and complex subqueries." },
      { week: 2, skill: "Python for Data Analysis (Pandas)", focus: "Data wrangling, missing value imputation, group-bys, and merges." },
      { week: 3, skill: "Power BI / Tableau Interactive Dashboards", focus: "DAX formulas, interactive slicers, drill-down charts, and executive metrics." },
      { week: 4, skill: "Statistical Analysis & Hypothesis Testing", focus: "P-values, confidence intervals, A/B testing protocols, and variance analysis." },
      { week: 5, skill: "Cloud Data Warehousing (BigQuery/Snowflake)", focus: "Querying cloud warehouses, partitioning tables, and cost-efficient queries." },
    ],
  },
  {
    id: "data-scientist",
    name: "Data Scientist",
    category: "Data Science",
    summary: "Develops predictive models, machine learning pipelines, deep learning algorithms, and data-driven intelligence solutions.",
    coreSkills: ["Python", "Machine Learning", "SQL", "Pandas", "NumPy", "Scikit-Learn", "Git"],
    secondarySkills: ["Statistics", "Data Visualization", "PyTorch", "TensorFlow", "PostgreSQL", "Jupyter", "Feature Engineering"],
    advancedSkills: ["Deep Learning", "Natural Language Processing (NLP)", "MLOps", "Docker", "AWS SageMaker", "Big Data", "Spark"],
    expectedKeywords: [
      "predictive modeling",
      "feature engineering",
      "model validation",
      "hyperparameter tuning",
      "cross-validation",
      "roc-auc",
      "loss functions",
      "data science pipeline",
    ],
    detectionKeywords: ["data scientist", "machine learning engineer", "ml engineer", "deep learning", "nlp", "computer vision", "pytorch"],
    roadmap: [
      { week: 1, skill: "Deep Learning Foundations (PyTorch)", focus: "Tensors, autograd, feedforward neural nets, and loss backpropagation." },
      { week: 2, skill: "Feature Engineering & Dimensionality Reduction", focus: "PCA, t-SNE, scaling techniques, and feature selection methodologies." },
      { week: 3, skill: "MLOps & Model Serialization", focus: "Packaging models with ONNX, MLflow experiment tracking, and FastAPI serving." },
      { week: 4, skill: "Docker Containerization for ML", focus: "Reproducible inference containers, CUDA drivers, and lightweight base images." },
      { week: 5, skill: "Cloud ML Deployment (AWS / GCP)", focus: "Deploying inference microservices to cloud endpoints with auto-scaling." },
    ],
  },
  {
    id: "devops-engineer",
    name: "DevOps Engineer",
    category: "Infrastructure",
    summary: "Automates continuous integration, cloud infrastructure, container orchestration, monitoring, and platform reliability.",
    coreSkills: ["Linux", "Docker", "CI/CD", "Git", "Bash / Shell", "AWS", "Python"],
    secondarySkills: ["Kubernetes", "Terraform", "GitHub Actions", "Prometheus", "Grafana", "Networking", "Security"],
    advancedSkills: ["Ansible", "Helm", "GCP", "Site Reliability Engineering (SRE)", "Infrastructure as Code", "ArgoCD"],
    expectedKeywords: [
      "infrastructure as code",
      "container orchestration",
      "continuous integration",
      "continuous deployment",
      "observability",
      "high availability",
      "cloud security",
      "iac pipelines",
    ],
    detectionKeywords: ["devops", "cloud engineer", "sre", "site reliability", "infrastructure engineer", "kubernetes", "terraform", "aws cloud"],
    roadmap: [
      { week: 1, skill: "Kubernetes Cluster Administration", focus: "Pods, Deployments, Services, Ingress controllers, and Helm charts." },
      { week: 2, skill: "Terraform Infrastructure as Code", focus: "State management, modules, remote backends, and cloud resource provisioning." },
      { week: 3, skill: "Production CI/CD Pipelines", focus: "GitHub Actions matrix builds, artifact caching, container registries, and CD." },
      { week: 4, skill: "Observability & Monitoring (Prometheus & Grafana)", focus: "Metric scraping, custom dashboards, alertmanager rules, and SLAs/SLOs." },
      { week: 5, skill: "Cloud Security & Secrets Management", focus: "Vault, AWS IAM roles, least privilege policies, and container vulnerability scanning." },
    ],
  },
  {
    id: "ui-ux-designer",
    name: "UI/UX Designer",
    category: "Design",
    summary: "Crafts intuitive digital user journeys, design systems, wireframes, interactive prototypes, and usability testing studies.",
    coreSkills: ["Figma", "UI Design", "UX Design", "Wireframing", "Prototyping", "User Research", "Design Systems"],
    secondarySkills: ["User Flows", "Information Architecture", "HTML5", "CSS3", "Adobe XD", "Usability Testing", "Accessibility"],
    advancedSkills: ["Micro-interactions", "Design Tokens", "Design Handoff", "Motion Design", "Design Thinking", "A/B Testing"],
    expectedKeywords: [
      "user journey maps",
      "design system tokens",
      "usability testing",
      "information architecture",
      "wireframes and prototypes",
      "heuristic evaluation",
      "wcag accessibility",
    ],
    detectionKeywords: ["ui/ux", "ux designer", "ui designer", "product designer", "figma", "wireframing", "prototyping", "user experience"],
    roadmap: [
      { week: 1, skill: "Advanced Figma Component Architecture", focus: "Auto-layout, interactive variants, design tokens, and library publishing." },
      { week: 2, skill: "Design Systems & Tokens", focus: "Color systems, typography scales, spacing tokens, and developer handoff specs." },
      { week: 3, skill: "Usability Testing & User Research", focus: "Conducting user interviews, usability audits, heatmaps, and feedback synthesis." },
      { week: 4, skill: "Micro-interactions & Prototyping", focus: "Smart animate, state transitions, interactive component states, and motion." },
      { week: 5, skill: "Accessibility & WCAG Compliance", focus: "Contrast ratios, screen reader hierarchies, focus states, and inclusive design." },
    ],
  },
];

export const ROLE_IDS = SUPPORTED_ROLES.map((r) => r.id);
export const ROLE_NAMES = SUPPORTED_ROLES.map((r) => r.name);

/**
 * Finds a role template by ID or normalized name.
 */
export function getRoleTemplate(roleIdentifier = "") {
  if (!roleIdentifier || typeof roleIdentifier !== "string") {
    return SUPPORTED_ROLES.find((r) => r.id === "full-stack-developer");
  }

  const normalized = roleIdentifier.trim().toLowerCase().replace(/[-_]/g, " ");

  // Direct ID match
  const byId = SUPPORTED_ROLES.find((r) => r.id === roleIdentifier.trim().toLowerCase());
  if (byId) return byId;

  // Name match
  const byName = SUPPORTED_ROLES.find((r) => r.name.toLowerCase() === normalized);
  if (byName) return byName;

  // Fuzzy match on name or aliases
  const byFuzzy = SUPPORTED_ROLES.find((r) => {
    const rName = r.name.toLowerCase();
    return rName.includes(normalized) || normalized.includes(rName);
  });
  if (byFuzzy) return byFuzzy;

  // Keyword match
  const byKeywords = SUPPORTED_ROLES.find((r) =>
    r.detectionKeywords.some((k) => normalized.includes(k) || k.includes(normalized))
  );
  if (byKeywords) return byKeywords;

  return SUPPORTED_ROLES.find((r) => r.id === "full-stack-developer");
}

export default {
  SUPPORTED_ROLES,
  ROLE_IDS,
  ROLE_NAMES,
  getRoleTemplate,
};

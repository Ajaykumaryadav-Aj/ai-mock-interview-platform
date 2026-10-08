// src/data/landingPagesData.js
// Structured SEO content and metadata for all intent-targeted landing pages

export const LANDING_PAGES = {
  "ai-mock-interview": {
    slug: "ai-mock-interview",
    title: "AI Mock Interview Online Practice | MocInterview",
    description:
      "Practice realistic AI mock interviews with adaptive questions, voice answers, instant objective scoring, and benchmark model answers.",
    h1: "Intelligent AI Mock Interview Simulation & Real-Time Evaluation",
    subtitle:
      "Experience high-stakes hiring rounds guided by generative AI. Get adaptive questioning, voice-enabled interaction, instant objective grading, and benchmark response analysis.",
    category: "AI Simulation",
    badge: "AI-Powered Simulation",
    heroImage: "/assets/img/hero.jpg",
    overview:
      "What makes an AI mock interview different from a traditional mock interview? Rather than relying on rigid static question banks or costly human coaching sessions that require days to schedule, an AI mock interview creates a dynamic, conversational simulation. Our generative AI engine ingests your job title, experience level, and tech stack to ask adaptive questions in real time. It evaluates your spoken or written answers against thousands of industry standards, delivering objective scoring, communication feedback, and ideal sample answers instantly.",
    keyTakeaways: [
      "Adaptive AI question generation calibrated dynamically to your target job role, tech stack, and seniority",
      "Real-time voice and text capture with instant diagnostic feedback on technical accuracy and delivery",
      "Objective AI scoring across technical competency, communication clarity, and problem solving",
      "Exemplary model benchmark answers provided for every generated interview question",
    ],
    curriculum: [
      {
        title: "Adaptive Role-Calibrated Questions",
        description: "In-depth questions dynamically tailored to your exact seniority level, tech stack, and job specifications.",
      },
      {
        title: "Interactive Voice & Text Simulation",
        description: "Answer verbally using speech recognition or via text input to replicate actual conversational hiring rounds.",
      },
      {
        title: "Instant Diagnostic Evaluation",
        description: "Detailed scoring breakdown out of 10 highlighting technical accuracy, structure, and communication depth.",
      },
      {
        title: "Model Benchmark Answers",
        description: "Review line-by-line exemplar responses to understand how top candidates frame their solutions.",
      },
    ],
    faqs: [
      {
        question: "What makes an AI mock interview different from a normal mock interview?",
        answer:
          "A normal mock interview is typically conducted with a human peer or coach, requiring advance scheduling, high costs, and often resulting in subjective opinions. An AI mock interview is available 24/7 on demand, generates customized questions calibrated to your specific profile, and applies consistent, objective benchmarks to score your technical accuracy, clarity, and delivery immediately.",
      },
      {
        question: "How does MocInterview evaluate my spoken answers?",
        answer:
          "Our AI leverages natural language understanding to evaluate the technical substance, logical flow, conciseness, and depth of your answers. It compares your explanation against vetted industry benchmarks to provide constructive suggestions and a line-by-line model answer.",
      },
      {
        question: "Can I choose between a full AI simulation and repetitive practice drills?",
        answer:
          "Yes. The AI Mock Interview track simulates a complete hiring interview from start to finish. If you prefer to repeat individual questions and drill specific concepts with unlimited retakes, you can use our AI interview practice mode.",
      },
    ],
    contextualCallout: {
      title: "Need a different interview preparation format?",
      description:
        "Looking for a broad overview of online interview preparation, or want repetitive question drills to target specific weaknesses?",
      links: [
        { label: "Prefer a traditional online mock interview?", href: "/mock-interview" },
        { label: "Want focused AI interview practice?", href: "/ai-interview-practice" },
      ],
    },
    relatedSlugs: ["mock-interview", "ai-interview-practice", "interview-preparation", "technical-interview"],
  },

  "mock-interview": {
    slug: "mock-interview",
    title: "Online Mock Interview Practice | MocInterview",
    description:
      "Practice realistic online mock interviews, overcome anxiety, and structure winning answers for engineering and HR rounds.",
    h1: "Online Mock Interviews to Prepare for Real-World Hiring Rounds",
    subtitle:
      "Eliminate interview anxiety through realistic online interview simulation. Rehearse real-world question formats, structure articulate answers, and build confidence before your real interview.",
    category: "Simulation",
    badge: "Online Interview Prep",
    heroImage: "/assets/img/hero.jpg",
    overview:
      "An online mock interview is a comprehensive rehearsal designed to prepare job seekers for the pacing, format, and emotional pressure of a real employer interview. Unlike casual reading or memorizing question lists, practicing an online interview forces you to retrieve knowledge under time constraints, articulate thoughts clearly, and manage nervous energy. MocInterview provides an accessible, pressure-tested environment to practice professional storytelling, master behavioral responses, and verify your readiness before walking into high-stakes hiring rounds.",
    keyTakeaways: [
      "Authentic rehearsal simulating the pressure, timing, and structure of modern employer interviews",
      "Eliminates interview anxiety and hesitation through repetitive, realistic rehearsal",
      "Safe, judgement-free environment to test answers, refine storytelling, and polish delivery",
      "Permanent record of your interview history, transcripts, and progress milestones",
    ],
    curriculum: [
      {
        title: "Interview Format & Etiquette",
        description: "Replicate modern remote video interview conditions and professional question pacing.",
      },
      {
        title: "Comprehensive Question Rehearsal",
        description: "Practice introductory pitches, behavioral STAR stories, and core competency questions.",
      },
      {
        title: "Active Recall Under Time Pressure",
        description: "Train your ability to structure cohesive thoughts on the spot without reading from notes.",
      },
      {
        title: "Comprehensive Confidence Review",
        description: "Review transcripts and performance notes to gauge readiness before interview day.",
      },
    ],
    faqs: [
      {
        question: "What is an online mock interview and why is it important?",
        answer:
          "An online mock interview is a structured practice session that mirrors the conditions of an actual job interview. It bridges the gap between theoretical knowledge and real-time verbal communication, helping candidates organize their thoughts, overcome anxiety, and practice professional delivery in a safe environment.",
      },
      {
        question: "How does an online mock interview help reduce interview anxiety?",
        answer:
          "Anxiety often stems from the unpredictability of questions and fear of stumbling under pressure. Practicing online desensitizes you to the interview setting, builds muscle memory for articulating past achievements, and gives you certainty in your speaking cadence.",
      },
      {
        question: "How does this general mock interview track compare to AI simulation or drills?",
        answer:
          "This track focuses on the holistic interview experience—building general readiness, professional presence, and question-answer fluency. For dynamic real-time AI scoring, explore our AI mock interview, or for question-by-question skill drills, try our AI interview practice platform.",
      },
    ],
    contextualCallout: {
      title: "Explore specialized practice formats",
      description:
        "Looking for automated AI scoring or focused question-by-question drills with unlimited retries?",
      links: [
        { label: "Looking for an AI-powered interview experience?", href: "/ai-mock-interview" },
        { label: "Want to practice specific interview questions repeatedly?", href: "/ai-interview-practice" },
      ],
    },
    relatedSlugs: ["ai-mock-interview", "ai-interview-practice", "interview-preparation", "fresher-interview"],
  },

  "ai-interview-practice": {
    slug: "ai-interview-practice",
    title: "AI Interview Practice | Targeted Question Drills & Skill Improvement",
    description:
      "Master tough interview questions through repeated AI interview practice drills. Target weak areas, get instant actionable feedback, and refine your answers with unlimited retries.",
    h1: "Targeted AI Interview Practice for Continuous Skill Improvement",
    subtitle:
      "Turn interview weaknesses into strengths. Drill specific technical and behavioral questions, get immediate feedback on each response, and practice until your delivery is flawless.",
    category: "Practice Drills",
    badge: "Targeted Drills",
    heroImage: "/assets/img/office.jpg",
    overview:
      "AI interview practice focuses on the deliberate, repeated practice of individual questions and competencies rather than a single full-length mock simulation. Think of a mock interview as a full dress rehearsal, while AI interview practice is the focused batting cage where you isolate weak spots. With rapid practice-feedback-improvement loops, you can rehearse a challenging system design trade-off, refine a behavioral story, or polish your technical phrasing with unlimited retries and instant critique.",
    keyTakeaways: [
      "Focused question-by-question practice with unlimited retakes to build muscle memory",
      "Rapid feedback loop: Answer → Instant AI Critique → Model Answer → Re-try",
      "Targeted drills to isolate weak areas in technical explanations, STAR framework, or conciseness",
      "Granular feedback highlighting missing concepts, structural flaws, and filler words",
    ],
    curriculum: [
      {
        title: "Targeted Question Drills",
        description: "Isolate specific competency areas, from tricky coding trade-offs to situational conflict questions.",
      },
      {
        title: "Continuous Feedback Loop",
        description: "Receive instantaneous critique highlighting missing keywords and conceptual oversights.",
      },
      {
        title: "Unlimited Answer Retries",
        description: "Iterate on your response immediately using the provided model answer as a guide.",
      },
      {
        title: "Pacing & Articulation Drills",
        description: "Practice eliminating filler words, tightening explanations, and maintaining confident cadence.",
      },
    ],
    faqs: [
      {
        question: "What is the difference between AI interview practice and an AI mock interview?",
        answer:
          "AI interview practice is designed for repetitive, targeted skill drills where you can answer, review feedback, and re-attempt individual questions until perfected. An AI mock interview, by contrast, is a complete simulated round that mimics the full chronological flow of an actual interview from beginning to end.",
      },
      {
        question: "Can I re-record my answers multiple times during practice?",
        answer:
          "Yes. In practice mode, you have unlimited retries on every single question. You can review the AI's diagnostic feedback and exemplar benchmark answer, adjust your response, and re-record until you achieve top-tier clarity.",
      },
      {
        question: "How does targeted question practice help improve performance?",
        answer:
          "Deliberate practice accelerates learning by isolating specific failure points—such as rambling, failing to use the STAR method, or omitting key technical terminology—allowing you to correct them before doing a full mock interview.",
      },
    ],
    contextualCallout: {
      title: "Ready for a complete simulation or general prep?",
      description:
        "Once you've drilled your key questions, test your end-to-end performance in a timed simulation.",
      links: [
        { label: "Ready for an AI mock interview simulation?", href: "/ai-mock-interview" },
        { label: "Explore general online mock interview prep", href: "/mock-interview" },
      ],
    },
    relatedSlugs: ["ai-mock-interview", "mock-interview", "technical-interview", "hr-interview"],
  },

  "interview-preparation": {
    slug: "interview-preparation",
    title: "Interview Preparation Online | Comprehensive Job Prep with AI",
    description:
      "Complete online interview preparation toolkit. Master behavioral frameworks, technical deep-dives, and resume alignment to land your dream offer.",
    h1: "End-to-End Online Interview Preparation with AI",
    subtitle:
      "From resume verification to the final executive round, prepare systematically with AI-driven insights designed to get you hired.",
    category: "Preparation",
    badge: "Complete Toolkit",
    heroImage: "/assets/img/office.jpg",
    overview:
      "Job hunting is demanding. Candidates often struggle with knowing what questions to expect, how deep to go with technical explanations, and how to frame past achievements. MocInterview provides structured interview preparation that removes guesswork.",
    keyTakeaways: [
      "Job description ingestion: paste the role description to generate tailored questions",
      "STAR methodology coaching for behavioral and leadership interviews",
      "Confidence building through repeatable, low-stress practice",
      "Comprehensive scoring metrics across technical, communication, and problem-solving pillars",
    ],
    curriculum: [
      {
        title: "Job Description Alignment",
        description: "Map your skills directly to the key requirements of the position you are targeting.",
      },
      {
        title: "Competency Drills",
        description: "Targeted rounds focusing on domain mastery, troubleshooting, and edge-case handling.",
      },
      {
        title: "Behavioral Alignment",
        description: "Craft convincing stories that prove your leadership, resilience, and adaptability.",
      },
    ],
    faqs: [
      {
        question: "How long should I prepare before my actual interview?",
        answer:
          "We recommend doing 3 to 5 targeted mock interviews over the course of a week before your interview date. This allows you to identify gaps, refine your elevator pitch, and build muscle memory for verbalizing technical concepts.",
      },
    ],
    relatedSlugs: ["ai-mock-interview", "technical-interview", "behavioral-interview", "resume-interview"],
  },

  "technical-interview": {
    slug: "technical-interview",
    title: "Technical Mock Interview Online | Coding & System Design Practice",
    description:
      "Ace your technical interview rounds. Practice software engineering, coding concepts, data structures, algorithms, and system design with AI evaluation.",
    h1: "Technical Mock Interviews for Software Engineers",
    subtitle:
      "Master coding fundamentals, system architecture, database trade-offs, and software design patterns with an AI interviewer that knows code.",
    category: "Technical",
    badge: "Engineers & Tech",
    heroImage: "/assets/img/hero.jpg",
    overview:
      "Technical interviews require both deep conceptual understanding and clear technical communication. It is not enough to write code; you must explain your time and space complexities, trade-offs, and scalability choices clearly.",
    keyTakeaways: [
      "Full coverage of frontend, backend, fullstack, mobile, and DevOps roles",
      "In-depth questions on data structures, algorithms, APIs, and microservices",
      "Evaluation of architectural trade-offs, edge-cases, and optimization",
      "AI analysis of your technical vocabulary and conceptual accuracy",
    ],
    curriculum: [
      {
        title: "Data Structures & Core Algorithms",
        description: "Verbalize complexity trade-offs, memory implications, and optimal algorithmic approaches.",
      },
      {
        title: "System Architecture & API Design",
        description: "Discuss REST vs GraphQL, caching strategies, horizontal scaling, and SQL vs NoSQL selections.",
      },
      {
        title: "Debugging & Production Incidents",
        description: "Demonstrate systematic troubleshooting methodologies under simulated production failure scenarios.",
      },
    ],
    faqs: [
      {
        question: "Does the technical interview test coding or concepts?",
        answer:
          "MocInterview focuses heavily on conceptual mastery, design decisions, architectural trade-offs, and verbal technical communication—the primary differentiator in modern senior and mid-level technical screenings.",
      },
    ],
    relatedSlugs: ["software-developer-interview", "frontend-interview", "react-interview", "javascript-interview"],
  },

  "hr-interview": {
    slug: "hr-interview",
    title: "HR Mock Interview Online | Practice HR Questions & Answers",
    description:
      "Prepare for HR screening rounds with realistic AI questions. Perfect your answers for salary expectations, career goals, strengths, and company fit.",
    h1: "Master the HR Interview Round with AI Practice",
    subtitle:
      "Don't let the HR screening filter you out. Learn how to articulate your career trajectory, culture fit, and salary discussions with calm confidence.",
    category: "HR",
    badge: "Culture & Screening",
    heroImage: "/assets/img/office.jpg",
    overview:
      "The HR round is the critical first gatekeeper of any hiring pipeline. Recruiters assess cultural alignment, communication poise, career stability, and salary expectations. MocInterview helps you practice these questions so you never sound unprepared.",
    keyTakeaways: [
      "Master the classic HR questions: 'Why this company?', 'Where do you see yourself in 5 years?', and 'Why are you leaving?'",
      "Learn how to address employment gaps or career transitions positively",
      "Practice confident negotiation framing around compensation and role scope",
      "Receive objective grading on professional tone, enthusiasm, and coherence",
    ],
    curriculum: [
      {
        title: "Introduction & Career Narrative",
        description: "Deliver a compelling, focused summary of your career journey without unnecessary tangents.",
      },
      {
        title: "Motivation & Company Fit",
        description: "Demonstrate research, passion for the company mission, and authentic cultural alignment.",
      },
      {
        title: "Compensation & Logistics",
        description: "Answer questions about notice period, relocation, and salary expectations professionally.",
      },
    ],
    faqs: [
      {
        question: "Can freshers practice HR rounds on MocInterview?",
        answer:
          "Absolutely! We have specialized HR question tracks for freshers focusing on academic background, internships, extracurricular leadership, and enthusiasm to learn.",
      },
    ],
    relatedSlugs: ["behavioral-interview", "fresher-interview", "ai-mock-interview", "interview-preparation"],
  },

  "behavioral-interview": {
    slug: "behavioral-interview",
    title: "Behavioral Mock Interview Online | STAR Method Practice with AI",
    description:
      "Master behavioral interviews using the STAR method (Situation, Task, Action, Result). Practice leadership, conflict resolution, and teamwork questions.",
    h1: "Behavioral Mock Interviews Powered by the STAR Method",
    subtitle:
      "Prove your impact. Structure compelling answers for leadership, teamwork, cross-functional collaboration, and overcoming failure.",
    category: "Behavioral",
    badge: "STAR Framework",
    heroImage: "/assets/img/office.jpg",
    overview:
      "Companies like Amazon, Google, Microsoft, and top startups place massive weight on behavioral interviews. The key to winning these rounds is structured storytelling using the STAR framework: Situation, Task, Action, and Result.",
    keyTakeaways: [
      "Instant feedback on whether your answers clearly articulated Action and quantifiable Results",
      "Preparation for high-frequency themes: conflict resolution, tight deadlines, and ambiguous requirements",
      "Guidance on keeping stories concise and focused on personal contribution",
      "Scoring based on leadership principles and emotional intelligence",
    ],
    curriculum: [
      {
        title: "Conflict Resolution & Team Friction",
        description: "Explain how you navigated disagreements with colleagues or managers constructively.",
      },
      {
        title: "Handling Failure & Resilience",
        description: "Frame past missteps as powerful learning experiences and demonstrate accountability.",
      },
      {
        title: "Delivering Under Pressure",
        description: "Showcase prioritization, stakeholder communication, and calm execution during tight timelines.",
      },
    ],
    faqs: [
      {
        question: "What is the STAR method?",
        answer:
          "The STAR method is an interview framework: Situation (set the context), Task (describe your responsibility), Action (explain the specific steps you took), and Result (share the outcome, ideally with measurable numbers).",
      },
    ],
    relatedSlugs: ["hr-interview", "software-developer-interview", "ai-mock-interview", "interview-preparation"],
  },

  "software-developer-interview": {
    slug: "software-developer-interview",
    title: "Software Developer Mock Interview | Practice Tech Rounds with AI",
    description:
      "Practice comprehensive software developer interviews covering full-stack architecture, clean code, design patterns, and engineering trade-offs.",
    h1: "Software Developer Mock Interviews for Modern Engineers",
    subtitle:
      "From junior coder to staff engineer: practice end-to-end software development interviews with realistic technical challenges and instant grading.",
    category: "Roles",
    badge: "Developers",
    heroImage: "/assets/img/hero.jpg",
    overview:
      "Software developer interviews have evolved beyond rote algorithm memorization. Today's top tech teams look for pragmatic problem-solving, clean code principles, testability, distributed systems intuition, and team collaboration.",
    keyTakeaways: [
      "Covers frontend, backend, database design, and cloud deployments",
      "Questions tailored to specific language ecosystems: JavaScript, TypeScript, Python, Java, Go",
      "Evaluation on performance optimization, concurrency, and security practices",
      "Instant benchmark solutions showing optimal design patterns",
    ],
    curriculum: [
      {
        title: "Object-Oriented & Functional Design",
        description: "SOLID principles, modularity, composition over inheritance, and design patterns.",
      },
      {
        title: "API Design & Microservices",
        description: "RESTful principles, idempotent operations, authentication schemes, and rate limiting.",
      },
      {
        title: "Data Persistence & Caching",
        description: "Indexing strategies, query optimization, ACID guarantees, and distributed caching with Redis.",
      },
    ],
    faqs: [
      {
        question: "Which languages and frameworks are supported?",
        answer:
          "MocInterview supports all major engineering stacks including JavaScript, React, Node.js, Python, Java, C++, Go, Flutter, SQL, MongoDB, and AWS.",
      },
    ],
    relatedSlugs: ["technical-interview", "frontend-interview", "react-interview", "javascript-interview"],
  },

  "frontend-interview": {
    slug: "frontend-interview",
    title: "Frontend Developer Mock Interview | HTML, CSS, JS & Web Performance",
    description:
      "Practice frontend developer mock interviews. Prepare for DOM manipulation, CSS layouts, Web APIs, accessibility, and modern client architecture.",
    h1: "Frontend Developer Mock Interviews & Practice",
    subtitle:
      "Master the modern web stack. Practice core JavaScript, CSS architectures, browser rendering pipelines, and state management with AI feedback.",
    category: "Roles",
    badge: "Frontend Tech",
    heroImage: "/assets/img/hero.jpg",
    overview:
      "Frontend engineering interviews require a fine balance between deep JavaScript fundamentals, CSS mastery, browser internals, and user experience intuition. MocInterview prepares you to tackle complex frontend challenges with authority.",
    keyTakeaways: [
      "In-depth questions on the Event Loop, asynchronous JS, closures, and prototypes",
      "CSS Grid, Flexbox, responsive design, and CSS performance optimization",
      "Web accessibility (a11y), WCAG compliance, and semantic HTML5",
      "Critical rendering path, Core Web Vitals, and bundle size reduction",
    ],
    curriculum: [
      {
        title: "Browser Internals & Rendering",
        description: "Understand reflows, repaints, composite layers, and how browsers parse HTML/CSS into pixels.",
      },
      {
        title: "Modern JavaScript Deep-Dive",
        description: "Promises, async/await, generators, modules, memory leaks, and garbage collection.",
      },
      {
        title: "Web Performance & Metrics",
        description: "LCP, FID/INP, CLS, code splitting, lazy loading, and asset optimization techniques.",
      },
    ],
    faqs: [
      {
        question: "Are frontend framework questions included?",
        answer:
          "Yes! You can specify React, Vue, Angular, or vanilla JavaScript when configuring your frontend mock interview.",
      },
    ],
    relatedSlugs: ["react-interview", "javascript-interview", "software-developer-interview", "technical-interview"],
  },

  "react-interview": {
    slug: "react-interview",
    title: "React Mock Interview Practice | Hooks, State, Fiber & Performance",
    description:
      "Prepare for React.js interviews. Practice questions on Hooks, reconciliation, custom hooks, context, state management, and Server Components with AI.",
    h1: "React Developer Mock Interview Practice with AI",
    subtitle:
      "Crack your React interview. Master Hooks, Virtual DOM, Fiber architecture, state management patterns, and render optimizations.",
    category: "Roles",
    badge: "React.js",
    heroImage: "/assets/img/hero.jpg",
    overview:
      "React remains the undisputed king of web UI development. Interviewers expect candidates to understand not just how to call `useEffect`, but how the Fiber reconciler schedules updates, how to prevent unnecessary re-renders, and how to structure scalable state.",
    keyTakeaways: [
      "Mastery of `useState`, `useEffect`, `useCallback`, `useMemo`, `useRef`, and `useReducer`",
      "Deep understanding of reconciliation, keys, batching, and concurrent rendering",
      "State management comparisons: Context API vs Zustand vs Redux Toolkit",
      "React performance profiling and memoization techniques",
    ],
    curriculum: [
      {
        title: "React Lifecycle & Hooks Internals",
        description: "Rules of Hooks, dependency arrays, stale closures, and creating custom reusable hooks.",
      },
      {
        title: "Component Architecture & Patterns",
        description: "Compound components, render props, higher-order components, and container/presentational separation.",
      },
      {
        title: "React 18 & Server Components",
        description: "Automatic batching, transitions (`useTransition`), Suspense for data fetching, and SSR concepts.",
      },
    ],
    faqs: [
      {
        question: "What are the most common React interview questions?",
        answer:
          "High-frequency React questions include explaining the Virtual DOM and reconciliation, differences between `useCallback` and `useMemo`, managing prop drilling, and handling asynchronous side-effects properly.",
      },
    ],
    relatedSlugs: ["frontend-interview", "javascript-interview", "software-developer-interview", "technical-interview"],
  },

  "javascript-interview": {
    slug: "javascript-interview",
    title: "JavaScript Mock Interview Practice | MocInterview",
    description:
      "Master JavaScript technical interviews. Practice Event Loop, closures, prototypes, promises, and async/await with instant AI scoring.",
    h1: "JavaScript Mock Interview Online Practice",
    subtitle:
      "Deepen your JavaScript expertise. Conquer closures, prototypes, hoisting, the microtask queue, and modern ECMAScript features.",
    category: "Roles",
    badge: "Core JavaScript",
    heroImage: "/assets/img/hero.jpg",
    overview:
      "Regardless of whether you build with React, Node.js, Vue, or Next.js, mastering JavaScript fundamentals is mandatory. Hiring managers use JavaScript deep-dives to quickly separate surface-level coders from true engineers.",
    keyTakeaways: [
      "Master the Event Loop, Call Stack, Microtask Queue, and Task Queue",
      "Understand lexical scoping, closures, IIFEs, and execution contexts",
      "Demystify `this` binding (`call`, `apply`, `bind`, and arrow functions)",
      "Deep-dive into prototypes, prototypal inheritance, and ES6 classes",
    ],
    curriculum: [
      {
        title: "Execution Context & Memory Management",
        description: "Variable environment, lexical environment, scope chains, and garbage collection algorithms.",
      },
      {
        title: "Asynchronous JavaScript Mastery",
        description: "Event Loop choreography, Promise chaining, error handling with async/await, and `Promise.allSettled`.",
      },
      {
        title: "Modern ES6+ Capabilities",
        description: "Destructuring, spread/rest, Sets, Maps, WeakMaps, optional chaining, and nullish coalescing.",
      },
    ],
    faqs: [
      {
        question: "How does the AI grade my JavaScript explanations?",
        answer:
          "The AI evaluates whether you accurately mention the underlying mechanics (e.g. referencing the microtask queue for Promises rather than just saying 'it runs later') and checks for clear code examples in your verbal explanation.",
      },
    ],
    relatedSlugs: ["frontend-interview", "react-interview", "software-developer-interview", "technical-interview"],
  },

  "flutter-interview": {
    slug: "flutter-interview",
    title: "Flutter Mock Interview Online | Dart, Widgets, BLoC & State Prep",
    description:
      "Practice Flutter and Dart mock interviews with AI. Master widget trees, state management (BLoC, Riverpod, Provider), asynchronous Dart, and app performance.",
    h1: "Flutter & Dart Mock Interview Practice Platform",
    subtitle:
      "Prepare for high-paying mobile developer roles. Master Widget lifecycle, BuildContext, Flutter architecture, and responsive mobile UI.",
    category: "Roles",
    badge: "Mobile & Flutter",
    heroImage: "/assets/img/hero.jpg",
    overview:
      "Flutter is the premier multi-platform mobile framework. Mobile engineering interviewers look for candidates who understand Flutter's rendering pipeline (Widget -> Element -> RenderObject), state management architecture, platform channels, and memory optimization.",
    keyTakeaways: [
      "In-depth questions on Dart streams, futures, isolates, and event loops",
      "State management comparisons: BLoC, Cubit, Riverpod, and Provider",
      "Flutter rendering engine: Skia, Impeller, and the 3-tree architecture",
      "Native platform channels and background services on iOS and Android",
    ],
    curriculum: [
      {
        title: "Widget Architecture & Lifecycle",
        description: "Stateless vs Stateful widgets, `didUpdateWidget`, `dispose`, and keys (`ValueKey`, `GlobalKey`).",
      },
      {
        title: "State Management & Clean Architecture",
        description: "Separation of concerns using BLoC pattern, repository patterns, and dependency injection with GetIt.",
      },
      {
        title: "Performance Optimization & Profiling",
        description: "Reducing widget rebuilds, `const` constructors, image caching, and eliminating UI jank.",
      },
    ],
    faqs: [
      {
        question: "Does MocInterview ask about Dart language fundamentals?",
        answer:
          "Yes! Questions cover Dart null safety, mixins, extension methods, asynchronous streams, and isolate-based concurrency alongside Flutter UI questions.",
      },
    ],
    relatedSlugs: ["software-developer-interview", "technical-interview", "ai-mock-interview", "fresher-interview"],
  },

  "fresher-interview": {
    slug: "fresher-interview",
    title: "Mock Interview for Freshers | College Graduates Job Prep with AI",
    description:
      "AI mock interview platform designed specifically for college freshers and entry-level job seekers. Practice foundational coding, CS basics, and HR rounds.",
    h1: "AI Mock Interviews for Freshers & College Graduates",
    subtitle:
      "Turn graduation into job offers. Build interview confidence with foundational CS questions, project explanations, and entry-level HR drills.",
    category: "Freshers",
    badge: "College to Career",
    heroImage: "/assets/img/hero.jpg",
    overview:
      "Landing your first job out of college is intimidating. Freshers often struggle with verbalizing their academic projects, answering core CS questions (OOPs, DBMS, OS, Networks), and handling HR screenings with confidence. MocInterview gives you a private space to rehearse until you're ready.",
    keyTakeaways: [
      "Foundational computer science topics: OOPs concepts, SQL queries, normalization, and basic data structures",
      "Guidance on explaining final-year projects and capstones with technical clarity",
      "Friendly, encouraging AI evaluation that highlights your positive qualities while giving actionable improvement steps",
      "Practice for common fresher HR questions: 'Why should we hire you?', 'Strengths and weaknesses', and 'Tell me about yourself'",
    ],
    curriculum: [
      {
        title: "CS Fundamentals & Core Concepts",
        description: "OOPs (Inheritance, Polymorphism, Encapsulation, Abstraction), SQL joins, and basic time complexity.",
      },
      {
        title: "Project Presentation & Deep-Dive",
        description: "Practice explaining your tech stack choices, individual contributions, and challenges overcome in student projects.",
      },
      {
        title: "Aptitude & Soft Skills Communication",
        description: "Clarity of thought, enthusiasm to learn, adaptability, and professional communication.",
      },
    ],
    faqs: [
      {
        question: "Is MocInterview beginner-friendly for college students?",
        answer:
          "Yes! You can set your experience level to 0 years, and the AI will specifically tailor its questions to entry-level and campus placement standards.",
      },
      {
        question: "Can I practice explaining my resume projects?",
        answer:
          "Yes! With our Resume-Based Interview feature, you can upload your college resume or project notes, and the AI will ask targeted questions about what you built.",
      },
    ],
    relatedSlugs: ["ai-mock-interview", "hr-interview", "resume-interview", "software-developer-interview"],
  },

  "resume-interview": {
    slug: "resume-interview",
    title: "Resume-Based Mock Interview | AI Interview on Your Experience & Projects",
    description:
      "Practice mock interviews tailored specifically to your resume. Our AI analyzes your skills, past projects, and bullet points to ask personalized questions.",
    h1: "Resume-Based AI Mock Interview Practice",
    subtitle:
      "Don't get caught off guard by questions about your own resume. Let AI grill you on your listed skills, project metrics, and career achievements.",
    category: "Specialized",
    badge: "Resume AI",
    heroImage: "/assets/img/office.jpg",
    overview:
      "Hiring managers always conduct deep-dives into your resume bullet points. If you list 'optimized database queries by 40%' or 'built microservices with Node.js', you must be ready to defend the architecture, choices, and numbers. MocInterview scans your resume claims and questions you directly on them.",
    keyTakeaways: [
      "Upload PDF/Word resume or paste your project summary into the interview creator",
      "AI automatically extracts your tech stack, job titles, and quantifiable claims",
      "Generates hyper-specific questions challenging the depth of your stated experience",
      "Prevents resume 'exaggeration panic' by preparing you for every possible follow-up",
    ],
    curriculum: [
      {
        title: "Project Architecture Cross-Examination",
        description: "Defend your design choices, trade-offs, third-party libraries, and scalability considerations.",
      },
      {
        title: "Metrics & Business Impact Verification",
        description: "Practice explaining how you achieved the metrics listed in your bullet points.",
      },
      {
        title: "Technology Stack Mastery",
        description: "Be tested on the edge cases and intricacies of every tool, language, and framework listed on your CV.",
      },
    ],
    faqs: [
      {
        question: "How does the resume analysis feature work?",
        answer:
          "Our system securely parses your resume text, identifies key technical skills, architectural claims, and project descriptions, and generates custom questions targeted directly at validating those experiences.",
      },
      {
        question: "Is my resume kept private and secure?",
        answer:
          "Yes. Your uploaded resume is analyzed securely and is never shared, sold, or exposed publicly.",
      },
    ],
    relatedSlugs: ["ai-mock-interview", "software-developer-interview", "fresher-interview", "interview-preparation"],
  },
};

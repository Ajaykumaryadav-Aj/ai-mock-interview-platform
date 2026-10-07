// src/config/site.js
// Centralized site metadata and SEO configuration for MocInterview

export const SITE_URL = "https://mocinterview.vercel.app";
export const SITE_NAME = "MocInterview";
export const BRAND_TAGLINE = "AI Mock Interview Platform";

export const DEFAULT_SEO = {
  title: "AI Mock Interview Platform | Practice Interviews with AI | MocInterview",
  description:
    "Practice realistic AI mock interviews with instant scoring and actionable feedback. Tailored technical, HR, behavioral, and resume-based interview prep for developers and freshers.",
  canonical: SITE_URL,
  ogImage: `${SITE_URL}/assets/img/og-mocinterview.png`,
  ogType: "website",
  twitterCard: "summary_large_image",
};

export const PRIMARY_KEYWORDS = [
  "AI mock interview",
  "AI interview platform",
  "AI interview practice",
  "online mock interview",
  "mock interview online",
  "AI interview preparation",
  "interview practice platform",
  "technical mock interview",
  "HR mock interview",
  "behavioral mock interview",
  "interview preparation online",
  "mock interview for freshers",
  "interview practice for software developers",
  "resume based mock interview",
  "ATS resume checker",
  "free ATS resume score",
  "ATS resume scanner",
  "check resume ATS score online",
  "resume score calculator",
  "ATS compatibility check",
];

export const NAVIGATION_LINKS = [
  { label: "Home", href: "/" },
  { label: "AI Mock Interview", href: "/ai-mock-interview" },
  { label: "ATS Resume Checker", href: "/ats-resume" },
  { label: "Technical Interview", href: "/technical-interview" },
  { label: "HR Interview", href: "/hr-interview" },
  { label: "Blog & Guides", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const FOOTER_LINKS = {
  platform: [
    { label: "Home", href: "/" },
    { label: "ATS Resume Checker", href: "/ats-resume" },
    { label: "AI Mock Interview", href: "/ai-mock-interview" },
    { label: "Interview Practice", href: "/ai-interview-practice" },
    { label: "Interview Preparation", href: "/interview-preparation" },
    { label: "About Us", href: "/about" },
    { label: "Contact Us", href: "/contact" },
    { label: "Services", href: "/services" },
  ],
  interviewTypes: [
    { label: "Technical Interview", href: "/technical-interview" },
    { label: "HR Interview", href: "/hr-interview" },
    { label: "Behavioral Interview", href: "/behavioral-interview" },
    { label: "Fresher Interview", href: "/fresher-interview" },
    { label: "Resume-Based Interview", href: "/resume-interview" },
    { label: "Mock Interview Online", href: "/mock-interview" },
  ],
  developerRoles: [
    { label: "Software Developer Interview", href: "/software-developer-interview" },
    { label: "Frontend Developer Interview", href: "/frontend-interview" },
    { label: "React Interview Practice", href: "/react-interview" },
    { label: "JavaScript Interview Practice", href: "/javascript-interview" },
    { label: "Flutter Interview Practice", href: "/flutter-interview" },
  ],
  resources: [
    { label: "Interview Guides & Blog", href: "/blog" },
    { label: "AI Mock Interview Guide", href: "/blog/ai-mock-interview-guide" },
    { label: "How to Prepare for an Interview", href: "/blog/how-to-prepare-for-an-interview" },
    { label: "Common Interview Questions", href: "/blog/common-interview-questions" },
    { label: "JavaScript Interview Questions", href: "/blog/javascript-interview-questions" },
    { label: "React Interview Questions", href: "/blog/react-interview-questions" },
    { label: "HR Interview Questions", href: "/blog/hr-interview-questions" },
    { label: "Freshers Interview Questions", href: "/blog/interview-questions-for-freshers" },
  ],
};

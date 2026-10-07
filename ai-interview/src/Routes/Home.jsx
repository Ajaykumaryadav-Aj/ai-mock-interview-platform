// src/Routes/Home.jsx
// Redesigned MocInterview homepage: Modern, premium, trustworthy AI interview SaaS

import React from "react";
import Containers from "@/components/Containers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SEO } from "@/components/SEO";
import { SITE_URL, SITE_NAME } from "@/config/site";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  Brain,
  Layers,
  FileText,
  CheckCircle2,
  Code,
  UserCheck,
  MessageSquare,
  Laptop,
  Atom,
  FileCode,
  Smartphone,
  GraduationCap,
  Sparkles,
  HelpCircle,
  Briefcase,
  Users,
  Compass,
  Zap,
  BookOpen,
  Check,
} from "lucide-react";

import HeroProductMockup from "@/components/home/HeroProductMockup";
import FeedbackMockup from "@/components/home/FeedbackMockup";
import DashboardMockup from "@/components/home/DashboardMockup";
import ResumeWorkflowVisual from "@/components/home/ResumeWorkflowVisual";

// Core Trust Benefits
const coreBenefits = [
  {
    icon: <Brain className="w-6 h-6 text-emerald-600" />,
    title: "AI-Powered Interviews",
    desc: "Practice with dynamically generated interview questions tailored to your interview type.",
  },
  {
    icon: <Sparkles className="w-6 h-6 text-blue-600" />,
    title: "Instant AI Feedback",
    desc: "Understand your strengths, weaknesses, communication and answer quality.",
  },
  {
    icon: <Layers className="w-6 h-6 text-purple-600" />,
    title: "Multiple Interview Types",
    desc: "Prepare for technical, HR, behavioral and role-specific interviews.",
  },
  {
    icon: <FileText className="w-6 h-6 text-amber-600" />,
    title: "Resume-Based Practice",
    desc: "Practice questions generated around your own resume and experience.",
  },
];

// 10 Dedicated Interview Types
const interviewTypesList = [
  {
    title: "Technical Interview",
    desc: "Test your technical knowledge with realistic interview questions.",
    href: "/technical-interview",
    icon: <Code className="w-5 h-5 text-emerald-600" />,
    badge: "Core Engineering",
  },
  {
    title: "HR Interview",
    desc: "Practice common HR and behavioral questions with AI feedback.",
    href: "/hr-interview",
    icon: <UserCheck className="w-5 h-5 text-purple-600" />,
    badge: "Screening Drill",
  },
  {
    title: "Behavioral Interview",
    desc: "Master situational scenarios using the proven STAR framework.",
    href: "/behavioral-interview",
    icon: <MessageSquare className="w-5 h-5 text-amber-600" />,
    badge: "STAR Method",
  },
  {
    title: "Software Developer Interview",
    desc: "Full-stack development, software architecture, and system concepts.",
    href: "/software-developer-interview",
    icon: <Laptop className="w-5 h-5 text-blue-600" />,
    badge: "Software Track",
  },
  {
    title: "Frontend Interview",
    desc: "Prepare for frontend interviews covering JavaScript, React and web development.",
    href: "/frontend-interview",
    icon: <Layers className="w-5 h-5 text-teal-600" />,
    badge: "Web Engineering",
  },
  {
    title: "React Interview",
    desc: "Deep-dive into component lifecycle, hooks, and Virtual DOM diffing.",
    href: "/react-interview",
    icon: <Atom className="w-5 h-5 text-sky-600" />,
    badge: "Framework",
  },
  {
    title: "JavaScript Interview",
    desc: "Core JS fundamentals: event loops, closures, prototypes, and async.",
    href: "/javascript-interview",
    icon: <FileCode className="w-5 h-5 text-yellow-600" />,
    badge: "Language",
  },
  {
    title: "Flutter Interview",
    desc: "Cross-platform mobile architecture, widget trees, and Dart semantics.",
    href: "/flutter-interview",
    icon: <Smartphone className="w-5 h-5 text-cyan-600" />,
    badge: "Mobile Dev",
  },
  {
    title: "Fresher Interview",
    desc: "Campus hiring drills, OOPs principles, DBMS queries, and basic CS.",
    href: "/fresher-interview",
    icon: <GraduationCap className="w-5 h-5 text-rose-600" />,
    badge: "Entry-Level",
  },
  {
    title: "Resume-Based Interview",
    desc: "Practice questions based on your actual resume and experience.",
    href: "/resume-interview",
    icon: <FileText className="w-5 h-5 text-emerald-600" />,
    badge: "Personalized",
  },
  {
    title: "ATS Resume Checker",
    desc: "Instant ATS score, detected role keywords, parseability & quality audit.",
    href: "/ats-resume",
    icon: <Zap className="w-5 h-5 text-indigo-600" />,
    badge: "Free Tool",
  },
];

// Why MocInterview Features
const whyFeatures = [
  "AI-generated interview questions",
  "Realistic interview simulation",
  "Voice-based answers",
  "AI-powered evaluation",
  "Personalized feedback",
  "Resume-based questions",
  "Interview history",
  "Performance tracking",
  "Practice anytime",
  "Multiple interview types",
];

// Who is MocInterview for
const audienceList = [
  {
    title: "Students",
    desc: "Build interview confidence before your first placement interview.",
    icon: <GraduationCap className="w-5 h-5 text-emerald-600" />,
  },
  {
    title: "Freshers",
    desc: "Practice common questions and learn how to communicate your skills.",
    icon: <Users className="w-5 h-5 text-blue-600" />,
  },
  {
    title: "Software Developers",
    desc: "Prepare for technical interviews with role-specific practice.",
    icon: <Laptop className="w-5 h-5 text-purple-600" />,
  },
  {
    title: "Frontend Developers",
    desc: "Master modern web technologies, UI performance, and component architecture.",
    icon: <Layers className="w-5 h-5 text-teal-600" />,
  },
  {
    title: "Job Seekers",
    desc: "Sharpen your verbal answers and eliminate nervous filler words before real calls.",
    icon: <Briefcase className="w-5 h-5 text-amber-600" />,
  },
  {
    title: "Career Switchers",
    desc: "Translate past achievements into compelling technical and behavioral narratives.",
    icon: <Compass className="w-5 h-5 text-rose-600" />,
  },
  {
    title: "Experienced Professionals",
    desc: "Calibrate system design, team leadership, and executive communication.",
    icon: <ShieldCheck className="w-5 h-5 text-indigo-600" />,
  },
];

// Target Roles
const targetRoles = [
  { name: "Frontend Developer", href: "/frontend-interview" },
  { name: "React Developer", href: "/react-interview" },
  { name: "JavaScript Developer", href: "/javascript-interview" },
  { name: "Flutter Developer", href: "/flutter-interview" },
  { name: "Software Developer", href: "/software-developer-interview" },
  { name: "Full Stack Developer", href: "/software-developer-interview" },
  { name: "Backend Developer", href: "/technical-interview" },
  { name: "Data Analyst", href: "/technical-interview" },
  { name: "Web Developer", href: "/frontend-interview" },
  { name: "Mobile Developer", href: "/flutter-interview" },
];

// Tech tags
const techTags = [
  { name: "React", href: "/react-interview" },
  { name: "JavaScript", href: "/javascript-interview" },
  { name: "Flutter", href: "/flutter-interview" },
  { name: "HTML", href: "/frontend-interview" },
  { name: "CSS", href: "/frontend-interview" },
  { name: "Node.js", href: "/software-developer-interview" },
  { name: "MongoDB", href: "/technical-interview" },
  { name: "REST APIs", href: "/technical-interview" },
];

// Resources
const resourceCards = [
  {
    category: "Interview Questions",
    title: "Top 25 Technical & HR Interview Questions",
    desc: "Detailed answers, key talking points, and evaluator rubrics for modern hiring rounds.",
    href: "/blog/common-interview-questions",
    readTime: "8 min read",
  },
  {
    category: "Preparation Guides",
    title: "How to Prepare for Any Interview: 7-Step Framework",
    desc: "Comprehensive roadmap covering technical revision, behavioral storytelling, and live delivery.",
    href: "/blog/how-to-prepare-for-an-interview",
    readTime: "7 min read",
  },
  {
    category: "Behavioral Method",
    title: "Mastering Behavioral Interviews with the STAR Method",
    desc: "Real-world examples of Situation, Task, Action, and Result for software and team scenarios.",
    href: "/blog/behavioral-interview-questions",
    readTime: "6 min read",
  },
  {
    category: "Technical Prep",
    title: "Top 25 React Interview Questions & Architectural Concepts",
    desc: "Reconciliation, custom hooks, state management trade-offs, and SSR performance.",
    href: "/blog/react-interview-questions",
    readTime: "9 min read",
  },
];

// FAQs
const homeFaqs = [
  {
    question: "What is MocInterview?",
    answer:
      "MocInterview is an intelligent AI mock interview platform that simulates realistic hiring conversations. It dynamically generates role-specific interview questions, records speech-to-text responses, and delivers instant, calibrated performance feedback with model benchmark answers.",
  },
  {
    question: "How does AI mock interview practice work?",
    answer:
      "You select your target role, years of experience, and interview track (or upload a resume). The AI generates realistic questions. You answer via speech or text, and the platform delivers immediate feedback on communication, technical depth, and actionable areas for improvement.",
  },
  {
    question: "Can I practice technical interviews?",
    answer:
      "Yes. MocInterview supports in-depth technical interview tracks covering data structures, system design, modern frameworks (React, Flutter), programming languages (JavaScript), and backend architectures.",
  },
  {
    question: "Can I practice HR interviews?",
    answer:
      "Yes. We offer dedicated HR and behavioral interview rounds focused on culture fit, salary negotiations, career transitions, and situational questions evaluated using the STAR methodology.",
  },
  {
    question: "Can I practice using my resume?",
    answer:
      "Yes. In our Resume-Based Interview track, our AI analyzes your projects, skills, and metrics, generating targeted probe questions that test your ability to defend your resume just like a hiring manager would.",
  },
  {
    question: "Does MocInterview provide feedback?",
    answer:
      "Yes. After each session, you receive a comprehensive report featuring a score out of 10, breakdown of technical accuracy, communication clarity, strengths, specific improvement tips, and a model benchmark answer.",
  },
  {
    question: "Can I practice interviews for developer roles?",
    answer:
      "Yes. We have dedicated tracks for Frontend Engineers, React Developers, Full-Stack Developers, Mobile/Flutter Developers, and Software Engineers of all seniority levels.",
  },
  {
    question: "Is MocInterview free?",
    answer:
      "Yes. You can start practicing mock interviews for free with no credit card required.",
  },
  {
    question: "Do I need to create an account?",
    answer:
      "You can explore tracks and preview questions without signing in. To record audio sessions, save your interview history, and track progress over time, a quick free account via Clerk is required.",
  },
  {
    question: "Can I practice multiple times?",
    answer:
      "Yes. You can retake interviews as many times as you like. Every session generates fresh, dynamic questions and records your scoring trajectory in your candidate dashboard.",
  },
];

export const HomePage = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description:
          "Practice realistic AI mock interviews with instant voice evaluation, scoring, and actionable feedback.",
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/assets/favicon.png`,
      },
      {
        "@type": "SoftwareApplication",
        name: "MocInterview AI Mock Interview Platform",
        applicationCategory: "EducationalApplication",
        operatingSystem: "Web Browser",
        url: SITE_URL,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faq`,
        mainEntity: homeFaqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ],
  };

  const handleScrollToHowItWorks = (e) => {
    e.preventDefault();
    const element = document.getElementById("how-it-works");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-col w-full bg-white text-gray-900 min-h-screen">
      <SEO
        title="AI Mock Interview Platform | Practice Interviews with AI | MocInterview"
        description="Practice realistic AI mock interviews with instant voice evaluation, scoring, and actionable feedback. Master technical, HR, and resume-based rounds with MocInterview."
        canonical="/"
        structuredData={structuredData}
      />

      {/* ── 1. HERO SECTION ──────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-20 md:pt-16 md:pb-28 overflow-hidden bg-gradient-to-b from-emerald-50/40 via-white to-white border-b border-gray-100">
        <Containers>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Side Copy */}
            <div className="lg:col-span-6 space-y-6 text-left">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                AI-POWERED INTERVIEW PRACTICE
              </div>

              {/* Main H1 */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-950 tracking-tight leading-[1.12]">
                Ace Your Next Interview With{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800">
                  AI-Powered Practice
                </span>
              </h1>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl">
                Practice realistic interviews, answer questions with confidence, and get instant AI-powered feedback to improve before the real interview.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <Link to="/generate">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base px-7 py-6 rounded-xl shadow-lg shadow-emerald-600/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                  >
                    Start Free Interview <ArrowRight className="w-4 h-4 ml-0.5" />
                  </Button>
                </Link>
                <a
                  href="#how-it-works"
                  onClick={handleScrollToHowItWorks}
                  className="inline-flex"
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-base px-6 py-6 rounded-xl"
                  >
                    See How It Works
                  </Button>
                </a>
              </div>

              {/* Trust & Benefit Bullet Points */}
              <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>AI-powered questions</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Real-time interview practice</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Instant personalized feedback</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Resume-based interviews</span>
                </div>
              </div>
            </div>

            {/* Right Side: Realistic Product Mockup */}
            <div className="lg:col-span-6 flex justify-center">
              <HeroProductMockup />
            </div>
          </div>
        </Containers>
      </section>

      {/* ── 2. TRUST / CORE BENEFITS SECTION ──────────────────────────────── */}
      <section className="py-16 md:py-20 bg-gray-50/60 border-b border-gray-100">
        <Containers>
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Everything You Need to Prepare With Confidence
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              MocInterview is engineered to simulate authentic hiring pressure and deliver actionable feedback.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreBenefits.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-gray-200/70 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all text-left space-y-3"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
                  {item.icon}
                </div>
                <h3 className="text-base font-bold text-gray-900">{item.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </Containers>
      </section>

      {/* ── 3. HOW IT WORKS ──────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 md:py-28 border-b border-gray-100">
        <Containers>
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <Badge variant="outline" className="text-emerald-700 border-emerald-300 bg-emerald-50">
              Workflow
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              How MocInterview Works
            </h2>
            <p className="text-base text-gray-600">
              Practice like a real interview. Learn from every answer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="p-8 rounded-3xl bg-white border border-gray-200/80 shadow-xs hover:shadow-lg transition-all text-left space-y-4 relative group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-mono font-bold text-lg flex items-center justify-center shadow-md shadow-emerald-600/20">
                01
              </div>
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                Choose Your Interview
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Select the role, interview type and difficulty that match your target job.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-8 rounded-3xl bg-white border border-gray-200/80 shadow-xs hover:shadow-lg transition-all text-left space-y-4 relative group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-mono font-bold text-lg flex items-center justify-center shadow-md shadow-emerald-600/20">
                02
              </div>
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                Take the Interview
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Answer AI-generated questions through a realistic interview experience.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-8 rounded-3xl bg-white border border-gray-200/80 shadow-xs hover:shadow-lg transition-all text-left space-y-4 relative group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-mono font-bold text-lg flex items-center justify-center shadow-md shadow-emerald-600/20">
                03
              </div>
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                Get AI Feedback
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Review your performance, identify weaknesses and improve for your next attempt.
              </p>
            </div>
          </div>
        </Containers>
      </section>

      {/* ── 3.5. ATS RESUME CHECKER BANNER ──────────────────────────────── */}
      <section className="py-12 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-950 text-white relative overflow-hidden border-b border-indigo-900/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
        <Containers>
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 p-8 md:p-10 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="space-y-3 text-left max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                <Zap className="w-3.5 h-3.5 text-indigo-400" />
                <span>Free ATS Resume Scanner</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Check Your ATS Resume Score Before Applying
              </h2>
              <p className="text-sm sm:text-base text-indigo-200/90 leading-relaxed">
                Scan your resume against 8 ATS pillars — parseability, detected role keywords, quantifiable impact metrics, and layout compliance — without needing a job description.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
              <Link to="/ats-resume" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-7 py-6 rounded-xl shadow-lg shadow-indigo-600/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  Check ATS Score Free <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </Containers>
      </section>

      {/* ── 4. INTERVIEW TYPES ───────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-gray-50/50 border-b border-gray-100">
        <Containers>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 text-left">
            <div className="space-y-2">
              <Badge variant="outline" className="text-emerald-700 border-emerald-300 bg-emerald-50">
                Curriculum
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                Practice for Any Interview
              </h2>
              <p className="text-base text-gray-600">
                Targeted preparation tracks built for technical skills, behavioral stories, and recruiter screening rounds.
              </p>
            </div>

            <Link to="/ai-mock-interview">
              <Button variant="ghost" className="text-emerald-700 font-semibold gap-1.5 hover:text-emerald-800 hover:bg-emerald-50">
                View All Tracks <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {interviewTypesList.map((track) => (
              <Link
                key={track.href}
                to={track.href}
                className="p-6 rounded-2xl bg-white border border-gray-200/70 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between text-left group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-gray-50 group-hover:bg-emerald-50 transition-colors border border-gray-100">
                      {track.icon}
                    </div>
                    <Badge variant="secondary" className="text-[10px] bg-gray-100 text-gray-700">
                      {track.badge}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-base text-gray-900 group-hover:text-emerald-700 transition-colors">
                    {track.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {track.desc}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100 flex items-center text-xs font-semibold text-emerald-600 group-hover:text-emerald-700 gap-1 group-hover:translate-x-0.5 transition-transform">
                  Practice Track <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </Containers>
      </section>

      {/* ── 5. WHY MOCINTERVIEW (PRODUCT VALUE SECTION) ─────────────────── */}
      <section className="py-20 md:py-28 border-b border-gray-100">
        <Containers>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Feature Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <Badge variant="outline" className="text-emerald-700 border-emerald-300 bg-emerald-50">
                Product Advantages
              </Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
                More Than Just Interview Questions
              </h2>
              <p className="text-base text-gray-600 leading-relaxed">
                Reading static interview questions is passive. MocInterview puts you on the spot in a realistic simulation, challenging your verbal articulation, timing, and problem-solving depth so you walk into real interviews completely prepared.
              </p>

              {/* 10 Checkmark Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                {whyFeatures.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-sm text-gray-800">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span className="font-medium">{feat}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Link to="/generate">
                  <Button
                    size="lg"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md px-7 py-6 text-base"
                  >
                    Experience Live Simulation <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column: Dashboard UI Visual */}
            <div className="lg:col-span-5 flex justify-center">
              <DashboardMockup />
            </div>
          </div>
        </Containers>
      </section>

      {/* ── 6. AI FEEDBACK SECTION ───────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-gray-50/50 border-b border-gray-100">
        <Containers>
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <Badge variant="outline" className="text-emerald-700 border-emerald-300 bg-emerald-50">
              Granular Evaluation
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Know Exactly How You Performed
            </h2>
            <p className="text-base text-gray-600">
              Don't just practice. Understand what to improve.
            </p>
            <p className="text-xs sm:text-sm text-gray-500 max-w-xl mx-auto pt-1 leading-relaxed">
              After your interview, MocInterview analyzes your responses and provides actionable feedback so you know what you're doing well and where you need to improve.
            </p>
          </div>

          <FeedbackMockup />
        </Containers>
      </section>

      {/* ── 7. RESUME-BASED INTERVIEW SECTION ────────────────────────────── */}
      <section className="py-20 md:py-28 border-b border-gray-100 bg-white">
        <Containers>
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <Badge variant="outline" className="text-emerald-700 border-emerald-300 bg-emerald-50">
              Resume Intelligence
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Turn Your Resume Into an Interview
            </h2>
            <p className="text-base text-gray-600">
              Practice questions based on your real experience, skills and projects.
            </p>
          </div>

          <ResumeWorkflowVisual />
        </Containers>
      </section>

      {/* ── 8. WHO IS MOCINTERVIEW FOR? ──────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-gray-50/60 border-b border-gray-100">
        <Containers>
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <Badge variant="outline" className="text-emerald-700 border-emerald-300 bg-emerald-50">
              Tailored For You
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Built for Every Stage of Your Career
            </h2>
            <p className="text-base text-gray-600">
              Whether you are preparing for your very first campus placement or a senior engineering screen.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 text-left">
            {audienceList.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-gray-200/70 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
                  {item.icon}
                </div>
                <h3 className="font-bold text-base text-gray-900">{item.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </Containers>
      </section>

      {/* ── 9. ROLES & TECHNOLOGIES SECTION ──────────────────────────────── */}
      <section className="py-20 md:py-28 border-b border-gray-100 bg-white">
        <Containers>
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <Badge variant="outline" className="text-emerald-700 border-emerald-300 bg-emerald-50">
              Role Coverage
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Practice for the Role You're Targeting
            </h2>
            <p className="text-base text-gray-600">
              Choose your target role or key technologies to launch tailored practice drills immediately.
            </p>
          </div>

          {/* Role Badges */}
          <div className="space-y-6 max-w-4xl mx-auto">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block text-center mb-3">
                Job Roles
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                {targetRoles.map((role) => (
                  <Link
                    key={role.name}
                    to={role.href}
                    className="px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 text-xs sm:text-sm font-semibold hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 transition-all"
                  >
                    {role.name}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block text-center mb-3">
                Technologies & Core Frameworks
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                {techTags.map((tech) => (
                  <Link
                    key={tech.name}
                    to={tech.href}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-50/60 border border-emerald-200/70 text-emerald-800 font-mono text-xs font-medium hover:bg-emerald-100 transition-colors"
                  >
                    {tech.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </Containers>
      </section>

      {/* ── 10. RESOURCES SECTION ────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-gray-50/50 border-b border-gray-100">
        <Containers>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 text-left">
            <div className="space-y-2">
              <Badge variant="outline" className="text-emerald-700 border-emerald-300 bg-emerald-50">
                Resource Library
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                Prepare Smarter With Free Resources
              </h2>
              <p className="text-base text-gray-600">
                Deep-dive into curated question banks, STAR frameworks, and technical interview guides.
              </p>
            </div>

            <Link to="/blog">
              <Button variant="ghost" className="text-emerald-700 font-semibold gap-1.5 hover:text-emerald-800 hover:bg-emerald-50">
                Explore Blog & Guides <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {resourceCards.map((card, idx) => (
              <Link
                key={idx}
                to={card.href}
                className="p-6 rounded-2xl bg-white border border-gray-200/70 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between text-left group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-semibold text-emerald-700 uppercase tracking-wider text-[11px]">
                      {card.category}
                    </span>
                    <span>{card.readTime}</span>
                  </div>
                  <h3 className="font-bold text-base text-gray-900 group-hover:text-emerald-700 transition-colors leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100 flex items-center text-xs font-semibold text-emerald-600 group-hover:text-emerald-700 gap-1 group-hover:translate-x-0.5 transition-transform">
                  Read Guide <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </Containers>
      </section>

      {/* ── 11. PLATFORM COMMITMENT / TRUST BANNER ────────────────────────── */}
      <section className="py-14 bg-white border-b border-gray-100">
        <Containers>
          <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50/50 to-slate-50 border border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-6 text-left">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Our Commitment to Candidate Readiness
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                Practice in a Safe, Realistic, Zero-Bias Environment
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                MocInterview never records your camera video, never shares your scores with potential employers, and gives you unlimited attempts to iterate on your answers until you are completely interview-ready.
              </p>
            </div>

            <Link to="/generate" className="shrink-0">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-6 py-5">
                Start Practicing Free
              </Button>
            </Link>
          </div>
        </Containers>
      </section>

      {/* ── 12. FAQ SECTION ──────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-gray-50/50 border-b border-gray-100">
        <Containers>
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <Badge variant="outline" className="text-emerald-700 border-emerald-300 bg-emerald-50">
              Answers
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-base text-gray-600">
              Everything you need to know about preparing with MocInterview.
            </p>
          </div>

          <div className="max-w-3xl mx-auto text-left">
            <Accordion type="single" collapsible className="w-full space-y-3">
              {homeFaqs.map((faq, idx) => (
                <AccordionItem
                  key={idx}
                  value={`home-faq-${idx}`}
                  className="bg-white rounded-2xl border border-gray-200/80 px-5 shadow-xs"
                >
                  <AccordionTrigger className="text-left font-bold text-gray-900 hover:text-emerald-700 text-sm sm:text-base py-4 hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm text-gray-600 leading-relaxed pb-4 pt-1">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Containers>
      </section>

      {/* ── 13. FINAL HIGH-CONVERTING CTA BANNER ──────────────────────────── */}
      <section className="py-20 md:py-24 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white relative overflow-hidden">
        <Containers>
          <div className="max-w-3xl mx-auto text-center space-y-6 relative z-10">
            <Badge className="bg-white/10 text-emerald-200 border-white/20 text-xs font-semibold px-3 py-1">
              🚀 Ready To Ace Your Interview?
            </Badge>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Your Next Interview Starts Here
            </h2>

            <p className="text-base sm:text-lg text-emerald-100/90 max-w-xl mx-auto leading-relaxed">
              Practice. Get Feedback. Improve. Walk Into Your Next Interview With Confidence.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link to="/generate" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-white text-emerald-900 hover:bg-emerald-50 font-extrabold text-base px-8 py-6 rounded-xl shadow-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                >
                  Start Free Interview <Sparkles className="w-4 h-4 text-emerald-600" />
                </Button>
              </Link>
              <Link to="/ai-mock-interview" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 font-semibold text-base px-7 py-6 rounded-xl"
                >
                  Explore Interview Types
                </Button>
              </Link>
            </div>
          </div>
        </Containers>
      </section>
    </div>
  );
};

export default HomePage;

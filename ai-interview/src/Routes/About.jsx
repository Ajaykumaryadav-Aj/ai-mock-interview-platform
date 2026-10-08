// src/Routes/About.jsx
// Comprehensive About page showcasing MocInterview mission, team, and complete platform features catalog

import React from "react";
import { Link } from "react-router-dom";
import Containers from "@/components/Containers";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Award,
  HeartHandshake,
  Lightbulb,
  Sparkles,
  Mic,
  Code,
  FileText,
  CheckCircle2,
  ArrowRight,
  Zap,
  BarChart3,
  Layers,
  GraduationCap,
  Laptop,
  Brain,
  ShieldCheck,
  FileCode,
  Atom,
  Smartphone,
  MessageSquare,
} from "lucide-react";

const teamMembers = [
  {
    name: "Ajay Kumar",
    role: "Founder & Full-Stack Developer",
    img: "/assets/img/RohanFRajak.jpeg",
    bio: "Passionate about building AI developer tools, automated interview simulators, and empowering students to land top engineering offers.",
  },
];

const platformFeatures = [
  {
    icon: <Mic className="w-6 h-6 text-emerald-600" />,
    badge: "Voice & Speech AI",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    title: "Realistic AI Mock Interviews",
    description:
      "Practice high-stakes interviews with conversational voice recognition. Speak your answers naturally or type them to experience real-world interview pressure.",
    highlights: [
      "Dynamic questions tailored to your experience level (0-10+ yrs)",
      "Instant scoring out of 10 for technical accuracy & clarity",
      "Model benchmark answers provided for every single question",
    ],
    ctaText: "Start AI Mock Interview",
    ctaLink: "/generate",
  },
  {
    icon: <Zap className="w-6 h-6 text-indigo-600" />,
    badge: "100% Free Tool",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    title: "Free ATS Resume Checker",
    description:
      "Audit your CV against 8 enterprise ATS screening pillars without needing a job description. Ensure your resume passes automated filters and reaches human recruiters.",
    highlights: [
      "Automated candidate profile detection (Frontend, Flutter, etc.)",
      "Parseability, section formatting & action-verb analysis",
      "Quantifiable metrics check & instant bullet point suggestions",
    ],
    ctaText: "Check ATS Score Free",
    ctaLink: "/ats-resume",
  },
  {
    icon: <Code className="w-6 h-6 text-blue-600" />,
    badge: "Live Coding Sandbox",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    title: "Algorithmic Coding Rounds",
    description:
      "Solve data structure and algorithm challenges inside an interactive coding environment equipped with an automated test runner and algorithmic complexity judge.",
    highlights: [
      "Hidden test-case protection preventing false positives",
      "Automated Time & Space complexity classification (O(1), O(n), O(n²))",
      "Comprehensive problem library from basic math to advanced maps",
    ],
    ctaText: "Practice Coding Round",
    ctaLink: "/coding",
  },
  {
    icon: <FileText className="w-6 h-6 text-amber-600" />,
    badge: "Personalized CV AI",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    title: "Resume-Based Mock Interviews",
    description:
      "Upload your PDF resume and let AI cross-examine your listed projects, technical stack, metrics, and architecture claims with deep follow-up questions.",
    highlights: [
      "Zero generic questions; 100% targeted to your actual background",
      "Defend trade-offs, tech choices, and quantifiable achievements",
      "Eliminates resume 'exaggeration anxiety' before real interviewer calls",
    ],
    ctaText: "Practice Resume Round",
    ctaLink: "/resume-interview",
  },
  {
    icon: <Layers className="w-6 h-6 text-teal-600" />,
    badge: "10+ Tracks",
    badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
    title: "Curated Specialization Tracks",
    description:
      "Dedicated interview curriculums crafted for popular engineering roles, frameworks, languages, and hiring stages with focused question banks.",
    highlights: [
      "JavaScript: Closures, Event Loop, Scope, Prototypes, and Async/Await",
      "Frontend & React: Hooks, Virtual DOM diffing, and component state",
      "Campus Placement & Freshers: Core CS, OOPs, DBMS, and HR rounds",
    ],
    ctaText: "Browse All Tracks",
    ctaLink: "/ai-mock-interview",
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-purple-600" />,
    badge: "Progress Analytics",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    title: "Performance History & Dashboard",
    description:
      "Monitor your interview trajectory over time. Review past audio transcripts, score breakdowns, historical submissions, and targeted feedback tips.",
    highlights: [
      "Persistent user profile synced via Clerk and MongoDB Atlas",
      "Side-by-side comparison of your answers vs ideal answers",
      "Unlimited retakes with fresh dynamically generated questions",
    ],
    ctaText: "View Dashboard",
    ctaLink: "/dashboard",
  },
];

const trackPills = [
  { name: "JavaScript Practice", href: "/javascript-interview", icon: <FileCode className="w-4 h-4 text-yellow-600" /> },
  { name: "React Engineering", href: "/react-interview", icon: <Atom className="w-4 h-4 text-sky-600" /> },
  { name: "Frontend Developer", href: "/frontend-interview", icon: <Layers className="w-4 h-4 text-teal-600" /> },
  { name: "Flutter & Dart", href: "/flutter-interview", icon: <Smartphone className="w-4 h-4 text-cyan-600" /> },
  { name: "Software Developer", href: "/software-developer-interview", icon: <Laptop className="w-4 h-4 text-blue-600" /> },
  { name: "Technical Interview", href: "/technical-interview", icon: <Code className="w-4 h-4 text-emerald-600" /> },
  { name: "HR & Behavioral", href: "/hr-interview", icon: <MessageSquare className="w-4 h-4 text-purple-600" /> },
  { name: "Freshers & Campus", href: "/fresher-interview", icon: <GraduationCap className="w-4 h-4 text-rose-600" /> },
];

const values = [
  {
    icon: <Award className="w-8 h-8 text-emerald-600" />,
    title: "Relentless Excellence",
    desc: "We hold our AI prompts, scoring algorithms, and coding sandbox to the strictest real-world standards.",
  },
  {
    icon: <HeartHandshake className="w-8 h-8 text-emerald-600" />,
    title: "Fresher-First Empathy",
    desc: "Job hunting is stressful. We build safe, encouraging practice environments where anyone can fail and improve.",
  },
  {
    icon: <Lightbulb className="w-8 h-8 text-emerald-600" />,
    title: "Cutting-Edge Innovation",
    desc: "Combining Google Gemini, speech synthesis, AST evaluation, and modern web tech to deliver lightning-fast prep.",
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-emerald-600" />,
    title: "Zero Hidden Barriers",
    desc: "Core mock interviews and the complete ATS resume checker remain freely accessible for all job seekers.",
  },
];

export const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900 py-12 md:py-20">
      <SEO
        title="About MocInterview | The Team Behind the AI Interview Tool"
        description="Learn more about MocInterview, a free AI mock interview platform built to help freshers and college students crack their dream job interviews with real-time AI feedback."
        canonical="/about"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "About Us", item: "/about" },
        ]}
      />

      <Containers>
        {/* ── 1. HERO SECTION ────────────────────────────────────────────── */}
        <section className="flex flex-col lg:flex-row items-center gap-12 mb-20 md:mb-28 text-left">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              THE STORY BEHIND MOCINTERVIEW
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-950 tracking-tight leading-[1.15]">
              Empowering Freshers to Crack Their{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800">
                Dream Job Interviews
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl">
              MocInterview is an intelligent, accessible interview preparation platform built specifically to bridge the
              gap between theoretical knowledge and real-time verbal communication. We give college students, freshers,
              and engineers a private, zero-stress simulation to build bulletproof confidence before meeting real hiring managers.
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-950">1,000+</div>
                  <div className="text-xs text-gray-500">Job Seekers Empowered</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-950">100% Free</div>
                  <div className="text-xs text-gray-500">Core Tools &amp; ATS Scanner</div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link to="/generate">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-7 py-6 rounded-xl shadow-lg shadow-emerald-600/20">
                  Try Free Mock Interview <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link to="/ats-resume">
                <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold px-6 py-6 rounded-xl">
                  Check ATS Resume Score
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center w-full">
            <div className="relative w-full max-w-lg">
              <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur-xl opacity-20" />
              <img
                src="/assets/img/hero.jpg"
                alt="MocInterview Platform Preview"
                className="relative w-full rounded-2xl shadow-2xl border border-gray-200/80 object-cover"
              />
            </div>
          </div>
        </section>

        {/* ── 2. MISSION STATEMENT ───────────────────────────────────────── */}
        <section className="mb-20 md:mb-28 p-8 md:p-12 rounded-3xl bg-gradient-to-br from-emerald-50/70 via-teal-50/30 to-white border border-emerald-100 text-left">
          <div className="max-w-3xl space-y-4">
            <Badge variant="outline" className="text-emerald-700 border-emerald-300 bg-white">
              Our Core Mission
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight">
              Why We Built MocInterview
            </h2>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
              Most candidates fail interviews not because they lack technical knowledge, but because they stumble under verbal pressure, speak in fragmented sentences, or submit resumes that get rejected by Applicant Tracking Systems before a human ever sees them.
            </p>
            <p className="text-base text-gray-600 leading-relaxed">
              Traditional mock coaching costs hundreds of dollars per session and requires days of advance scheduling. We built MocInterview to democratize high-quality interview preparation — giving every college student and developer on-demand access to realistic AI interviews, transparent ATS resume scoring, and diagnostic grading 24/7.
            </p>
          </div>
        </section>

        {/* ── 3. ALL PLATFORM FEATURES (COMPREHENSIVE CATALOG) ──────────── */}
        <section className="mb-20 md:mb-28 text-left">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <Badge variant="outline" className="text-emerald-700 border-emerald-300 bg-emerald-50">
              Platform Features
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight">
              Everything You Can Do on MocInterview
            </h2>
            <p className="text-base text-gray-600">
              A complete suite of smart AI tools designed to prepare you for every stage of modern software hiring.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformFeatures.map((feat, idx) => (
              <div
                key={idx}
                className="p-7 rounded-2xl bg-white border border-gray-200/80 shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 group-hover:bg-emerald-50 border border-gray-100 flex items-center justify-center transition-colors">
                      {feat.icon}
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${feat.badgeColor}`}>
                      {feat.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-950 group-hover:text-emerald-700 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>

                  <ul className="space-y-2 pt-2 border-t border-gray-100">
                    {feat.highlights.map((item, hIdx) => (
                      <li key={hIdx} className="flex items-start gap-2 text-xs text-gray-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 mt-4 border-t border-gray-100">
                  <Link to={feat.ctaLink} className="w-full block">
                    <Button
                      variant="outline"
                      className="w-full border-gray-200 group-hover:border-emerald-500 group-hover:bg-emerald-50 text-gray-800 group-hover:text-emerald-800 font-semibold text-xs py-5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>{feat.ctaText}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Specialization Tracks Bar */}
          <div className="mt-10 p-6 rounded-2xl bg-gray-50 border border-gray-200/80">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Explore Targeted Specialization Tracks:
            </div>
            <div className="flex flex-wrap gap-2.5">
              {trackPills.map((track) => (
                <Link
                  key={track.name}
                  to={track.href}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-800 hover:border-emerald-500 hover:text-emerald-700 hover:shadow-xs transition-all"
                >
                  {track.icon}
                  <span>{track.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. CORE VALUES ─────────────────────────────────────────────── */}
        <section className="mb-20 md:mb-28 text-left">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <Badge variant="outline" className="text-emerald-700 border-emerald-300 bg-emerald-50">
              Principles &amp; Culture
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight">
              What Drives Our Engineering
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((val, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-gray-200/80 hover:shadow-lg transition-all space-y-3"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                  {val.icon}
                </div>
                <h3 className="font-bold text-base text-gray-900">{val.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 5. MEET THE TEAM ───────────────────────────────────────────── */}
        <section className="mb-20 md:mb-28 text-left">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <Badge variant="outline" className="text-emerald-700 border-emerald-300 bg-emerald-50">
              Creators
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight">
              Meet the Creator
            </h2>
            <p className="text-base text-gray-600">
              Crafted with care to help candidates build confidence and secure high-paying engineering roles.
            </p>
          </div>

          <div className="flex justify-center">
            {teamMembers.map((member, idx) => (
              <div
                key={idx}
                className="max-w-md w-full p-8 rounded-3xl bg-white border border-gray-200/80 shadow-md hover:shadow-xl transition-shadow text-center space-y-4"
              >
                <img
                  src={member.img}
                  alt={member.name}
                  className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-emerald-100 shadow-md"
                />
                <div>
                  <h3 className="font-extrabold text-xl text-gray-950">{member.name}</h3>
                  <p className="text-xs font-semibold text-emerald-700 mt-0.5">{member.role}</p>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{member.bio}</p>
                <div className="pt-2 flex justify-center gap-3">
                  <Link to="/contact">
                    <Button variant="outline" size="sm" className="rounded-lg text-xs font-semibold">
                      Get in Touch
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 6. FINAL CALL TO ACTION ────────────────────────────────────── */}
        <section className="p-8 md:p-14 rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-900 to-teal-950 text-white text-center space-y-6 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Ready to Ace Your Next Interview?
            </h2>
            <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
              Start practicing with realistic AI mock questions, run a free ATS resume compatibility check, and gain the confidence to stand out.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/generate" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-white hover:bg-emerald-50 text-emerald-950 font-bold px-8 py-6 rounded-xl shadow-lg shadow-black/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  Start Free Interview <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link to="/ats-resume" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-emerald-950/70 hover:bg-emerald-900 text-white border border-emerald-400/60 font-semibold px-8 py-6 rounded-xl shadow-md hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 text-emerald-300" />
                  Check ATS Resume Score
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </Containers>
    </div>
  );
};

export default AboutPage;

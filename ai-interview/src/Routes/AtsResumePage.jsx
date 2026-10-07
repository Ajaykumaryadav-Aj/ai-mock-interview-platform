// src/Routes/AtsResumePage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";
import { SITE_URL } from "@/config/site";
import {
  Upload,
  FileText,
  Sparkles,
  ArrowRight,
  Loader2,
  History,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Target,
  FileCode,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  X,
  Briefcase,
  Layers,
  RotateCcw,
  HelpCircle,
  BookOpen,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { extractResumeFileText, validateResumeFile } from "@/services/resumeService";
import {
  analyzeAtsResume,
  getAtsHistory,
  deleteAtsAnalysis,
  getAtsAnalytics,
} from "@/services/atsService";

import { AtsCandidateProfileBadge } from "@/components/ats/AtsRoleDetectionBadge";
import { AtsScoreGauge } from "@/components/ats/AtsScoreGauge";
import { AtsCategoryCards } from "@/components/ats/AtsCategoryCards";
import { AtsDetectedSkillsView } from "@/components/ats/AtsKeywordsView";
import { AtsProjectAnalysisView } from "@/components/ats/AtsProjectAnalysisView";
import { AtsIssuesView } from "@/components/ats/AtsIssuesView";
import { AtsSuggestionsView } from "@/components/ats/AtsSuggestionsView";
import { AtsHistoryDrawer } from "@/components/ats/AtsHistoryDrawer";
import { AtsAnalyticsBar } from "@/components/ats/AtsAnalyticsBar";

import { SAMPLE_RESUMES } from "@/data/atsSampleData";

const ATS_FAQS = [
  {
    q: "What is an ATS Resume Score?",
    a: "An ATS (Applicant Tracking System) resume score measures how effectively automated recruiting software (such as Workday, Greenhouse, Taleo, and Lever) can parse, read, and index your resume. A high score means your section structure, technology keywords, and measurable accomplishments meet enterprise hiring standards.",
  },
  {
    q: "How does this ATS scanner calculate my score without a Job Description?",
    a: "Unlike tools that force you to paste an arbitrary job description, our scanner inspects your resume headline, skills cluster, and work history to automatically detect your exact profile (e.g., Frontend Developer, Flutter Developer, Full Stack Engineer). It then audits your resume across 8 core ATS quality pillars including parseability, skills clarity, action verbs, quantified metrics, and formatting safety.",
  },
  {
    q: "What is considered a good ATS score?",
    a: "A score of 80 or above is considered strong and gives your resume a very high likelihood of passing automated screening filters into recruiter review. Scores between 60 and 79 indicate average quality with clear fixable gaps (such as missing metrics or non-standard headers). Scores below 60 require immediate structure and content remediation.",
  },
  {
    q: "Which file formats are supported for ATS scanning?",
    a: "We support PDF (.pdf), Microsoft Word (.docx), and plain text (.txt). PDF and DOCX files with selectable text layers are the most recommended formats for applicant tracking systems.",
  },
  {
    q: "Is this ATS Resume Checker completely free?",
    a: "Yes! Our ATS Resume Checker is 100% free with unlimited scans. You get an instant comprehensive breakdown with no paywalls, hidden limits, or required credit card.",
  },
  {
    q: "How can I improve my ATS score to 80+?",
    a: "Focus on 3 high-impact adjustments: 1) Use standard section headings (Summary, Skills, Experience, Projects, Education); 2) Quantify your bullets with concrete metrics (e.g., 'reduced API response times by 35%', 'managed 100K+ DAU'); 3) Avoid tables, complex multi-column columns, and graphics that can confuse automated text parsers.",
  },
];

export const AtsResumePage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Resume Input states
  const [resumeText, setResumeText] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [resumeFileSize, setResumeFileSize] = useState(0);
  const [activeInputMode, setActiveInputMode] = useState("upload"); // 'upload' | 'text'

  // Loading states
  const [isExtractingFile, setIsExtractingFile] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Analysis result states
  const [analysis, setAnalysis] = useState(null);
  const [activeReportTab, setActiveReportTab] = useState("skills"); // 'skills' | 'issues' | 'projects' | 'suggestions'

  // History Drawer & Analytics state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyList, setHistoryList] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);

  // Load history & analytics on mount
  useEffect(() => {
    loadHistoryAndAnalytics();
  }, []);

  const loadHistoryAndAnalytics = async () => {
    setIsLoadingHistory(true);
    try {
      const [history, analytics] = await Promise.allSettled([
        getAtsHistory(),
        getAtsAnalytics(),
      ]);

      if (history.status === "fulfilled") setHistoryList(history.value || []);
      if (analytics.status === "fulfilled") setAnalyticsData(analytics.value || null);
    } catch {
      // Non-blocking if offline or unauthenticated
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Handle resume file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg("");
    setIsExtractingFile(true);

    try {
      validateResumeFile(file);
      const res = await extractResumeFileText(file);
      setResumeText(res.text);
      setResumeFileName(res.fileName);
      setResumeFileSize(res.fileSize);
      toast.success(`Parsed ${file.name} successfully! (${res.text.split(/\s+/).filter(Boolean).length} words)`);
    } catch (err) {
      console.error("[AtsResumePage] File parse error:", err);
      setErrorMsg(err.message || "Failed to parse resume file.");
      toast.error(err.message || "File parsing failed.");
    } finally {
      setIsExtractingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // 1-Click Sample Resume Presets
  const handleLoadSampleResume = (sampleResumeId) => {
    const sample = SAMPLE_RESUMES.find((s) => s.id === sampleResumeId) || SAMPLE_RESUMES[0];
    setResumeText(sample.text);
    setResumeFileName(sample.fileName || `${sample.name}.pdf`);
    setResumeFileSize(35400);
    setErrorMsg("");
    toast.success(`Loaded sample: "${sample.name}"`);
  };

  // Clear loaded resume
  const handleClearResume = () => {
    setResumeText("");
    setResumeFileName("");
    setResumeFileSize(0);
    setErrorMsg("");
  };

  // Trigger Resume ATS Analysis
  const handleRunAnalysis = async () => {
    const trimmedResume = resumeText.trim();
    if (!trimmedResume) {
      setErrorMsg("Please upload a resume file or paste your resume text first.");
      toast.error("Resume content is required.");
      return;
    }

    if (trimmedResume.length < 30) {
      setErrorMsg("Resume text must be at least 30 characters long for an accurate ATS audit.");
      toast.error("Resume content is too short.");
      return;
    }

    setErrorMsg("");
    setIsAnalyzing(true);

    try {
      const result = await analyzeAtsResume({
        resumeText: trimmedResume,
        resumeFileName: resumeFileName || "Candidate_Resume.pdf",
        resumeFileSize: resumeFileSize || trimmedResume.length,
      });

      setAnalysis(result);
      setActiveReportTab("skills");
      toast.success("Resume ATS Audit complete!");
      loadHistoryAndAnalytics();

      // Smooth scroll down to results
      setTimeout(() => {
        document.getElementById("ats-results-section")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      console.error("[AtsResumePage] Analysis error:", err);
      const msg = err.message || "An error occurred while analyzing the resume.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Delete past scan
  const handleDeleteScan = async (scanId) => {
    try {
      await deleteAtsAnalysis(scanId);
      setHistoryList((prev) => prev.filter((item) => (item._id || item.id) !== scanId));
      if (analysis?._id === scanId) {
        setAnalysis(null);
      }
      toast.success("Scan deleted from history.");
      loadHistoryAndAnalytics();
    } catch (err) {
      toast.error("Failed to delete scan.");
    }
  };

  // Select scan from history
  const handleSelectHistoryScan = (scan) => {
    setAnalysis(scan);
    if (scan.resumeText) setResumeText(scan.resumeText);
    if (scan.resumeFileName) setResumeFileName(scan.resumeFileName);
    setActiveReportTab("skills");
    toast.info(`Loaded audit for: ${scan.detectedProfile || scan.resumeFileName || "Past Scan"}`);
    setTimeout(() => {
      document.getElementById("ats-results-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const resumeWordCount = resumeText.split(/\s+/).filter(Boolean).length;

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "MocInterview Free ATS Resume Checker & Compatibility Audit",
      "url": `${SITE_URL}/ats-resume`,
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "All (Web Browser)",
      "description":
        "Free online ATS resume checker and quality audit tool. Automatically detects candidate career profile and audits ATS parseability, keywords, quantified impact, and section structure without needing a job description.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "1280",
        "bestRating": "5",
        "worstRating": "1",
      },
      "featureList": [
        "Automated Candidate Headline & Profile Detection",
        "8-Pillar ATS Compatibility Breakdown",
        "Quantified Impact & Action Verbs Audit",
        "Section Header & Parseability Analysis",
        "Actionable Recommendations & Instant Fixes",
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": ATS_FAQS.map((faq) => ({
        "@type": "Question",
        "name": faq.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.a,
        },
      })),
    },
  ];

  const breadcrumbs = [
    { name: "Home", item: "/" },
    { name: "ATS Resume Checker", item: "/ats-resume" },
  ];

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <SEO
        title="Free ATS Resume Checker – Instant ATS Score & Quality Audit | MocInterview"
        description="Check your ATS resume score online for free. Automatically detects your role (Frontend, Flutter, Full Stack, Software Engineer) and audits ATS parseability, keywords, impact metrics, and structure."
        canonical="/ats-resume"
        structuredData={structuredData}
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header & History Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-200 dark:border-gray-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 mb-3">
              <Zap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>ATS Resume Scanner • No JD Required</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-gray-900 dark:text-white">
              Free ATS Resume Checker & Compatibility Score Audit
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mt-2 max-w-2xl leading-relaxed">
              Scan your resume against 8 core ATS pillars — parseability, section structure, role-specific keywords, and quantifiable impact metrics — purely evaluated on candidate evidence without needing a job description.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold text-sm text-gray-700 dark:text-gray-200 shadow-xs transition-all cursor-pointer"
            >
              <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Audit History</span>
              {historyList.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                  {historyList.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Analytics Growth Strip (if candidate has past scans) */}
        {analyticsData && analyticsData.totalScans > 0 && (
          <AtsAnalyticsBar analytics={analyticsData} />
        )}

        {/* Step-by-Step Pipeline Navigation */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xs">
          <div className="flex items-center justify-between overflow-x-auto gap-2 text-xs font-semibold scrollbar-none py-0.5">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl shrink-0 transition-all ${
                resumeText
                  ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold"
                  : "text-gray-500"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                1
              </span>
              <span>Upload Resume</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />

            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl shrink-0 transition-all ${
                analysis
                  ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold"
                  : "text-gray-500"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                2
              </span>
              <span>Content Parsing</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />

            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl shrink-0 transition-all ${
                isAnalyzing
                  ? "bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-bold animate-pulse"
                  : analysis
                  ? "bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-bold"
                  : "text-gray-500"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold">
                3
              </span>
              <span>ATS Score /100</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />

            <button
              type="button"
              disabled={!analysis}
              onClick={() => {
                setActiveReportTab("skills");
                document.getElementById("ats-results-section")?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl shrink-0 transition-all cursor-pointer ${
                analysis && activeReportTab === "skills"
                  ? "bg-indigo-600 text-white shadow-xs font-bold"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Detected Skills & Audit</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />

            <button
              type="button"
              disabled={!analysis}
              onClick={() => {
                setActiveReportTab("projects");
                document.getElementById("ats-results-section")?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl shrink-0 transition-all cursor-pointer ${
                analysis && activeReportTab === "projects"
                  ? "bg-indigo-600 text-white shadow-xs font-bold"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Project Analysis</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />

            <button
              type="button"
              disabled={!analysis}
              onClick={() => {
                setActiveReportTab("strengths");
                document.getElementById("ats-results-section")?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl shrink-0 transition-all cursor-pointer ${
                analysis && activeReportTab === "strengths"
                  ? "bg-indigo-600 text-white shadow-xs font-bold"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Strengths & Issues</span>
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start justify-between gap-3 text-rose-800 dark:text-rose-200">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
              <p className="text-sm font-medium">{errorMsg}</p>
            </div>
            <button
              onClick={() => setErrorMsg("")}
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Focused Hero Resume Upload Section (NO JD REQUIRED) */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white text-lg">
                  Upload Resume for ATS Resume Compatibility & Detailed Audit
                </h2>
                <p className="text-xs text-gray-400">PDF, DOCX, or plain text • Evaluated on actual candidate resume evidence</p>
              </div>
            </div>

            {/* Input Mode Toggle */}
            <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-medium self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveInputMode("upload")}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeInputMode === "upload"
                    ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-2xs font-semibold"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setActiveInputMode("text")}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeInputMode === "text"
                    ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-2xs font-semibold"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                Paste / Edit Text
              </button>
            </div>
          </div>

          {/* Sample Presets */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-gray-400 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Try with 1-Click Samples:
            </span>
            {SAMPLE_RESUMES.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleLoadSampleResume(sample.id)}
                className="px-3 py-1 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-gray-700 dark:text-gray-300 font-medium transition-all cursor-pointer"
              >
                {sample.name}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div>
            {activeInputMode === "upload" ? (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt,.doc"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="ats-upload-input"
                />
                <label
                  htmlFor="ats-upload-input"
                  className="cursor-pointer border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-indigo-400 dark:hover:border-indigo-600 rounded-3xl p-10 flex flex-col items-center justify-center text-center bg-gray-50/50 dark:bg-gray-850/50 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all group"
                >
                  {isExtractingFile ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-3" />
                      <span className="text-base font-semibold text-gray-900 dark:text-white">
                        Extracting resume content...
                      </span>
                      <span className="text-xs text-gray-400 mt-1">
                        Parsing sections, technologies, projects & credentials
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-xs">
                        <Upload className="w-7 h-7" />
                      </div>
                      <span className="text-base font-bold text-gray-900 dark:text-white">
                        {resumeFileName ? "Replace Uploaded Resume" : "Click to Browse or Drag & Drop Resume"}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                        Supports PDF, DOCX, and TXT (Max 5MB) • No Job Description needed
                      </span>
                    </>
                  )}
                </label>

                {resumeFileName && (
                  <div className="mt-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 truncate">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <div className="truncate">
                        <span className="font-bold text-emerald-950 dark:text-emerald-200 truncate block text-sm">
                          {resumeFileName}
                        </span>
                        <span className="text-emerald-700/80 dark:text-emerald-400 font-mono text-[11px]">
                          {resumeWordCount} words parsed
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveInputMode("text")}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-gray-900 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold hover:bg-emerald-100 transition-colors cursor-pointer"
                      >
                        View Text
                      </button>
                      <button
                        type="button"
                        onClick={handleClearResume}
                        className="p-1.5 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-400 cursor-pointer"
                        title="Clear resume"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <textarea
                  id="ats-paste-textarea"
                  rows={10}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your complete resume text here (Summary, Skills, Experience, Projects, Education)..."
                  className="w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850/50 p-4 font-mono text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                />
                <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                  <span>Words: {resumeWordCount} | Characters: {resumeText.length}</span>
                  <button
                    type="button"
                    onClick={handleClearResume}
                    className="hover:text-rose-500 cursor-pointer"
                  >
                    Clear Text
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Parsed locally in browser • No external sharing</span>
            </div>

            <button
              id="ats-analyze-btn"
              type="button"
              onClick={() => handleRunAnalysis()}
              disabled={isAnalyzing || isExtractingFile || !resumeText.trim()}
              className="w-full sm:w-auto min-w-[280px] py-4 px-10 rounded-2xl font-bold text-sm bg-gradient-to-r from-indigo-600 via-indigo-700 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Auditing Resume & Extracting Evidence...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  <span>Audit Resume for ATS Compatibility</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* RESULTS DASHBOARD */}
        {analysis && (
          <div id="ats-results-section" className="space-y-8 pt-6">
            {/* 1. Inferred Descriptive Candidate Profile Badge & Re-scan Button */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  ATS Compatibility Audit Report
                </span>
                <button
                  type="button"
                  onClick={() => {
                    handleClearResume();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Scan Another Resume
                </button>
              </div>

              <AtsCandidateProfileBadge
                detectedProfile={analysis.detectedProfile || analysis.candidateTitle || "Resume ATS Analysis"}
                skillsCount={(analysis.extractedSkills || []).length}
                wordCount={resumeWordCount || analysis.qualityAudit?.wordCount || 0}
              />
            </div>

            {/* 2. Top Circular Score Gauge */}
            <AtsScoreGauge
              score={analysis.overallScore || 0}
              candidateTitle={analysis.detectedProfile || analysis.candidateTitle || "Resume ATS Audit"}
              assessment={analysis.assessment}
            />

            {/* 3. 8-Pillar Scoring Breakdown Cards */}
            <AtsCategoryCards categoryScores={analysis.scoringBreakdown || analysis.categoryScores} />

            {/* 4. Streamlined Tab Navigation Strip */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 dark:border-gray-800 text-sm font-semibold scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveReportTab("skills")}
                className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                  activeReportTab === "skills"
                    ? "bg-indigo-600 text-white shadow-xs font-bold"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Target className="w-4 h-4" />
                <span>Detected Skills</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white font-bold">
                  {(analysis.extractedSkills || []).length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveReportTab("issues")}
                className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                  activeReportTab === "issues"
                    ? "bg-indigo-600 text-white shadow-xs font-bold"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>ATS Issues & Strengths</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white font-bold">
                  {(analysis.issues || []).length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveReportTab("projects")}
                className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                  activeReportTab === "projects"
                    ? "bg-indigo-600 text-white shadow-xs font-bold"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Project Analysis</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white font-bold">
                  {(analysis.projects || []).length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveReportTab("suggestions")}
                className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                  activeReportTab === "suggestions"
                    ? "bg-indigo-600 text-white shadow-xs font-bold"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Actionable Recommendations</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white font-bold">
                  {(analysis.suggestions || []).length}
                </span>
              </button>
            </div>

            {/* 5. Active Tab Content Views */}
            {activeReportTab === "skills" && (
              <AtsDetectedSkillsView
                extractedSkills={analysis.extractedSkills || []}
                skillCategories={analysis.skillCategories || {}}
                skillsAudit={analysis.skillsAudit || {}}
                detectedProfile={analysis.detectedProfile || ""}
              />
            )}

            {activeReportTab === "issues" && (
              <AtsIssuesView
                issues={analysis.issues || []}
                strengths={analysis.strengths || []}
                qualityAudit={analysis.qualityAudit || {}}
              />
            )}

            {activeReportTab === "projects" && (
              <AtsProjectAnalysisView
                projects={analysis.projects || []}
                profileName={analysis.detectedProfile || ""}
              />
            )}

            {activeReportTab === "suggestions" && (
              <AtsSuggestionsView suggestions={analysis.suggestions || []} />
            )}

            {/* 6. Bottom Re-Scan Banner */}
            <div className="p-6 rounded-3xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-base">
                  Ready to optimize your resume for {analysis.detectedProfile || "your profile"}?
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Apply the recommended metrics and section improvements, then re-upload to verify your score increase.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  handleClearResume();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Upload className="w-4 h-4" />
                Scan Another Resume
              </button>
            </div>
          </div>
        )}

        {/* ── SEO SECTION 1: How ATS Scanner Works (8 Pillars) ───────── */}
        <section id="ats-how-it-works" className="pt-8 border-t border-gray-200 dark:border-gray-800 space-y-6 text-left">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              <BookOpen className="w-3.5 h-3.5" />
              <span>ATS Scoring Methodology</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              How Our ATS Resume Scanner Evaluates Your Resume
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-3xl leading-relaxed">
              Applicant Tracking Systems (ATS) scan hundreds of resumes per job posting. Our scoring algorithm checks the exact technical criteria modern enterprise ATS software uses to rank and filter candidates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Parseability & Standard Headings
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Applicant tracking systems search for standard headers: Summary, Skills, Experience, Projects, and Education. Creative or image-based headings can cause whole sections to be skipped.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Candidate Profile & Tech Keyword Extraction
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Automatically detects your career profile (Frontend, Flutter, Full Stack, etc.) from resume headings and validates industry-standard language, tools, and framework clusters.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Quantified Impact & Action Verbs
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Evaluates your bullet points for measurable outcomes (percentages, performance increases, user scale, revenue) and strong proactive action verbs rather than passive task descriptions.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                4
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Formatting Safety & ATS Hygiene
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Flags invisible text, multi-column layout glitches, non-standard bullet characters, and unparseable date formats that commonly trigger automatic disqualification in ATS filters.
              </p>
            </div>
          </div>
        </section>

        {/* ── SEO SECTION 2: Frequently Asked Questions (FAQ) ─────────── */}
        <section id="ats-faq-section" className="pt-8 border-t border-gray-200 dark:border-gray-800 space-y-6 text-left">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Got Questions?</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Frequently Asked Questions About ATS Resume Scores
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
              Everything you need to know about how applicant tracking systems work, score thresholds, and how to optimize your resume.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xs">
            <Accordion type="single" collapsible className="w-full">
              {ATS_FAQS.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`} className="border-b border-gray-100 dark:border-gray-800 last:border-b-0 py-1">
                  <AccordionTrigger className="text-sm sm:text-base font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 text-left py-4">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed pb-4">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* ── SEO SECTION 3: Next Steps & Interview Prep Tracks ──────── */}
        <section id="ats-next-steps" className="pt-8 border-t border-gray-200 dark:border-gray-800 pb-12 space-y-6 text-left">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next Career Step</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Ready for the Real Interview?
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
              Once your resume passes the ATS screen, hiring managers will test your practical skills. Practice realistic AI mock interviews tailored to your exact profile.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/technical-interview"
              className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-emerald-400 hover:shadow-md transition-all space-y-2 group"
            >
              <h3 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                Technical Interview →
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Data structures, system architecture, and core CS fundamentals.
              </p>
            </Link>

            <Link
              to="/frontend-interview"
              className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-emerald-400 hover:shadow-md transition-all space-y-2 group"
            >
              <h3 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                Frontend Interview →
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                React, JavaScript ES6+, state management, and web performance.
              </p>
            </Link>

            <Link
              to="/flutter-interview"
              className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-emerald-400 hover:shadow-md transition-all space-y-2 group"
            >
              <h3 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                Flutter Interview →
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Dart semantics, cross-platform widgets, state and APIs.
              </p>
            </Link>

            <Link
              to="/resume-interview"
              className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-emerald-400 hover:shadow-md transition-all space-y-2 group"
            >
              <h3 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                Resume-Based Drill →
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                AI questions crafted directly from your uploaded resume projects.
              </p>
            </Link>
          </div>
        </section>
      </div>

      {/* History Slide-over Drawer */}
      <AtsHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={historyList}
        isLoading={isLoadingHistory}
        onSelectScan={handleSelectHistoryScan}
        onDeleteScan={handleDeleteScan}
      />
    </div>
  );
};

export default AtsResumePage;

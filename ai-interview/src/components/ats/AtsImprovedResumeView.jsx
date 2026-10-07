// src/components/ats/AtsImprovedResumeView.jsx
import React, { useState } from "react";
import {
  Sparkles,
  Copy,
  Check,
  Download,
  TrendingUp,
  FileText,
  ShieldCheck,
  Loader2,
  User,
  Briefcase,
  Layers,
  Wrench,
} from "lucide-react";

export const AtsImprovedResumeView = ({
  originalResumeText = "",
  improvedResumeText = "",
  improvedSections = {},
  originalScore = 0,
  improvedScore = null,
  isImproving = false,
  onGenerateImprovement,
}) => {
  // 'full' | 'summary' | 'projects' | 'experience' | 'skills' | 'original'
  const [activeTab, setActiveTab] = useState("full");
  const [copied, setCopied] = useState(false);

  const sections = improvedSections || {};
  const hasImproved = Boolean(improvedResumeText || sections.professionalSummary);
  const scoreDelta = improvedScore !== null ? improvedScore - originalScore : null;

  // Resolve content based on active tab
  const getTabContent = () => {
    switch (activeTab) {
      case "summary":
        return sections.professionalSummary || "No professional summary generated yet.";
      case "projects":
        return sections.projectDescriptions || "No project descriptions generated yet.";
      case "experience":
        return sections.experienceSection || "No experience section generated yet.";
      case "skills":
        return sections.skillsSection || "No skills section generated yet.";
      case "original":
        return originalResumeText;
      case "full":
      default:
        return improvedResumeText || sections.improvedResumeText || originalResumeText;
    }
  };

  const currentContent = getTabContent();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    const filename =
      activeTab === "full"
        ? "ats_optimized_resume.txt"
        : `ats_${activeTab}_section.txt`;
    const blob = new Blob([currentContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 md:p-8 shadow-sm">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              AI Resume Improvement & Optimization Module
            </h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Modular, fact-preserving rewrites for your Professional Summary, Project Descriptions, Experience, and Skills sections.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onGenerateImprovement}
            disabled={isImproving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50"
          >
            {isImproving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Optimizing & Recalculating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{hasImproved ? "Regenerate Recommendations" : "Generate Optimized Resume"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Recalculated Score Delta Banner (if improved) */}
      {hasImproved && improvedScore !== null && (
        <div className="my-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200/80 dark:border-emerald-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500 text-white font-bold text-lg shadow-sm">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-emerald-950 dark:text-emerald-200 text-sm">
                  ATS Score Re-evaluated Deterministically
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                  {scoreDelta > 0 ? `+${scoreDelta} pts improvement` : scoreDelta === 0 ? "Score maintained" : `${scoreDelta} pts`}
                </span>
              </div>
              <p className="text-xs text-emerald-800 dark:text-emerald-400 mt-0.5">
                Before: <strong className="font-mono">{originalScore}/100</strong> → After:{" "}
                <strong className="font-mono text-emerald-600 dark:text-emerald-300">{improvedScore}/100</strong>. Recalculated using the ATS Resume Quality Engine.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold hidden sm:inline">
              Verified by ATS Engine
            </span>
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {!hasImproved && !isImproving ? (
        <div className="py-12 px-4 text-center rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-dashed border-gray-200 dark:border-gray-800 my-6">
          <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <h4 className="font-bold text-gray-900 dark:text-white text-base">
            Ready to generate ATS-optimized recommendations?
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
            Click <strong>Generate Optimized Resume</strong> above to receive modular rewritten content for your Summary, Projects, Experience, and Skills sections.
          </p>
        </div>
      ) : (
        <div className="space-y-4 mt-6">
          {/* Section Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-gray-100 dark:border-gray-800">
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab("full")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === "full"
                    ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-2xs font-bold"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-emerald-500" />
                <span>Full Optimized Draft</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("summary")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === "summary"
                    ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-2xs font-bold"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                }`}
              >
                <User className="w-3.5 h-3.5 text-indigo-500" />
                <span>Professional Summary</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("projects")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === "projects"
                    ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-2xs font-bold"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-teal-500" />
                <span>Project Descriptions</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("experience")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === "experience"
                    ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-2xs font-bold"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-cyan-500" />
                <span>Experience Section</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("skills")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === "skills"
                    ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-2xs font-bold"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                }`}
              >
                <Wrench className="w-3.5 h-3.5 text-amber-500" />
                <span>Skills Section</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("original")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === "original"
                    ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-2xs font-bold"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                }`}
              >
                <span>Original ({originalScore} pts)</span>
              </button>
            </div>

            {/* Copy & Download Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy Section"}</span>
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .txt</span>
              </button>
            </div>
          </div>

          {/* Text Area / Preview */}
          <div className="relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-950/70 p-5 font-mono text-xs text-gray-800 dark:text-gray-200 leading-relaxed overflow-x-auto max-h-[500px] overflow-y-auto whitespace-pre-wrap select-text">
            {currentContent}
          </div>

          {/* Fact-Preservation Disclaimer */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 text-[11px] text-gray-500 dark:text-gray-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <p>
              <strong>Anti-Hallucination & ATS Standard Guarantee:</strong> Rewritten recommendations only refine formatting, highlight verified skills from your background, and align section headings with ATS parsing standards. Always verify all details before submitting.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AtsImprovedResumeView;

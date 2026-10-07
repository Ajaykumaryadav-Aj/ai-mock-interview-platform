// src/components/ats/AtsInterviewBridge.jsx
import React from "react";
import {
  Video,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Code2,
  AlertTriangle,
  Target,
  Layers,
  HelpCircle,
  Loader2,
} from "lucide-react";

export const AtsInterviewBridge = ({
  candidateTitle = "Software Developer",
  extractedSkills = [],
  missingKeywords = [],
  targetRole = "",
  weakAreas = [],
  projects = [],
  onStartInterview,
  isStarting = false,
}) => {
  const formatSkillNames = (items, max = 3) => {
    if (!Array.isArray(items)) return "";
    const names = [];
    for (const item of items) {
      if (typeof item === "string" && item.trim()) {
        names.push(item.trim());
      } else if (item && typeof item === "object") {
        const val = item.keyword || item.canonical || item.term || item.name || item.skill;
        if (typeof val === "string" && val.trim()) {
          names.push(val.trim());
        }
      }
      if (names.length >= max) break;
    }

    const clean = names.filter((n) => n && n !== "[object Object]");
    if (clean.length === 0) return "";
    if (clean.length === 1) return clean[0];
    if (clean.length === 2) return `${clean[0]} and ${clean[1]}`;
    return `${clean.slice(0, -1).join(", ")} and ${clean[clean.length - 1]}`;
  };

  const topSkillsSummary = formatSkillNames(extractedSkills, 3);
  const missingSummary = formatSkillNames(missingKeywords, 2);
  const firstProject = projects[0]?.name || "Featured Application";
  const effectiveRole = targetRole || candidateTitle || "Software Engineer";
  const sampleMissingSkill = Array.isArray(missingKeywords) && missingKeywords[0]
    ? typeof missingKeywords[0] === "string"
      ? missingKeywords[0]
      : missingKeywords[0].keyword || "Redis"
    : "Redis";

  return (
    <div className="rounded-3xl p-6 md:p-8 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-700/50 relative overflow-hidden space-y-6">
      {/* Decorative background glow */}
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        {/* Left: Info */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>Role-Calibrated Mock Interview Engine</span>
          </div>

          <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Targeted AI Mock Interview for {effectiveRole}
          </h3>
          <p className="text-indigo-200/90 text-sm md:text-base mt-2 leading-relaxed">
            Practice an AI interview calibrated against your verified skills, resume projects, missing industry skills, and identified resume weak areas.
          </p>

          {/* 5 Calibrated Question Pillars Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5 text-xs">
            {/* 1. Resume Skills */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <span className="text-emerald-400 font-bold block mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                1. Resume Skills Deep-Dive
              </span>
              <p className="text-gray-300 text-[11px] leading-normal">
                {topSkillsSummary
                  ? `Validates hands-on proficiency with ${topSkillsSummary}.`
                  : "Validates technical core skills and framework architecture."}
              </p>
            </div>

            {/* 2. Resume Projects */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <span className="text-cyan-400 font-bold block mb-1 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                2. Project Architecture Probing
              </span>
              <p className="text-gray-300 text-[11px] leading-normal">
                Tests technical decisions, scalability, and code structure in {firstProject}.
              </p>
            </div>

            {/* 3. Missing Skills */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <span className="text-amber-400 font-bold block mb-1 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5" />
                3. Missing Skills & Fast Ramp-up
              </span>
              <p className="text-gray-300 text-[11px] leading-normal">
                {missingSummary
                  ? `Targeted questions bridging gap in ${missingSummary}.`
                  : "Examines conceptual understanding of missing role competencies."}
              </p>
            </div>

            {/* 4. Weak Areas & Metrics */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <span className="text-rose-400 font-bold block mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                4. Weak Areas & Engineering Quality
              </span>
              <p className="text-gray-300 text-[11px] leading-normal">
                Probes metrics, debugging processes, and unit test discipline.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Action CTA */}
        <div className="shrink-0 flex flex-col items-center sm:items-start lg:items-end justify-center">
          <button
            type="button"
            onClick={onStartInterview}
            disabled={isStarting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-base bg-white text-indigo-950 hover:bg-indigo-50 shadow-lg hover:shadow-xl transition-all cursor-pointer disabled:opacity-50"
          >
            {isStarting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                <span>Generating Interview Room...</span>
              </>
            ) : (
              <>
                <Video className="w-5 h-5 text-indigo-600" />
                <span>Start AI Interview</span>
                <ArrowRight className="w-4 h-4 text-indigo-400" />
              </>
            )}
          </button>
          <span className="text-[11px] text-indigo-300/80 mt-2 text-center lg:text-right">
            Prepares questions based on Resume + {effectiveRole} Gaps
          </span>
        </div>
      </div>

      {/* Example Prompt Showcase */}
      <div className="relative z-10 p-3 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3 text-xs text-indigo-200">
        <HelpCircle className="w-4 h-4 text-indigo-300 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">Sample Calibrated Question Generated for {effectiveRole}:</span>
          <p className="text-indigo-200/90 text-[11px] mt-0.5 font-mono">
            "Role: {effectiveRole} | Missing Skill: {sampleMissingSkill} → Explain {sampleMissingSkill} caching and when you would use it in a {effectiveRole} application."
          </p>
        </div>
      </div>
    </div>
  );
};

export default AtsInterviewBridge;

// src/components/ats/AtsIssuesView.jsx
import React, { useState } from "react";
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileCheck2,
} from "lucide-react";

export const AtsIssuesView = ({ issues = [], strengths = [], qualityAudit = {} }) => {
  const [filter, setFilter] = useState("all"); // 'all' | 'high' | 'medium' | 'strengths'
  const [expandedIssues, setExpandedIssues] = useState({});

  const toggleExpand = (id) => {
    setExpandedIssues((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const highIssues = issues.filter((i) => i.severity === "HIGH");
  const medIssues = issues.filter((i) => i.severity === "MEDIUM" || i.severity === "INFO");

  const filteredIssues =
    filter === "high"
      ? highIssues
      : filter === "medium"
      ? medIssues
      : filter === "strengths"
      ? []
      : issues;

  const showStrengths = filter === "all" || filter === "strengths";

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 md:p-8 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Resume Quality & ATS Compatibility Audit
            </h3>
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              {issues.length} Issues • {strengths.length} Strengths
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Grounded structural audit detecting section completeness, quantifiable metrics, contact info, and parser friendliness.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-800/80 rounded-xl text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === "all"
                ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-xs font-semibold"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            All ({issues.length + strengths.length})
          </button>
          <button
            onClick={() => setFilter("high")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === "high"
                ? "bg-rose-500 text-white font-semibold"
                : "text-rose-600 dark:text-rose-400 hover:text-rose-700"
            }`}
          >
            Critical ({highIssues.length})
          </button>
          <button
            onClick={() => setFilter("medium")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === "medium"
                ? "bg-amber-500 text-white font-semibold"
                : "text-amber-600 dark:text-amber-400 hover:text-amber-700"
            }`}
          >
            Moderate ({medIssues.length})
          </button>
          <button
            onClick={() => setFilter("strengths")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === "strengths"
                ? "bg-emerald-600 text-white font-semibold"
                : "text-emerald-600 dark:text-emerald-400 hover:text-emerald-700"
            }`}
          >
            Passed ({strengths.length})
          </button>
        </div>
      </div>

      {/* Structural Stats Strip */}
      {qualityAudit && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
          <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 text-center">
            <span className="text-xs text-gray-500 dark:text-gray-400 block font-medium">Word Count</span>
            <span className="text-lg font-bold text-gray-900 dark:text-white mt-0.5 block">
              {qualityAudit.wordCount || 0}
            </span>
            <span className="text-[11px] text-gray-400">Target: 350 - 950 words</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 text-center">
            <span className="text-xs text-gray-500 dark:text-gray-400 block font-medium">Quantifiable Metrics</span>
            <span className={`text-lg font-bold mt-0.5 block ${
              (qualityAudit.metricsCount || 0) >= 3 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
            }`}>
              {qualityAudit.metricsCount || 0} found
            </span>
            <span className="text-[11px] text-gray-400">Numbers, %, $, metrics</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 text-center">
            <span className="text-xs text-gray-500 dark:text-gray-400 block font-medium">Bullet Points</span>
            <span className="text-lg font-bold text-gray-900 dark:text-white mt-0.5 block">
              {qualityAudit.bulletsCount || 0}
            </span>
            <span className="text-[11px] text-gray-400">Action-oriented bullets</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 text-center">
            <span className="text-xs text-gray-500 dark:text-gray-400 block font-medium">Core Sections</span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
              {[
                qualityAudit.hasProfessionalSummary,
                qualityAudit.hasSkillsSection,
                qualityAudit.hasExperienceSection,
                qualityAudit.hasEducationSection,
              ].filter(Boolean).length} / 4
            </span>
            <span className="text-[11px] text-gray-400">Summary, Skills, Exp, Edu</span>
          </div>
        </div>
      )}

      {/* Issues List */}
      <div className="space-y-3.5">
        {filteredIssues.map((issue) => {
          const isHigh = issue.severity === "HIGH";
          const isExpanded = expandedIssues[issue.id];
          return (
            <div
              key={issue.id}
              className={`rounded-2xl border transition-all ${
                isHigh
                  ? "border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20"
                  : "border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20"
              }`}
            >
              <div
                onClick={() => toggleExpand(issue.id)}
                className="p-4 sm:p-5 flex items-start justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`mt-0.5 p-2 rounded-xl shrink-0 ${
                      isHigh
                        ? "bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400"
                        : "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400"
                    }`}
                  >
                    {isHigh ? <AlertTriangle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center flex-wrap gap-2">
                      <h4 className="font-bold text-gray-900 dark:text-white text-base">
                        {issue.title}
                      </h4>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isHigh
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                        }`}
                      >
                        {issue.severity} Priority
                      </span>
                      {issue.category && (
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 capitalize">
                          • {issue.category}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                      {issue.description || issue.evidence}
                    </p>
                    {issue.recommendation && (
                      <div className="mt-2 text-xs font-medium text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                        <span className="font-bold uppercase tracking-wider text-[10px] bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded">Recommendation</span>
                        <span>{issue.recommendation}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 mt-1 p-1"
                  aria-label="Toggle details"
                >
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>

              {/* Collapsible Evidence Section */}
              {isExpanded && issue.evidence && (
                <div className="px-5 pb-5 pt-1 border-t border-gray-200/60 dark:border-gray-800/60">
                  <div className="p-3 rounded-xl bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 text-xs font-mono text-gray-700 dark:text-gray-300">
                    <span className="font-semibold text-gray-500 block mb-1 font-sans">
                      Detected Evidence:
                    </span>
                    {issue.evidence}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredIssues.length === 0 && filter !== "strengths" && (
          <div className="text-center py-8 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 p-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <h4 className="font-bold text-gray-900 dark:text-white text-base">
              No Issues Found in this Category
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
              Your resume successfully satisfied all structural and formatting checkpoints for this filter.
            </p>
          </div>
        )}

        {/* Strengths Section */}
        {showStrengths && strengths.length > 0 && (
          <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-800 space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                Passed Quality Checkpoints ({strengths.length})
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {strengths.map((str) => (
                <div
                  key={str.id}
                  className="p-3.5 rounded-2xl bg-emerald-50/30 dark:bg-emerald-950/15 border border-emerald-100/80 dark:border-emerald-900/40 flex items-start gap-3"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <h5 className="text-xs font-bold text-gray-900 dark:text-white">
                      {str.title}
                    </h5>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-normal">
                      {str.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AtsIssuesView;

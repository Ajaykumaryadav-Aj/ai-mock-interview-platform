// src/components/ats/AtsProjectAnalysisView.jsx
import React from "react";
import {
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Code2,
} from "lucide-react";

export const AtsProjectAnalysisView = ({ projects = [], profileName = "" }) => {
  if (!projects || projects.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-8 text-center shadow-sm">
        <Layers className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <h4 className="font-bold text-gray-900 dark:text-white text-base">
          No Dedicated Projects Detected
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
          Add 2-3 technical projects with architecture details, links, and technologies used to showcase your practical abilities.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 md:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Technical Project Evaluation
            </h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Independent technical audit of projects on your resume, evaluated for depth, metrics, and technology clarity.
          </p>
        </div>

        <span className="text-xs px-3 py-1.5 rounded-full font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 self-start sm:self-auto">
          {projects.length} Project{projects.length === 1 ? "" : "s"} Analyzed
        </span>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 gap-6">
        {projects.map((proj, idx) => {
          const isHigh = proj.relevance === "High";
          const isMed = proj.relevance === "Medium";

          return (
            <div
              key={idx}
              className="rounded-2xl border border-gray-200 dark:border-gray-800 p-6 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-850/50 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800 transition-all space-y-4"
            >
              {/* Project Title & Industry Relevance */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-base font-bold text-gray-900 dark:text-white">
                      {proj.name}
                    </h4>
                    <span className="text-[11px] text-gray-400">
                      {profileName ? `Evaluated for ${profileName}` : "Technical Evaluation"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                    Relevance:
                  </span>
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      isHigh
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : isMed
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {proj.relevance} Relevance
                  </span>
                </div>
              </div>

              {/* Technologies Used */}
              <div>
                <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-2">
                  <Code2 className="w-3.5 h-3.5 text-indigo-500" />
                  Technologies Used:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(proj.technologies || []).map((tech, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200/80 dark:border-gray-700/80"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Strengths & Weaknesses 2-Column Split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* Strengths */}
                <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Project Strengths
                  </span>
                  <ul className="space-y-1.5 text-xs text-emerald-950 dark:text-emerald-200 font-medium">
                    {(proj.strengths || []).map((s, sIdx) => (
                      <li key={sIdx} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold shrink-0">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40">
                  <span className="text-xs font-bold text-rose-900 dark:text-rose-300 flex items-center gap-1.5 mb-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    Areas to Strengthen
                  </span>
                  <ul className="space-y-1.5 text-xs text-rose-950 dark:text-rose-200 font-medium">
                    {(proj.weaknesses || []).map((w, wIdx) => (
                      <li key={wIdx} className="flex items-start gap-1.5">
                        <span className="text-rose-600 font-bold shrink-0">•</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Improvement Suggestions */}
              {proj.improvementSuggestions && (
                <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 flex items-start gap-2.5 text-xs">
                  <Lightbulb className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-indigo-900 dark:text-indigo-200 block mb-0.5">
                      Improvement Recommendation:
                    </span>
                    <p className="text-indigo-950 dark:text-indigo-100 font-medium leading-relaxed">
                      {proj.improvementSuggestions}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AtsProjectAnalysisView;

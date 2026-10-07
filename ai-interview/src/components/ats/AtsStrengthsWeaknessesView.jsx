// src/components/ats/AtsStrengthsWeaknessesView.jsx
import React from "react";
import { CheckCircle2, AlertTriangle, ShieldCheck, ArrowUpRight } from "lucide-react";

export const AtsStrengthsWeaknessesView = ({
  strengths = [],
  weaknesses = [],
}) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 md:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Resume Strengths & Weaknesses Analysis
          </h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Objective evaluation of what makes your resume structurally sound and competitive, alongside identified risk factors.
        </p>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Strengths */}
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 p-5 bg-gradient-to-br from-emerald-50/40 to-teal-50/20 dark:from-emerald-950/20 dark:to-teal-950/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-emerald-900/40">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h4 className="font-bold text-emerald-950 dark:text-emerald-200 text-sm">
                Verified Strengths ({strengths.length})
              </h4>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
              Competitive Advantage
            </span>
          </div>

          <div className="space-y-3">
            {strengths.map((str, idx) => {
              const title = typeof str === "string" ? str : str.title;
              const desc = typeof str === "object" ? str.description || str.evidence : "";

              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white dark:bg-gray-850 border border-emerald-100 dark:border-emerald-900/30 shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="font-bold text-xs text-gray-900 dark:text-white">
                      {title}
                    </span>
                  </div>
                  {desc && (
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1.5 pl-4 leading-relaxed font-medium">
                      {desc}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Weaknesses */}
        <div className="rounded-2xl border border-rose-200 dark:border-rose-900/60 p-5 bg-gradient-to-br from-rose-50/40 to-amber-50/20 dark:from-rose-950/20 dark:to-amber-950/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-rose-100 dark:border-rose-900/40">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              <h4 className="font-bold text-rose-950 dark:text-rose-200 text-sm">
                Resume Weaknesses ({weaknesses.length})
              </h4>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300">
              Screening Risk
            </span>
          </div>

          <div className="space-y-3">
            {weaknesses.map((weak, idx) => {
              const title = typeof weak === "string" ? weak : weak.title;
              const desc = typeof weak === "object" ? weak.description || weak.evidence : "";

              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white dark:bg-gray-850 border border-rose-100 dark:border-rose-900/30 shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    <span className="font-bold text-xs text-gray-900 dark:text-white">
                      {title}
                    </span>
                  </div>
                  {desc && (
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1.5 pl-4 leading-relaxed font-medium">
                      {desc}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AtsStrengthsWeaknessesView;

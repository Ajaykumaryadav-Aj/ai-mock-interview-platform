// src/components/ats/AtsSuggestionsView.jsx
import React from "react";
import { Sparkles, Lightbulb, MapPin, HelpCircle, CheckCheck } from "lucide-react";

export const AtsSuggestionsView = ({ suggestions = [] }) => {
  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-8 text-center shadow-sm">
        <Sparkles className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
        <h4 className="font-bold text-gray-900 dark:text-white text-base">
          Resume Content & Structure is High Quality
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
          No critical structural or content gaps detected. Proceed with mock interview practice or review your keyword coverage.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 md:p-8 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Grounded AI Improvement Recommendations
            </h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            4-part structured advice derived directly from your resume structure, keyword depth, and content analysis.
          </p>
        </div>
        <span className="text-xs px-3 py-1.5 rounded-full font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 self-start sm:self-auto">
          {suggestions.length} Tailored Actions
        </span>
      </div>

      {/* Cards List */}
      <div className="space-y-4 mt-6">
        {suggestions.map((sug, idx) => {
          const priority = sug.priority || "MEDIUM";
          const isHigh = priority === "HIGH";

          return (
            <div
              key={idx}
              className="rounded-2xl border border-gray-200 dark:border-gray-800 p-5 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/40 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800 transition-all"
            >
              {/* Header with Step # and Priority */}
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      isHigh
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300"
                    }`}
                  >
                    {priority} Priority
                  </span>
                </div>
              </div>

              {/* 4 Structured Parts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                {/* 1. What is Wrong */}
                <div className="p-3 rounded-xl bg-white dark:bg-gray-850 border border-gray-150 dark:border-gray-800">
                  <div className="flex items-center gap-1.5 font-bold text-gray-800 dark:text-gray-200 mb-1">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span>1. What: Issue Detected</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                    {sug.what}
                  </p>
                </div>

                {/* 2. Where is it Wrong */}
                <div className="p-3 rounded-xl bg-white dark:bg-gray-850 border border-gray-150 dark:border-gray-800">
                  <div className="flex items-center gap-1.5 font-bold text-gray-800 dark:text-gray-200 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                    <span>2. Where: Section Location</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                    {sug.where}
                  </p>
                </div>

                {/* 3. Why does it matter */}
                <div className="p-3 rounded-xl bg-white dark:bg-gray-850 border border-gray-150 dark:border-gray-800">
                  <div className="flex items-center gap-1.5 font-bold text-gray-800 dark:text-gray-200 mb-1">
                    <HelpCircle className="w-3.5 h-3.5 text-purple-500" />
                    <span>3. Why: ATS Scoring Impact</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                    {sug.why}
                  </p>
                </div>

                {/* 4. What to change */}
                <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-900 dark:text-indigo-200 mb-1">
                    <CheckCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>4. How: Recommended Action</span>
                  </div>
                  <p className="text-indigo-950 dark:text-indigo-100 leading-relaxed font-medium">
                    {sug.how}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AtsSuggestionsView;

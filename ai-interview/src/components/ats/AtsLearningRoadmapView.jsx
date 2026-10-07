// src/components/ats/AtsLearningRoadmapView.jsx
import React, { useState } from "react";
import {
  Compass,
  Calendar,
  CheckCircle2,
  Clock,
  Code2,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const AtsLearningRoadmapView = ({
  roadmap = [],
  targetRole = "Software Developer",
  missingSkills = [],
}) => {
  const [completedWeeks, setCompletedWeeks] = useState({});

  const toggleWeek = (weekNum) => {
    setCompletedWeeks((prev) => ({ ...prev, [weekNum]: !prev[weekNum] }));
  };

  const completedCount = Object.values(completedWeeks).filter(Boolean).length;
  const progressPercent = roadmap.length > 0 ? Math.round((completedCount / roadmap.length) * 100) : 0;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 md:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Targeted Skill Growth Roadmap
            </h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Personalized week-by-week curriculum to bridge identified skill gaps for a competitive {targetRole} profile.
          </p>
        </div>

        {/* Progress tracker */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="text-right">
            <span className="text-xs font-bold text-gray-900 dark:text-white block">
              {completedCount} of {roadmap.length} Weeks
            </span>
            <span className="text-[10px] text-gray-400">Curriculum Progress</span>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-indigo-200 dark:border-indigo-800 flex items-center justify-center font-bold text-xs text-indigo-600 dark:text-indigo-400">
            {progressPercent}%
          </div>
        </div>
      </div>

      {/* Timeline Steps */}
      <div className="space-y-4">
        {roadmap.map((item, idx) => {
          const isDone = Boolean(completedWeeks[item.week]);
          const isHigh = item.priority === "HIGH";

          return (
            <div
              key={idx}
              className={`rounded-2xl border p-5 transition-all ${
                isDone
                  ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
                  : "bg-white dark:bg-gray-850 border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  {/* Checkbox Button */}
                  <button
                    type="button"
                    onClick={() => toggleWeek(item.week)}
                    className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                      isDone
                        ? "bg-emerald-500 text-white"
                        : "border-2 border-gray-300 dark:border-gray-600 hover:border-indigo-500"
                    }`}
                    title="Mark week completed"
                  >
                    {isDone && <CheckCircle2 className="w-4 h-4" />}
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Week {item.week}
                      </span>
                      <span className="text-base font-extrabold text-gray-900 dark:text-white">
                        {item.skill}
                      </span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          isHigh
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                        }`}
                      >
                        {item.priority} Priority
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
                      {item.focus}
                    </p>

                    {/* Hands-on Task */}
                    {item.handsOnTask && (
                      <div className="mt-2 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-800 flex items-start gap-2 text-xs">
                        <Code2 className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-gray-800 dark:text-gray-200">Hands-On Goal:</strong>{" "}
                          <span className="text-gray-600 dark:text-gray-400">{item.handsOnTask}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 text-xs text-gray-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{item.estimatedHours || "6-8 hrs"}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AtsLearningRoadmapView;

// src/components/ats/AtsAnalyticsBar.jsx
import React from "react";
import { TrendingUp, Award, Clock, ArrowUpRight, CheckCircle2, Zap } from "lucide-react";

export const AtsAnalyticsBar = ({ analytics = {} }) => {
  const {
    highestScore = 0,
    latestScore = 0,
    averageScore = 0,
    improvementPercent = 0,
    totalScans = 0,
    skillGrowthTracking = [],
  } = analytics;

  if (totalScans <= 0) return null;

  return (
    <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-md border border-indigo-700/40 space-y-4">
      {/* Top Strip Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-800/60">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
            Candidate ATS Performance & Growth Analytics
          </span>
        </div>
        <span className="text-[11px] text-indigo-300">
          Based on {totalScans} resume audit{totalScans === 1 ? "" : "s"}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Highest Score */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
          <span className="text-[11px] text-indigo-200 block font-medium">Highest ATS Score</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-emerald-400">{highestScore}</span>
            <span className="text-xs text-indigo-300">/100</span>
          </div>
        </div>

        {/* Latest Score */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
          <span className="text-[11px] text-indigo-200 block font-medium">Latest ATS Score</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-cyan-400">{latestScore}</span>
            <span className="text-xs text-indigo-300">/100</span>
          </div>
        </div>

        {/* Average Score */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
          <span className="text-[11px] text-indigo-200 block font-medium">Average Score</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-indigo-200">{averageScore}</span>
            <span className="text-xs text-indigo-300">/100</span>
          </div>
        </div>

        {/* Improvement % */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
          <span className="text-[11px] text-indigo-200 block font-medium">Improvement %</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-amber-400">
              {improvementPercent > 0 ? `+${improvementPercent}%` : `${improvementPercent}%`}
            </span>
            <TrendingUp className="w-3.5 h-3.5 text-amber-400 ml-1 inline" />
          </div>
        </div>
      </div>

      {/* Skill Growth Tracking Badges */}
      {skillGrowthTracking.length > 0 && (
        <div className="pt-2 border-t border-indigo-800/60">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-bold text-indigo-200">
              Skill Growth Tracking (Verified Across Scans):
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {skillGrowthTracking.slice(0, 10).map((item, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-indigo-100 border border-white/10 flex items-center gap-1"
              >
                <span>{item.skill}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AtsAnalyticsBar;

// src/components/ats/AtsScoreGauge.jsx
import React from "react";
import { Award, Sparkles } from "lucide-react";

export const AtsScoreGauge = ({
  score = 0,
  detectedProfile = "",
  candidateTitle = "",
  assessment = "",
}) => {
  const displayTitle = candidateTitle || detectedProfile || "Resume ATS Audit";

  // Color Coding as specified:
  // Red: 0-50, Yellow: 51-75, Green: 76-100
  let tierColor = "text-emerald-500 dark:text-emerald-400";
  let strokeColor = "#10b981"; // green
  let bgColor = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800";
  let badgeText = "Strong ATS Compatibility (76-100)";
  let description = assessment || "Solid ATS parseability, clear section structure, and demonstrable technical skills.";

  if (score >= 76) {
    tierColor = "text-emerald-500 dark:text-emerald-400";
    strokeColor = "#10b981";
    bgColor = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800";
    badgeText = "Strong ATS Compatibility (76-100)";
    if (!assessment) {
      description = "Outstanding resume structure, robust parseability, clear skill categorization, and strong quantifiable achievements.";
    }
  } else if (score >= 51) {
    tierColor = "text-yellow-500 dark:text-yellow-400";
    strokeColor = "#eab308";
    bgColor = "bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-800";
    badgeText = "Moderate Compatibility (51-75)";
    if (!assessment) {
      description = "Passes standard ATS parsers. Add quantifiable metrics and standardize section headers to maximize hiring impact.";
    }
  } else {
    tierColor = "text-rose-500 dark:text-rose-400";
    strokeColor = "#ef4444";
    bgColor = "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800";
    badgeText = "Needs Improvement (0-50)";
    if (!assessment) {
      description = "Significant structural or formatting gaps detected. High risk of ATS parse failure or indexing omission.";
    }
  }

  // Radial SVG Math
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
      {/* Left: Circular Progress Score Gauge */}
      <div className="flex items-center gap-6 shrink-0">
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
            {/* Background Track */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              className="text-gray-100 dark:text-gray-800"
              strokeWidth="12"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Animated Circular Score Bar */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke={strokeColor}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Centered Score Number */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className={`text-4xl font-extrabold tracking-tight ${tierColor}`}>
              {score}
            </span>
            <span className="text-xs uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500">
              out of 100
            </span>
          </div>
        </div>

        {/* Score Details */}
        <div className="space-y-1.5 text-left">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Overall ATS Score
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {displayTitle}
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${bgColor}`}>
            <Award className="w-3.5 h-3.5" />
            {badgeText}
          </span>
        </div>
      </div>

      {/* Right: Meaningful Assessment */}
      <div className="flex-1 max-w-md text-left space-y-2 border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-800 pt-4 md:pt-0 md:pl-8">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-gray-200">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          ATS Compatibility Assessment
        </div>
        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          {description}
        </p>
        <p className="text-[11px] text-muted-foreground">
          Calculated across 8 deterministic pillars: ATS Parseability (15%), Structure (15%), Skills Clarity (15%), Experience (20%), Projects (10%), Achievements (10%), Formatting (10%), and Consistency (5%).
        </p>
      </div>
    </div>
  );
};

export default AtsScoreGauge;

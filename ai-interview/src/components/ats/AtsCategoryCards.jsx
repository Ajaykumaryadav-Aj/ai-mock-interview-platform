// src/components/ats/AtsCategoryCards.jsx
import React from "react";
import {
  FileText,
  LayoutTemplate,
  KeyRound,
  Briefcase,
  Layers,
  Award,
  Sparkles,
  CheckCheck,
} from "lucide-react";

export const AtsCategoryCards = ({ categoryScores = {} }) => {
  const {
    atsParseability = categoryScores.atsParseability || 90,
    resumeStructure = categoryScores.resumeStructure || categoryScores.structure || 85,
    skillsClarity = categoryScores.skillsClarity || categoryScores.skillsQuality || 85,
    experienceQuality = categoryScores.experienceQuality || categoryScores.experienceRelevance || 80,
    projectQuality = categoryScores.projectQuality || 80,
    achievementStrength = categoryScores.achievementStrength || categoryScores.impactAndMetrics || 60,
    formatting = categoryScores.formatting || categoryScores.readability || 85,
    contentConsistency = categoryScores.contentConsistency || 90,
  } = categoryScores;

  const categories = [
    {
      title: "ATS Parseability",
      score: atsParseability,
      weight: "15% Weight",
      icon: <FileText className="w-4 h-4 text-indigo-500" />,
      desc: "Text extraction cleanliness, no merged headers or split words.",
    },
    {
      title: "Resume Structure",
      score: resumeStructure,
      weight: "15% Weight",
      icon: <LayoutTemplate className="w-4 h-4 text-emerald-500" />,
      desc: "Presence and delineation of standard sections (Summary, Skills, Experience, Education).",
    },
    {
      title: "Skills Clarity",
      score: skillsClarity,
      weight: "15% Weight",
      icon: <KeyRound className="w-4 h-4 text-blue-500" />,
      desc: "Logical domain grouping, breadth, and reinforcement in projects.",
    },
    {
      title: "Experience Quality",
      score: experienceQuality,
      weight: "20% Weight",
      icon: <Briefcase className="w-4 h-4 text-purple-500" />,
      desc: "Action-driven verbs, clear employment roles, and technical responsibilities.",
    },
    {
      title: "Project Quality",
      score: projectQuality,
      weight: "10% Weight",
      icon: <Layers className="w-4 h-4 text-cyan-500" />,
      desc: "Real-world engineering complexity, technologies, and architecture.",
    },
    {
      title: "Achievement Strength",
      score: achievementStrength,
      weight: "10% Weight",
      icon: <Award className="w-4 h-4 text-amber-500" />,
      desc: "Quantifiable outcome metrics (% improvement, user scale, latency savings).",
    },
    {
      title: "Formatting & Readability",
      score: formatting,
      weight: "10% Weight",
      icon: <Sparkles className="w-4 h-4 text-teal-500" />,
      desc: "Clean typography, concise bullet points, and optimal length.",
    },
    {
      title: "Content Consistency",
      score: contentConsistency,
      weight: "5% Weight",
      icon: <CheckCheck className="w-4 h-4 text-rose-500" />,
      desc: "Consistent 4-digit date ranges, no repeated blocks, and clean titles.",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3.5">
      {categories.map((cat, idx) => {
        const isGood = cat.score >= 76;
        const isAverage = cat.score >= 51 && cat.score < 76;

        const badgeColor = isGood
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
          : isAverage
          ? "bg-yellow-50 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400"
          : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400";

        const barColor = isGood
          ? "bg-emerald-500"
          : isAverage
          ? "bg-yellow-500"
          : "bg-rose-500";

        return (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xs flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
                  {cat.icon}
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
                  {cat.weight}
                </span>
              </div>

              <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                {cat.title}
              </h4>

              <div className="flex items-baseline gap-0.5 mt-1">
                <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  {cat.score}
                </span>
                <span className="text-xs text-gray-400 font-semibold">{cat.unit}</span>
              </div>

              <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                  style={{ width: `${Math.min(100, Math.max(5, cat.score))}%` }}
                />
              </div>
            </div>

            <p className="text-[10px] text-gray-400 mt-2.5 leading-snug line-clamp-2">
              {cat.desc}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default AtsCategoryCards;

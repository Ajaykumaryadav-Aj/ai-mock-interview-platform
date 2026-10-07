// src/components/ats/AtsKeywordsView.jsx
import React, { useState } from "react";
import {
  KeyRound,
  Code2,
  Layers,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Check,
  Search,
  Cpu,
} from "lucide-react";

export const AtsDetectedSkillsView = ({
  extractedSkills = [],
  skillCategories = {},
  skillsAudit = {},
  detectedProfile = "",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Group extracted skills by domain if skillCategories is empty
  const domainGroups = { ...skillCategories };
  if (Object.keys(domainGroups).length === 0 && extractedSkills.length > 0) {
    for (const skill of extractedSkills) {
      const cat = skill.category || "General";
      if (!domainGroups[cat]) domainGroups[cat] = [];
      domainGroups[cat].push(skill);
    }
  }

  const allCategories = Object.keys(domainGroups);

  // Filter skills by search term and category
  const filteredSkills = extractedSkills.filter((skill) => {
    const matchesSearch =
      (skill.keyword || skill).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat =
      selectedCategory === "all" || skill.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const appliedCount = extractedSkills.filter((s) => s.appliedInWorkOrProjects).length;
  const appliedRatio =
    extractedSkills.length > 0
      ? Math.round((appliedCount / extractedSkills.length) * 100)
      : 0;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 md:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-indigo-500" />
            Detected Technical Skills & Clarity Audit
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Verified technical competencies extracted directly from your resume text. Evaluated for clarity, domain grouping, and practical application.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search detected skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-850 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Skills Health & Audit Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Code2 className="w-4 h-4" />
            <span>Total Detected Skills</span>
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
            {extractedSkills.length}
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
            Verified across {allCategories.length} functional domains
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            <span>Practical Reinforcement</span>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {appliedRatio}%
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
            {appliedCount} of {extractedSkills.length} skills demonstrated in Experience or Projects
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider">
            <Cpu className="w-4 h-4" />
            <span>Skills Grouping Health</span>
          </div>
          <div className="text-sm font-bold text-gray-900 dark:text-white mt-2">
            {allCategories.length >= 3 ? "Logically Categorized" : "Basic Grouping"}
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
            {allCategories.slice(0, 3).join(", ")}
          </p>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedCategory("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            selectedCategory === "all"
              ? "bg-indigo-600 text-white font-bold shadow-2xs"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
          }`}
        >
          All Domains ({extractedSkills.length})
        </button>
        {allCategories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? "bg-indigo-600 text-white font-bold shadow-2xs"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
            }`}
          >
            {cat} ({domainGroups[cat]?.length || 0})
          </button>
        ))}
      </div>

      {/* Skills Grouped by Domain */}
      <div className="space-y-6">
        {selectedCategory === "all" ? (
          allCategories.map((domain) => {
            const domainSkills = (domainGroups[domain] || []).filter((s) =>
              (s.keyword || s).toLowerCase().includes(searchTerm.toLowerCase())
            );
            if (domainSkills.length === 0) return null;

            return (
              <div
                key={domain}
                className="p-5 rounded-2xl bg-gray-50/50 dark:bg-gray-850/50 border border-gray-100 dark:border-gray-800/80 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    {domain}
                  </h4>
                  <span className="text-[11px] font-mono text-gray-400">
                    {domainSkills.length} competencies
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {domainSkills.map((skill, sIdx) => {
                    const name = skill.keyword || skill.canonical || skill;
                    const isApplied = skill.appliedInWorkOrProjects;

                    return (
                      <div
                        key={sIdx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 text-xs font-medium text-gray-800 dark:text-gray-200 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                      >
                        <span className="font-semibold">{name}</span>
                        {isApplied ? (
                          <span
                            className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold"
                            title="Applied in Work Experience or Projects"
                          >
                            <Check className="w-2.5 h-2.5" />
                            Applied
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400 font-mono">
                            {skill.occurrences ? `${skill.occurrences}x` : "Listed"}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-wrap gap-2">
            {filteredSkills.map((skill, sIdx) => {
              const name = skill.keyword || skill.canonical || skill;
              const isApplied = skill.appliedInWorkOrProjects;

              return (
                <div
                  key={sIdx}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-800 dark:text-gray-200 shadow-2xs"
                >
                  <span className="font-bold">{name}</span>
                  {isApplied && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-0.5">
                      <Check className="w-2.5 h-2.5" />
                      Applied in Projects/Work
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Skills Audit Notice */}
      <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
        <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">Skills Clarity & ATS Indexing Recommendation</span>
          <p className="mt-0.5 text-amber-800 dark:text-amber-300/80 leading-relaxed">
            Ensure skills are organized under dedicated section headings without merged lines (e.g., separate &quot;Databases&quot; and &quot;Core CS Concepts&quot;). Reinforce key competencies by explicitly citing them inside your project bullet points.
          </p>
        </div>
      </div>
    </div>
  );
};

export const AtsKeywordsView = AtsDetectedSkillsView;
export default AtsDetectedSkillsView;

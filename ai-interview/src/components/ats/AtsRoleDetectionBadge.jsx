// src/components/ats/AtsRoleDetectionBadge.jsx
import React from "react";
import { UserCheck, Sparkles } from "lucide-react";

export const AtsCandidateProfileBadge = ({
  detectedProfile = "",
  candidateTitle = "",
  detectedRole = "",
  skillsCount = 0,
  sectionsCount = 5,
  wordCount = 0,
}) => {
  const profileName = detectedProfile || candidateTitle || detectedRole || "Resume ATS Analysis";

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-indigo-100 dark:border-indigo-950/60 p-5 md:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-sm shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Detected Profile
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Resume Heading & Content
              </span>
            </div>

            <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mt-0.5">
              {profileName}
            </h2>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Profile detected directly from your resume heading and technical competencies. Your ATS score is calibrated specifically for this profile.
            </p>
          </div>
        </div>

        {(skillsCount > 0 || wordCount > 0) && (
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            {skillsCount > 0 && (
              <span className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/40 text-xs font-bold">
                {skillsCount} Skills Found
              </span>
            )}
            {wordCount > 0 && (
              <span className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold">
                {wordCount} Words
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const AtsRoleDetectionBadge = AtsCandidateProfileBadge;
export default AtsCandidateProfileBadge;


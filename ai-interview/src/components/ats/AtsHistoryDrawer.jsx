// src/components/ats/AtsHistoryDrawer.jsx
import React from "react";
import {
  History,
  X,
  Calendar,
  ArrowRight,
  Trash2,
  FileText,
  Loader2,
} from "lucide-react";

export const AtsHistoryDrawer = ({
  isOpen = false,
  onClose,
  history = [],
  isLoading = false,
  onSelectScan,
  onDeleteScan,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-800 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                  ATS Scan History
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Previous resume ATS audits
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-150 dark:hover:bg-gray-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3.5">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin mb-2 text-indigo-600" />
                <span className="text-xs">Loading history...</span>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 text-sm">
                  No Past Scans Yet
                </h4>
                <p className="text-xs text-gray-400 mt-1">
                  Upload and analyze a resume to save your first ATS audit.
                </p>
              </div>
            ) : (
              history.map((scan) => {
                const score = scan.overallScore || scan.report?.overallScore || 0;
                const role = scan.detectedProfile || scan.candidateTitle || scan.resumeFileName || "Candidate Resume";
                const date = scan.analyzedAt || scan.createdAt
                  ? new Date(scan.analyzedAt || scan.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Recent";

                const scoreColor =
                  score >= 80
                    ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800"
                    : score >= 60
                    ? "text-teal-600 bg-teal-50 dark:bg-teal-950/50 border-teal-200 dark:border-teal-800"
                    : "text-amber-600 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800";

                const skillsCount =
                  scan.extractedSkills?.length ||
                  scan.keywordStats?.totalSkillsCount ||
                  (Array.isArray(scan.matchedKeywords) ? scan.matchedKeywords.length : 0);

                return (
                  <div
                    key={scan._id || scan.id}
                    className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-800 bg-white dark:bg-gray-850 transition-all shadow-xs flex items-center justify-between gap-3 group"
                  >
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => {
                        onSelectScan(scan);
                        onClose();
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg border ${scoreColor}`}
                        >
                          {score}/100
                        </span>
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate">
                          {role}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 mt-2 text-[11px] text-gray-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{date}</span>
                        {skillsCount > 0 && (
                          <span>• {skillsCount} verified skills</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteScan(scan._id || scan.id);
                        }}
                        className="p-2 rounded-lg text-gray-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                        title="Delete scan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectScan(scan);
                          onClose();
                        }}
                        className="p-2 rounded-lg text-gray-400 group-hover:text-indigo-600 transition-all cursor-pointer"
                        title="Load scan"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AtsHistoryDrawer;

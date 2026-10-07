// src/components/coding/SubmissionsTab.jsx
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Code2,
  Copy,
  Check,
  RotateCcw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RotateCw,
  Terminal,
  Cpu,
} from "lucide-react";
import { toast } from "sonner";

export const SubmissionsTab = ({
  submissions = [],
  loading = false,
  onLoadCodeIntoEditor,
  onViewScorecard,
  onRefresh,
}) => {
  const [expandedId, setExpandedId] = useState(submissions[0]?.id || null);
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = async (code, id) => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      toast.success("Code copied to clipboard!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Failed to copy code.");
    }
  };

  const handleLoadIntoEditor = (code, language) => {
    if (!code) {
      toast.error("No code recorded for this submission.");
      return;
    }
    if (onLoadCodeIntoEditor) {
      onLoadCodeIntoEditor(code, language);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (loading) {
    return (
      <div className="space-y-3 py-4">
        <div className="h-20 rounded-xl bg-gray-100 dark:bg-gray-800/60 animate-pulse" />
        <div className="h-20 rounded-xl bg-gray-100 dark:bg-gray-800/60 animate-pulse" />
        <div className="h-20 rounded-xl bg-gray-100 dark:bg-gray-800/60 animate-pulse" />
      </div>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="p-8 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-center bg-gray-50/50 dark:bg-gray-900/50 space-y-3 my-4">
        <Terminal className="w-9 h-9 text-gray-400 mx-auto" />
        <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm">
          No submissions yet for this problem
        </h3>
        <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
          Write your solution in the code editor and click <span className="font-semibold text-emerald-600 dark:text-emerald-400">Submit</span> to evaluate your code against hidden test cases. Your past attempts and submitted code will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Past Submissions
            <span className="text-xs font-normal text-muted-foreground">
              ({submissions.length} attempt{submissions.length === 1 ? "" : "s"})
            </span>
          </h2>
          <p className="text-[11px] text-muted-foreground">
            Review previous code, compare revisions, or load directly into the editor.
          </p>
        </div>
        {onRefresh && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onRefresh}
            className="h-7 px-2 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"
            title="Refresh history"
          >
            <RotateCw className="w-3.5 h-3.5 mr-1" /> Refresh
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {submissions.map((sub, idx) => {
          const isExpanded = expandedId === sub.id;
          const isAccepted = sub.status === "Accepted" || sub.status === "Passed";
          const isCompileError = sub.status === "Compilation Error";
          const isTimeout = sub.status === "Time Limit Exceeded";

          const formattedDate = sub.createdAt
            ? new Date(sub.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : null;

          return (
            <div
              key={sub.id || idx}
              className={`rounded-xl border transition-all duration-150 overflow-hidden ${
                isAccepted
                  ? "border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10"
                  : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
              }`}
            >
              {/* Summary Header */}
              <div
                onClick={() => toggleExpand(sub.id)}
                className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors"
              >
                <div className="flex items-center gap-2.5 flex-wrap min-w-0">
                  {/* Status Indicator */}
                  {isAccepted ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Accepted
                    </span>
                  ) : isCompileError ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="w-4 h-4 text-amber-600" /> Compile Error
                    </span>
                  ) : isTimeout ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 dark:text-orange-400">
                      <Clock className="w-4 h-4 text-orange-600" /> Timeout
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                      <XCircle className="w-4 h-4 text-rose-600" /> {sub.status || "Wrong Answer"}
                    </span>
                  )}

                  <Badge
                    variant="outline"
                    className="capitalize font-mono text-[10px] px-1.5 py-0.5 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    {sub.language}
                  </Badge>

                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    {sub.score}/100
                  </span>

                  <span className="text-[11px] text-muted-foreground font-mono">
                    ({sub.passedCount ?? 0}/{sub.totalCount ?? 0} tests)
                  </span>

                  {sub.executionTime && (
                    <span className="text-[11px] text-gray-500 font-mono">
                      {sub.executionTime}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {formattedDate && (
                    <span className="text-[10px] text-muted-foreground hidden sm:inline">
                      {formattedDate}
                    </span>
                  )}

                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(sub.id);
                    }}
                    className="h-7 w-7 p-0 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    title={isExpanded ? "Collapse code" : "Expand code"}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Quick Details Bar */}
              <div className="px-3.5 pb-2.5 pt-0 flex items-center justify-between text-[11px] text-muted-foreground border-t border-gray-100 dark:border-gray-800/60 pt-2 gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  {sub.timeComplexity && (
                    <span className="inline-flex items-center gap-1 font-mono text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                      <Cpu className="w-3 h-3" /> Time: {sub.timeComplexity}
                    </span>
                  )}
                  {sub.spaceComplexity && (
                    <span className="inline-flex items-center gap-1 font-mono text-sky-700 dark:text-sky-400 font-semibold bg-sky-50 dark:bg-sky-950/40 px-1.5 py-0.5 rounded">
                      Space: {sub.spaceComplexity}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLoadIntoEditor(sub.code, sub.language);
                    }}
                    className="h-6 px-2 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                    title="Load this submitted code into Monaco editor"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" /> Load into Editor
                  </Button>

                  {onViewScorecard && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewScorecard(sub);
                      }}
                      className="h-6 px-2 text-[11px] text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400"
                    >
                      Scorecard <ExternalLink className="w-2.5 h-2.5 ml-1" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Expanded Code View */}
              {isExpanded && (
                <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-900 text-gray-100">
                  {/* Code Toolbar */}
                  <div className="px-3.5 py-2 bg-gray-950/90 border-b border-gray-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-mono text-[11px] text-gray-300 font-semibold uppercase">
                        {sub.language} Submission Code
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleCopy(sub.code, sub.id)}
                        className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-[11px] font-medium text-gray-200 flex items-center gap-1 transition-colors cursor-pointer"
                        title="Copy code to clipboard"
                      >
                        {copiedId === sub.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copy
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleLoadIntoEditor(sub.code, sub.language)}
                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-[11px] font-semibold text-white flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                        title="Load this code into your active editor"
                      >
                        <RotateCcw className="w-3 h-3" /> Load into Editor
                      </button>
                    </div>
                  </div>

                  {/* Code Block with Line Numbers */}
                  {sub.code ? (
                    <div className="p-3 font-mono text-xs overflow-x-auto max-h-80 select-text leading-relaxed">
                      <pre className="text-gray-200">
                        <code>{sub.code}</code>
                      </pre>
                    </div>
                  ) : (
                    <div className="p-4 text-xs text-gray-400 italic text-center">
                      No code content stored for this attempt.
                    </div>
                  )}

                  {/* AI Feedback Snippet if present */}
                  {sub.aiReview?.strengths?.length > 0 && (
                    <div className="px-3.5 py-2 bg-gray-950/70 border-t border-gray-800 text-[11px] space-y-1">
                      <span className="font-semibold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Key Strength:
                      </span>
                      <p className="text-gray-300">{sub.aiReview.strengths[0]}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubmissionsTab;

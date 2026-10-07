// src/components/coding/CodingScorecardModal.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  Clock,
  Cpu,
  ArrowRight,
  HelpCircle,
  ThumbsUp,
  Flame,
  ShieldCheck,
  Zap,
  Code2,
  Copy,
  Check,
} from "lucide-react";

export const CodingScorecardModal = ({ isOpen, onClose, submissionResult }) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [showCode, setShowCode] = useState(false);

  if (!submissionResult) return null;

  const {
    score = 0,
    status = "Wrong Answer",
    passedCount = 0,
    totalCount = 0,
    executionTime = "0ms",
    memory = "N/A",
    questionTitle,
    questionId,
    language,
    code,
    createdAt,
    complexityAnalysis = {},
    aiReview = {},
  } = submissionResult;

  // Status Badge Logic
  let statusBadge;
  if (status === "Accepted" || status === "Passed") {
    statusBadge = (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Accepted
      </span>
    );
  } else if (status === "Compilation Error") {
    statusBadge = (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Compilation Error
      </span>
    );
  } else if (status === "Time Limit Exceeded") {
    statusBadge = (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 border border-orange-300 font-bold text-xs">
        <Clock className="w-3.5 h-3.5 text-orange-600" /> Time Limit Exceeded
      </span>
    );
  } else if (status === "Runtime Error") {
    statusBadge = (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 font-bold text-xs">
        <XCircle className="w-3.5 h-3.5 text-rose-600" /> Runtime Error
      </span>
    );
  } else {
    // Wrong Answer
    statusBadge = (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 font-bold text-xs">
        <XCircle className="w-3.5 h-3.5 text-rose-600" /> Wrong Answer
      </span>
    );
  }

  const effectiveComplexity = complexityAnalysis?.timeComplexity
    ? complexityAnalysis
    : {
        timeComplexity: aiReview?.timeComplexity || "O(n)",
        spaceComplexity: aiReview?.spaceComplexity || "O(1)",
        optimalTime: aiReview?.optimalComplexity?.time || "O(n)",
        optimalSpace: aiReview?.optimalComplexity?.space || "O(1)",
        confidence: aiReview?.complexityConfidence || 0.95,
        evidence: aiReview?.complexityEvidence || [],
        reasoning: aiReview?.complexityReasoning || "",
      };

  const handleCopyCode = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // ignore
    }
  };

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-6 md:p-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl">
        <DialogHeader className="space-y-2 text-center pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-center gap-2 mb-1 flex-wrap">
            {statusBadge}
            {language && (
              <Badge variant="outline" className="font-mono uppercase text-[10px] px-2 py-0.5 border-gray-300 dark:border-gray-700">
                {language}
              </Badge>
            )}
            {formattedDate && (
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> {formattedDate}
              </span>
            )}
          </div>
          <DialogTitle className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
            {questionTitle ? `Performance: ${questionTitle}` : "Coding Round Performance"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Clear separation between deterministic execution results, code complexity, and qualitative AI review.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* 1. OBJECTIVE EXECUTION RESULTS */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Objective Execution Results (Ground Truth)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <div className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                  Test Pass Rate
                </div>
                <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">
                  {score}%
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                <div className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Tests Passed
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                  {passedCount} / {totalCount}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                <div className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3 text-gray-400" /> Runtime
                </div>
                <div className="text-base font-bold text-gray-900 dark:text-white mt-1 font-mono">
                  {executionTime}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                <div className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center justify-center gap-1">
                  <Cpu className="w-3 h-3 text-gray-400" /> Memory
                </div>
                <div className="text-base font-bold text-gray-900 dark:text-white mt-1 font-mono">
                  {memory}
                </div>
              </div>
            </div>
          </div>

          {/* 2. CODE-SPECIFIC COMPLEXITY ANALYSIS */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-gray-800/70 dark:to-gray-800/50 border border-teal-200 dark:border-teal-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-teal-600" /> Code-Specific Complexity Analysis
              </div>
              {effectiveComplexity.confidence && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300">
                  Confidence: {Math.round(effectiveComplexity.confidence * 100)}%
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-1">
              <div className="p-2.5 rounded-lg bg-white/70 dark:bg-gray-900/50 border border-teal-100 dark:border-teal-900/50">
                <div className="text-gray-500 dark:text-gray-400 text-[11px]">Time Complexity</div>
                <div className="text-base font-extrabold text-teal-700 dark:text-teal-300 mt-0.5">
                  {effectiveComplexity.timeComplexity}
                </div>
                {effectiveComplexity.optimalTime && (
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    Optimal: <span className="font-semibold text-gray-700 dark:text-gray-300">{effectiveComplexity.optimalTime}</span>
                  </div>
                )}
              </div>

              <div className="p-2.5 rounded-lg bg-white/70 dark:bg-gray-900/50 border border-teal-100 dark:border-teal-900/50">
                <div className="text-gray-500 dark:text-gray-400 text-[11px]">Auxiliary Space</div>
                <div className="text-base font-extrabold text-teal-700 dark:text-teal-300 mt-0.5">
                  {effectiveComplexity.spaceComplexity}
                </div>
                {effectiveComplexity.optimalSpace && (
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    Optimal: <span className="font-semibold text-gray-700 dark:text-gray-300">{effectiveComplexity.optimalSpace}</span>
                  </div>
                )}
              </div>
            </div>

            {effectiveComplexity.reasoning && (
              <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                {effectiveComplexity.reasoning}
              </p>
            )}

            {Array.isArray(effectiveComplexity.evidence) && effectiveComplexity.evidence.length > 0 && (
              <div className="space-y-1 pt-1 border-t border-teal-200/60 dark:border-teal-800/60">
                <div className="text-[11px] font-semibold text-teal-800 dark:text-teal-300">
                  Structural Evidence:
                </div>
                <ul className="text-[11px] text-gray-600 dark:text-gray-400 space-y-0.5 list-disc list-inside">
                  {effectiveComplexity.evidence.map((ev, i) => (
                    <li key={i}>{ev}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* 3. SUBMITTED CODE SECTION (IF PRESENT) */}
          {code && (
            <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-3.5 py-2 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800">
                <div className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-emerald-600" /> Submitted Code ({language || "code"})
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="text-[11px] font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-1 transition-colors"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCode(!showCode)}
                    className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 ml-2"
                  >
                    {showCode ? "Hide Code" : "View Code"}
                  </button>
                </div>
              </div>
              {showCode && (
                <div className="p-3 bg-[#18181b] overflow-x-auto max-h-60">
                  <pre className="text-xs font-mono text-gray-200 whitespace-pre">
                    {code}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* 4. QUALITATIVE AI CODE REVIEW & FEEDBACK */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Qualitative AI Code Review
            </h3>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700">
                <div className="text-[11px] text-gray-500 uppercase">Code Quality</div>
                <div className="font-bold text-lg text-gray-900 dark:text-white">
                  {aiReview.codeQuality || 8}/10
                </div>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700">
                <div className="text-[11px] text-gray-500 uppercase">Readability</div>
                <div className="font-bold text-lg text-gray-900 dark:text-white">
                  {aiReview.readability || 8}/10
                </div>
              </div>
            </div>

            {/* Strengths */}
            {aiReview.strengths && aiReview.strengths.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <ThumbsUp className="w-3.5 h-3.5" /> Implementation Strengths:
                </div>
                <ul className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
                  {aiReview.strengths.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Issues & Edge Cases */}
            {aiReview.issues && aiReview.issues.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Observations & Edge Cases:
                </div>
                <ul className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
                  {aiReview.issues.map((iss, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span>{iss}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestions */}
            {aiReview.suggestions && aiReview.suggestions.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Optimization & Style Suggestions:
                </div>
                <ul className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
                  {aiReview.suggestions.map((sug, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0 mt-1.5" />
                      <span>{sug}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Follow-up Interview Questions */}
            {aiReview.followUpQuestions && aiReview.followUpQuestions.length > 0 && (
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-2">
                <div className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-emerald-600" /> Interviewer Follow-Up Questions:
                </div>
                <ul className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300 italic">
                  {aiReview.followUpQuestions.map((q, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="font-bold text-emerald-600 not-italic">Q{idx + 1}:</span>
                      <span>"{q}"</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="w-full sm:w-auto text-xs font-semibold rounded-xl"
            >
              Close
            </Button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {questionId ? (
                <Link to={`/coding/${questionId}`} className="w-full sm:w-auto" onClick={onClose}>
                  <Button
                    size="sm"
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
                  >
                    Solve Again <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              ) : (
                <Link to="/coding" className="w-full sm:w-auto" onClick={onClose}>
                  <Button
                    size="sm"
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
                  >
                    Browse Challenges <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CodingScorecardModal;

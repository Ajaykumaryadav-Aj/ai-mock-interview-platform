// src/components/coding/ProblemPanel.jsx
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Lightbulb,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Loader2,
  FileText,
  History,
} from "lucide-react";
import { SubmissionsTab } from "./SubmissionsTab";

export const ProblemPanel = ({
  question,
  onGetAiHint,
  isLoadingHint,
  aiHintResult,
  submissions = [],
  loadingSubmissions = false,
  onLoadCodeIntoEditor,
  onViewScorecard,
  onRefreshSubmissions,
  activeTab: controlledTab,
  onTabChange,
}) => {
  const [internalTab, setInternalTab] = useState("description");
  const currentTab = controlledTab || internalTab;

  const handleTabClick = (tab) => {
    setInternalTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  const [selectedHintLevel, setSelectedHintLevel] = useState(1);

  if (!question) {
    return <div className="p-6 text-muted-foreground">Loading problem details...</div>;
  }

  const difficultyColor =
    question.difficulty === "Easy"
      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
      : question.difficulty === "Medium"
      ? "bg-amber-100 text-amber-800 border-amber-200"
      : "bg-rose-100 text-rose-800 border-rose-200";

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 overflow-hidden">
      {/* Top Tab Bar: Description | Submissions (N) */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-4 py-2 bg-gray-50/70 dark:bg-gray-950/60 shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleTabClick("description")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentTab === "description"
                ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-xs border border-gray-200 dark:border-gray-700"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/60"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            Description
          </button>

          <button
            type="button"
            onClick={() => handleTabClick("submissions")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentTab === "submissions"
                ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-xs border border-gray-200 dark:border-gray-700"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/60"
            }`}
          >
            <History className="w-3.5 h-3.5 text-sky-600" />
            Submissions
            {submissions?.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                {submissions.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {currentTab === "description" ? (
          <>
      {/* Title & Badges */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={`px-2.5 py-0.5 text-xs font-semibold ${difficultyColor}`}>
            {question.difficulty}
          </Badge>
          <Badge variant="secondary" className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 text-xs">
            {question.category}
          </Badge>
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          {question.title}
        </h1>
      </div>

      {/* Description */}
      <div className="prose dark:prose-invert max-w-none text-sm md:text-base leading-relaxed space-y-3">
        <div className="whitespace-pre-line text-gray-700 dark:text-gray-300">
          {question.description}
        </div>
      </div>

      {/* Examples */}
      {question.examples && question.examples.length > 0 && (
        <div className="space-y-4 pt-2">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Examples</h2>
          {question.examples.map((ex, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-2 text-xs md:text-sm font-mono"
            >
              <div className="font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                Example {idx + 1}:
              </div>
              <div>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">Input: </span>
                <span className="text-gray-800 dark:text-gray-200">{ex.input}</span>
              </div>
              <div>
                <span className="text-blue-700 dark:text-blue-400 font-bold">Output: </span>
                <span className="text-gray-800 dark:text-gray-200">{ex.output}</span>
              </div>
              {ex.explanation && (
                <div className="text-gray-600 dark:text-gray-400 text-xs font-sans pt-1">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Explanation: </span>
                  {ex.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Constraints */}
      {question.constraints && question.constraints.length > 0 && (
        <div className="space-y-2 pt-2">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Constraints</h2>
          <ul className="list-disc list-inside space-y-1 text-xs md:text-sm text-gray-600 dark:text-gray-400 font-mono">
            {question.constraints.map((c, idx) => (
              <li key={idx}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Hints & AI Coach Section */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Interview Hints & AI Coach
          </h2>
        </div>

        {/* AI Hint Trigger */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" /> Need guidance without spoiling the solution?
            </span>
            <div className="flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setSelectedHintLevel(1)}
                className={`px-2 py-0.5 rounded font-medium transition-colors ${
                  selectedHintLevel === 1
                    ? "bg-emerald-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border"
                }`}
              >
                Lvl 1
              </button>
              <button
                type="button"
                onClick={() => setSelectedHintLevel(2)}
                className={`px-2 py-0.5 rounded font-medium transition-colors ${
                  selectedHintLevel === 2
                    ? "bg-emerald-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border"
                }`}
              >
                Lvl 2
              </button>
              <button
                type="button"
                onClick={() => setSelectedHintLevel(3)}
                className={`px-2 py-0.5 rounded font-medium transition-colors ${
                  selectedHintLevel === 3
                    ? "bg-emerald-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border"
                }`}
              >
                Lvl 3
              </button>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => onGetAiHint(selectedHintLevel)}
            disabled={isLoadingHint}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 shadow-xs"
          >
            {isLoadingHint ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Thinking...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" /> Request Hint Level {selectedHintLevel}
              </>
            )}
          </Button>

          {/* Display Received AI Hint */}
          {aiHintResult && (
            <div className="mt-3 p-3.5 rounded-lg bg-white dark:bg-gray-900 border border-emerald-300 dark:border-emerald-700 text-xs md:text-sm text-gray-800 dark:text-gray-200 leading-relaxed space-y-1">
              <div className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> AI Coach Guidance (Level {aiHintResult.hintLevel}):
              </div>
              <p>{aiHintResult.hintText}</p>
            </div>
          )}
        </div>
      </div>
          </>
        ) : (
          <SubmissionsTab
            submissions={submissions}
            loading={loadingSubmissions}
            onLoadCodeIntoEditor={onLoadCodeIntoEditor}
            onViewScorecard={onViewScorecard}
            onRefresh={onRefreshSubmissions}
          />
        )}
      </div>
    </div>
  );
};

export default ProblemPanel;

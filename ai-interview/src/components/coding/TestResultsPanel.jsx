// src/components/coding/TestResultsPanel.jsx
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Clock, Cpu, Play, Terminal, AlertTriangle, Loader2 } from "lucide-react";

export const TestResultsPanel = ({
  sampleTestCases = [],
  customInput,
  onCustomInputChange,
  onRunCustomInput,
  isRunningCustom,
  runResults,
  isRunning,
}) => {
  const [activeTab, setActiveTab] = useState("cases"); // "cases" | "results" | "custom"
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);

  return (
    <div className="flex flex-col h-full bg-[#18181b] text-gray-200 border-t border-[#27272a]">
      {/* Top Tab Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#202024] border-b border-[#27272a] text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("cases")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === "cases"
                ? "bg-[#27272a] text-emerald-400"
                : "text-gray-400 hover:text-gray-200 hover:bg-[#27272a]/50"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" /> Sample Test Cases
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("custom")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === "custom"
                ? "bg-[#27272a] text-emerald-400"
                : "text-gray-400 hover:text-gray-200 hover:bg-[#27272a]/50"
            }`}
          >
            Custom Input
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("results")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === "results"
                ? "bg-[#27272a] text-emerald-400"
                : "text-gray-400 hover:text-gray-200 hover:bg-[#27272a]/50"
            }`}
          >
            Test Results
            {runResults && (
              <span
                className={`w-2 h-2 rounded-full ${
                  runResults.success ? "bg-emerald-400" : "bg-rose-500"
                }`}
              />
            )}
          </button>
        </div>

        {/* Runtime Metrics pill */}
        {runResults && (
          <div className="hidden sm:flex items-center gap-3 text-xs text-gray-400">
            {runResults.executionTime && (
              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3 text-gray-500" /> {runResults.executionTime}
              </span>
            )}
            {runResults.memory && runResults.memory !== "N/A" && (
              <span className="flex items-center gap-1 font-mono">
                <Cpu className="w-3 h-3 text-gray-500" /> {runResults.memory}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tab Body */}
      <div className="flex-1 overflow-y-auto p-4 text-xs font-mono">
        {/* ── 1. Sample Test Cases ─────────────────────────────────────────── */}
        {activeTab === "cases" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {sampleTestCases.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedCaseIdx(idx)}
                  className={`px-3 py-1 rounded-md font-semibold text-xs transition-colors ${
                    selectedCaseIdx === idx
                      ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40"
                      : "bg-[#27272a] text-gray-400 hover:text-gray-200"
                  }`}
                >
                  Case {idx + 1}
                </button>
              ))}
            </div>

            {sampleTestCases[selectedCaseIdx] ? (
              <div className="space-y-3 bg-[#202024] p-3.5 rounded-xl border border-[#27272a]">
                <div>
                  <div className="text-[11px] text-gray-400 uppercase tracking-wider font-sans mb-1">
                    Input
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#18181b] border border-[#2e2e33] text-gray-200 select-all font-mono">
                    {sampleTestCases[selectedCaseIdx].input}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-gray-400 uppercase tracking-wider font-sans mb-1">
                    Expected Output
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#18181b] border border-[#2e2e33] text-emerald-400 select-all font-mono font-bold">
                    {sampleTestCases[selectedCaseIdx].expected}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 italic">No sample test cases configured.</div>
            )}
          </div>
        )}

        {/* ── 2. Custom Input ──────────────────────────────────────────────── */}
        {activeTab === "custom" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="custom-input-box" className="text-xs font-sans text-gray-300 font-semibold">
                Provide custom stdin / function arguments:
              </label>
              <Button
                size="sm"
                type="button"
                onClick={onRunCustomInput}
                disabled={isRunningCustom || isRunning}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 px-3 rounded-lg flex items-center gap-1.5 shadow-xs"
              >
                {isRunningCustom ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" /> Running...
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-white" /> Run with Custom Input
                  </>
                )}
              </Button>
            </div>

            <textarea
              id="custom-input-box"
              value={customInput}
              onChange={(e) => onCustomInputChange(e.target.value)}
              placeholder="e.g. [2, 7, 11, 15]&#10;9"
              rows={4}
              className="w-full bg-[#202024] border border-[#2e2e33] rounded-xl p-3 text-xs font-mono text-gray-200 focus:outline-hidden focus:border-emerald-500 transition-colors resize-y"
            />
          </div>
        )}

        {/* ── 3. Test Results / Output ──────────────────────────────────────── */}
        {activeTab === "results" && (
          <div className="space-y-4">
            {isRunning ? (
              <div className="h-32 flex flex-col items-center justify-center gap-2 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                <span className="text-xs">Executing code in isolated Judge0 sandbox...</span>
              </div>
            ) : !runResults ? (
              <div className="h-32 flex flex-col items-center justify-center gap-2 text-gray-500 font-sans">
                <Terminal className="w-6 h-6 text-gray-600" />
                <span>You have not run any code yet. Press "Run Code" above.</span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Status Bar */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#202024] border border-[#27272a]">
                  <div className="flex items-center gap-2">
                    {runResults.success ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="font-bold text-emerald-400 text-sm font-sans">
                          {runResults.status || "Accepted / All Tests Passed"}
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-rose-400" />
                        <span className="font-bold text-rose-400 text-sm font-sans">
                          {runResults.status || "Failed"}
                        </span>
                      </>
                    )}
                  </div>

                  {runResults.passedCount !== undefined && (
                    <Badge variant="outline" className="border-gray-700 text-gray-300 font-mono text-xs">
                      {runResults.passedCount} / {runResults.totalCount} Passed
                    </Badge>
                  )}
                </div>

                {/* Compile or Runtime Error Box */}
                {runResults.error && (
                  <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-200 space-y-1">
                    <div className="font-bold text-xs flex items-center gap-1.5 text-rose-300 font-sans">
                      <AlertTriangle className="w-3.5 h-3.5" /> Output / Error Log:
                    </div>
                    <pre className="text-xs whitespace-pre-wrap font-mono max-h-40 overflow-y-auto">
                      {runResults.error}
                    </pre>
                  </div>
                )}

                {/* Custom output text if custom input was run */}
                {runResults.output && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] text-gray-400 uppercase tracking-wider font-sans">
                      Program Standard Output:
                    </div>
                    <pre className="p-3 rounded-xl bg-[#202024] border border-[#2e2e33] text-gray-200 whitespace-pre-wrap font-mono max-h-48 overflow-y-auto">
                      {runResults.output}
                    </pre>
                  </div>
                )}

                {/* Test Cases Results List */}
                {runResults.testResults && runResults.testResults.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-[11px] text-gray-400 uppercase tracking-wider font-sans">
                      Test Cases Detail:
                    </div>
                    <div className="space-y-2">
                      {runResults.testResults.map((tc, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                            tc.passed
                              ? "bg-emerald-950/20 border-emerald-900/50 text-emerald-200"
                              : "bg-rose-950/20 border-rose-900/50 text-rose-200"
                          }`}
                        >
                          <div className="flex items-center justify-between font-sans">
                            <span className="font-bold flex items-center gap-1.5">
                              {tc.passed ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                              )}
                              Test Case {tc.testCaseId} {tc.isHidden && "(Hidden Test Case)"}
                            </span>
                            <span className="text-[11px] font-semibold">
                              {tc.passed ? "Passed" : "Failed"}
                            </span>
                          </div>

                          {!tc.isHidden && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                              <div>
                                <span className="text-gray-400">Expected: </span>
                                <span className="text-emerald-300">{tc.expected}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Actual: </span>
                                <span className={tc.passed ? "text-emerald-300" : "text-rose-300"}>
                                  {tc.actual}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestResultsPanel;

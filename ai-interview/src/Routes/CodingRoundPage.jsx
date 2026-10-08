// src/Routes/CodingRoundPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { ProblemPanel } from "@/components/coding/ProblemPanel";
import { CodeEditor } from "@/components/coding/CodeEditor";
import { TestResultsPanel } from "@/components/coding/TestResultsPanel";
import { CodingScorecardModal } from "@/components/coding/CodingScorecardModal";
import {
  getCodingQuestion,
  runCodingCode,
  submitCodingCode,
  getCodingHint,
  getCodingHistory,
} from "@/services/codingService";
import { CODING_QUESTIONS, SUPPORTED_LANGUAGES } from "@/data/codingQuestionsData";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Code2, History } from "lucide-react";
import { toast } from "sonner";

export const CodingRoundPage = () => {
  const { questionId } = useParams();
  const navigate = useNavigate();

  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [customInput, setCustomInput] = useState("");

  const [isRunning, setIsRunning] = useState(false);
  const [isRunningCustom, setIsRunningCustom] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResults, setRunResults] = useState(null);

  const [isLoadingHint, setIsLoadingHint] = useState(false);
  const [aiHintResult, setAiHintResult] = useState(null);

  const [submissionResult, setSubmissionResult] = useState(null);
  const [isScorecardOpen, setIsScorecardOpen] = useState(false);

  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [activePanelTab, setActivePanelTab] = useState("description");

  // Load question
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const fetched = await getCodingQuestion(questionId);
        if (isMounted && fetched) {
          setQuestion(fetched);
          const initialStarter = fetched.starterCode?.[language] || fetched.starterCode?.javascript || "";
          setCode(initialStarter);
        }
      } catch {
        // Fallback to local dataset
        const local = CODING_QUESTIONS.find((q) => q.id === questionId);
        if (isMounted) {
          if (local) {
            setQuestion(local);
            setCode(local.starterCode?.[language] || local.starterCode?.javascript || "");
          } else {
            toast.error("Problem not found.");
            navigate("/coding");
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [questionId, navigate, language]);

  // Handle language change
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (question?.starterCode?.[newLang]) {
      setCode(question.starterCode[newLang]);
    }
  };

  // Reset to starter code
  const handleResetCode = () => {
    if (question?.starterCode?.[language]) {
      setCode(question.starterCode[language]);
      toast.info("Reset code to initial template.");
    }
  };

  // Clear code
  const handleClearCode = () => {
    setCode("");
    toast.info("Cleared editor.");
  };

  // Run Code against sample test cases
  const handleRunCode = async () => {
    if (!code || code.trim().length === 0) {
      toast.error("Please write some code before running.");
      return;
    }

    setIsRunning(true);
    try {
      const result = await runCodingCode({
        questionId,
        language,
        code,
        isCustomInput: false,
      });
      setRunResults(result);
      if (result.success) {
        toast.success("Sample test cases passed!");
      } else {
        toast.error("Some test cases failed or encountered an error.");
      }
    } catch (err) {
      toast.error(err.message || "Failed to execute code.");
      setRunResults({
        success: false,
        status: "Error",
        error: err.message,
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Run Code with Custom Input
  const handleRunCustomInput = async () => {
    if (!code || code.trim().length === 0) {
      toast.error("Please write some code before running.");
      return;
    }

    setIsRunningCustom(true);
    try {
      const result = await runCodingCode({
        questionId,
        language,
        code,
        customInput,
        isCustomInput: true,
      });
      setRunResults(result);
      toast.info("Custom input execution completed.");
    } catch (err) {
      toast.error(err.message || "Execution failed.");
      setRunResults({
        success: false,
        status: "Error",
        error: err.message,
      });
    } finally {
      setIsRunningCustom(false);
    }
  };

  // Submit Code (evaluates against sample + hidden tests & calls AI review)
  const handleSubmitCode = async () => {
    if (!code || code.trim().length === 0) {
      toast.error("Cannot submit empty code.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitCodingCode({
        questionId,
        language,
        code,
      });

      setSubmissionResult(result);
      setRunResults({
        success: result.success,
        status: result.status,
        passedCount: result.passedCount,
        totalCount: result.totalCount,
        executionTime: result.executionTime,
        memory: result.memory,
        testResults: result.testResults,
        error: result.error,
      });

      fetchSubmissions();
      setIsScorecardOpen(true);
      if (result.success) {
        toast.success("🎉 Solution Accepted! Full score achieved.");
      } else {
        toast.warning(`Evaluation complete. Score: ${result.overallScore}/100`);
      }
    } catch (err) {
      toast.error(err.message || "Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch submissions history for this specific question
  const fetchSubmissions = useCallback(async () => {
    if (!questionId) return;
    setLoadingSubmissions(true);
    try {
      const history = await getCodingHistory({ questionId });
      setSubmissions(history || []);
    } catch (err) {
      console.warn("[CodingRoundPage] Could not load submissions:", err);
    } finally {
      setLoadingSubmissions(false);
    }
  }, [questionId]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // Load code from a previous submission into Monaco editor
  const handleLoadCodeIntoEditor = (submittedCode, submittedLanguage) => {
    if (!submittedCode) {
      toast.error("No code content available to load.");
      return;
    }
    if (submittedLanguage && SUPPORTED_LANGUAGES.some((l) => l.id === submittedLanguage)) {
      setLanguage(submittedLanguage);
    }
    setCode(submittedCode);
    toast.success("Previous submission code loaded into editor!");
  };

  // View full scorecard for a submission
  const handleViewSubmissionScorecard = (sub) => {
    setSubmissionResult(sub);
    setIsScorecardOpen(true);
  };

  // Request AI Hint
  const handleGetAiHint = async (hintLevel) => {
    setIsLoadingHint(true);
    try {
      const res = await getCodingHint({
        questionId,
        hintLevel,
        currentCode: code,
        language,
      });
      setAiHintResult(res);
      toast.success(`Received Hint Level ${hintLevel}!`);
    } catch (err) {
      toast.error(err.message || "Failed to load AI hint.");
    } finally {
      setIsLoadingHint(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        <p className="text-sm font-medium text-gray-400">Loading Coding Room...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-white select-none">
      <SEO
        title={`${question?.title || "Coding Challenge"} | Coding Round | MocInterview`}
        description={`Practice ${question?.title} with real server-side execution in ${language}, automated hidden test cases, and AI code review.`}
        canonical={`/coding/${questionId}`}
        noindex={true} // Authenticated coding room should not be indexed
      />

      {/* Top Navigation Header */}
      <header className="h-14 border-b border-gray-800 bg-gray-900/90 backdrop-blur-md px-4 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/coding"
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-emerald-400 transition-colors p-1.5 rounded-lg hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Problem Set</span>
          </Link>
          <div className="h-4 w-px bg-gray-700 hidden sm:block" />
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-emerald-500" />
            <span className="font-bold text-sm text-gray-200 truncate max-w-[200px] sm:max-w-md">
              {question?.title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Submissions Toggle in Header */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              setActivePanelTab(activePanelTab === "submissions" ? "description" : "submissions")
            }
            className={`text-xs h-8 cursor-pointer ${
              activePanelTab === "submissions"
                ? "bg-sky-950/70 text-sky-400 border border-sky-800"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            <History className="w-3.5 h-3.5 mr-1.5 text-sky-400" />
            Submissions
            {submissions?.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-sky-900/60 text-sky-300">
                {submissions.length}
              </span>
            )}
          </Button>

          {submissionResult && (
            <Button
              size="sm"
              onClick={() => setIsScorecardOpen(true)}
              className="text-xs bg-gray-900 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-950/60 h-8 cursor-pointer rounded-lg font-medium"
            >
              Scorecard ({submissionResult.overallScore}/100)
            </Button>
          )}
        </div>
      </header>

      {/* Main Split Layout */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Side: Problem Statement, Examples, Constraints, Hints, Submissions */}
        <section className="w-full lg:w-[45%] h-[400px] lg:h-auto overflow-hidden flex flex-col border-b lg:border-b-0 lg:border-r border-gray-800">
          <ProblemPanel
            question={question}
            onGetAiHint={handleGetAiHint}
            isLoadingHint={isLoadingHint}
            aiHintResult={aiHintResult}
            submissions={submissions}
            loadingSubmissions={loadingSubmissions}
            onLoadCodeIntoEditor={handleLoadCodeIntoEditor}
            onViewScorecard={handleViewSubmissionScorecard}
            onRefreshSubmissions={fetchSubmissions}
            activeTab={activePanelTab}
            onTabChange={setActivePanelTab}
          />
        </section>

        {/* Right Side: Monaco Code Editor + Test Results Panel */}
        <section className="w-full lg:w-[55%] flex-1 flex flex-col h-[650px] lg:h-auto overflow-hidden">
          {/* Top: Editor */}
          <div className="flex-1 min-h-[350px] overflow-hidden">
            <CodeEditor
              language={language}
              onLanguageChange={handleLanguageChange}
              code={code}
              onCodeChange={setCode}
              onResetCode={handleResetCode}
              onClearCode={handleClearCode}
              onRunCode={handleRunCode}
              onSubmitCode={handleSubmitCode}
              isRunning={isRunning}
              isSubmitting={isSubmitting}
            />
          </div>

          {/* Bottom: Test Results & Custom Input Panel */}
          <div className="h-64 sm:h-72 overflow-hidden shrink-0">
            <TestResultsPanel
              sampleTestCases={question?.sampleTestCases || []}
              customInput={customInput}
              onCustomInputChange={setCustomInput}
              onRunCustomInput={handleRunCustomInput}
              isRunningCustom={isRunningCustom}
              runResults={runResults}
              isRunning={isRunning}
            />
          </div>
        </section>
      </main>

      {/* Scorecard Modal */}
      <CodingScorecardModal
        isOpen={isScorecardOpen}
        onClose={() => setIsScorecardOpen(false)}
        submissionResult={submissionResult}
      />
    </div>
  );
};

export default CodingRoundPage;

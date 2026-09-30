import { useEffect, useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import LoaderPage from "./Loaderpage";
import { CustomBreadCrum } from "@/components/CustomBreadCrum";
import { Headings } from "@/components/Headings";
import { InterviewPin } from "@/components/InterviewPin";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import {
  CircleCheck,
  Star,
  Sparkles,
  TrendingUp,
  AlertCircle,
  BookOpen,
  MessageSquare,
  Award,
  CheckCircle2,
  Lightbulb,
  Target,
  Compass,
  FileText,
  XCircle,
} from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getInterviewById,
  getUserAnswersForInterview,
} from "@/services/interviewService";
import { useFirebaseAuthReady } from "@/services/firebaseAuthBridge";

export const FeedBack = () => {
  const { interviewId } = useParams();
  const [interview, setInterview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState([]);
  const [activeFeed, setActiveFeed] = useState("");
  const { userId } = useAuth();
  const { isFirebaseReady } = useFirebaseAuthReady();

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!interviewId) {
        if (isMounted) setIsLoading(false);
        return;
      }

      if (!isFirebaseReady) {
        return;
      }

      try {
        setIsLoading(true);
        const [interviewData, answersData] = await Promise.all([
          getInterviewById(interviewId),
          userId
            ? getUserAnswersForInterview(interviewId, userId)
            : Promise.resolve([]),
        ]);

        if (isMounted) {
          setInterview(interviewData);
          setFeedbacks(answersData || []);
        }
      } catch (error) {
        console.error("Error loading feedback page data:", error);
        toast("Error", {
          description: "Something went wrong. Please try again later.",
        });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [interviewId, userId, isFirebaseReady]);

  const isLive = interview?.mode === "live";
  const liveEval = interview?.finalEvaluation;

  const isLiveEarlyExit =
    interview?.isEarlyExit ||
    liveEval?.isEarlyExit ||
    liveEval?.completionStatus === "abandoned_early" ||
    interview?.status === "abandoned_early";

  const liveOverallScoreNum =
    liveEval?.overallRating !== undefined && liveEval?.overallRating !== null
      ? Number(liveEval.overallRating)
      : 0;

  // Normalized planned questions in practice mode
  const normalizedPlannedQuestions = useMemo(() => {
    return (interview?.questions || []).map((q, idx) => ({
      id: `planned-${idx}`,
      question: q?.question || q?.questions || "",
      answer: q?.answer || "",
    }));
  }, [interview?.questions]);

  const totalPlannedQuestions = normalizedPlannedQuestions.length || 5;
  const answeredCount = feedbacks?.length || 0;
  const isPracticeIncomplete = !isLive && answeredCount < totalPlannedQuestions;

  // Real calibrated ratings for practice feedback
  const { practiceAttemptedAvg, practiceAdjustedOverallRating } = useMemo(() => {
    if (!feedbacks || feedbacks.length === 0) {
      return { practiceAttemptedAvg: "0.0", practiceAdjustedOverallRating: "0.0" };
    }

    const totalRatings = feedbacks.reduce(
      (acc, feedback) => acc + (Number(feedback.rating) || 0),
      0
    );

    const attemptedAvg = (totalRatings / feedbacks.length).toFixed(1);
    const adjustedOverall = (totalRatings / totalPlannedQuestions).toFixed(1);

    return {
      practiceAttemptedAvg: attemptedAvg,
      practiceAdjustedOverallRating: adjustedOverall,
    };
  }, [feedbacks, totalPlannedQuestions]);

  // Dynamic Page Header Title & Description
  const { headerTitle, headerDescription } = useMemo(() => {
    if (isLive) {
      if (isLiveEarlyExit) {
        return {
          headerTitle: "Interview Terminated Prematurely",
          headerDescription:
            "This session was concluded early before completing the required conversation turns. In professional hiring, abandoning an interview leads to an automatic Strong No Hire. The evaluation below reflects the limited answers provided before exit.",
        };
      }
      if (liveEval?.completionStatus === "low_effort") {
        return {
          headerTitle: "Interview Evaluation — Superficial Responses",
          headerDescription:
            "Responses were extremely brief, one-word, or evasive without technical substance. In professional hiring evaluations, this leads to an automatic disqualification.",
        };
      }
      if (liveEval?.completionStatus === "partial" || liveOverallScoreNum < 4.0) {
        return {
          headerTitle: "Interview Performance Review — Critical Gaps",
          headerDescription:
            "Significant foundational and communication deficiencies were observed during the session. Detailed diagnostic analysis is provided below.",
        };
      }
      if (liveOverallScoreNum >= 7.5) {
        return {
          headerTitle: "Congratulations! Outstanding Performance",
          headerDescription:
            "Your Live AI Interview evaluation report is ready. You demonstrated strong technical depth, structured communication, and problem-solving habits.",
        };
      }
      return {
        headerTitle: "Live AI Interview Evaluation Report",
        headerDescription:
          "Your Live AI Interview evaluation report is ready. Review your comprehensive performance across key competency dimensions.",
      };
    }

    // Practice Mode Header
    if (answeredCount === 0) {
      return {
        headerTitle: "Practice Session Incomplete — No Answers Saved",
        headerDescription:
          "The interview was exited without recording answers. Questions are marked as unattempted (0/10).",
      };
    }
    if (isPracticeIncomplete) {
      return {
        headerTitle: "Practice Interview Incomplete",
        headerDescription: `You concluded the session early after answering only ${answeredCount} of ${totalPlannedQuestions} questions. Incomplete questions receive 0 points.`,
      };
    }
    if (Number(practiceAdjustedOverallRating) < 4.0) {
      return {
        headerTitle: "Practice Interview Review — Improvement Needed",
        headerDescription:
          "Your answers lacked sufficient depth and technical precision. Review the feedback and model answers below to strengthen your fundamentals.",
      };
    }
    if (Number(practiceAdjustedOverallRating) >= 7.5) {
      return {
        headerTitle: "Congratulations! Strong Practice Performance",
        headerDescription:
          "Great job! You demonstrated solid understanding across all questions. Review the tips and model answers below to further refine your delivery.",
      };
    }
    return {
      headerTitle: "Practice Interview Feedback Report",
      headerDescription:
        "Your personalized feedback is now available. Dive in to see your strengths, areas for improvement, and model answers.",
    };
  }, [
    isLive,
    isLiveEarlyExit,
    liveEval?.completionStatus,
    liveOverallScoreNum,
    answeredCount,
    isPracticeIncomplete,
    totalPlannedQuestions,
    practiceAdjustedOverallRating,
  ]);

  // Merge planned questions with user submitted feedback for comprehensive practice review
  const mergedPracticeQuestions = useMemo(() => {
    if (!normalizedPlannedQuestions || normalizedPlannedQuestions.length === 0) {
      return feedbacks.map((f, i) => ({
        id: f.id || `feedback-${i}`,
        questionNumber: i + 1,
        question: f.question,
        correct_ans: f.correct_ans,
        user_ans: f.user_ans,
        feedback: f.feedback,
        rating: f.rating,
        attempted: true,
      }));
    }

    const matchedFeedbackIds = new Set();

    const merged = normalizedPlannedQuestions.map((pq, idx) => {
      const matched = feedbacks.find(
        (f) =>
          !matchedFeedbackIds.has(f.id) &&
          (f.question?.trim().toLowerCase() === pq.question?.trim().toLowerCase() ||
            (f.question &&
              pq.question &&
              f.question.toLowerCase().includes(pq.question.toLowerCase().slice(0, 30))))
      );

      if (matched) {
        matchedFeedbackIds.add(matched.id);
        return {
          id: matched.id || `question-${idx}`,
          questionNumber: idx + 1,
          question: pq.question,
          correct_ans: matched.correct_ans || pq.answer,
          user_ans: matched.user_ans,
          feedback: matched.feedback,
          rating: matched.rating,
          attempted: true,
        };
      }

      return {
        id: `unattempted-${idx}`,
        questionNumber: idx + 1,
        question: pq.question,
        correct_ans: pq.answer,
        user_ans: "",
        feedback:
          "This question was skipped or not reached because the interview was ended prematurely. In a real technical screening, unattempted questions receive 0 points.",
        rating: 0,
        attempted: false,
      };
    });

    // Append any extra feedbacks that didn't match planned questions
    feedbacks.forEach((f, extraIdx) => {
      if (!matchedFeedbackIds.has(f.id)) {
        merged.push({
          id: f.id || `extra-${extraIdx}`,
          questionNumber: merged.length + 1,
          question: f.question,
          correct_ans: f.correct_ans,
          user_ans: f.user_ans,
          feedback: f.feedback,
          rating: f.rating,
          attempted: true,
        });
      }
    });

    return merged;
  }, [normalizedPlannedQuestions, feedbacks]);

  if (isLoading) {
    return <LoaderPage className="w-full h-[70vh]" />;
  }

  if (!interviewId || !interview) {
    return <Navigate to="/generate" replace />;
  }

  return (
    <div className="flex flex-col w-full gap-8 py-5">
      {/* Breadcrumb navigation */}
      <div className="flex items-center justify-between w-full gap-2">
        <CustomBreadCrum
          breadCrumbPage={"Feedback"}
          breadCrumbItems={[
            { label: "Mock Interviews", link: "/generate" },
            {
              label: `${interview?.position || "Interview"}`,
              link: `/generate/interview/${interview?.id}`,
            },
          ]}
        />
      </div>

      <Headings title={headerTitle} description={headerDescription} />

      {/* ── LIVE AI INTERVIEW REPORT ────────────────────────────────────────── */}
      {isLive ? (
        <div className="w-full flex flex-col gap-6">
          {/* Executive Rating Card */}
          <div className="w-full p-6 rounded-2xl bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start">
                <Badge className="bg-purple-500/30 text-purple-200 border-purple-400/40 text-xs">
                  🎙️ Live Conversational Evaluation
                </Badge>
                {isLiveEarlyExit && (
                  <Badge className="bg-rose-500/30 text-rose-200 border-rose-400/40 text-xs font-semibold">
                    ⚠️ Terminated Early ({liveEval?.userTurnsCount ?? 0} Turns)
                  </Badge>
                )}
                {liveEval?.hiringRecommendation && (
                  <Badge
                    className={cn(
                      "text-xs font-semibold",
                      liveEval.hiringRecommendation.toLowerCase().includes("no hire")
                        ? "bg-rose-500/30 text-rose-200 border-rose-400/40"
                        : liveEval.hiringRecommendation.toLowerCase().includes("hire")
                        ? "bg-emerald-500/30 text-emerald-200 border-emerald-400/40"
                        : "bg-amber-500/30 text-amber-200 border-amber-400/40"
                    )}
                  >
                    📋 {liveEval.hiringRecommendation}
                  </Badge>
                )}
                {liveEval?.performanceLevel && (
                  <Badge className="bg-white/15 text-slate-200 border-white/20 text-xs">
                    {liveEval.performanceLevel}
                  </Badge>
                )}
              </div>
              <h2 className="text-2xl font-bold tracking-tight">
                {interview.position} Interview Assessment
              </h2>
              <p className="text-xs text-purple-200/80 max-w-xl">
                Conducted with real-time adaptive questioning, speech analysis, and calibrated competency scoring.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center p-4 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-md min-w-[140px]">
              <div className="flex items-center gap-1">
                <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                <span className="text-3xl font-extrabold text-white">
                  {liveOverallScoreNum.toFixed(1)}
                </span>
                <span className="text-sm text-purple-200 font-semibold">/10</span>
              </div>
              <span className="text-[11px] text-purple-200 uppercase tracking-wider font-semibold mt-1">
                Calibrated Score
              </span>
            </div>
          </div>

          {/* Early Exit / Low Effort Alert Banner */}
          {(isLiveEarlyExit || liveEval?.completionStatus === "abandoned_early" || liveEval?.completionStatus === "low_effort" || liveEval?.completionStatus === "partial") && (
            <div className="p-5 rounded-2xl border border-rose-200 bg-rose-50/90 text-rose-950 flex items-start gap-3.5 shadow-xs">
              <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-rose-900">
                  {isLiveEarlyExit || liveEval?.completionStatus === "abandoned_early"
                    ? "Premature Interview Termination Warning"
                    : liveEval?.completionStatus === "low_effort"
                    ? "Superficial Responses Warning"
                    : "Partial Interview Session Warning"}
                </h4>
                <p className="text-xs text-rose-800 leading-relaxed font-normal">
                  {isLiveEarlyExit || liveEval?.completionStatus === "abandoned_early"
                    ? `This live interview was concluded before completing the conversational assessment (only ${liveEval?.userTurnsCount ?? 0} candidate response turns recorded). In professional tech hiring, abandoning an interview mid-session or leaving prematurely is an immediate disqualification (Strong No Hire). Your score and competency ratings realistically reflect this incomplete record.`
                    : liveEval?.completionStatus === "low_effort"
                    ? "The candidate answers contained minimal explanation, one-word replies, or evasive statements (such as 'idk' or 'skip'). In real engineering interviews, candidates must explain concepts, edge cases, and reasoning."
                    : "The candidate answered some questions but the session lacked sufficient technical depth and conversational coverage."}
                </p>
              </div>
            </div>
          )}

          {/* Sub-Score Competency Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "Technical Knowledge",
                score: liveEval?.technicalKnowledgeScore ?? liveEval?.competencies?.technicalKnowledge?.score ?? 0,
                icon: <Sparkles className="w-4 h-4 text-purple-600" />,
                color: "bg-purple-50 border-purple-200 text-purple-900",
              },
              {
                label: "Communication",
                score: liveEval?.communicationScore ?? liveEval?.competencies?.communication?.score ?? 0,
                icon: <MessageSquare className="w-4 h-4 text-sky-600" />,
                color: "bg-sky-50 border-sky-200 text-sky-900",
              },
              {
                label: "Problem Solving",
                score: liveEval?.problemSolvingScore ?? liveEval?.competencies?.problemSolving?.score ?? 0,
                icon: <TrendingUp className="w-4 h-4 text-emerald-600" />,
                color: "bg-emerald-50 border-emerald-200 text-emerald-900",
              },
              {
                label: "Relevance & Depth",
                score: liveEval?.relevanceDepthScore ?? liveEval?.competencies?.relevanceDepth?.score ?? 0,
                icon: <Award className="w-4 h-4 text-amber-600" />,
                color: "bg-amber-50 border-amber-200 text-amber-900",
              },
            ].map((metric) => (
              <div
                key={metric.label}
                className={`p-4 rounded-xl border ${metric.color} flex flex-col justify-between space-y-3`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">{metric.label}</span>
                  {metric.icon}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{metric.score}</span>
                  <span className="text-xs opacity-75 font-medium">/ 10</span>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Competency Evidence & Analysis */}
          {liveEval?.competencies && (
            <div className="space-y-4">
              <Headings
                title="Independent Competency Deep-Dive"
                description="Evidence-backed analysis derived from your actual transcript answers."
                isSubHeading
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    key: "technicalKnowledge",
                    title: "Technical Knowledge",
                    data: liveEval.competencies.technicalKnowledge,
                    icon: <Sparkles className="w-4 h-4 text-purple-600" />,
                    badgeColor: "bg-purple-100 text-purple-800",
                    border: "border-purple-200",
                  },
                  {
                    key: "communication",
                    title: "Communication",
                    data: liveEval.competencies.communication,
                    icon: <MessageSquare className="w-4 h-4 text-sky-600" />,
                    badgeColor: "bg-sky-100 text-sky-800",
                    border: "border-sky-200",
                  },
                  {
                    key: "problemSolving",
                    title: "Problem Solving",
                    data: liveEval.competencies.problemSolving,
                    icon: <TrendingUp className="w-4 h-4 text-emerald-600" />,
                    badgeColor: "bg-emerald-100 text-emerald-800",
                    border: "border-emerald-200",
                  },
                  {
                    key: "relevanceDepth",
                    title: "Relevance & Depth",
                    data: liveEval.competencies.relevanceDepth,
                    icon: <Award className="w-4 h-4 text-amber-600" />,
                    badgeColor: "bg-amber-100 text-amber-800",
                    border: "border-amber-200",
                  },
                ].map((comp) => {
                  if (!comp.data) return null;
                  return (
                    <div
                      key={comp.key}
                      className={`p-5 rounded-xl border ${comp.border} bg-white space-y-3 shadow-xs`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {comp.icon}
                          <span className="font-semibold text-sm text-gray-900">
                            {comp.title}
                          </span>
                        </div>
                        <Badge className={`${comp.badgeColor} text-xs font-bold px-2 py-0.5`}>
                          {comp.data.score}/10
                        </Badge>
                      </div>

                      {comp.data.summary && (
                        <p className="text-xs text-gray-600 leading-relaxed font-medium">
                          {comp.data.summary}
                        </p>
                      )}

                      {comp.data.evidence && comp.data.evidence.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-500">
                            Observed Evidence:
                          </span>
                          <ul className="space-y-1 text-xs text-gray-700">
                            {comp.data.evidence.map((ev, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                                <span>{ev}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {comp.data.improvements && comp.data.improvements.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[11px] uppercase tracking-wider font-semibold text-amber-700">
                            Targeted Growth:
                          </span>
                          <ul className="space-y-1 text-xs text-gray-700">
                            {comp.data.improvements.map((imp, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                                <span>{imp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── RESUME-BASED INTERVIEW INSIGHTS ────────────────────────────── */}
          {(interview?.resumeBased || (liveEval?.resumeInsights && liveEval.resumeInsights.length > 0)) && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Headings
                  title="Resume-Based Interview Insights"
                  description="Comparison between claimed resume experience and evidence demonstrated during the live interview."
                  isSubHeading
                />
                <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 text-xs">
                  📄 Resume Verification
                </Badge>
              </div>

              {/* Resume Claims vs Interview Evidence */}
              {liveEval?.resumeInsights && liveEval.resumeInsights.length > 0 ? (
                <div className="space-y-3">
                  {liveEval.resumeInsights.map((insight, idx) => {
                    const isVerified = insight.verificationStatus === "verified";
                    const isPartial = insight.verificationStatus === "partially_verified";
                    return (
                      <Card
                        key={idx}
                        className={`p-4 border rounded-xl shadow-xs transition-all ${
                          isVerified
                            ? "border-emerald-200 bg-emerald-50/20"
                            : isPartial
                            ? "border-amber-200 bg-amber-50/20"
                            : "border-slate-200 bg-slate-50/40"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100">
                          <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-indigo-600" />
                            Resume Claim: &ldquo;{insight.claim}&rdquo;
                          </span>
                          <Badge
                            className={`text-[10px] font-semibold w-fit ${
                              isVerified
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                : isPartial
                                ? "bg-amber-100 text-amber-800 border-amber-300"
                                : "bg-slate-100 text-slate-700 border-slate-300"
                            }`}
                          >
                            {isVerified ? "✓ Verified" : isPartial ? "~ Partially Verified" : "○ Needs Evidence"}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                              Interview Evidence:
                            </span>
                            <p className="text-gray-700 leading-relaxed font-normal">
                              {insight.evidence || "No specific evidence demonstrated during session."}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                              Interviewer Assessment:
                            </span>
                            <p className="text-gray-800 leading-relaxed font-medium">
                              {insight.assessment || "Assessment pending further technical exploration."}
                            </p>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-gray-600">
                  Resume context was successfully supplied for question personalization. As you answer deeper technical questions, detailed claim verification comparisons are recorded here.
                </div>
              )}

              {/* Verified Strengths vs Areas Needing Stronger Evidence */}
              {((liveEval?.resumeStrengthsVerified && liveEval.resumeStrengthsVerified.length > 0) ||
                (liveEval?.resumeAreasNeedingEvidence && liveEval.resumeAreasNeedingEvidence.length > 0)) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {liveEval?.resumeStrengthsVerified?.length > 0 && (
                    <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
                      <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Resume Strengths Verified in Interview
                      </span>
                      <ul className="space-y-1 text-xs text-gray-700">
                        {liveEval.resumeStrengthsVerified.map((st, sIdx) => (
                          <li key={sIdx} className="flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span>{st}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {liveEval?.resumeAreasNeedingEvidence?.length > 0 && (
                    <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
                      <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        Resume Areas Needing Stronger Evidence
                      </span>
                      <ul className="space-y-1 text-xs text-gray-700">
                        {liveEval.resumeAreasNeedingEvidence.map((area, aIdx) => (
                          <li key={aIdx} className="flex items-start gap-1.5">
                            <span className="text-amber-600 font-bold">•</span>
                            <span>{area}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Executive Summary */}
          {liveEval?.overallSummary && (
            <Card className="p-5 border bg-white rounded-xl shadow-xs space-y-2">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-purple-600" />
                Interviewer Executive Summary
              </CardTitle>
              <CardDescription className="text-sm text-gray-700 leading-relaxed font-normal">
                {liveEval.overallSummary}
              </CardDescription>
            </Card>
          )}

          {/* 4-Pillar Next Interview Action Plan */}
          {liveEval?.nextInterviewActionPlan && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 text-white space-y-4 shadow-md">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold">What to Improve Before Your Next Interview</h3>
              </div>
              <p className="text-xs text-slate-300">
                Actionable focus areas customized to your performance in this session:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="p-4 rounded-xl bg-white/10 border border-white/15 space-y-1.5">
                  <span className="text-xs font-bold text-purple-300 uppercase tracking-wide flex items-center gap-1.5">
                    💻 1. Technical Revision
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {liveEval.nextInterviewActionPlan.technical}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/10 border border-white/15 space-y-1.5">
                  <span className="text-xs font-bold text-sky-300 uppercase tracking-wide flex items-center gap-1.5">
                    💬 2. Communication Technique
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {liveEval.nextInterviewActionPlan.communication}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/10 border border-white/15 space-y-1.5">
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wide flex items-center gap-1.5">
                    🧠 3. Problem Solving Habit
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {liveEval.nextInterviewActionPlan.problemSolving}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/10 border border-white/15 space-y-1.5">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                    🎯 4. Interview Technique
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {liveEval.nextInterviewActionPlan.interviewTechnique}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Recommended Answer Framework */}
          {liveEval?.recommendedAnswerStructure && (
            <Card className="p-5 border border-indigo-200 bg-indigo-50/40 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-indigo-950 font-bold text-sm">
                <Compass className="w-4 h-4 text-indigo-600" />
                <span>How You Should Answer Next Time: {liveEval.recommendedAnswerStructure.structureName || "Response Framework"}</span>
              </div>
              <p className="text-xs text-indigo-900/80">
                {liveEval.recommendedAnswerStructure.explanation}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
                {(liveEval.recommendedAnswerStructure.steps || []).map((step, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-3 bg-white rounded-lg border border-indigo-150 text-xs font-medium text-indigo-950 shadow-2xs"
                  >
                    {step}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Strengths */}
            <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-semibold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Demonstrated Strengths
              </div>
              <ul className="space-y-2 text-xs text-gray-700">
                {(liveEval?.strengths || [
                  "Articulated technical concepts clearly.",
                  "Structured responses logically.",
                ]).map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold mt-0.5">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas for Improvement */}
            <div className="p-5 rounded-xl border border-amber-200 bg-amber-50/50 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-semibold text-sm">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Areas for Development
              </div>
              <ul className="space-y-2 text-xs text-gray-700">
                {(liveEval?.improvements || [
                  "Provide more real-world quantitative metrics.",
                  "Deepen explanation of edge case error handling.",
                ]).map((imp, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold mt-0.5">•</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Topics Covered & Suggested Practice */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Topics Covered */}
            <div className="p-5 rounded-xl border bg-white space-y-3">
              <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm">
                <Award className="w-4 h-4 text-purple-600" />
                Technical Topics Covered
              </div>
              <div className="flex flex-wrap gap-2">
                {(liveEval?.topicsCovered || [interview.techStack]).map(
                  (top, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="text-xs bg-purple-50 text-purple-900 border-purple-200"
                    >
                      {top}
                    </Badge>
                  )
                )}
              </div>
            </div>

            {/* Suggested Practice */}
            <div className="p-5 rounded-xl border bg-white space-y-3">
              <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                Recommended Next Practice Topics
              </div>
              <ul className="space-y-1.5 text-xs text-gray-600">
                {(liveEval?.suggestedPracticeTopics || [
                  "System design and state management trade-offs",
                  "Performance profiling and network optimization",
                ]).map((topic, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Question-by-Question Deep Dive */}
          {liveEval?.questionFeedback && liveEval.questionFeedback.length > 0 && (
            <div className="space-y-4">
              <Headings
                title="Question-by-Question Performance Breakdown"
                description="Specific diagnostic review of your responses across the interview turns."
                isSubHeading
              />
              <div className="space-y-3">
                {liveEval.questionFeedback.map((qf, qIdx) => (
                  <Card key={qIdx} className="p-4 border bg-white rounded-xl shadow-xs space-y-3">
                    <div className="flex items-start gap-2">
                      <Badge className="bg-purple-100 text-purple-800 text-[11px] font-semibold shrink-0 mt-0.5">
                        Turn {qIdx + 1}
                      </Badge>
                      <span className="text-xs font-semibold text-gray-900 leading-snug">
                        {qf.question}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                      <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-100 space-y-1">
                        <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          What You Did Well
                        </span>
                        <p className="text-xs text-gray-700 leading-relaxed font-normal">
                          {qf.whatWentWell}
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-100 space-y-1">
                        <span className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                          What Was Missing
                        </span>
                        <p className="text-xs text-gray-700 leading-relaxed font-normal">
                          {qf.whatWasMissing}
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-indigo-50/60 border border-indigo-100 space-y-1">
                        <span className="text-[11px] font-bold text-indigo-800 flex items-center gap-1">
                          <Compass className="w-3.5 h-3.5 text-indigo-600" />
                          Recommended Better Approach
                        </span>
                        <p className="text-xs text-gray-700 leading-relaxed font-normal">
                          {qf.betterApproach}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Live Conversation Transcript Accordion */}
          {interview.conversationHistory &&
            interview.conversationHistory.length > 0 && (
              <div className="mt-2 space-y-3">
                <Headings
                  title="Full Live Conversation Transcript"
                  isSubHeading
                />
                <div className="p-4 rounded-xl border bg-gray-50/70 max-h-96 overflow-y-auto space-y-3 text-xs">
                  {interview.conversationHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${
                        item.role === "ai" ? "items-start" : "items-end"
                      }`}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-[10px] font-semibold text-gray-500">
                          {item.role === "ai" ? "Interviewer" : "You (Candidate)"}
                        </span>
                        {item.topic && item.role === "ai" && (
                          <span className="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-medium">
                            {item.topic}
                          </span>
                        )}
                      </div>
                      <div
                        className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                          item.role === "ai"
                            ? "bg-white border text-gray-800 shadow-2xs"
                            : "bg-purple-600 text-white"
                        }`}
                      >
                        {item.content}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      ) : (
        /* ── PRACTICE INTERVIEW QUESTION ACCORDION ─────────── */
        <>
          {/* Incomplete Session Alert Banner */}
          {isPracticeIncomplete && (
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/80 text-amber-950 flex items-start gap-3 shadow-2xs">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-amber-900">
                  Incomplete Practice Session ({answeredCount} of {totalPlannedQuestions} Questions Attempted)
                </h4>
                <p className="text-xs text-amber-800 leading-relaxed font-normal">
                  You concluded this practice session early without attempting {totalPlannedQuestions - answeredCount} question(s). In a real technical screening, unattempted questions receive a score of 0. Your overall calibrated rating reflects the full planned assessment.
                </p>
              </div>
            </div>
          )}

          {/* Calibrated Performance Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex flex-col justify-between">
              <span className="text-xs font-semibold text-emerald-900">
                Overall Calibrated Score
              </span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-extrabold text-emerald-700">
                  {practiceAdjustedOverallRating}
                </span>
                <span className="text-sm text-emerald-800 font-semibold">/ 10</span>
              </div>
              <span className="text-[11px] text-emerald-700/80 mt-1">
                Calibrated across all {totalPlannedQuestions} planned questions
              </span>
            </div>

            <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 flex flex-col justify-between">
              <span className="text-xs font-semibold text-purple-900">
                Attempted Questions Avg
              </span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-extrabold text-purple-700">
                  {practiceAttemptedAvg}
                </span>
                <span className="text-sm text-purple-800 font-semibold">/ 10</span>
              </div>
              <span className="text-[11px] text-purple-700/80 mt-1">
                Average across {answeredCount} submitted answer(s)
              </span>
            </div>

            <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/50 flex flex-col justify-between">
              <span className="text-xs font-semibold text-sky-900">
                Session Completion
              </span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-extrabold text-sky-700">
                  {Math.round((answeredCount / totalPlannedQuestions) * 100)}%
                </span>
                <span className="text-sm text-sky-800 font-semibold">
                  ({answeredCount}/{totalPlannedQuestions})
                </span>
              </div>
              <span className="text-[11px] text-sky-700/80 mt-1">
                {isPracticeIncomplete ? "Terminated early" : "Full session completed"}
              </span>
            </div>
          </div>

          {interview && <InterviewPin interview={interview} onMockPage />}

          {/* Practice Mode Resume Foundation Card */}
          {interview?.resumeBased && (
            <Card className="p-5 border border-indigo-200 bg-indigo-50/30 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span className="font-semibold text-sm text-gray-900">
                    Resume-Based Practice Assessment
                  </span>
                </div>
                <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 text-xs">
                  {interview.resumeFileName || "Uploaded Resume"}
                </Badge>
              </div>
              <p className="text-xs text-gray-600">
                These questions were customized to evaluate your claimed project implementations and role competencies. Review each question feedback item below to see model answers and improvement guidance.
              </p>
              {interview?.resumeClaims?.length > 0 && (
                <div className="pt-1">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                    Targeted Claims Under Review:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {interview.resumeClaims.slice(0, 4).map((c, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2 py-0.5 bg-white border border-indigo-100 text-indigo-700 rounded-md font-medium"
                      >
                        {typeof c === "string" ? c : c.claim}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}

          <Headings title="Question-by-Question Feedback & Model Answers" isSubHeading />

          {mergedPracticeQuestions && mergedPracticeQuestions.length > 0 ? (
            <Accordion type="single" collapsible className="space-y-6">
              {mergedPracticeQuestions.map((item) => (
                <AccordionItem
                  key={item.id}
                  value={item.id}
                  className={cn(
                    "border rounded-lg shadow-xs overflow-hidden",
                    !item.attempted && "border-rose-200 bg-rose-50/20"
                  )}
                >
                  <AccordionTrigger
                    onClick={() => setActiveFeed(item.id)}
                    className={cn(
                      "px-5 py-3 items-center justify-between text-base rounded-t-lg transition-colors hover:no-underline",
                      activeFeed === item.id
                        ? "bg-gradient-to-r from-purple-50 to-blue-50 "
                        : "hover:bg-gray-50"
                    )}
                  >
                    <div className="flex items-center gap-2 text-left flex-wrap">
                      <span className="font-semibold text-xs text-gray-500">
                        Question #{item.questionNumber}:
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {item.question}
                      </span>
                      {!item.attempted && (
                        <Badge className="bg-rose-100 text-rose-700 border-rose-200 text-[10px] font-semibold">
                          ❌ Not Attempted (0/10)
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>

                  {/* Accordion content for the feedback */}
                  <AccordionContent className="px-5 py-6 bg-white rounded-b-lg space-y-5 shadow-inner">
                    <div className="text-base font-semibold flex items-center gap-1.5">
                      {item.attempted ? (
                        <>
                          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                          <span className="text-gray-800">Rating: {item.rating} / 10</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 text-rose-500" />
                          <span className="text-rose-700 font-bold">
                            Score: 0 / 10 (Not Attempted / Ended Early)
                          </span>
                        </>
                      )}
                    </div>

                    {!item.attempted && (
                      <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
                        This question was skipped or not reached before exiting the interview. Review the expected answer below to prepare for your next interview.
                      </div>
                    )}

                    {/* Expected answer card */}
                    <Card className="border-none space-y-3 p-4 bg-green-50 rounded-lg shadow-xs">
                      <CardTitle className="flex items-center text-sm font-bold text-green-900">
                        <CircleCheck className="w-4 h-4 mr-2 text-green-600" />
                        Expected Model Answer
                      </CardTitle>
                      <CardDescription className="text-xs font-normal text-gray-800 leading-relaxed whitespace-pre-line">
                        {item.correct_ans}
                      </CardDescription>
                    </Card>

                    {/* User answer card */}
                    {item.attempted ? (
                      <Card className="border-none space-y-3 p-4 bg-amber-50 rounded-lg shadow-xs">
                        <CardTitle className="flex items-center text-sm font-bold text-amber-900">
                          <CircleCheck className="w-4 h-4 mr-2 text-amber-600" />
                          Your Recorded Response
                        </CardTitle>
                        <CardDescription className="text-xs font-normal text-gray-800 leading-relaxed">
                          {item.user_ans}
                        </CardDescription>
                      </Card>
                    ) : (
                      <Card className="border-none space-y-3 p-4 bg-gray-50 rounded-lg shadow-xs">
                        <CardTitle className="flex items-center text-sm font-bold text-gray-700">
                          <CircleCheck className="w-4 h-4 mr-2 text-gray-400" />
                          Your Response
                        </CardTitle>
                        <CardDescription className="text-xs italic text-gray-500">
                          [No response recorded — interview was concluded before attempting this question]
                        </CardDescription>
                      </Card>
                    )}

                    {/* AI feedback card */}
                    <Card className="border-none space-y-3 p-4 bg-red-50 rounded-lg shadow-xs">
                      <CardTitle className="flex items-center text-sm font-bold text-red-900">
                        <CircleCheck className="w-4 h-4 mr-2 text-red-600" />
                        Interviewer Feedback
                      </CardTitle>
                      <CardDescription className="text-xs font-normal text-gray-800 leading-relaxed">
                        {item.feedback}
                      </CardDescription>
                    </Card>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-gray-50">
              <p className="text-lg font-medium text-gray-600 mb-2">
                No feedback found
              </p>
              <p className="text-sm text-gray-500">
                Complete the interview to see your feedback here.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};


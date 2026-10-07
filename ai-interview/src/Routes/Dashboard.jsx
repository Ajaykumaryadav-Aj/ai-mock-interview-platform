import { Headings } from "@/components/Headings";
import { InterviewPin } from "@/components/InterviewPin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@clerk/clerk-react";
import {
  Plus,
  Code,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  AlertTriangle,
  MoreVertical,
  Eye,
  Play,
  Trash2,
  Loader2,
  FileText,
} from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { subscribeToInterviews } from "@/services/interviewService";
import {
  getCodingHistory,
  getCodingSubmission,
  deleteCodingSubmission,
} from "@/services/codingService";
import { CodingScorecardModal } from "@/components/coding/CodingScorecardModal";
import { SEO } from "@/components/SEO";

export const Dashboard = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [codingHistory, setCodingHistory] = useState([]);
  const [loadingCodingHistory, setLoadingCodingHistory] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isScorecardOpen, setIsScorecardOpen] = useState(false);
  const [loadingPerformanceId, setLoadingPerformanceId] = useState(null);
  const [submissionToDelete, setSubmissionToDelete] = useState(null);
  const [isDeletingSubmission, setIsDeletingSubmission] = useState(false);
  const { userId } = useAuth();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToInterviews(
      userId,
      (interviewList) => {
        setInterviews(interviewList || []);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching interviews:", error);
        toast.error("Error", {
          description: "Something went wrong loading your interviews.",
        });
        setLoading(false);
      }
    );

    // Load coding round history
    setLoadingCodingHistory(true);
    getCodingHistory()
      .then((history) => {
        setCodingHistory(history || []);
      })
      .catch((err) => {
        console.warn("[Dashboard] Could not fetch coding history:", err);
      })
      .finally(() => {
        setLoadingCodingHistory(false);
      });

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [userId]);

  // Close 3-dot dropdown menu on outside click, window scroll/resize, or Escape
  useEffect(() => {
    if (!activeMenu) return;

    const handleOutsideClick = (e) => {
      if (e.target.closest?.(".coding-history-portal-menu")) return;
      setActiveMenu(null);
    };

    const handleScrollOrResize = () => {
      setActiveMenu(null);
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setActiveMenu(null);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeMenu]);

  const handleToggleMenu = (e, sub, idx) => {
    e.stopPropagation();
    if (activeMenu?.id === sub.id) {
      setActiveMenu(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const menuHeight = 148;
    const menuWidth = 192;
    const spaceBelow = window.innerHeight - rect.bottom;

    // Last row(s) or rows near the bottom of viewport open upwards (dropup)
    const isBottomRow = idx >= Math.max(0, codingHistory.length - 2);
    const openUpwards = spaceBelow < menuHeight + 20 || (isBottomRow && rect.top > menuHeight + 20);

    const top = openUpwards
      ? Math.max(10, rect.top - menuHeight - 6)
      : Math.min(window.innerHeight - menuHeight - 10, rect.bottom + 6);

    const left = Math.max(12, Math.min(window.innerWidth - menuWidth - 12, rect.right - menuWidth));

    setActiveMenu({
      id: sub.id,
      sub,
      top,
      left,
      openUpwards,
    });
  };

  const handleDeleteInterview = (deletedId) => {
    setInterviews((prev) => prev.filter((item) => item.id !== deletedId));
  };

  const handleViewPerformance = async (sub) => {
    setActiveMenu(null);
    try {
      setLoadingPerformanceId(sub.id);
      const fullSub = await getCodingSubmission(sub.id);
      setSelectedSubmission(fullSub || sub);
      setIsScorecardOpen(true);
    } catch (err) {
      console.warn("[Dashboard] Could not fetch full submission:", err);
      setSelectedSubmission(sub);
      setIsScorecardOpen(true);
    } finally {
      setLoadingPerformanceId(null);
    }
  };

  const handleDeleteSubmissionConfirm = async () => {
    if (!submissionToDelete) return;
    try {
      setIsDeletingSubmission(true);
      await deleteCodingSubmission(submissionToDelete.id);
      setCodingHistory((prev) => prev.filter((item) => item.id !== submissionToDelete.id));
      toast.success("Submission deleted successfully");
      setSubmissionToDelete(null);
    } catch (err) {
      toast.error(err.message || "Failed to delete submission.");
    } finally {
      setIsDeletingSubmission(false);
    }
  };

  return (
    <>
      <SEO title="Candidate Dashboard | MocInterview" noindex={true} nofollow={true} />
      
      {/* Top Header */}
      <div className="flex w-full items-center justify-between">
        <Headings
          title="Dashboard"
          description="Create and start your AI Mock interview or test your skills in the Coding Round"
        />
        <div className="flex items-center gap-2">
          <Link to="/ats-resume">
            <Button variant="outline" size="sm" className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 font-semibold">
              <FileText className="w-4 h-4 mr-1 text-indigo-600" /> ATS Resume Score
            </Button>
          </Link>
          <Link to="/coding">
            <Button variant="outline" size="sm" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-semibold">
              <Code className="w-4 h-4 mr-1 text-emerald-600" /> Coding Round
            </Button>
          </Link>
          <Link to="/generate/create">
            <Button size="sm">
              <Plus className="min-w-4 min-h-4 mr-1" /> Add New
            </Button>
          </Link>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Coding Round Highlight Banner */}
      <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-gray-900 text-white shadow-lg border border-emerald-800/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" /> New Feature
            </span>
            <span className="text-xs text-gray-400 font-mono">Real Code Execution Sandbox</span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white">
            Ace Technical Interviews with Live Coding Round
          </h2>
          <p className="text-xs md:text-sm text-gray-300 max-w-xl">
            Write code in Monaco editor across 6 languages (JavaScript, Python, Java, C++, C#, Dart). Run against hidden test cases and get AI code review, complexity analysis, and scorecard.
          </p>
        </div>
        <Link to="/coding" className="shrink-0">
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold shadow-md rounded-xl">
            Practice Coding <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </Link>
      </div>

      {/* Interviews Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Your Mock Interviews
            </h2>
            <p className="text-xs text-muted-foreground">
              Review and manage your previous audio, video, and resume-based mock interviews.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-44 rounded-xl" />
            <Skeleton className="h-44 rounded-xl" />
            <Skeleton className="h-44 rounded-xl" />
          </div>
        ) : interviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {interviews.map((interview) => (
              <InterviewPin
                key={interview.id}
                interview={interview}
                onDelete={handleDeleteInterview}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-center bg-white dark:bg-gray-900 space-y-3">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
              No mock interviews created yet
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Start practicing with our AI interviewer to get detailed feedback, confidence score, and technical evaluation.
            </p>
            <Link to="/generate/create" className="inline-block pt-1">
              <Button size="sm">
                <Plus className="min-w-4 min-h-4 mr-1" /> Create Your First Interview
              </Button>
            </Link>
          </div>
        )}
      </div>

      <Separator className="my-8" />

      {/* Coding Submissions History Section */}
      <div className="space-y-4 mb-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-600" />
              Coding Submissions History
            </h2>
            <p className="text-xs text-muted-foreground">
              Your recent coding challenges, execution outcomes, complexity metrics, and AI evaluations.
            </p>
          </div>
          <Link to="/coding">
            <Button variant="outline" size="sm" className="text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50">
              Browse All Coding Problems <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        {loadingCodingHistory ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ) : codingHistory.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 text-gray-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">Problem</th>
                  <th className="px-4 py-3">Difficulty</th>
                  <th className="px-4 py-3">Language</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Tests</th>
                  <th className="px-4 py-3">Runtime</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                {codingHistory.map((sub, idx) => {
                  return (
                    <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-gray-900 dark:text-white">
                        {sub.questionTitle}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-2 py-0.5 ${
                            sub.difficulty === "Easy"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : sub.difficulty === "Medium"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {sub.difficulty}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-gray-600 dark:text-gray-400 capitalize font-mono text-[11px]">
                        {sub.language}
                      </td>
                      <td className="px-4 py-3.5">
                        {sub.status === "Accepted" || sub.status === "Passed" ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
                          </span>
                        ) : sub.status === "Compilation Error" ? (
                          <span className="inline-flex items-center gap-1 text-amber-600 font-bold">
                            <AlertTriangle className="w-3.5 h-3.5" /> Compile Error
                          </span>
                        ) : sub.status === "Time Limit Exceeded" ? (
                          <span className="inline-flex items-center gap-1 text-orange-600 font-bold">
                            <Clock className="w-3.5 h-3.5" /> Timeout
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-600 font-bold">
                            <XCircle className="w-3.5 h-3.5" /> {sub.status || "Wrong Answer"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-gray-900 dark:text-white">
                        {sub.score}/100
                      </td>
                      <td className="px-4 py-3.5 text-gray-600 dark:text-gray-400 font-mono">
                        {sub.passedCount} / {sub.totalCount}
                      </td>
                      <td className="px-4 py-3.5 text-gray-500 font-mono">
                        {sub.executionTime || "0ms"}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="inline-flex items-center justify-end">
                          <button
                            type="button"
                            onClick={(e) => handleToggleMenu(e, sub, idx)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              activeMenu?.id === sub.id
                                ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600"
                                : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                            }`}
                            title="Options"
                            aria-label="Options"
                          >
                            {loadingPerformanceId === sub.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                            ) : (
                              <MoreVertical className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-center bg-white dark:bg-gray-900 space-y-2">
            <Terminal className="w-8 h-8 text-gray-400 mx-auto" />
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
              No coding challenges attempted yet
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Test your data structures and algorithm skills with real server-side execution and get instant AI code feedback.
            </p>
            <Link to="/coding" className="inline-block pt-2">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl">
                Explore Coding Challenges <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* 3-Dot Dropdown Portal - Rendered at body level so table overflow never clips or forces scroll */}
      {activeMenu && typeof document !== "undefined" &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: `${activeMenu.top}px`,
              left: `${activeMenu.left}px`,
              zIndex: 9999,
            }}
            className={`coding-history-portal-menu w-48 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl py-1 text-left animate-in fade-in zoom-in-95 duration-100 ${
              activeMenu.openUpwards ? "origin-bottom-right" : "origin-top-right"
            }`}
          >
            <button
              type="button"
              onClick={() => {
                const sub = activeMenu.sub;
                setActiveMenu(null);
                handleViewPerformance(sub);
              }}
              className="w-full px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
              View Performance
            </button>

            <Link
              to={`/coding/${activeMenu.sub.questionId}`}
              onClick={() => setActiveMenu(null)}
              className="w-full px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 transition-colors block cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-sky-600" />
              Solve Again
            </Link>

            <div className="my-1 border-t border-gray-100 dark:border-gray-800" />

            <button
              type="button"
              onClick={() => {
                const sub = activeMenu.sub;
                setActiveMenu(null);
                setSubmissionToDelete(sub);
              }}
              className="w-full px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              Delete Attempt
            </button>
          </div>,
          document.body
        )}

      {/* Performance / Scorecard Modal */}
      {selectedSubmission && (
        <CodingScorecardModal
          isOpen={isScorecardOpen}
          onClose={() => {
            setIsScorecardOpen(false);
            setSelectedSubmission(null);
          }}
          submissionResult={selectedSubmission}
        />
      )}

      {/* Delete Submission Confirmation Dialog */}
      <Dialog
        open={Boolean(submissionToDelete)}
        onOpenChange={(open) => !open && setSubmissionToDelete(null)}
      >
        <DialogContent className="max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl p-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white">
              Delete Coding Attempt
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to delete this submission for{" "}
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {submissionToDelete?.questionTitle}
              </span>
              ? This will permanently remove your execution history and AI evaluation for this attempt.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSubmissionToDelete(null)}
              disabled={isDeletingSubmission}
              className="text-xs rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDeleteSubmissionConfirm}
              disabled={isDeletingSubmission}
              className="text-xs rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold"
            >
              {isDeletingSubmission ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin mr-1.5" /> Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Dashboard;

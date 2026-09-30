import {
  Card,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { TooltipButton } from "./TooltipButton";
import { Eye, Newspaper, Sparkles, Trash2, Loader2 } from "lucide-react";
import { safeToDate, deleteInterview } from "@/services/interviewService";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const InterviewPin = ({
  interview,
  onMockPage = false,
  onDelete,
}) => {
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Safely extract and format createdAt date
  const createdDate = safeToDate(interview?.createdAt);
  const formattedDate = `${createdDate.toLocaleDateString("en-US", {
    dateStyle: "long",
  })} - ${createdDate.toLocaleTimeString("en-US", {
    timeStyle: "short",
  })}`;

  const techStackList = interview?.techStack
    ? String(interview.techStack)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const isLive = interview?.mode === "live";

  const handleDeleteConfirm = async (e) => {
    e?.stopPropagation?.();
    if (isDeleting || !interview?.id) return;

    try {
      setIsDeleting(true);
      await deleteInterview(interview.id);
      toast.success("Deleted!", {
        description: "Interview deleted successfully.",
      });
      setShowDeleteModal(false);
      onDelete?.(interview.id);
    } catch (error) {
      console.error("Error deleting interview:", error);
      toast.error("Error", {
        description:
          error.message || "Failed to delete interview. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="p-4 rounded-md shadow-none hover:shadow-md shadow-gray-100 cursor-pointer transition-all space-y-3 border">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-semibold leading-tight">
            {interview?.position || "Mock Interview"}
          </CardTitle>
          <div className="flex items-center gap-1.5 flex-wrap flex-shrink-0">
            {isLive ? (
              <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-[11px] font-semibold">
                🎙️ Live ({interview.duration || 10}m)
              </Badge>
            ) : (
              <Badge className="bg-sky-100 text-sky-800 border-sky-200 text-[11px] font-semibold">
                📝 Practice
              </Badge>
            )}
            {interview?.resumeBased && (
              <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 text-[11px] font-semibold">
                📄 Resume Based
              </Badge>
            )}
            {(interview?.status === "abandoned_early" || interview?.isEarlyExit) ? (
              <Badge className="bg-rose-100 text-rose-800 border-rose-200 text-[10px]">
                ⚠️ Incomplete
              </Badge>
            ) : interview?.status === "completed" ? (
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px]">
                Done
              </Badge>
            ) : null}
          </div>
        </div>

        <CardDescription className="line-clamp-2 text-xs text-gray-500">
          {interview?.description || "No description provided."}
        </CardDescription>

        {/* Tech Stack Badges */}
        <div className="w-full flex items-center gap-1.5 flex-wrap">
          {techStackList.map((word, index) => (
            <Badge
              key={index}
              variant="outline"
              className="text-[11px] text-muted-foreground hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-900"
            >
              {word}
            </Badge>
          ))}
        </div>

        <CardFooter
          className={cn(
            "w-full flex items-center p-0",
            onMockPage ? "justify-end" : "justify-between"
          )}
        >
          <p className="text-[12px] text-muted-foreground truncate whitespace-nowrap">
            {formattedDate}
          </p>

          {/* Action buttons */}
          {!onMockPage && (
            <div className="flex items-center justify-center">
              {/* View / Edit Details */}
              <TooltipButton
                content="Edit"
                buttonVariant="ghost"
                icon={<Eye className="min-w-4 min-h-4" />}
                onClick={() => {
                  navigate(`/generate/${interview.id}`, { replace: true });
                }}
                loading={false}
                buttonClassName="hover:text-sky-500"
                disabled={false}
              />

              {/* View Feedback & Report */}
              <TooltipButton
                content="Feedback"
                buttonVariant="ghost"
                icon={<Newspaper className="min-w-4 min-h-4" />}
                onClick={() => {
                  navigate(`/generate/feedback/${interview.id}`, {
                    replace: true,
                  });
                }}
                loading={false}
                buttonClassName="hover:text-yellow-500"
                disabled={false}
              />

              {/* Start Interview */}
              <TooltipButton
                content={isLive ? "Start Live" : "Start"}
                buttonVariant="ghost"
                icon={<Sparkles className="min-w-4 min-h-4" />}
                onClick={() => {
                  if (isLive) {
                    navigate(`/generate/interview/${interview.id}/live`, {
                      replace: true,
                    });
                  } else {
                    navigate(`/generate/interview/${interview.id}`, {
                      replace: true,
                    });
                  }
                }}
                loading={false}
                buttonClassName={
                  isLive ? "hover:text-purple-600" : "hover:text-sky-500"
                }
                disabled={false}
              />

              {/* Delete Interview */}
              <TooltipButton
                content="Delete"
                buttonVariant="ghost"
                icon={<Trash2 className="min-w-4 min-h-4 text-gray-500" />}
                onClick={(e) => {
                  e?.stopPropagation?.();
                  setShowDeleteModal(true);
                }}
                loading={isDeleting}
                buttonClassName="hover:text-red-500"
                disabled={isDeleting}
              />
            </div>
          )}
        </CardFooter>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent
          className="max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900">
              Delete Interview?
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 pt-2 leading-relaxed">
              Are you sure you want to delete this interview? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex items-center justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteModal(false);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" /> Deleting…
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

export default InterviewPin;

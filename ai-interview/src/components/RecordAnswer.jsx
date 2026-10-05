import { useAuth } from "@clerk/clerk-react";
import WebCam from "react-webcam";
import { useEffect, useState } from "react";
import useSpeechToText from "react-hook-speech-to-text";
import { useParams } from "react-router-dom";
import {
  CircleStop,
  Loader,
  Mic,
  RefreshCw,
  Save,
  Video,
  VideoOff,
  WebcamIcon,
} from "lucide-react";
import { TooltipButton } from "./TooltipButton";
import { toast } from "sonner";
import { SaveModel } from "./SaveModel";
import { evaluateAnswer } from "@/services/gemini";
import { saveUserAnswer } from "@/services/interviewService";

export const RecordAnswer = ({
  question,
  isWebCam,
  setIsWebCam,
}) => {
  const {
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

  const [userAnswer, setUserAnswer] = useState("");
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { userId } = useAuth();
  const { interviewId } = useParams();

  // Record/Stop User Answer
  const recordUserAnswer = async () => {
    if (isAIGenerating) return;
    if (isRecording) {
      stopSpeechToText();

      if (!userAnswer || !userAnswer.trim()) {
        toast.error("No answer recorded", {
          description: "Please speak your response before requesting evaluation.",
        });
        return;
      }

      try {
        setIsAIGenerating(true);
        const result = await evaluateAnswer({
          question: question?.question || "",
          correctAnswer: question?.answer || "",
          userAnswer,
        });

        setAiResult(result);
        toast.success("Feedback generated!", {
          description: `Rating: ${result.rating}/10. Click 'Save Result' to save.`,
        });
      } catch (error) {
        console.error("Error evaluating answer:", error);
        toast.error("Evaluation Failed", {
          description: error.message || "An error occurred while evaluating your answer.",
        });
      } finally {
        setIsAIGenerating(false);
      }
    } else {
      // Start recording
      startSpeechToText();
    }
  };

  // Reset and record a new answer
  const recordNewAnswer = () => {
    setUserAnswer("");
    setAiResult(null);
    if (isRecording) {
      stopSpeechToText();
    }
    startSpeechToText();
  };

  // Save the answer and AI feedback into MongoDB Atlas
  const handleSaveUserAnswer = async () => {
    if (!aiResult) {
      toast.error("No evaluation to save", {
        description: "Please record and evaluate your answer first.",
      });
      return;
    }

    if (!userId) {
      toast.error("Authentication required", {
        description: "Please sign in to save your answer.",
      });
      return;
    }

    try {
      setLoading(true);

      // Uses interviewService with proper mockIdRef, userId, question scoping and updatedAt field
      const res = await saveUserAnswer({
        mockIdRef: interviewId,
        question: question?.question,
        correct_ans: question?.answer,
        user_ans: userAnswer,
        feedback: aiResult.feedback,
        rating: aiResult.rating,
        userId,
      });

      if (res.updated) {
        toast.success("Updated", {
          description: "Your answer for this question has been updated.",
        });
      } else {
        toast.success("Saved", {
          description: "Your answer and feedback have been saved.",
        });
      }

      setUserAnswer("");
      setAiResult(null);
      stopSpeechToText();
    } catch (error) {
      console.error("Error saving user answer:", error);
      toast.error("Save Error", {
        description: error.message || "An error occurred while saving your answer.",
      });
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  // Aggregate speech recognition results
  useEffect(() => {
    const combineTranscripts = results
      .filter((result) => typeof result !== "string" && result?.transcript)
      .map((result) => result.transcript)
      .join(" ");

    if (combineTranscripts) {
      setUserAnswer(combineTranscripts);
    }
  }, [results]);

  return (
    <div className="w-full flex flex-col items-center gap-8 mt-4">
      {/* Save Modal */}
      <SaveModel
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={handleSaveUserAnswer}
        loading={loading}
      />

      {/* WebCam */}
      <div className="w-full h-[400px] md:w-96 flex flex-col items-center justify-center border p-4 bg-gray-50 rounded-md">
        {isWebCam ? (
          <WebCam
            onUserMedia={() => setIsWebCam(true)}
            onUserMediaError={() => {
              setIsWebCam(false);
              toast.error("Camera Error", {
                description: "Unable to access your webcam. Please check browser permissions.",
              });
            }}
            className="w-full h-full object-cover rounded-md"
          />
        ) : (
          <WebcamIcon className="min-w-24 min-h-24 text-muted-foreground" />
        )}
      </div>

      {/* Action button Section */}
      <div className="flex items-center justify-center gap-3">
        {/* Video Toggle */}
        <TooltipButton
          content={isWebCam ? "Turn Off Camera" : "Turn On Camera"}
          icon={
            isWebCam ? (
              <VideoOff className="min-w-5 min-h-5" />
            ) : (
              <Video className="min-w-5 min-h-5" />
            )
          }
          onClick={() => setIsWebCam(!isWebCam)}
        />

        {/* Audio Recording Button */}
        <TooltipButton
          content={isRecording ? "Stop Recording" : "Start Recording"}
          icon={
            isRecording ? (
              <CircleStop className="min-w-5 min-h-5 text-red-500 animate-pulse" />
            ) : (
              <Mic className="min-w-5 min-h-5" />
            )
          }
          onClick={recordUserAnswer}
        />

        {/* Record Again Button */}
        <TooltipButton
          content="Record Again"
          icon={<RefreshCw className="min-w-5 min-h-5" />}
          onClick={recordNewAnswer}
        />

        {/* Save Result Button */}
        <TooltipButton
          content="Save Result"
          icon={
            isAIGenerating ? (
              <Loader className="min-w-5 min-h-5 animate-spin" />
            ) : (
              <Save className="min-w-5 min-h-5" />
            )
          }
          onClick={() => setOpen(!open)}
          disabled={!aiResult}
        />
      </div>

      {/* User Answer Display Section */}
      <div className="w-full mt-4 p-4 border rounded-md bg-gray-50">
        <h2 className="text-lg font-semibold">Your Answer:</h2>

        <p className="text-sm mt-2 text-gray-700 whitespace-normal leading-relaxed">
          {userAnswer || "Click 'Start Recording' to begin answering with voice."}
        </p>

        {interimResult && (
          <p className="text-sm text-gray-500 mt-2 italic">
            <strong>Current Speech:</strong> {interimResult}
          </p>
        )}

        {aiResult && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-md">
            <p className="text-sm font-semibold text-emerald-800">
              Evaluation Ready: Rating {aiResult.rating}/10
            </p>
            <p className="text-xs text-emerald-700 mt-1">
              {aiResult.feedback}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordAnswer;

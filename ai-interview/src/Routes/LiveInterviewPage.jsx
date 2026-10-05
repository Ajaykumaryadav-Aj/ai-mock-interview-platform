import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import WebCam from "react-webcam";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  Sparkles,
  RotateCcw,
  Send,
  Square,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MessageSquare,
  ChevronRight,
  Loader2,
  Bot,
  User,
  ShieldAlert,
} from "lucide-react";

import { CustomBreadCrum } from "@/components/CustomBreadCrum";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import LoaderPage from "./Loaderpage";
import {
  getInterviewById,
  updateInterview,
} from "@/services/interviewService";
import {
  generateLiveConversationTurn,
  generateFinalLiveEvaluation,
} from "@/services/gemini";
import { SEO } from "@/components/SEO";

/**
 * Sanitizes conversation history by removing empty or redundant consecutive entries.
 */
const sanitizeHistory = (history = []) => {
  const clean = [];
  for (const item of history) {
    if (!item || !item.content || typeof item.content !== "string") continue;
    const trimmed = item.content.trim();
    if (!trimmed) continue;
    const last = clean[clean.length - 1];
    if (last && last.role === item.role && last.content.trim() === trimmed) {
      continue;
    }
    clean.push({ ...item, content: trimmed });
  }
  return clean;
};

/**
 * Requirement 27: Cleans candidate speech transcripts before sending to Gemini.
 * - Removes duplicated consecutive fragments produced by Web Speech engines
 * - Strips empty interim fragments
 * - Preserves legitimately spoken repeated words (e.g. "very very")
 * - Ensures one clean coherent answer per turn
 */
const cleanSpokenTranscript = (text = "") => {
  if (!text || typeof text !== "string") return "";
  let clean = text.replace(/\s+/g, " ").trim();

  // Check for repeated sentence or multi-word phrase patterns
  const sentences = clean.split(/(?<=[.?!])\s+/);
  const dedupedSentences = [];
  for (const s of sentences) {
    const trimmed = s.trim();
    if (!trimmed) continue;
    if (
      dedupedSentences.length > 0 &&
      dedupedSentences[dedupedSentences.length - 1].toLowerCase() === trimmed.toLowerCase()
    ) {
      continue;
    }
    dedupedSentences.push(trimmed);
  }
  clean = dedupedSentences.join(" ");

  // Deduplicate exact phrase echo: e.g. "my name is Ajay Kumar my name is Ajay Kumar"
  const words = clean.split(" ");
  if (words.length >= 4 && words.length % 2 === 0) {
    const half = words.length / 2;
    const firstHalf = words.slice(0, half).join(" ").toLowerCase();
    const secondHalf = words.slice(half).join(" ").toLowerCase();
    if (firstHalf === secondHalf) {
      clean = words.slice(0, half).join(" ");
    }
  }

  return clean.trim();
};

export const LiveInterviewPage = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const { userId } = useAuth();

  // ── Core Interview State ──────────────────────────────────────────────────
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionState, setSessionState] = useState("INITIALIZING"); // INITIALIZING | READY | AI_SPEAKING | LISTENING | PROCESSING | COMPLETING | COMPLETED
  const [conversationHistory, setConversationHistory] = useState([]);
  const [currentAiQuestion, setCurrentAiQuestion] = useState("");
  const [currentTopic, setCurrentTopic] = useState("Introduction");

  // ── User Input & Speech ───────────────────────────────────────────────────
  const [userTranscript, setUserTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isWebCamEnabled, setIsWebCamEnabled] = useState(true);
  const [isAiMuted, setIsAiMuted] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);

  // ── Timer State (Drift-proof) ─────────────────────────────────────────────
  const [startTime, setStartTime] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(600); // default 10 min
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // ── Confirmation Modal ────────────────────────────────────────────────────
  const [showEndModal, setShowEndModal] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // ── Refs for hardware & timers ────────────────────────────────────────────
  const recognitionRef = useRef(null);
  const speechUtteranceRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const webcamRef = useRef(null);
  const chatScrollRef = useRef(null);
  const handleAutoFinishRef = useRef(null);

  // State synchronization refs to avoid stale closures in Web Speech callbacks
  const baseTranscriptRef = useRef("");
  const userTranscriptRef = useRef("");
  const sessionStateRef = useRef("INITIALIZING");
  const isListeningRef = useRef(false);
  const isSubmittingRef = useRef(false);
  const isManuallyPausedRef = useRef(false);

  useEffect(() => {
    userTranscriptRef.current = userTranscript;
  }, [userTranscript]);

  useEffect(() => {
    sessionStateRef.current = sessionState;
  }, [sessionState]);

  // Auto-scroll chat to latest message
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [conversationHistory, interimText, userTranscript]);

  // ── 1. Load Interview Data ────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    const loadInterview = async () => {
      if (!interviewId) return;

      try {
        setLoading(true);
        const data = await getInterviewById(interviewId);
        if (!isMounted) return;

        if (!data) {
          toast.error("Interview not found");
          navigate("/generate", { replace: true });
          return;
        }

        setInterview(data);

        const initialHistory = data.conversationHistory || [];
        setConversationHistory(initialHistory);

        // Find initial question
        const firstAiMessage = initialHistory.find((m) => m.role === "ai");
        if (firstAiMessage) {
          setCurrentAiQuestion(firstAiMessage.content);
          setCurrentTopic(firstAiMessage.topic || "Introduction");
        } else if (data.questions?.[0]?.question) {
          setCurrentAiQuestion(data.questions[0].question);
        }

        const durationMin = data.duration || 10;
        setRemainingSeconds(durationMin * 60);

        // If interview was already completed, prompt redirect to feedback
        if (data.status === "completed") {
          toast.info("This interview is already completed.", {
            description: "Redirecting to your feedback report...",
          });
          navigate(`/generate/feedback/${interviewId}`, { replace: true });
          return;
        }

        setSessionState("READY");
      } catch (err) {
        console.error("Error loading live interview:", err);
        toast.error("Failed to load interview session.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadInterview();

    return () => {
      isMounted = false;
    };
  }, [interviewId, navigate]);

  // ── 2. Speech Synthesis (AI Voice Output) ──────────────────────────────────
  const speakMessage = (text, onFinished) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSessionState("LISTENING");
      sessionStateRef.current = "LISTENING";
      if (onFinished) onFinished();
      return;
    }

    // Cancel any active utterance
    try {
      window.speechSynthesis.cancel();
    } catch (_) {}

    if (isAiMuted || !text) {
      // If muted, wait a brief readable moment before enabling candidate answer
      const readingDelay = Math.min(3000, Math.max(1200, (text || "").length * 25));
      const timeout = setTimeout(() => {
        setSessionState("LISTENING");
        sessionStateRef.current = "LISTENING";
        isManuallyPausedRef.current = false;
        if (onFinished) {
          onFinished();
        } else {
          startListening();
        }
      }, readingDelay);
      return () => clearTimeout(timeout);
    }

    const utterance = new SpeechSynthesisUtterance(text);
    speechUtteranceRef.current = utterance;

    // Pick a natural English voice
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice =
      voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Natural") ||
            v.name.includes("Google") ||
            v.name.includes("Samantha") ||
            v.name.includes("Neural"))
      ) || voices.find((v) => v.lang.startsWith("en"));

    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setSessionState("AI_SPEAKING");
      sessionStateRef.current = "AI_SPEAKING";
      // Ensure microphone is stopped while AI speaks to avoid feedback loop
      stopListening(false);
    };

    const handleSpeechDone = () => {
      speechUtteranceRef.current = null;
      try {
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
      } catch (_) {}

      setSessionState("LISTENING");
      sessionStateRef.current = "LISTENING";
      isManuallyPausedRef.current = false;

      // Small buffer delay so residual speaker audio does not bleed into candidate mic
      setTimeout(() => {
        if (onFinished) {
          onFinished();
        } else {
          startListening();
        }
      }, 250);
    };

    utterance.onend = handleSpeechDone;
    utterance.onerror = (e) => {
      console.warn("Speech synthesis error or canceled:", e);
      handleSpeechDone();
    };

    window.speechSynthesis.speak(utterance);
  };

  // ── 3. Speech Recognition (User Voice Input) ──────────────────────────────
  const setupSpeechRecognition = () => {
    if (typeof window === "undefined") return null;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      isListeningRef.current = true;
      setIsRecording(true);
    };

    recognition.onresult = (event) => {
      let sessionFinal = "";
      let sessionInterim = "";

      // Accumulate final results and interim results separately
      for (let i = 0; i < event.results.length; i++) {
        const item = event.results[i];
        const text = item[0]?.transcript || "";
        if (item.isFinal) {
          sessionFinal += text + " ";
        } else {
          sessionInterim += text;
        }
      }

      sessionFinal = sessionFinal.trim();
      sessionInterim = sessionInterim.trim();

      // Combine base text with newly finalized session text
      const base = baseTranscriptRef.current ? baseTranscriptRef.current.trim() : "";
      const completeFinal = base
        ? (sessionFinal ? `${base} ${sessionFinal}` : base)
        : sessionFinal;

      setUserTranscript(completeFinal);
      userTranscriptRef.current = completeFinal;
      setInterimText(sessionInterim);
    };

    recognition.onerror = (event) => {
      if (event.error === "no-speech") return;
      console.warn("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        toast.error("Microphone Access Denied", {
          description: "Please allow microphone permission in your browser address bar.",
        });
      }
    };

    recognition.onend = () => {
      isListeningRef.current = false;
      setIsRecording(false);
      setInterimText("");

      // Seamless auto-restart on natural conversational pauses (silence threshold in Chrome)
      if (
        sessionStateRef.current === "LISTENING" &&
        !isManuallyPausedRef.current &&
        !isSubmittingRef.current
      ) {
        try {
          recognition.start();
          isListeningRef.current = true;
          setIsRecording(true);
        } catch (_) {
          // Handled on next cycle
        }
      }
    };

    return recognition;
  };

  const startListening = () => {
    // If interview is processing AI response or completing, do not listen
    if (
      sessionStateRef.current === "PROCESSING" ||
      sessionStateRef.current === "COMPLETING" ||
      sessionStateRef.current === "COMPLETED"
    ) {
      return;
    }

    // Cancel any active AI speech so candidate can speak immediately
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }
      } catch (_) {}
    }

    isManuallyPausedRef.current = false;
    setSessionState("LISTENING");
    sessionStateRef.current = "LISTENING";

    if (isListeningRef.current) {
      setIsRecording(true);
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.abort();
        } catch (_) {}
        recognitionRef.current = null;
      }

      baseTranscriptRef.current = userTranscriptRef.current ? userTranscriptRef.current.trim() : "";

      const rec = setupSpeechRecognition();
      if (!rec) {
        setIsRecording(false);
        isListeningRef.current = false;
        return;
      }

      recognitionRef.current = rec;
      rec.start();
      isListeningRef.current = true;
      setIsRecording(true);
    } catch (e) {
      console.warn("Recognition start skipped or already running:", e.message);
    }
  };

  const stopListening = (manual = false) => {
    if (manual) {
      isManuallyPausedRef.current = true;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch (_) {}
    }
    isListeningRef.current = false;
    setIsRecording(false);
    setInterimText("");
  };

  // Immediate interrupt: candidate clicks mic to speak right away
  const handleInterruptAndSpeak = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }
    speechUtteranceRef.current = null;
    isManuallyPausedRef.current = false;
    setSessionState("LISTENING");
    sessionStateRef.current = "LISTENING";
    startListening();
  };

  // ── 4. Drift-Proof Timer ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isTimerRunning || !startTime || !interview) return;

    const totalSeconds = (interview.duration || 10) * 60;

    timerIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      const remaining = Math.max(0, totalSeconds - elapsed);

      setElapsedSeconds(elapsed);
      setRemainingSeconds(remaining);

      // Auto-complete when time expires
      if (remaining <= 0) {
        clearInterval(timerIntervalRef.current);
        toast.info("Interview time completed!", {
          description: "Compiling your final evaluation report...",
        });
        handleAutoFinishRef.current?.();
      }
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isTimerRunning, startTime, interview]);

  // Format time MM:SS
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${String(mins).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
  };

  // ── 5. Start Session ──────────────────────────────────────────────────────
  const handleStartInterview = async () => {
    // 1. Explicitly prompt and verify microphone hardware permission on user click gesture
    try {
      if (typeof navigator !== "undefined" && navigator?.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch (permErr) {
      console.warn("Microphone access prompt check:", permErr);
      if (permErr.name === "NotAllowedError" || permErr.name === "PermissionDeniedError") {
        toast.error("Microphone Access Blocked", {
          description: "Please click the camera/microphone icon in your browser address bar and allow microphone access.",
        });
      }
    }

    const startTimestamp = Date.now();
    setStartTime(startTimestamp);
    setIsTimerRunning(true);
    isManuallyPausedRef.current = false;

    // Speak initial AI question, then mic turns on immediately
    if (currentAiQuestion) {
      speakMessage(currentAiQuestion, () => {
        startListening();
      });
    } else {
      startListening();
    }
  };

  // ── 6. Handle User Answer Submission (Conversational Turn) ────────────────
  const handleSubmitAnswer = async () => {
    if (
      isSubmittingRef.current ||
      sessionStateRef.current === "PROCESSING" ||
      sessionStateRef.current === "COMPLETING" ||
      sessionStateRef.current === "COMPLETED"
    ) {
      return;
    }

    isSubmittingRef.current = true;
    stopListening();

    const finalizedAnswer = cleanSpokenTranscript(
      userTranscriptRef.current + (interimText ? " " + interimText : "")
    );

    if (!finalizedAnswer || finalizedAnswer.length < 10) {
      toast.error("Answer too short", {
        description: "Please speak or write at least a sentence before submitting.",
      });
      isSubmittingRef.current = false;
      startListening();
      return;
    }

    setSessionState("PROCESSING");

    const userMessage = {
      role: "user",
      content: finalizedAnswer,
      timestamp: Date.now(),
    };

    // Sanitize conversation history to guarantee zero duplicate consecutive turns
    const updatedHistory = sanitizeHistory([...conversationHistory, userMessage]);
    setConversationHistory(updatedHistory);
    setUserTranscript("");
    userTranscriptRef.current = "";
    baseTranscriptRef.current = "";
    setInterimText("");

    try {
      // Save sanitized user answer to MongoDB Atlas
      await updateInterview(interviewId, {
        conversationHistory: updatedHistory,
      });

      // Query conversational AI engine
      const totalPlannedMinutes = interview.duration || 10;
      const turnResult = await generateLiveConversationTurn({
        position: interview.position,
        techStack: interview.techStack,
        experience: interview.experience,
        interviewType: interview.interviewType || "Technical",
        focusAreas: interview.focusAreas || "",
        durationMinutes: totalPlannedMinutes,
        elapsedSeconds,
        conversationHistory: updatedHistory,
        latestUserAnswer: finalizedAnswer,
        resumeAnalysis: interview.resumeAnalysis || null,
        resumeClaims: interview.resumeClaims || [],
        resumeBased: interview.resumeBased || false,
      });

      const aiResponse = {
        role: "ai",
        content: turnResult.message,
        topic: turnResult.topic || "Technical Assessment",
        action: turnResult.action || "follow_up",
        timestamp: Date.now(),
      };

      const nextHistory = sanitizeHistory([...updatedHistory, aiResponse]);
      setConversationHistory(nextHistory);
      setCurrentAiQuestion(turnResult.message);
      setCurrentTopic(turnResult.topic || "Technical Assessment");

      // Persist to MongoDB Atlas
      await updateInterview(interviewId, {
        conversationHistory: nextHistory,
      });

      isSubmittingRef.current = false;

      // If AI decided to wrap up or remaining time is less than 45s
      if (!turnResult.shouldContinue || remainingSeconds <= 45) {
        speakMessage(turnResult.message, async () => {
          await finalizeAndCompleteInterview(nextHistory);
        });
      } else {
        // Speak AI follow-up response
        speakMessage(turnResult.message, () => {
          startListening();
        });
      }
    } catch (err) {
      console.error("Error processing interview turn:", err);
      toast.error("Conversation error", {
        description: "Encountered a momentary glitch. Continuing session...",
      });
      isSubmittingRef.current = false;
      setSessionState("LISTENING");
      startListening();
    }
  };

  // ── 7. Replay Question ────────────────────────────────────────────────────
  const handleReplayQuestion = () => {
    if (currentAiQuestion && sessionStateRef.current !== "PROCESSING" && sessionStateRef.current !== "COMPLETING") {
      stopListening();
      speakMessage(currentAiQuestion, () => {
        startListening();
      });
    }
  };

  // ── 8. Finalize Interview & Generate Report ───────────────────────────────
  const finalizeAndCompleteInterview = async (historyToEvaluate, isManualEarlyExit = false) => {
    setIsCompleting(true);
    setSessionState("COMPLETING");
    setIsTimerRunning(false);
    stopListening();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    const cleanHistory = sanitizeHistory(historyToEvaluate || conversationHistory);
    const userTurnCount = cleanHistory.filter((m) => m.role === "user").length;
    const isEarly = isManualEarlyExit || (remainingSeconds > 90 && userTurnCount < 3);

    try {
      const evaluation = await generateFinalLiveEvaluation({
        position: interview.position,
        techStack: interview.techStack,
        experience: interview.experience,
        interviewType: interview.interviewType || "Technical",
        conversationHistory: cleanHistory,
        durationMinutes: interview.duration || 10,
        resumeAnalysis: interview.resumeAnalysis || null,
        resumeClaims: interview.resumeClaims || [],
        resumeBased: interview.resumeBased || false,
        isEarlyExit: isEarly,
        elapsedSeconds,
      });

      const finalStatus =
        evaluation.completionStatus === "abandoned_early" || isEarly
          ? "abandoned_early"
          : "completed";

      await updateInterview(interviewId, {
        status: finalStatus,
        isEarlyExit: isEarly,
        elapsedSeconds,
        conversationHistory: cleanHistory,
        finalEvaluation: evaluation,
      });

      if (isEarly || (evaluation.overallRating && evaluation.overallRating < 4.0)) {
        toast.warning("Interview concluded", {
          description: "Your realistic performance evaluation report has been generated.",
        });
      } else {
        toast.success("Interview completed!", {
          description: "Your comprehensive evaluation report is ready.",
        });
      }

      navigate(`/generate/feedback/${interviewId}`, { replace: true });
    } catch (err) {
      console.error("Error generating final evaluation:", err);
      toast.error("Could not compile evaluation", {
        description: "Saving conversation progress and opening feedback.",
      });
      navigate(`/generate/feedback/${interviewId}`, { replace: true });
    } finally {
      setIsCompleting(false);
    }
  };

  const handleAutoFinish = async () => {
    let currentHistory = [...conversationHistory];
    const pending = userTranscriptRef.current ? userTranscriptRef.current.trim() : "";
    if (pending.length >= 10) {
      currentHistory.push({
        role: "user",
        content: pending,
        timestamp: Date.now(),
      });
    }
    await finalizeAndCompleteInterview(sanitizeHistory(currentHistory), false);
  };
  handleAutoFinishRef.current = handleAutoFinish;

  const handleConfirmEndEarly = async () => {
    setShowEndModal(false);
    let currentHistory = [...conversationHistory];
    const pending = userTranscriptRef.current ? userTranscriptRef.current.trim() : "";
    if (pending.length >= 10) {
      currentHistory.push({
        role: "user",
        content: pending,
        timestamp: Date.now(),
      });
    }
    await finalizeAndCompleteInterview(sanitizeHistory(currentHistory), true);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  if (loading || !interview) {
    return <LoaderPage className="w-full h-[70vh]" />;
  }

  const durationMin = interview.duration || 10;
  const isTimeLow = remainingSeconds < 120;

  return (
    <div className="flex flex-col w-full gap-5 py-4 min-h-[90vh]">
      <SEO
        title="Live AI Interview Room | MocInterview"
        noindex={true}
        nofollow={true}
      />
      {/* ── Top Bar / Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b">
        <div>
          <CustomBreadCrum
            breadCrumbPage="Live Session"
            breadCrumbItems={[
              { label: "Dashboard", link: "/generate" },
              {
                label: interview.position || "Live Interview",
                link: `/generate/${interview.id}`,
              },
            ]}
          />
          <div className="flex items-center gap-2 mt-1">
            <h1 className="text-xl font-bold text-gray-900">
              {interview.position}
            </h1>
            <Badge className="bg-purple-100 text-purple-800 border-purple-300">
              🎙️ Live AI ({durationMin}m)
            </Badge>
            <Badge variant="outline" className="text-xs">
              {interview.interviewType || "Technical"}
            </Badge>
          </div>
        </div>

        {/* Status Pill & Timer */}
        <div className="flex items-center gap-3">
          {sessionState !== "READY" && sessionState !== "INITIALIZING" && (
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold ${
                isTimeLow
                  ? "bg-red-50 text-red-700 border-red-300 animate-pulse"
                  : "bg-gray-100 text-gray-800 border-gray-200"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>
                {formatTime(remainingSeconds)} / {durationMin}:00
              </span>
            </div>
          )}

          {sessionState !== "READY" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEndModal(true)}
              disabled={isCompleting}
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 text-xs"
            >
              <Square className="w-3.5 h-3.5 mr-1 fill-red-600" />
              End Interview
            </Button>
          )}
        </div>
      </div>

      {/* ── State: READY TO START ────────────────────────────────────────── */}
      {sessionState === "READY" && (
        <div className="w-full flex flex-col items-center justify-center p-8 bg-gradient-to-b from-purple-50/50 via-white to-white border border-purple-100 rounded-2xl shadow-sm space-y-6 max-w-3xl mx-auto my-6 text-center">
          <div className="w-16 h-16 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-200 animate-bounce">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">
              Your AI Interviewer is Ready
            </h2>
            <p className="text-sm text-gray-600 max-w-lg mx-auto">
              This is an interactive, real-time conversation. The interviewer
              will speak first, listen to your answers, and ask adaptive
              follow-up questions based on your responses.
            </p>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-xl text-left">
            <div className="p-3 bg-white rounded-lg border shadow-xs">
              <span className="text-[11px] text-gray-400 uppercase font-semibold">
                Role
              </span>
              <p className="text-xs font-semibold text-gray-800 truncate">
                {interview.position}
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border shadow-xs">
              <span className="text-[11px] text-gray-400 uppercase font-semibold">
                Experience
              </span>
              <p className="text-xs font-semibold text-gray-800">
                {interview.experience} Years
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border shadow-xs">
              <span className="text-[11px] text-gray-400 uppercase font-semibold">
                Target Time
              </span>
              <p className="text-xs font-semibold text-gray-800">
                {durationMin} Minutes
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border shadow-xs">
              <span className="text-[11px] text-gray-400 uppercase font-semibold">
                Format
              </span>
              <p className="text-xs font-semibold text-purple-700">
                Voice & Follow-ups
              </p>
            </div>
          </div>

          {/* Camera / Hardware Preview */}
          <div className="w-64 h-44 rounded-xl overflow-hidden border bg-gray-900 relative shadow-inner">
            {isWebCamEnabled ? (
              <WebCam
                ref={webcamRef}
                mirrored
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-xs gap-1">
                <VideoOff className="w-6 h-6" />
                <span>Camera Off</span>
              </div>
            )}
            <button
              onClick={() => setIsWebCamEnabled(!isWebCamEnabled)}
              className="absolute bottom-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            >
              {isWebCamEnabled ? (
                <Video className="w-3.5 h-3.5" />
              ) : (
                <VideoOff className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          <Button
            size="lg"
            onClick={handleStartInterview}
            className="px-8 py-6 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-base shadow-md shadow-purple-200 transition-all hover:scale-[1.02]"
          >
            <Mic className="w-5 h-5 mr-2" /> Start Live Interview
          </Button>
        </div>
      )}

      {/* ── State: ACTIVE INTERVIEW ROOM ─────────────────────────────────── */}
      {sessionState !== "READY" && sessionState !== "INITIALIZING" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
          {/* Left Area (8 cols): Video Tiles & Interaction Box */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* Split Screen Video Tiles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tile 1: AI Interviewer */}
              <div className="relative h-64 md:h-72 rounded-2xl border bg-gradient-to-b from-gray-900 via-slate-900 to-indigo-950 p-4 flex flex-col justify-between overflow-hidden shadow-sm">
                {/* AI Header */}
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">
                    <Bot className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-semibold text-white">
                      AI Interviewer
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {sessionState === "AI_SPEAKING" && (
                      <Button
                        size="xs"
                        variant="secondary"
                        onClick={handleInterruptAndSpeak}
                        className="bg-white/20 hover:bg-white/30 text-white text-[11px] h-7 px-2.5 border border-white/25 backdrop-blur-md"
                        title="Skip voice and start speaking immediately"
                      >
                        <Mic className="w-3 h-3 mr-1 text-emerald-400" />
                        Speak Now
                      </Button>
                    )}
                    <button
                      onClick={() => setIsAiMuted(!isAiMuted)}
                      title={isAiMuted ? "Unmute AI Voice" : "Mute AI Voice"}
                      className="p-1.5 rounded-full bg-black/40 text-gray-300 hover:text-white backdrop-blur-md transition-colors"
                    >
                      {isAiMuted ? (
                        <VolumeX className="w-4 h-4 text-red-400" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={handleReplayQuestion}
                      title="Replay Question"
                      disabled={sessionState === "PROCESSING"}
                      className="p-1.5 rounded-full bg-black/40 text-gray-300 hover:text-white backdrop-blur-md transition-colors disabled:opacity-50"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* AI Visual Center (Avatar + Audio Wave) */}
                <div className="flex flex-col items-center justify-center my-auto z-10">
                  <div
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                      sessionState === "AI_SPEAKING"
                        ? "bg-purple-600/30 ring-4 ring-purple-400/50 scale-110 shadow-lg shadow-purple-500/30"
                        : "bg-white/10"
                    }`}
                  >
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-md">
                      <Bot className="w-7 h-7" />
                    </div>
                  </div>

                  {/* Pulsing Audio Waveform Indicator */}
                  {sessionState === "AI_SPEAKING" && (
                    <div className="flex items-center gap-1 mt-3">
                      <span className="w-1 h-3 bg-purple-400 rounded-full animate-bounce delay-75"></span>
                      <span className="w-1 h-5 bg-purple-300 rounded-full animate-bounce delay-150"></span>
                      <span className="w-1 h-7 bg-purple-400 rounded-full animate-bounce delay-100"></span>
                      <span className="w-1 h-4 bg-purple-300 rounded-full animate-bounce delay-200"></span>
                      <span className="w-1 h-2 bg-purple-400 rounded-full animate-bounce delay-75"></span>
                    </div>
                  )}

                  <span className="text-[11px] font-medium text-purple-200 mt-2">
                    {sessionState === "AI_SPEAKING"
                      ? "Speaking Question…"
                      : sessionState === "PROCESSING"
                      ? "Analyzing Your Answer…"
                      : sessionState === "COMPLETING"
                      ? "Preparing Evaluation…"
                      : "Listening to You"}
                  </span>
                </div>

                {/* AI Current Topic Badge */}
                <div className="z-10 flex items-center justify-between text-[11px] text-gray-400">
                  <span className="truncate max-w-[200px]">
                    Topic: {currentTopic}
                  </span>
                  <span className="text-purple-300/80 font-mono text-[10px]">
                    AI Voice Active
                  </span>
                </div>
              </div>

              {/* Tile 2: Candidate Video & Microphone */}
              <div className="relative h-64 md:h-72 rounded-2xl border bg-gray-950 overflow-hidden shadow-sm flex flex-col justify-between p-4">
                {/* Candidate Feed */}
                {isWebCamEnabled ? (
                  <WebCam
                    ref={webcamRef}
                    mirrored
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-gray-900 text-gray-400">
                    <User className="w-12 h-12 text-gray-600 mb-1" />
                    <span className="text-xs">Camera is Off</span>
                  </div>
                )}

                {/* Candidate Header */}
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-2 bg-black/50 px-3 py-1 rounded-full backdrop-blur-md text-white">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs font-semibold">You (Candidate)</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        if (sessionState === "LISTENING" && isRecording) {
                          stopListening(true);
                        } else {
                          handleInterruptAndSpeak();
                        }
                      }}
                      title={
                        sessionState === "LISTENING" && isRecording
                          ? "Mute Microphone"
                          : "Turn Microphone On / Speak Now"
                      }
                      className={cn(
                        "p-1.5 rounded-full text-white backdrop-blur-md transition-colors",
                        sessionState === "LISTENING" && isRecording
                          ? "bg-emerald-600 hover:bg-emerald-700 ring-2 ring-emerald-400/50"
                          : "bg-red-600/90 hover:bg-red-700"
                      )}
                    >
                      {sessionState === "LISTENING" && isRecording ? (
                        <Mic className="w-4 h-4 text-white" />
                      ) : (
                        <MicOff className="w-4 h-4 text-white" />
                      )}
                    </button>
                    <button
                      onClick={() => setIsWebCamEnabled(!isWebCamEnabled)}
                      className="p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-md transition-colors"
                    >
                      {isWebCamEnabled ? (
                        <Video className="w-4 h-4" />
                      ) : (
                        <VideoOff className="w-4 h-4 text-red-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Candidate Bottom Status - Interactive Clickable Mic Toggle */}
                <div className="z-10 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      if (sessionState === "LISTENING" && isRecording) {
                        stopListening(true);
                      } else {
                        handleInterruptAndSpeak();
                      }
                    }}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md transition-all cursor-pointer shadow-xs",
                      sessionState === "LISTENING" && isRecording
                        ? "bg-emerald-500/90 hover:bg-emerald-600 text-white animate-pulse"
                        : "bg-black/60 hover:bg-black/80 text-gray-200 border border-white/10"
                    )}
                  >
                    {sessionState === "LISTENING" && isRecording ? (
                      <>
                        <Mic className="w-3.5 h-3.5" />
                        <span>🎙️ Mic ON (Listening) — Click to Mute</span>
                      </>
                    ) : sessionState === "AI_SPEAKING" ? (
                      <>
                        <Mic className="w-3.5 h-3.5 text-emerald-400" />
                        <span>AI Speaking — Click to Speak Now</span>
                      </>
                    ) : (
                      <>
                        <MicOff className="w-3.5 h-3.5 text-amber-400" />
                        <span>Mic OFF — Click to Turn On</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Current Question Banner */}
            <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5" /> Interviewer Question:
                </span>
                <span className="text-xs text-purple-700 font-medium">
                  {currentTopic}
                </span>
              </div>
              <p className="text-sm md:text-base font-semibold text-gray-900 leading-relaxed">
                &ldquo;{currentAiQuestion}&rdquo;
              </p>
            </div>

            {/* Answer & Transcription Box */}
            <div className="p-4 rounded-xl border bg-white shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-emerald-600" /> Your Spoken Answer:
                </span>
                {sessionState === "LISTENING" && (
                  <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    Transcribing voice in real time…
                  </span>
                )}
              </div>

              {/* Editable Transcript Textarea */}
              <div className="relative min-h-[90px] p-3 rounded-lg border bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-purple-400 transition-all">
                <textarea
                  value={userTranscript}
                  onChange={(e) => {
                    const val = e.target.value;
                    setUserTranscript(val);
                    userTranscriptRef.current = val;
                    baseTranscriptRef.current = val;
                  }}
                  placeholder={
                    sessionState === "LISTENING"
                      ? "Speak your response into your microphone, or type your answer here…"
                      : "Interviewer is speaking. Your microphone will turn on as soon as they finish…"
                  }
                  disabled={sessionState === "PROCESSING" || sessionState === "COMPLETING"}
                  className="w-full bg-transparent resize-none outline-none text-sm text-gray-800 placeholder:text-gray-400 leading-relaxed"
                  rows={3}
                />
                {interimText && (
                  <p className="text-xs text-purple-600 font-medium italic mt-1">
                    {interimText}
                  </p>
                )}
              </div>

              {/* Interaction Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setUserTranscript("");
                      userTranscriptRef.current = "";
                      baseTranscriptRef.current = "";
                      setInterimText("");
                    }}
                    disabled={
                      !userTranscript ||
                      sessionState === "PROCESSING" ||
                      sessionState === "COMPLETING"
                    }
                    className="text-xs text-gray-600"
                  >
                    Clear Text
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (sessionState === "LISTENING" && isRecording) {
                        stopListening(true);
                      } else {
                        handleInterruptAndSpeak();
                      }
                    }}
                    disabled={
                      sessionState === "PROCESSING" || sessionState === "COMPLETING"
                    }
                    className={cn(
                      "text-xs font-medium transition-all",
                      sessionState === "LISTENING" && isRecording
                        ? "border-amber-300 text-amber-700 hover:bg-amber-50"
                        : "border-emerald-400 text-emerald-700 bg-emerald-50/60 hover:bg-emerald-100"
                    )}
                  >
                    {sessionState === "LISTENING" && isRecording ? (
                      <>
                        <MicOff className="w-3.5 h-3.5 mr-1" /> Mute Mic
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Turn Mic On / Speak
                      </>
                    )}
                  </Button>
                </div>

                <Button
                  onClick={handleSubmitAnswer}
                  disabled={
                    sessionState === "PROCESSING" ||
                    sessionState === "COMPLETING" ||
                    (!userTranscript.trim() && !interimText.trim())
                  }
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-5 shadow-sm"
                >
                  {sessionState === "PROCESSING" ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      Analyzing Response…
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 mr-1.5" />
                      Submit Answer & Continue
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Area (4 cols): Live Conversation Transcript */}
          <div className="lg:col-span-4 flex flex-col h-[580px] rounded-2xl border bg-white shadow-xs overflow-hidden">
            <div className="p-3.5 border-b bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-bold text-gray-800">
                  Live Conversation Log
                </span>
              </div>
              <Badge variant="outline" className="text-[10px]">
                {conversationHistory.filter((m) => m.role === "user").length} Exchanges
              </Badge>
            </div>

            {/* Transcript Messages Container */}
            <div
              ref={chatScrollRef}
              className="flex-1 p-3.5 overflow-y-auto space-y-3.5 text-xs bg-gray-50/50"
            >
              {conversationHistory.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    item.role === "ai" ? "items-start" : "items-end"
                  }`}
                >
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-[10px] font-semibold text-gray-500">
                      {item.role === "ai" ? "Interviewer" : "You"}
                    </span>
                    {item.topic && item.role === "ai" && (
                      <span className="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-medium">
                        {item.topic}
                      </span>
                    )}
                  </div>
                  <div
                    className={`p-3 rounded-xl max-w-[90%] leading-relaxed ${
                      item.role === "ai"
                        ? "bg-white border text-gray-800 shadow-2xs rounded-tl-xs"
                        : "bg-purple-600 text-white rounded-tr-xs"
                    }`}
                  >
                    {item.content}
                  </div>
                </div>
              ))}

              {sessionState === "PROCESSING" && (
                <div className="flex items-center gap-2 p-2.5 bg-purple-50 text-purple-800 rounded-lg border border-purple-200 animate-pulse text-[11px]">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>AI interviewer is formulating next question…</span>
                </div>
              )}
            </div>

            {/* Bottom Info Footer */}
            <div className="p-3 border-t bg-white flex items-center justify-between text-[11px] text-gray-500">
              <span>Stack: {interview.techStack?.slice(0, 24)}…</span>
              <span className="text-emerald-600 font-medium">● Connected</span>
            </div>
          </div>
        </div>
      )}

      {/* ── End Interview Confirmation Modal ───────────────────────────────── */}
      <Dialog open={showEndModal} onOpenChange={setShowEndModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              End Live Interview Early?
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 pt-2 leading-relaxed">
              Are you sure you want to end this interview now? All answers and
              topics covered up to this point will be saved, and your final
              performance evaluation will be generated.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex items-center justify-end gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEndModal(false)}
            >
              Continue Interview
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmEndEarly}
              disabled={isCompleting}
            >
              {isCompleting ? "Saving Report…" : "Yes, End & View Feedback"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LiveInterviewPage;

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { TooltipButton } from "./TooltipButton";
import { Volume2, VolumeX } from "lucide-react";
import { RecordAnswer } from "./RecordAnswer";

export const QuestionSection = ({ questions = [] }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWebCam, setIsWebCam] = useState(false);
  const [currentSpeech, setCurrentSpeech] = useState(null);

  // Stop any active speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handlePlayQuestion = (qst) => {
    if (!qst) return;

    if (isPlaying && currentSpeech) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setCurrentSpeech(null);
    } else {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const speech = new SpeechSynthesisUtterance(qst);

        speech.onend = () => {
          setIsPlaying(false);
          setCurrentSpeech(null);
        };

        speech.onerror = () => {
          setIsPlaying(false);
          setCurrentSpeech(null);
        };

        window.speechSynthesis.speak(speech);
        setIsPlaying(true);
        setCurrentSpeech(speech);
      }
    }
  };

  // Safe check if questions are missing or empty
  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return (
      <div className="w-full min-h-48 border rounded-md p-6 flex flex-col items-center justify-center text-muted-foreground">
        <p className="text-sm">No questions available for this interview.</p>
      </div>
    );
  }

  // Use the actual first question as default active tab (fixes literal string bug)
  const defaultTabValue = questions[0]?.question || "question-0";

  return (
    <div className="w-full min-h-96 border rounded-md p-4">
      <Tabs
        defaultValue={defaultTabValue}
        className="w-full space-y-12"
        orientation="vertical"
      >
        <TabsList className="bg-transparent w-full flex flex-wrap items-center justify-start gap-4">
          {questions.map((tab, i) => {
            const tabValue = tab?.question || `question-${i}`;
            return (
              <TabsTrigger
                className={cn(
                  "data-[state=active]:bg-emerald-300 data-[state=active]:shadow-md text-xs px-2"
                )}
                key={i}
                value={tabValue}
              >
                {`Question #${i + 1}`}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Questions displayed */}
        {questions.map((tab, i) => {
          const tabValue = tab?.question || `question-${i}`;
          return (
            <TabsContent key={i} value={tabValue}>
              <p className="text-base text-left tracking-wide text-neutral-600 font-medium">
                {tab?.question || "Question text unavailable"}
              </p>
              <div className="w-full flex items-center justify-end">
                <TooltipButton
                  content={isPlaying ? "Stop" : "Listen"}
                  icon={
                    isPlaying ? (
                      <VolumeX className="min-w-5 min-h-5 text-muted-foreground" />
                    ) : (
                      <Volume2 className="min-w-5 min-h-5 text-muted-foreground" />
                    )
                  }
                  onClick={() => handlePlayQuestion(tab?.question)}
                />
              </div>

              <RecordAnswer
                question={tab}
                isWebCam={isWebCam}
                setIsWebCam={setIsWebCam}
              />
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default QuestionSection;

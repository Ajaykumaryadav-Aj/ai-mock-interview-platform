import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import LoaderPage from "./Loaderpage";
import { CustomBreadCrum } from "@/components/CustomBreadCrum";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Lightbulb, CheckCircle2 } from "lucide-react";
import { QuestionSection } from "@/components/QuestionSection";
import { getInterviewById } from "@/services/interviewService";

export const MockInterviewPage = () => {
  const { interviewId } = useParams();
  const [interview, setInterview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchInterview = async () => {
      if (!interviewId) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await getInterviewById(interviewId);
        if (isMounted) {
          setInterview(data);
        }
      } catch (error) {
        console.error("Error fetching interview in MockInterviewPage:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchInterview();

    return () => {
      isMounted = false;
    };
  }, [interviewId]);

  if (isLoading) {
    return <LoaderPage className="w-full h-[70vh]" />;
  }

  if (!interviewId || !interview) {
    return <Navigate to="/generate" replace />;
  }

  // Normalize questions to guarantee `question` property exists
  const normalizedQuestions = (interview?.questions || []).map((q) => ({
    question: q?.question || q?.questions || "",
    answer: q?.answer || "",
  }));

  return (
    <div className="flex flex-col w-full gap-8 py-5">
      <CustomBreadCrum
        breadCrumbPage="Start"
        breadCrumbItems={[
          { label: "Mock Interviews", link: "/generate" },
          {
            label: interview?.position || "",
            link: `/generate/interview/${interview?.id}`,
          },
        ]}
      />

      {/* Alert component for shadcn */}
      <div className="w-full">
        <Alert className="bg-sky-100 border border-sky-200 p-4 rounded-lg flex items-start gap-3 -mt-3">
          <Lightbulb className="h-5 w-5 text-sky-600" />
          <div>
            <AlertTitle className="text-sky-800 font-semibold">Important Note</AlertTitle>
            <AlertDescription className="text-sm text-sky-700 mt-1 leading-relaxed">
              Please enable your webcam and microphone to start the AI-generated
              mock interview. The interview consists of five questions. You’ll
              receive a personalized report based on your responses at the end.{" "}
              <br />
              <br />
              <span className="font-medium">Note:</span> Your video is{" "}
              <strong>never recorded</strong>. You can disable your webcam at any
              time.
            </AlertDescription>
          </div>
        </Alert>
      </div>

      {/* Mock interview question section */}
      {normalizedQuestions.length > 0 && (
        <div className="mt-4 w-full flex flex-col items-start gap-4">
          <QuestionSection questions={normalizedQuestions} />

          <div className="w-full flex items-center justify-end mt-4">
            <Link to={`/generate/feedback/${interviewId}`}>
              <Button size="sm">
                <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-300" />
                End Interview & View Feedback
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

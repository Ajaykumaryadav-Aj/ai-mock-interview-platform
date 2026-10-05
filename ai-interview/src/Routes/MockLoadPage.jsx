import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import LoaderPage from "./Loaderpage";
import { CustomBreadCrum } from "@/components/CustomBreadCrum";
import { Button } from "@/components/ui/button";
import { Lightbulb, Sparkles, WebcamIcon } from "lucide-react";
import { InterviewPin } from "@/components/InterviewPin";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import WebCam from "react-webcam";
import { getInterviewById } from "@/services/interviewService";
import { SEO } from "@/components/SEO";

export const MockLoadPage = () => {
  const { interviewId } = useParams();
  const [interview, setInterview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWebCamEnabled, setIsWebCamEnabled] = useState(false);

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
        console.error("Error fetching interview in MockLoadPage:", error);
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

  return (
    <div className="flex flex-col w-full gap-8 py-5">
      <SEO
        title="Prepare Interview Session | MocInterview"
        noindex={true}
        nofollow={true}
      />
      <div className="flex items-center justify-between w-full gap-2">
        <CustomBreadCrum
          breadCrumbPage={interview?.position || ""}
          breadCrumbItems={[{ label: "Mock Interviews", link: "/generate" }]}
        />

        <Link to={`/generate/interview/${interviewId}/start`}>
          <Button size={"sm"}>
            Start <Sparkles />
          </Button>
        </Link>
      </div>

      {/* Conditional rendering that display interview pin */}
      {interview && <InterviewPin interview={interview} onMockPage />}

      {/* Alert component for shadcn */}
      <Alert className="bg-yellow-100/50 border-yellow-200 p-4 rounded-lg flex items-start gap-3 -mt-3">
        <Lightbulb className="h-5 w-5 text-yellow-600" />
        <div>
          <AlertTitle>Important Information</AlertTitle>
          <AlertDescription className="text-sm text-yellow-700 mt-1">
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

      {/* WebCam section */}
      <div className="flex items-center justify-center w-full h-full">
        <div className="w-full h-[400px] md:w-96 flex flex-col items-center justify-center border p-4 bg-gray-50 rounded-md">
          {isWebCamEnabled ? (
            <WebCam
              onUserMedia={() => setIsWebCamEnabled(true)}
              onUserMediaError={() => setIsWebCamEnabled(false)}
              className="w-full h-full object-cover rounded-md"
            />
          ) : (
            <WebcamIcon className="min-w-24 min-h-24 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Webcam button for enabling and disabling */}
      <div className="flex items-center justify-center">
        <Button onClick={() => setIsWebCamEnabled(!isWebCamEnabled)}>
          {isWebCamEnabled ? "Disable Webcam" : "Enable Webcam"}
        </Button>
      </div>
    </div>
  );
};

export default MockLoadPage;

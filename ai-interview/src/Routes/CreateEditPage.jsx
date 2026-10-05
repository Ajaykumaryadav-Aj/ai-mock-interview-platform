import { FormMockInterview } from "@/components/FormMockInterview";
import { getInterviewById } from "@/services/interviewService";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SEO } from "@/components/SEO";

export const CreateEditPage = () => {
  const { interviewId } = useParams();
  const [interview, setInterview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchInterview = async () => {
      if (interviewId && interviewId !== "create") {
        try {
          setIsLoading(true);
          const data = await getInterviewById(interviewId);
          if (isMounted && data) {
            setInterview(data);
          }
        } catch (error) {
          console.error("Error fetching interview in CreateEditPage:", error);
        } finally {
          if (isMounted) setIsLoading(false);
        }
      } else {
        setInterview(null);
      }
    };

    fetchInterview();
    return () => {
      isMounted = false;
    };
  }, [interviewId]);

  return (
    <div className="my-4 flex-col w-full">
      <SEO
        title={interviewId === "create" ? "Create Mock Interview | MocInterview" : "Edit Mock Interview | MocInterview"}
        noindex={true}
        nofollow={true}
      />
      <FormMockInterview initialData={interview} isLoadingDoc={isLoading} />
    </div>
  );
};

export default CreateEditPage;

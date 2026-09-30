import { FormMockInterview } from "@/components/FormMockInterview";
import { getInterviewById } from "@/services/interviewService";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useFirebaseAuthReady } from "@/services/firebaseAuthBridge";

export const CreateEditPage = () => {
  const { interviewId } = useParams();
  const [interview, setInterview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isFirebaseReady } = useFirebaseAuthReady();

  useEffect(() => {
    let isMounted = true;
    const fetchInterview = async () => {
      if (interviewId && interviewId !== "create") {
        if (!isFirebaseReady) return;

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
  }, [interviewId, isFirebaseReady]);

  return (
    <div className="my-4 flex-col w-full">
      <FormMockInterview initialData={interview} isLoadingDoc={isLoading} />
    </div>
  );
};

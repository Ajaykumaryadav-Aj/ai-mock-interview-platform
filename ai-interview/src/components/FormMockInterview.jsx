import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { CustomBreadCrum } from "./CustomBreadCrum";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Headings } from "./Headings";
import { Button } from "./ui/button";
import {
  Loader,
  Trash2,
  FileText,
  UploadCloud,
  CheckCircle2,
  RefreshCw,
  X,
  AlertTriangle,
  Wand2,
  FileCheck,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { generateInterviewQuestions, generateLiveIntro } from "@/services/gemini";
import { processResume, MAX_RESUME_FILE_SIZE } from "@/services/resumeService";
import {
  createInterview,
  updateInterview,
  deleteInterview,
} from "@/services/interviewService";

// Form validation schema
const formSchema = z.object({
  mode: z.enum(["practice", "live"]).default("practice"),
  position: z
    .string()
    .min(1, "Position is required")
    .max(100, "Position must be 100 characters or less"),
  description: z.string().optional(),
  experience: z.coerce
    .number()
    .min(0, "Experience cannot be empty or negative"),
  techStack: z.string().min(1, "Tech stack must be at least a character"),
  duration: z.coerce.number().default(10),
  interviewType: z.enum(["Technical", "HR", "Behavioral", "Mixed"]).default("Technical"),
  focusAreas: z.string().optional(),
});

export const FormMockInterview = ({ initialData }) => {
  const [selectedMode, setSelectedMode] = useState(
    initialData?.mode || "practice"
  );
  const [selectedDuration, setSelectedDuration] = useState(
    initialData?.duration || 10
  );
  const [selectedType, setSelectedType] = useState(
    initialData?.interviewType || "Technical"
  );

  // Resume-Based Interview State (Requirement 2 & 19)
  const [interviewSource, setInterviewSource] = useState(
    initialData?.resumeBased ? "resume" : "general"
  );
  const [resumeData, setResumeData] = useState(
    initialData?.resumeBased && initialData?.resumeAnalysis
      ? {
          fileName: initialData.resumeFileName || "Uploaded Resume",
          fileSize: initialData.resumeFileSize || 0,
          analysis: initialData.resumeAnalysis,
          claims:
            initialData.resumeClaims ||
            initialData.resumeAnalysis?.resumeClaims ||
            [],
        }
      : null
  );
  const [isProcessingResume, setIsProcessingResume] = useState(false);
  const [resumeError, setResumeError] = useState("");
  const fileInputRef = useRef(null);

  const populateFormWithAnalysis = (analysis) => {
    if (!analysis) return;
    if (analysis.targetRole) {
      form.setValue("position", analysis.targetRole, { shouldValidate: true });
    }
    if (analysis.technicalSkills && analysis.technicalSkills.length > 0) {
      form.setValue("techStack", analysis.technicalSkills.slice(0, 6).join(", "), {
        shouldValidate: true,
      });
    }
    if (typeof analysis.experienceYears === "number") {
      form.setValue("experience", Math.max(0, Math.round(analysis.experienceYears)), {
        shouldValidate: true,
      });
    }
    if (analysis.summary) {
      form.setValue("description", analysis.summary, { shouldValidate: true });
    } else if (analysis.targetRole && analysis.technicalSkills) {
      form.setValue(
        "description",
        `Comprehensive interview tailored to ${analysis.targetRole} focusing on ${analysis.technicalSkills.slice(0, 4).join(", ")}.`,
        { shouldValidate: true }
      );
    }
  };

  const handleProcessFile = async (file) => {
    if (!file) return;
    setResumeError("");
    setIsProcessingResume(true);
    try {
      const result = await processResume(file);
      setResumeData(result);

      // Automatically autofill form inputs from the analyzed resume data
      if (result?.analysis) {
        populateFormWithAnalysis(result.analysis);
      }

      toast.success("Resume analyzed & form autofilled!", {
        description: `Profile: ${result.analysis?.candidateName || "Candidate"} (${result.analysis?.targetRole || "Engineer"}) • Skills: ${(result.analysis?.technicalSkills || []).slice(0, 5).join(", ")}`,
      });
    } catch (err) {
      console.error("[FormMockInterview] Resume processing error:", err);
      const msg = err.message || "Please upload a PDF or DOCX resume.";
      setResumeError(msg);
      toast.error("Resume Error", {
        description: msg,
      });
    } finally {
      setIsProcessingResume(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleProcessFile(file);
  };

  const handleAutoFillFromResume = () => {
    if (!resumeData?.analysis) return;
    populateFormWithAnalysis(resumeData.analysis);
    toast.info("Form populated from resume!", {
      description: "You can adjust any fields as needed before starting.",
    });
  };

  const handleRemoveResume = () => {
    setResumeData(null);
    setResumeError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          mode: initialData.mode || "practice",
          description: initialData.description || "",
          position: initialData.position || "",
          experience:
            typeof initialData.experience === "string"
              ? parseInt(initialData.experience, 10) || 0
              : initialData.experience || 0,
          techStack: initialData.techStack || "",
          duration: initialData.duration || 10,
          interviewType: initialData.interviewType || "Technical",
          focusAreas: initialData.focusAreas || "",
        }
      : {
          mode: "practice",
          description: "",
          position: "",
          experience: 0,
          techStack: "",
          duration: 10,
          interviewType: "Technical",
          focusAreas: "",
        },
  });

  const { isValid, isSubmitting } = form.formState;
  const [loading, setLoading] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const navigate = useNavigate();
  const { userId } = useAuth();

  const title = initialData?.position
    ? initialData.position
    : "Create a new Mock Interview";

  const breadCrumbPage = initialData?.position ? "Edit" : "Create";
  const actions = initialData ? "Save Changes" : "Create";
  const toastMessage = initialData
    ? { title: "Updated!", description: "Changes saved successfully." }
    : { title: "Created!", description: "New Mock Interview created." };

  const handleDelete = async () => {
    if (!initialData?.id) return;
    try {
      setLoading(true);
      await deleteInterview(initialData.id);
      toast.success("Deleted!", { description: "Mock interview removed." });
      navigate("/generate", { replace: true });
    } catch (error) {
      console.error("Error deleting interview:", error);
      toast.error("Error", {
        description: "Failed to delete interview. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    if (loading) return;
    try {
      setLoading(true);

      if (!userId) {
        toast.error("Authentication Required", {
          description: "Please sign in to create or update interviews.",
        });
        setLoading(false);
        return;
      }

      if (interviewSource === "resume" && !resumeData) {
        toast.error("Resume Required", {
          description:
            "Please upload your resume to continue with a Resume-Based Interview, or switch to General Interview.",
        });
        setLoading(false);
        return;
      }

      const isResumeBased = interviewSource === "resume" && Boolean(resumeData);
      const waitToastId = "gemini-working";

      if (selectedMode === "live") {
        toast.loading("Preparing Live AI Interviewer…", {
          id: waitToastId,
          duration: Infinity,
        });

        try {
          const liveIntro = await generateLiveIntro({
            position: data.position,
            techStack: data.techStack,
            experience: data.experience,
            interviewType: selectedType,
            focusAreas: data.focusAreas || "",
            resumeAnalysis: isResumeBased ? resumeData?.analysis : null,
            resumeClaims: isResumeBased ? (resumeData?.claims || []) : [],
            resumeBased: isResumeBased,
          });
          toast.dismiss(waitToastId);

          const livePayload = {
            ...data,
            mode: "live",
            duration: selectedDuration,
            interviewType: selectedType,
            focusAreas: data.focusAreas || "",
            description:
              data.description?.trim() ||
              `${selectedType} Live AI Interview for ${data.position}`,
            resumeBased: isResumeBased,
            resumeFileName: isResumeBased ? (resumeData?.fileName || "") : "",
            resumeFileSize: isResumeBased ? (resumeData?.fileSize || 0) : 0,
            resumeAnalysis: isResumeBased ? (resumeData?.analysis || null) : null,
            resumeClaims: isResumeBased ? (resumeData?.claims || []) : [],
          };

          if (initialData?.id) {
            await updateInterview(initialData.id, livePayload);
            toast.success("Updated!", {
              description: "Live AI Interview updated successfully.",
            });
            navigate(`/generate/interview/${initialData.id}/live`, {
              replace: true,
            });
          } else {
            const newInterview = await createInterview({
              ...livePayload,
              userId,
              status: "in-progress",
              conversationHistory: [
                {
                  role: "ai",
                  content: liveIntro.message,
                  topic: liveIntro.topic || "Introduction",
                  action: "intro",
                  timestamp: Date.now(),
                },
              ],
              questions: [
                {
                  question: liveIntro.message,
                  answer: "Live interview response",
                },
              ],
            });

            toast.success("Live Interview Ready!", {
              description: isResumeBased
                ? "Connecting to Resume-Based Live Interview room..."
                : "Connecting to Live AI Interview room...",
            });

            navigate(`/generate/interview/${newInterview.id}/live`, {
              replace: true,
            });
          }
          return;
        } catch (err) {
          toast.dismiss(waitToastId);
          throw err;
        }
      }

      // ── Practice Interview Mode ──────────────────────────────────────────
      const practiceQuestionCount = selectedDuration <= 5 ? 4 : selectedDuration >= 15 ? 7 : 5;

      if (initialData?.id) {
        toast.loading("Generating questions…", {
          id: waitToastId,
          duration: Infinity,
        });
        try {
          const aiQuestions = await generateInterviewQuestions({
            position: data.position,
            description: data.description,
            experience: data.experience,
            techStack: data.techStack,
            interviewType: selectedType,
            focusAreas: data.focusAreas || "",
            questionCount: practiceQuestionCount,
            resumeAnalysis: isResumeBased ? resumeData?.analysis : null,
            resumeClaims: isResumeBased ? (resumeData?.claims || []) : [],
            resumeBased: isResumeBased,
          });
          toast.dismiss(waitToastId);

          await updateInterview(initialData.id, {
            ...data,
            mode: "practice",
            interviewType: selectedType,
            duration: selectedDuration,
            focusAreas: data.focusAreas || "",
            questions: aiQuestions,
            resumeBased: isResumeBased,
            resumeFileName: isResumeBased ? (resumeData?.fileName || "") : "",
            resumeFileSize: isResumeBased ? (resumeData?.fileSize || 0) : 0,
            resumeAnalysis: isResumeBased ? (resumeData?.analysis || null) : null,
            resumeClaims: isResumeBased ? (resumeData?.claims || []) : [],
          });

          toast.success(toastMessage.title, {
            description: toastMessage.description,
          });
          navigate("/generate", { replace: true });
        } catch (err) {
          toast.dismiss(waitToastId);
          throw err;
        }
      } else {
        toast.loading("Generating questions…", {
          id: waitToastId,
          duration: Infinity,
        });
        try {
          const aiQuestions = await generateInterviewQuestions({
            position: data.position,
            description: data.description,
            experience: data.experience,
            techStack: data.techStack,
            interviewType: selectedType,
            focusAreas: data.focusAreas || "",
            questionCount: practiceQuestionCount,
            resumeAnalysis: isResumeBased ? resumeData?.analysis : null,
            resumeClaims: isResumeBased ? (resumeData?.claims || []) : [],
            resumeBased: isResumeBased,
          });
          toast.dismiss(waitToastId);

          await createInterview({
            ...data,
            mode: "practice",
            interviewType: selectedType,
            duration: selectedDuration,
            focusAreas: data.focusAreas || "",
            userId,
            questions: aiQuestions,
            resumeBased: isResumeBased,
            resumeFileName: isResumeBased ? (resumeData?.fileName || "") : "",
            resumeFileSize: isResumeBased ? (resumeData?.fileSize || 0) : 0,
            resumeAnalysis: isResumeBased ? (resumeData?.analysis || null) : null,
            resumeClaims: isResumeBased ? (resumeData?.claims || []) : [],
          });

          toast.success(toastMessage.title, {
            description: isResumeBased
              ? "New Resume-Based Mock Interview created."
              : toastMessage.description,
          });
          navigate("/generate", { replace: true });
        } catch (err) {
          toast.dismiss(waitToastId);
          throw err;
        }
      }
    } catch (error) {
      console.error("Error submitting interview form:", error);
      toast.error("Error", {
        description:
          error.message || "Something went wrong. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      setSelectedMode(initialData.mode || "practice");
      setSelectedDuration(initialData.duration || 10);
      setSelectedType(initialData.interviewType || "Technical");
      form.reset({
        mode: initialData.mode || "practice",
        position: initialData.position || "",
        description: initialData.description || "",
        experience: initialData.experience || 0,
        techStack: initialData.techStack || "",
        duration: initialData.duration || 10,
        interviewType: initialData.interviewType || "Technical",
        focusAreas: initialData.focusAreas || "",
      });
    }
  }, [initialData, form]);

  return (
    <div className="w-full flex-col space-y-4">
      <CustomBreadCrum
        breadCrumbPage={breadCrumbPage}
        breadCrumbItems={[{ label: "Mock Interview", link: "/generate" }]}
      />

      <div className="mt-4 flex items-center justify-between w-full">
        <Headings title={title} isSubHeading />

        {initialData && (
          <Button
            size="icon"
            variant="ghost"
            onClick={handleDelete}
            disabled={loading}
            title="Delete Interview"
          >
            <Trash2 className="min-w-4 min-h-4 text-red-500" />
          </Button>
        )}
      </div>

      <Separator className="my-4" />

      {/* Mode Selection Tabs */}
      <div className="w-full mb-6">
        <p className="text-sm font-semibold text-gray-700 mb-2">
          Select Interview Mode
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => {
              setSelectedMode("practice");
              form.setValue("mode", "practice");
            }}
            className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col gap-1 ${
              selectedMode === "practice"
                ? "border-sky-500 bg-sky-50/50 shadow-sm"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900 text-base">
                📝 Practice Interview
              </span>
              {selectedMode === "practice" && (
                <span className="text-xs bg-sky-600 text-white font-medium px-2 py-0.5 rounded-full">
                  Selected
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Question-by-question interview flow with voice recording, AI evaluation, and structured feedback report.
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedMode("live");
              form.setValue("mode", "live");
            }}
            className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col gap-1 ${
              selectedMode === "live"
                ? "border-purple-500 bg-purple-50/50 shadow-sm"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-purple-900 text-base flex items-center gap-1.5">
                🎙️ Live AI Interview
                <span className="text-[10px] bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                  Conversational
                </span>
              </span>
              {selectedMode === "live" && (
                <span className="text-xs bg-purple-600 text-white font-medium px-2 py-0.5 rounded-full">
                  Selected
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Human-like conversational AI interviewer that speaks, listens, asks adaptive follow-ups, and conducts a real-time timed interview.
            </p>
          </button>
        </div>
      </div>

      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full p-8 rounded-lg flex-col flex items-start justify-start gap-6 shadow-md border bg-white"
        >
          {/* Interview Foundation / Resume Section */}
          <div className="w-full p-5 bg-gradient-to-br from-slate-50 to-indigo-50/40 border border-slate-200 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Interview Foundation
                </h3>
                <p className="text-xs text-gray-500">
                  Select whether the AI should personalize questions from your actual resume or use general role requirements.
                </p>
              </div>
              {interviewSource === "resume" && resumeData && (
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Resume Active
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setInterviewSource("general")}
                className={`p-3 rounded-lg border text-left transition-all ${
                  interviewSource === "general"
                    ? "border-sky-500 bg-sky-50/50 shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-gray-900 flex items-center gap-1.5">
                    🎯 General Interview
                  </span>
                  {interviewSource === "general" && (
                    <span className="text-[10px] bg-sky-600 text-white font-semibold px-2 py-0.5 rounded-full">
                      Selected
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  Questions are generated based on job title, tech stack, and experience level. Resume is optional.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setInterviewSource("resume")}
                className={`p-3 rounded-lg border text-left transition-all ${
                  interviewSource === "resume"
                    ? "border-indigo-500 bg-indigo-50/60 shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-indigo-900 flex items-center gap-1.5">
                    📄 Resume-Based Interview
                    <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.5 rounded-full font-bold">
                      PRO
                    </span>
                  </span>
                  {interviewSource === "resume" && (
                    <span className="text-[10px] bg-indigo-600 text-white font-semibold px-2 py-0.5 rounded-full">
                      Selected
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  Personalized probing into your real projects, claims, and responsibilities. Resume upload required.
                </p>
              </button>
            </div>

            {/* Resume Upload / Processing / Preview Area */}
            {interviewSource === "resume" && (
              <div className="mt-3 pt-3 border-t border-slate-200">
                {!resumeData ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleProcessFile(e.dataTransfer.files[0]);
                      }
                    }}
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                      isProcessingResume
                        ? "border-indigo-400 bg-indigo-50/30"
                        : "border-indigo-200 hover:border-indigo-400 bg-white"
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".pdf,.docx,.txt,.md,.doc"
                      className="hidden"
                      id="resume-file-input"
                      disabled={isProcessingResume}
                    />

                    {isProcessingResume ? (
                      <div className="flex flex-col items-center justify-center py-4 space-y-3">
                        <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
                        <div className="text-center">
                          <p className="text-sm font-semibold text-indigo-950">
                            Analyzing Resume with AI…
                          </p>
                          <p className="text-xs text-indigo-600">
                            Extracting projects, skills, and verifiable claims
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="p-3 bg-indigo-50 rounded-full text-indigo-600">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          Drop your resume here, or{" "}
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-indigo-600 hover:underline font-bold"
                          >
                            browse file
                          </button>
                        </p>
                        <p className="text-xs text-gray-500">
                          Supported formats: PDF, DOCX, TXT • Maximum file size: 5MB
                        </p>
                        <div className="pt-2 flex items-center gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                          >
                            Upload Resume
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setInterviewSource("general")}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            Continue without Resume
                          </Button>
                        </div>
                      </div>
                    )}

                    {resumeError && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between text-left">
                        <div className="flex items-center gap-2 text-xs text-red-800">
                          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                          <span>{resumeError}</span>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-[11px] h-7 px-2 text-red-700 border-red-300 hover:bg-red-100"
                        >
                          Try Again
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Requirement 19: Resume Preview */
                  <div className="p-4 bg-white border border-indigo-200 rounded-xl shadow-sm space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                          <FileCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-gray-900">
                              Resume analyzed successfully
                            </h4>
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px]">
                              Ready
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500">
                            {resumeData.fileName} • {Math.round(resumeData.fileSize / 1024)} KB
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAutoFillFromResume}
                          className="text-xs text-indigo-700 border-indigo-200 hover:bg-indigo-50 flex items-center gap-1.5"
                          title="Fill Job Role, Tech Stack and Experience from resume"
                        >
                          <Wand2 className="w-3.5 h-3.5" /> Auto-fill Form
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveResume}
                          className="text-xs text-red-600 hover:bg-red-50 flex items-center gap-1"
                          title="Remove resume"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                          Candidate
                        </span>
                        <span className="font-semibold text-gray-800">
                          {resumeData.analysis?.candidateName || "Candidate"}
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                          Detected Role
                        </span>
                        <span className="font-semibold text-gray-800">
                          {resumeData.analysis?.targetRole || "Software Engineer"}
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                          Experience
                        </span>
                        <span className="font-semibold text-gray-800">
                          {resumeData.analysis?.experienceYears || 0} years
                        </span>
                      </div>
                    </div>

                    {resumeData.analysis?.technicalSkills?.length > 0 && (
                      <div>
                        <p className="text-[11px] font-semibold text-gray-500 mb-1">
                          Key technologies detected:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {resumeData.analysis.technicalSkills.slice(0, 8).map((tech, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-medium border border-indigo-100"
                            >
                              {tech}
                            </span>
                          ))}
                          {resumeData.analysis.technicalSkills.length > 8 && (
                            <span className="text-[11px] px-1.5 py-0.5 text-gray-400 font-medium">
                              +{resumeData.analysis.technicalSkills.length - 8} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {resumeData.analysis?.projects?.length > 0 && (
                      <div>
                        <p className="text-[11px] font-semibold text-gray-500 mb-1">
                          Projects detected:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {resumeData.analysis.projects.slice(0, 4).map((proj, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md font-medium border border-emerald-100"
                            >
                              🚀 {proj.name || proj}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {resumeData.claims?.length > 0 && (
                      <div className="text-[11px] text-gray-600 bg-amber-50/70 border border-amber-200 rounded-md p-2 flex items-center justify-between">
                        <span>
                          🔍 <strong>{resumeData.claims.length} verifiable resume claims</strong> identified for interview validation.
                        </span>
                        <span className="text-[10px] text-amber-800 font-medium">
                          Difficulty set by Experience Level
                        </span>
                      </div>
                    )}

                    <p className="text-[11px] text-gray-400 italic">
                      Interview questions will be personalized from your resume.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* General interview hint */}
            {interviewSource === "general" && !resumeData && (
              <div className="text-xs text-gray-500 flex items-center justify-between pt-1">
                <span>Want questions tailored to your projects? Switch to Resume-Based Interview anytime.</span>
                <button
                  type="button"
                  onClick={() => setInterviewSource("resume")}
                  className="text-xs text-indigo-600 font-semibold hover:underline"
                >
                  + Attach Resume
                </button>
              </div>
            )}
          </div>

          {/* Live Mode Specific Settings */}
          {selectedMode === "live" && (
            <div className="w-full p-5 bg-gradient-to-br from-purple-50/70 to-indigo-50/50 border border-purple-200 rounded-xl space-y-5">
              <div>
                <p className="text-sm font-semibold text-purple-950">
                  Live Interview Duration
                </p>
                <p className="text-xs text-purple-700/80 mb-2">
                  Select the target time duration for this interactive session.
                </p>
                <div className="flex items-center gap-3">
                  {[5, 10, 15].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => {
                        setSelectedDuration(mins);
                        form.setValue("duration", mins);
                      }}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                        selectedDuration === mins
                          ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                          : "bg-white text-gray-700 border-purple-200 hover:border-purple-400"
                      }`}
                    >
                      {mins} Minutes {mins === 10 ? "✨" : ""}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-purple-950">
                  Interview Type
                </p>
                <p className="text-xs text-purple-700/80 mb-2">
                  Tailors the interviewer&apos;s personality and question domains.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {["Technical", "HR", "Behavioral", "Mixed"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setSelectedType(type);
                        form.setValue("interviewType", type);
                      }}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        selectedType === type
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                          : "bg-white text-gray-700 border-indigo-200 hover:border-indigo-400"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Job Role / Position */}
          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem className="w-full space-y-2">
                <div className="w-full flex items-center justify-between">
                  <FormLabel className="font-semibold text-gray-800">
                    Job Role / Position
                  </FormLabel>
                  <FormMessage className="text-sm" />
                </div>
                <FormControl>
                  <Input
                    disabled={loading}
                    className="h-12"
                    placeholder="eg: Frontend Developer / Senior React Engineer"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Years of Experience with Quick Presets */}
          <FormField
            control={form.control}
            name="experience"
            render={({ field }) => (
              <FormItem className="w-full space-y-2">
                <div className="w-full flex items-center justify-between">
                  <FormLabel className="font-semibold text-gray-800">
                    Years of Experience
                  </FormLabel>
                  <FormMessage className="text-sm" />
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {[
                    { label: "Fresher (0 yr)", val: 0 },
                    { label: "0–1 Year", val: 1 },
                    { label: "1–2 Years", val: 2 },
                    { label: "2–4 Years", val: 3 },
                    { label: "4+ Years", val: 5 },
                  ].map((exp) => (
                    <button
                      key={exp.label}
                      type="button"
                      onClick={() => field.onChange(exp.val)}
                      className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                        field.value === exp.val
                          ? "bg-gray-800 text-white border-gray-800"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {exp.label}
                    </button>
                  ))}
                </div>
                <FormControl>
                  <Input
                    type="number"
                    className="h-12"
                    disabled={loading}
                    placeholder="eg: 2"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Tech Stacks */}
          <FormField
            control={form.control}
            name="techStack"
            render={({ field }) => (
              <FormItem className="w-full space-y-2">
                <div className="w-full flex items-center justify-between">
                  <FormLabel className="font-semibold text-gray-800">
                    Technology Stack
                  </FormLabel>
                  <FormMessage className="text-sm" />
                </div>
                <FormControl>
                  <Textarea
                    className="h-14"
                    disabled={loading}
                    placeholder="eg: React, JavaScript, TypeScript, Next.js, Redux, Tailwind CSS"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Optional Focus Areas for Live Mode */}
          {selectedMode === "live" && (
            <FormField
              control={form.control}
              name="focusAreas"
              render={({ field }) => (
                <FormItem className="w-full space-y-2">
                  <div className="w-full flex items-center justify-between">
                    <FormLabel className="font-semibold text-gray-800">
                      Custom Focus Areas (Optional)
                    </FormLabel>
                    <FormMessage className="text-sm" />
                  </div>
                  <FormControl>
                    <Input
                      disabled={loading}
                      className="h-12"
                      placeholder="eg: System design, Web Vitals, API resilience, State management"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          )}

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="w-full space-y-2">
                <div className="w-full flex items-center justify-between">
                  <FormLabel className="font-semibold text-gray-800">
                    Job Description {selectedMode === "live" ? "(Optional)" : ""}
                  </FormLabel>
                  <FormMessage className="text-sm" />
                </div>
                <FormControl>
                  <Textarea
                    className="h-14"
                    disabled={loading}
                    placeholder={
                      selectedMode === "live"
                        ? "eg: Interactive live interview covering core frontend architecture and state management"
                        : "eg: Describe your target job responsibilities and requirements"
                    }
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Buttons */}
          <div className="w-full flex items-center justify-end gap-4 pt-2">
            <Button
              type="reset"
              size="sm"
              variant="outline"
              disabled={isSubmitting || loading}
              onClick={() => form.reset()}
            >
              Reset
            </Button>

            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !isValid || loading}
              className={
                selectedMode === "live"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-sm"
                  : ""
              }
            >
              {loading ? (
                <>
                  <Loader className="text-gray-50 animate-spin mr-1 h-4 w-4" />
                  {selectedMode === "live" ? "Preparing AI…" : "Generating…"}
                </>
              ) : selectedMode === "live" ? (
                "🎙️ Start Live AI Interview"
              ) : (
                actions
              )}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default FormMockInterview;

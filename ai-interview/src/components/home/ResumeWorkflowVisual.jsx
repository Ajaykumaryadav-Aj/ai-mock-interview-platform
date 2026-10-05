import React from "react";
import {
  UploadCloud,
  Cpu,
  HelpCircle,
  Mic,
  Award,
  ArrowRight,
  FileText,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

export const ResumeWorkflowVisual = () => {
  const steps = [
    {
      num: "01",
      icon: <UploadCloud className="w-5 h-5 text-emerald-600" />,
      label: "Upload Resume",
      desc: "PDF or text format",
    },
    {
      num: "02",
      icon: <Cpu className="w-5 h-5 text-blue-600" />,
      label: "AI Analyzes Resume",
      desc: "Extracts stack & metrics",
    },
    {
      num: "03",
      icon: <HelpCircle className="w-5 h-5 text-purple-600" />,
      label: "Personalized Questions",
      desc: "Tests claimed experience",
    },
    {
      num: "04",
      icon: <Mic className="w-5 h-5 text-amber-600" />,
      label: "Mock Interview",
      desc: "Realistic live simulation",
    },
    {
      num: "05",
      icon: <Award className="w-5 h-5 text-emerald-600" />,
      label: "AI Feedback",
      desc: "Scored recommendations",
    },
  ];

  return (
    <div className="w-full space-y-12">
      {/* 5-Step Visual Pipeline */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 relative">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-white border border-emerald-100/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col items-center text-center relative group"
          >
            <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-emerald-50 text-gray-700 group-hover:text-emerald-700 flex items-center justify-center mb-2.5 transition-colors border border-gray-100">
              {step.icon}
            </div>
            <div className="text-[11px] font-mono font-bold text-emerald-600 mb-0.5">
              Step {step.num}
            </div>
            <div className="text-xs font-bold text-gray-900 mb-0.5">
              {step.label}
            </div>
            <div className="text-[11px] text-gray-500">{step.desc}</div>
          </div>
        ))}
      </div>

      {/* Product UI Visual: Parsed Resume to Probe Question */}
      <div className="rounded-3xl bg-gradient-to-br from-gray-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 border border-gray-800 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left">
        {/* Left Side: Parsed Resume Snapshot */}
        <div className="lg:col-span-5 rounded-2xl bg-white/5 border border-white/10 p-5 space-y-4 backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              <span className="font-semibold text-xs text-white">
                Alex_Candidate_Resume.pdf
              </span>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px]">
              Parsed 100%
            </Badge>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
              Extracted Skills & Tech Stack
            </span>
            <div className="flex flex-wrap gap-1.5">
              {["React.js", "Node.js", "TypeScript", "Redis", "MongoDB", "Docker", "AWS"].map(
                (skill) => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 rounded-md bg-white/10 text-emerald-200 font-mono text-[11px] border border-white/10"
                  >
                    {skill}
                  </span>
                )
              )}
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-gray-300">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
              Key Project Highlight
            </span>
            <p className="p-2.5 rounded-lg bg-black/30 border border-white/5 text-[11px] font-mono text-gray-300 leading-relaxed">
              "Architected microservices caching layer reducing p99 API latency by 42% under 10k RPS."
            </p>
          </div>
        </div>

        {/* Right Side: Tailored AI Interviewer Probe & Action */}
        <div className="lg:col-span-7 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            AI Cross-Examination Generated
          </div>

          <div className="space-y-3">
            <h4 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Questions That Challenge What You Claim
            </h4>
            <p className="text-sm text-gray-300 leading-relaxed">
              Top hiring managers don't ask generic trivia—they interrogate your resume bullet points. MocInterview simulates that exact pressure so you're ready with airtight answers.
            </p>
          </div>

          {/* Generated Question Card */}
          <div className="p-4 rounded-xl bg-indigo-950/50 border border-indigo-500/30 text-xs sm:text-sm text-indigo-100 font-medium leading-relaxed">
            <span className="text-emerald-400 font-bold block text-xs uppercase mb-1">
              Sample AI Question:
            </span>
            "In your previous role, you noted a 42% latency reduction using Redis. How did you resolve stale cache anomalies during rapid consecutive writes?"
          </div>

          <div className="pt-2">
            <Link to="/resume-interview">
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg px-6 py-5 text-sm sm:text-base flex items-center gap-2 hover:scale-[1.02] transition-transform"
              >
                Try Resume Interview <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeWorkflowVisual;

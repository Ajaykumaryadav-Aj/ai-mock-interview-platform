import React from "react";
import {
  Award,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const FeedbackMockup = () => {
  const metrics = [
    { label: "Overall Score", score: 8.8, color: "bg-emerald-500", percent: 88 },
    { label: "Technical Knowledge", score: 8.7, color: "bg-blue-500", percent: 87 },
    { label: "Answer Relevance", score: 9.0, color: "bg-purple-500", percent: 90 },
    { label: "Communication Clarity", score: 9.2, color: "bg-emerald-500", percent: 92 },
    { label: "Delivery & Confidence", score: 8.4, color: "bg-amber-500", percent: 84 },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto rounded-3xl bg-white border border-gray-200/90 shadow-xl overflow-hidden text-left relative">
      {/* Product Feature Preview Header */}
      <div className="bg-gray-50/80 px-6 py-3 border-b border-gray-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-white text-emerald-700 border-emerald-300 font-mono text-[10px]">
            DEMO PREVIEW
          </Badge>
          <span className="font-semibold text-gray-700">
            Interview Performance Report
          </span>
        </div>
        <span className="text-gray-400 font-mono text-[11px]">
          Session ID: #AI-MOCK-924
        </span>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        {/* Executive Summary Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-gray-950 via-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs">
                Strong Hire Ready
              </Badge>
              <span className="text-xs text-gray-400">Full-Stack Track</span>
            </div>
            <h4 className="text-xl font-bold tracking-tight text-white">
              Senior Software Engineer Assessment
            </h4>
            <p className="text-xs text-gray-300 max-w-md">
              Demonstrated thorough algorithmic depth, clean communication structure, and well-reasoned architectural trade-offs.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center p-3.5 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-md min-w-[120px]">
            <span className="text-3xl font-extrabold text-white">8.8<span className="text-xs text-emerald-400 font-normal">/10</span></span>
            <span className="text-[10px] text-gray-300 uppercase tracking-wider font-semibold mt-0.5">
              Calibrated Score
            </span>
          </div>
        </div>

        {/* Competency Metric Progress Bars */}
        <div className="space-y-3.5">
          <h5 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Core Competency Breakdown
          </h5>
          <div className="space-y-3">
            {metrics.map((m, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-gray-700">{m.label}</span>
                  <span className="font-mono text-gray-900">{m.score} / 10</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${m.color} rounded-full transition-all duration-500`}
                    style={{ width: `${m.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths & Actionable Improvements */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Key Strengths Identified</span>
            </div>
            <ul className="text-xs text-gray-700 space-y-1.5 leading-relaxed">
              <li>• Articulated asymptotic complexity with accuracy</li>
              <li>• Structured response using STAR framework</li>
              <li>• Highlighted distributed system trade-offs</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-100 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span>High-Impact Recommendations</span>
            </div>
            <ul className="text-xs text-gray-700 space-y-1.5 leading-relaxed">
              <li>• Elaborate further on database indexing nuances</li>
              <li>• Specify concrete business impact metrics</li>
              <li>• Avoid brief pauses when transitioning thoughts</li>
            </ul>
          </div>
        </div>

        {/* Benchmark Model Answer Snippet */}
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 text-xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="font-bold uppercase tracking-wider text-[11px] text-gray-700">
              Model Benchmark Answer
            </span>
            <span className="text-[11px] text-emerald-700 font-medium">
              Industry Standard Reference
            </span>
          </div>
          <p className="text-gray-600 italic leading-relaxed">
            "When designing a resilient message queue, I prioritize decoupling ingest from consumers using backpressure buffers. For instance, in my past role..."
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeedbackMockup;

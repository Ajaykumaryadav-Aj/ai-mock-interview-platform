import React from "react";
import {
  Bot,
  Mic,
  Sparkles,
  Volume2,
  Clock,
  CheckCircle2,
  Square,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const HeroProductMockup = () => {
  return (
    <div className="w-full max-w-xl mx-auto rounded-2xl bg-gradient-to-b from-gray-900 via-slate-900 to-indigo-950 p-1 shadow-2xl border border-gray-800/80 ring-1 ring-white/10 group">
      {/* OS Window Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-800 bg-gray-950/70 rounded-t-xl text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
          <span className="ml-2 font-mono text-[11px] text-gray-400 hidden sm:inline">
            mocinterview.app/live-session
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium text-[11px] border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            Live AI Session
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4 text-left">
        {/* Session Metadata Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-800 text-xs">
          <div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
              Role & Interview Track
            </div>
            <div className="text-white font-bold text-sm flex flex-wrap items-center gap-1.5 mt-0.5">
              <span>Senior Frontend Engineer</span>
              <Badge className="bg-purple-900/60 text-purple-300 border-purple-700/60 text-[10px] py-0 px-2 font-normal whitespace-nowrap">
                React & System Architecture
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-800/80 text-gray-200 font-mono text-xs border border-gray-700">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>03:42 / 10:00</span>
          </div>
        </div>

        {/* AI Interviewer Question Box */}
        <div className="rounded-xl bg-gray-950/80 border border-indigo-900/40 p-3.5 sm:p-4 space-y-2.5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-purple-200">
                AI Interviewer
              </span>
            </div>

            {/* Audio Waveform Animation */}
            <div className="flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 text-purple-400" />
              <span className="w-1 h-2.5 bg-purple-400 rounded-full animate-bounce delay-75"></span>
              <span className="w-1 h-4 bg-purple-300 rounded-full animate-bounce delay-150"></span>
              <span className="w-1 h-3 bg-purple-400 rounded-full animate-bounce delay-100"></span>
              <span className="text-[10px] text-purple-300 font-mono ml-1">
                Speaking...
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-gray-200 font-medium leading-relaxed">
            "Can you explain how React's reconciliation diffing algorithm works with Virtual DOM, and why keys are essential for optimal list re-rendering?"
          </p>
        </div>

        {/* Candidate Audio & Live Transcript Response Box */}
        <div className="rounded-xl bg-gray-900/90 border border-gray-800 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold text-gray-300">
                Candidate Voice Input
              </span>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">
              Speech-to-Text Active
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-black/40 border border-gray-800/80 text-xs text-gray-300 leading-relaxed font-mono">
            <span className="text-emerald-400 font-bold mr-1">&gt;</span>
            React compares the virtual DOM trees using an O(n) heuristic. Keys give elements a persistent identity across renders, so React reorders DOM nodes instead of re-creating them from scratch...
            <span className="inline-block w-1.5 h-3 bg-emerald-400 ml-1 animate-pulse"></span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
              <Mic className="w-3.5 h-3.5 animate-pulse" />
              <span>Microphone listening...</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400">Press stop to submit</span>
              <button
                type="button"
                className="px-2.5 py-1 rounded-md bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-[11px] flex items-center gap-1 font-medium transition-colors"
              >
                <Square className="w-2.5 h-2.5 fill-red-400" />
                Done
              </button>
            </div>
          </div>
        </div>

        {/* Real-Time AI Diagnostic Preview Pill */}
        <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="font-semibold text-emerald-200 text-xs">
                Instant Diagnostic Preview
              </div>
              <div className="text-[11px] text-gray-300">
                Score: <strong className="text-white">8.9/10</strong> • High technical accuracy & structure
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-300/80 bg-emerald-900/40 px-2 py-1 rounded-md border border-emerald-700/50">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Fiber Tree Analyzed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroProductMockup;

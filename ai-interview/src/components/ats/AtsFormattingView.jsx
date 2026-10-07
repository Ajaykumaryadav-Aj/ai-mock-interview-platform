// src/components/ats/AtsFormattingView.jsx
import React from "react";
import {
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Layers,
  Sparkles,
  Info,
  Type,
  Maximize2,
  FileText,
} from "lucide-react";

export const AtsFormattingView = ({ qualityAudit = {}, formattingScore = 0 }) => {
  const {
    wordCount = 0,
    hasMalformedExtraction = false,
    malformedArtifacts = [],
    metricsCount = 0,
    achievements = [],
    issues = [],
    strengths = [],
  } = qualityAudit;

  // Filter formatting and readability specific issues
  const formattingIssues = issues.filter(
    (i) =>
      i.category === "Parser Integrity" ||
      i.category === "Formatting & Parser Integrity" ||
      i.category === "Impact" ||
      i.category === "Measurable Impact" ||
      i.category === "Readability" ||
      i.category === "Completeness"
  );

  const formattingStrengths = strengths.filter(
    (s) => s.category === "Impact" || s.category === "Structure"
  );

  return (
    <div className="space-y-6">
      {/* Top Banner: Score & Summary */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 mb-2">
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Layout & Parser Analysis</span>
          </div>
          <h3 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white">
            Formatting & Readability Audit
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xl">
            Evaluates PDF text extraction fidelity, bullet point scannability, word count density, and evidence-grounded quantifiable outcome metrics.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/60 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shrink-0">
          <div className="text-right">
            <span className="text-xs uppercase font-bold text-gray-400 block">Readability Score</span>
            <span className={`text-3xl font-extrabold ${
              formattingScore >= 75
                ? "text-emerald-600 dark:text-emerald-400"
                : formattingScore >= 50
                ? "text-amber-500 dark:text-amber-400"
                : "text-rose-500 dark:text-rose-400"
            }`}>
              {formattingScore}%
            </span>
          </div>
        </div>
      </div>

      {/* 4 Pillars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pillar 1: Parser Integrity */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Parser Integrity
            </span>
            {!hasMalformedExtraction ? (
              <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            ) : (
              <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600">
                <AlertTriangle className="w-4 h-4" />
              </span>
            )}
          </div>
          <h4 className="text-base font-bold text-gray-900 dark:text-white">
            {!hasMalformedExtraction ? "Clean Extraction" : "Artifacts Detected"}
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {!hasMalformedExtraction
              ? "Zero split words or glued headers detected in text stream."
              : `${malformedArtifacts.length} layout/encoding anomalies found in PDF.`}
          </p>
        </div>

        {/* Pillar 2: Measurable Impact */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Quantifiable Impact
            </span>
            {metricsCount >= 3 ? (
              <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            ) : (
              <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600">
                <AlertTriangle className="w-4 h-4" />
              </span>
            )}
          </div>
          <h4 className="text-base font-bold text-gray-900 dark:text-white">
            {metricsCount > 0 ? `${metricsCount} Outcome Metrics` : "Limited Impact"}
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {metricsCount > 0
              ? "Verified % improvements, latency drops, or user scale metrics."
              : "Experience bullets focus on job duties rather than outcome metrics."}
          </p>
        </div>

        {/* Pillar 3: Word Count & Length */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Resume Length
            </span>
            <span className={`p-1.5 rounded-lg ${
              wordCount >= 250 && wordCount <= 1200
                ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600"
                : "bg-amber-50 dark:bg-amber-950 text-amber-600"
            }`}>
              <FileText className="w-4 h-4" />
            </span>
          </div>
          <h4 className="text-base font-bold text-gray-900 dark:text-white">
            {wordCount} Words
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {wordCount < 150
              ? "Too brief (<150 words); expand project architectures."
              : wordCount > 1800
              ? "Extensive (>1800 words); trim outdated roles to 1-2 pages."
              : "Within the optimal 1-2 page length for ATS parsers."}
          </p>
        </div>

        {/* Pillar 4: Bullet Scannability */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Scannability
            </span>
            <span className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600">
              <Type className="w-4 h-4" />
            </span>
          </div>
          <h4 className="text-base font-bold text-gray-900 dark:text-white">
            Recruiter Skim Rate
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Clear section delineation allows automated parsers to segment experience, education, and skills.
          </p>
        </div>
      </div>

      {/* Detected Formatting Anomalies */}
      {hasMalformedExtraction && (
        <div className="p-6 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h4 className="font-bold text-amber-900 dark:text-amber-200 text-sm">
              Specific Text Extraction Anomalies Flagged
            </h4>
          </div>
          <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            The ATS text extractor detected these structural anomalies in your resume:
          </p>
          <ul className="space-y-1.5 pl-5 list-disc text-xs text-amber-900 dark:text-amber-200 font-mono">
            {malformedArtifacts.map((art, idx) => (
              <li key={idx}>{art}</li>
            ))}
          </ul>
          <p className="text-xs text-amber-700 dark:text-amber-400 pt-1">
            <strong>How to fix:</strong> Save your resume from Google Docs or Word directly as standard PDF. Ensure section headers have clean line returns and avoid multi-column tables that concatenate headers.
          </p>
        </div>
      )}

      {/* Specific Formatting Issues Cards */}
      <div className="space-y-3">
        <h4 className="font-bold text-gray-900 dark:text-white text-sm">
          Formatting & Readability Observations ({formattingIssues.length})
        </h4>

        {formattingIssues.map((item, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xs space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                {item.title}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                {item.category}
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              <strong>Evidence:</strong> {item.evidence}
            </p>
            <p className="text-xs text-teal-700 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-950/30 p-2.5 rounded-xl border border-teal-100 dark:border-teal-900/40">
              <strong>Recommendation:</strong> {item.recommendation}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AtsFormattingView;

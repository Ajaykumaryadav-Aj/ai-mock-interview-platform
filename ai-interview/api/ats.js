// api/ats.js
// Production Serverless API endpoint for ATS Resume Analysis and Optimization.
// Guarantees 100% valid JSON responses on all code paths (success, validation, auth, db, or ai errors).
// Integrates deterministic scoring, grounded AI suggestions, modular resume improvements,
// and tailored Mock Interview question generation based on Resume + JD + Missing Skills.

import { ObjectId } from "mongodb";
import { handleCors } from "./_cors.js";
import { authenticateRequest, applyPrivateSecurityHeaders } from "./_lib/auth.js";
import { getDb } from "./_lib/mongodb.js";
import { checkRateLimit, setRateLimitHeaders, getClientIp } from "./_lib/rateLimiter.js";
import { calculateAtsScore } from "./_lib/atsScorer.js";
import {
  generateAtsSuggestions,
  generateImprovedResume,
  generateAtsInterviewQuestions,
} from "./_lib/atsAi.js";

function sanitizeFileName(fileName) {
  if (!fileName || typeof fileName !== "string") return "resume.pdf";
  const clean = fileName
    .replace(/[\x00-\x1f\x7f]/g, "")
    .replace(/[\\/]/g, "")
    .replace(/\.\.+/g, ".")
    .trim();
  return clean.slice(0, 100) || "resume.pdf";
}

export default async function handler(req, res) {
  // Always guarantee application/json header
  res.setHeader("Content-Type", "application/json");

  // 1. CORS Preflight
  if (req.method === "OPTIONS") {
    const isAllowed = handleCors(req, res);
    if (!isAllowed) {
      return res.status(403).json({ error: "Origin not permitted by CORS policy." });
    }
    return res.status(204).end();
  }

  const isAllowed = handleCors(req, res);
  if (req.headers.origin && !isAllowed) {
    return res.status(403).json({ error: "Origin not permitted by CORS policy." });
  }

  applyPrivateSecurityHeaders(res);

  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const action = req.query?.action || url.searchParams.get("action") || req.body?.action;

  // 2. Authentication (Optional for guest scans, required for account history and destructive actions)
  let auth = { userId: null };
  try {
    auth = await authenticateRequest(req);
  } catch (authErr) {
    if (action !== "analyze") {
      console.error("[api/ats] Authentication error:", authErr.message);
      return res.status(401).json({ error: "Authentication verification failed." });
    }
  }

  if (action !== "analyze" && !auth?.userId) {
    return res.status(401).json({ error: auth?.error || "Authentication required." });
  }
  const userId = auth?.userId || null;

  try {
    // ── 1. POST /api/ats?action=analyze: Perform ATS analysis ────────────────
    if (req.method === "POST" && action === "analyze") {
      const rlKey = userId ? `ats_analyze_user_${userId}` : `ats_analyze_ip_${getClientIp(req)}`;
      const rlLimit = userId ? 15 : 5;
      const rlResult = await checkRateLimit(rlKey, { limit: rlLimit, windowMs: 60 * 1000 });
      setRateLimitHeaders(res, rlResult);
      if (!rlResult.allowed) {
        return res.status(429).json({
          error: "Rate limit exceeded. Please wait before analyzing another resume.",
        });
      }

      const {
        resumeText,
        jobDescription = "",
        targetRole = "",
        resumeFileName = "resume.pdf",
        resumeFileSize = 0,
      } = req.body || {};

      const resumeLen = typeof resumeText === "string" ? resumeText.trim().length : 0;

      if (!resumeText || typeof resumeText !== "string" || resumeLen < 30) {
        return res.status(400).json({
          error: "Resume text must be at least 30 characters long for ATS analysis.",
        });
      }

      if (resumeLen > 100000) {
        return res.status(400).json({
          error: "Resume text exceeds maximum limit of 100,000 characters.",
        });
      }

      const safeJobDescription = typeof jobDescription === "string" ? jobDescription.slice(0, 50000) : "";
      const safeTargetRole = typeof targetRole === "string" ? targetRole.trim().slice(0, 200) : "";
      const safeFileName = sanitizeFileName(resumeFileName);
      const safeFileSize = Math.max(0, Math.min(20 * 1024 * 1024, Number(resumeFileSize) || 0));

      // Step A: Deterministic scoring (JD-matched if JD provided, else resume-only)
      let report;
      try {
        report = calculateAtsScore({
          resumeText,
          jobDescription: safeJobDescription,
          targetRole: safeTargetRole,
        });
      } catch (scoreErr) {
        console.error("[api/ats] ATS scorer error:", scoreErr.message);
        return res.status(400).json({
          error: scoreErr.message || "Failed to parse and score resume content.",
        });
      }

      // Step B: Grounded AI recommendations based on resume findings & JD
      let suggestions = [];
      try {
        suggestions = await generateAtsSuggestions({
          resumeText,
          jobDescription: safeJobDescription,
          atsReport: report,
        });
      } catch (aiErr) {
        console.warn("[api/ats] AI suggestions generation warning (continuing with report):", aiErr.message);
      }

      // Step C: Persistence in MongoDB
      const now = new Date();
      const doc = {
        userId,
        detectedProfile: report.detectedProfile || report.candidateTitle || "Resume ATS Analysis",
        resumeProfile: report.detectedProfile || report.candidateTitle || "Resume ATS Analysis",
        candidateTitle: report.detectedProfile || report.candidateTitle || "Resume ATS Analysis",
        detectedRole: report.detectedProfile || report.candidateTitle || "Resume ATS Analysis",
        targetRole: safeTargetRole || report.detectedProfile || report.candidateTitle || "Resume ATS Analysis",
        confidence: 90,
        resumeFileName: safeFileName,
        resumeFileSize: safeFileSize,
        resumeText,
        jobDescription: safeJobDescription,
        overallScore: report.overallScore,
        categoryScores: report.categoryScores,
        scoringBreakdown: report.scoringBreakdown,
        assessment: report.assessment,
        extractedSkills: report.extractedSkills || [],
        skillCategories: report.skillCategories || {},
        skillsAudit: report.skillsAudit || {},
        keywordStats: report.keywordStats || {},
        matchedSkills: report.extractedSkills || [],
        missingSkills: [],
        matchedKeywords: report.extractedSkills || [],
        missingKeywords: [],
        projects: report.projects || [],
        strengths: report.strengths || [],
        issues: report.issues || [],
        qualityAudit: report.qualityAudit || {},
        suggestions,
        createdAt: now,
        updatedAt: now,
      };

      let insertedId = "ats_" + Date.now();
      if (userId) {
        try {
          const db = await getDb();
          const atsCollection = db.collection("atsAnalyses");
          const insertRes = await atsCollection.insertOne(doc);
          insertedId = insertRes.insertedId.toString();
        } catch (dbErr) {
          console.warn("[api/ats] MongoDB persistence non-fatal warning (analysis returned):", dbErr.message);
        }
      }

      return res.status(200).json({
        success: true,
        id: insertedId,
        analysis: {
          id: insertedId,
          _id: insertedId,
          ...doc,
        },
      });
    }

    // ── 2. POST /api/ats?action=improve: Generate improved resume & recalculate ─
    if (req.method === "POST" && action === "improve") {
      const rlResult = await checkRateLimit(`ats_improve_${userId}`, { limit: 10, windowMs: 60 * 1000 });
      setRateLimitHeaders(res, rlResult);
      if (!rlResult.allowed) {
        return res.status(429).json({
          error: "Rate limit exceeded. Please wait before requesting another resume rewrite.",
        });
      }

      const { resumeText, jobDescription = "", analysisId } = req.body || {};

      if (!resumeText || typeof resumeText !== "string" || resumeText.trim().length < 30) {
        return res.status(400).json({ error: "resumeText must be provided for resume improvement." });
      }

      if (resumeText.length > 100000) {
        return res.status(400).json({ error: "resumeText exceeds maximum limit of 100,000 characters." });
      }

      const safeJobDescription = typeof jobDescription === "string" ? jobDescription.slice(0, 50000) : "";
      const cleanAnalysisId = typeof analysisId === "string" ? analysisId.trim().slice(0, 64) : null;

      console.log(`[api/ats] Improve resume started: resumeLen=${resumeText.length}`);

      // Initial analysis
      const initialReport = calculateAtsScore({ resumeText, jobDescription });

      // Generate improved draft and modular sections
      const { improvedResumeText, sections, changesMade } = await generateImprovedResume({
        resumeText,
        jobDescription,
        atsReport: initialReport,
      });

      // Recalculate score deterministically on improved text
      const recalculatedReport = calculateAtsScore({
        resumeText: improvedResumeText,
        jobDescription,
      });

      // Update in MongoDB if analysisId was passed
      if (cleanAnalysisId) {
        try {
          const db = await getDb();
          const atsCollection = db.collection("atsAnalyses");
          const isHex24 = /^[0-9a-fA-F]{24}$/.test(cleanAnalysisId);
          const q = (isHex24 && ObjectId.isValid(cleanAnalysisId))
            ? { _id: new ObjectId(cleanAnalysisId), userId }
            : { id: cleanAnalysisId, userId };

          await atsCollection.updateOne(q, {
            $set: {
              improvedResumeText,
              improvedScore: recalculatedReport.overallScore,
              improvedSections: sections,
              recalculatedReport,
              changesMade,
              updatedAt: new Date(),
            },
          });
        } catch (dbErr) {
          console.warn("[api/ats] Non-fatal DB update error on improved resume:", dbErr.message);
        }
      }

      return res.status(200).json({
        success: true,
        originalScore: initialReport.overallScore,
        recalculatedScore: recalculatedReport.overallScore,
        newScore: recalculatedReport.overallScore,
        scoreDelta: recalculatedReport.overallScore - initialReport.overallScore,
        improvedResumeText,
        improvedText: improvedResumeText,
        sections,
        changesMade,
        originalCategoryScores: initialReport.categoryScores,
        recalculatedReport,
        newCategoryScores: recalculatedReport.categoryScores,
        newMatchedKeywords: recalculatedReport.matchedKeywords || [],
        newMissingKeywords: recalculatedReport.missingKeywords || [],
      });
    }

    // ── 3. POST /api/ats?action=create-interview: ATS -> Interview Bridge ────
    if (req.method === "POST" && (action === "create-interview" || action === "start-interview")) {
      const { analysisId, position } = req.body || {};
      if (!analysisId || typeof analysisId !== "string" || analysisId.length > 64) {
        return res.status(400).json({ error: "Missing or invalid 'analysisId' parameter." });
      }

      const cleanAnalysisId = analysisId.trim();

      let analysisDoc = null;
      try {
        const db = await getDb();
        const atsCollection = db.collection("atsAnalyses");
        const isHex24 = /^[0-9a-fA-F]{24}$/.test(cleanAnalysisId);
        const q = (isHex24 && ObjectId.isValid(cleanAnalysisId))
          ? { _id: new ObjectId(cleanAnalysisId), userId }
          : { id: cleanAnalysisId, userId };
        analysisDoc = await atsCollection.findOne(q);
      } catch (dbErr) {
        console.warn("[api/ats] DB lookup warning for analysisId:", dbErr.message);
      }

      const safePosition = typeof position === "string" ? position.trim().slice(0, 120) : "";
      const targetPosition = safePosition || analysisDoc?.targetRole || analysisDoc?.candidateTitle || "Software Engineer";
      const candidateSkills = analysisDoc?.extractedSkills || analysisDoc?.matchedKeywords || [];
      const missingKeywords = analysisDoc?.missingKeywords || [];
      const weakAreas = (analysisDoc?.issues || []).map((i) => (typeof i === "string" ? i : i.title)).filter(Boolean);

      const questions = await generateAtsInterviewQuestions({
        resumeText: analysisDoc?.resumeText || "",
        jobDescription: analysisDoc?.jobDescription || "",
        candidateSkills,
        missingKeywords,
        targetRole: targetPosition,
        weakAreas,
      });

      let interviewId = "interview_" + Date.now();
      const now = new Date();
      const newInterview = {
        userId,
        position: targetPosition,
        description: `ATS-Calibrated Interview for ${targetPosition}. Testing Resume Stack, JD Requirements, and Missing Skills: ${missingKeywords.slice(0, 3).map((m) => (typeof m === "string" ? m : m.keyword || m)).join(", ") || "Technical Breadth"}.`,
        experience: 2,
        techStack: candidateSkills.slice(0, 6).map((s) => (typeof s === "string" ? s : s.keyword || s)).join(", "),
        duration: 15,
        interviewType: "Technical",
        focusAreas: `Resume Verification & JD Gap Probing`,
        mode: "practice",
        questions,
        status: "in-progress",
        conversationHistory: [],
        resumeBased: true,
        resumeFileName: analysisDoc?.resumeFileName || "resume.pdf",
        resumeFileSize: analysisDoc?.resumeFileSize || 0,
        atsAnalysisId: cleanAnalysisId,
        atsScore: analysisDoc?.overallScore || 70,
        createdAt: now,
        updatedAt: now,
      };

      try {
        const db = await getDb();
        const interviewsCollection = db.collection("interviews");
        const insertRes = await interviewsCollection.insertOne(newInterview);
        interviewId = insertRes.insertedId.toString();
      } catch (dbErr) {
        console.warn("[api/ats] Fallback mock interview persistence warning:", dbErr.message);
      }

      return res.status(200).json({
        success: true,
        interviewId,
        id: interviewId,
        interview: {
          id: interviewId,
          _id: interviewId,
          ...newInterview,
        },
      });
    }

    // ── 4. GET /api/ats?action=history: List user's ATS analyses ──────────────
    if (req.method === "GET" && action === "history") {
      try {
        const db = await getDb();
        const atsCollection = db.collection("atsAnalyses");
        const list = await atsCollection
          .find({ userId })
          .sort({ createdAt: -1 })
          .limit(25)
          .toArray();

        return res.status(200).json({ success: true, history: list });
      } catch (dbErr) {
        console.warn("[api/ats] Failed to load history from DB:", dbErr.message);
        return res.status(200).json({ success: true, history: [] });
      }
    }

    // ── 5. GET /api/ats?action=analysis&id=...: Get single analysis ───────────
    if (req.method === "GET" && (action === "analysis" || action === "get")) {
      const id = req.query?.id || url.searchParams.get("id");
      if (!id || typeof id !== "string" || id.length > 64) {
        return res.status(400).json({ error: "Missing or invalid 'id' parameter." });
      }

      const cleanId = id.trim();

      try {
        const db = await getDb();
        const atsCollection = db.collection("atsAnalyses");
        const isHex24 = /^[0-9a-fA-F]{24}$/.test(cleanId);
        const q = (isHex24 && ObjectId.isValid(cleanId))
          ? { _id: new ObjectId(cleanId), userId }
          : { id: cleanId, userId };
        const found = await atsCollection.findOne(q);

        if (!found) {
          return res.status(404).json({ error: "Analysis not found or access denied." });
        }

        return res.status(200).json({ success: true, analysis: found });
      } catch (dbErr) {
        console.error("[api/ats] Error finding analysis:", dbErr.message);
        return res.status(500).json({ error: "Failed to retrieve analysis." });
      }
    }

    // ── 6. DELETE /api/ats?action=analysis&id=...: Delete analysis ────────────
    if (req.method === "DELETE" && action === "analysis") {
      const id = req.query?.id || url.searchParams.get("id");
      if (!id || typeof id !== "string" || id.length > 64) {
        return res.status(400).json({ error: "Missing or invalid 'id' parameter." });
      }

      const cleanId = id.trim();

      try {
        const db = await getDb();
        const atsCollection = db.collection("atsAnalyses");
        const isHex24 = /^[0-9a-fA-F]{24}$/.test(cleanId);
        const q = (isHex24 && ObjectId.isValid(cleanId))
          ? { _id: new ObjectId(cleanId), userId }
          : { id: cleanId, userId };
        const deleteRes = await atsCollection.deleteOne(q);

        if (deleteRes.deletedCount === 0) {
          return res.status(404).json({ error: "Analysis not found or access denied." });
        }

        return res.status(200).json({ success: true, deleted: true });
      } catch (dbErr) {
        console.error("[api/ats] Error deleting analysis:", dbErr.message);
        return res.status(500).json({ error: "Failed to delete analysis." });
      }
    }

    // ── 7. GET /api/ats?action=analytics: ATS Score Analytics & Skill Growth ────
    if (req.method === "GET" && action === "analytics") {
      try {
        const db = await getDb();
        const atsCollection = db.collection("atsAnalyses");
        const list = await atsCollection
          .find({ userId })
          .sort({ createdAt: -1 })
          .limit(50)
          .toArray();

        if (list.length === 0) {
          return res.status(200).json({
            success: true,
            analytics: {
              highestScore: 0,
              latestScore: 0,
              averageScore: 0,
              improvementPercent: 0,
              totalScans: 0,
              skillGrowthTracking: [],
              scoreTrend: [],
            },
          });
        }

        const scores = list.map((i) => i.overallScore || 0);
        const highestScore = Math.max(...scores);
        const latestScore = scores[0];
        const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        const earliestScore = scores[scores.length - 1];
        const improvementPercent = earliestScore > 0 ? Math.round(((latestScore - earliestScore) / earliestScore) * 100) : 0;

        const chronological = [...list].reverse();
        const skillSet = new Set();
        const skillGrowthTracking = [];
        for (const item of chronological) {
          const skills = (item.extractedSkills || []).map((s) => (typeof s === "string" ? s : s.keyword || s));
          for (const s of skills) {
            if (s && !skillSet.has(s.toLowerCase())) {
              skillSet.add(s.toLowerCase());
              skillGrowthTracking.push({
                skill: s,
                date: item.createdAt,
                role: item.targetRole || item.candidateTitle,
              });
            }
          }
        }

        const scoreTrend = chronological.map((item) => ({
          date: item.createdAt,
          score: item.overallScore,
          role: item.targetRole || item.candidateTitle,
        }));

        return res.status(200).json({
          success: true,
          analytics: {
            highestScore,
            latestScore,
            averageScore,
            improvementPercent,
            totalScans: list.length,
            skillGrowthTracking: skillGrowthTracking.slice(-15),
            scoreTrend: scoreTrend.slice(-10),
          },
        });
      } catch (dbErr) {
        console.error("[api/ats] Analytics computation error:", dbErr.message);
        return res.status(200).json({
          success: true,
          analytics: {
            highestScore: 0,
            latestScore: 0,
            averageScore: 0,
            improvementPercent: 0,
            totalScans: 0,
            skillGrowthTracking: [],
            scoreTrend: [],
          },
        });
      }
    }

    return res.status(400).json({ error: `Unsupported ATS action: '${action}'.` });
  } catch (err) {
    console.error("[api/ats] Top-level handler uncaught error:", err);
    return res.status(500).json({
      error: err.message || "An unexpected error occurred during ATS analysis.",
    });
  }
}

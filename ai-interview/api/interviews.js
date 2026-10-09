// api/interviews.js
// Vercel Serverless Function: Mock interviews management backed by MongoDB Atlas.
// Fully authenticated; strictly enforces that candidates can only access/manage their own interviews.
// Hardened with Strict Whitelist Updates, Input Validation, Type Checks, and Rate Limiting.

import { ObjectId } from "mongodb";
import { handleCors } from "./_cors.js";
import { authenticateRequest, applyPrivateSecurityHeaders } from "./_lib/auth.js";
import { getDb } from "./_lib/mongodb.js";
import { checkRateLimit, setRateLimitHeaders } from "./_lib/rateLimiter.js";

/**
 * Normalizes a MongoDB document for JSON response:
 * converts _id to string id and handles Date serialization.
 */
export function formatInterviewDoc(doc) {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return {
    id: _id ? _id.toString() : doc.id,
    ...rest,
  };
}

/**
 * Validates and normalizes an interview ID to prevent injection.
 */
function sanitizeInterviewId(raw) {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();
  // Safe alphanumeric and standard MongoDB ObjectId regex
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(trimmed)) return null;
  return trimmed;
}

/**
 * Sanitizes a filename to remove any path traversal sequences and control characters.
 */
function sanitizeFileName(name) {
  if (!name || typeof name !== "string") return "";
  return name
    .replace(/[/\\]/g, "_")
    .replace(/\.\./g, "_")
    .replace(/[^\w.\- ]/g, "")
    .slice(0, 100)
    .trim();
}

export default async function handler(req, res) {
  applyPrivateSecurityHeaders(res);

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

  // 2. Server-Side Authentication
  const { userId, error: authError } = await authenticateRequest(req);
  if (!userId) {
    return res.status(401).json({ error: authError || "Unauthorized." });
  }

  try {
    const db = await getDb();
    const interviewsCollection = db.collection("interviews");
    const userAnswersCollection = db.collection("userAnswers");

    const rawId = req.query.id || req.query.interviewId;
    const interviewId = rawId ? sanitizeInterviewId(String(rawId)) : null;

    if (rawId && !interviewId && rawId !== "create") {
      return res.status(400).json({ error: "Invalid interview ID format." });
    }

    // ── GET: List user interviews or fetch single by ID ─────────────────────
    if (req.method === "GET") {
      if (interviewId && interviewId !== "create") {
        let filter;
        if (ObjectId.isValid(interviewId)) {
          filter = { _id: new ObjectId(interviewId) };
        } else {
          filter = { id: interviewId };
        }

        const interview = await interviewsCollection.findOne(filter);
        if (!interview) {
          return res.status(404).json({ error: "Interview not found." });
        }

        // Strict ownership enforcement (IDOR / BOLA Prevention)
        if (interview.userId !== userId) {
          return res.status(403).json({ error: "Forbidden: You do not own this interview." });
        }

        return res.status(200).json(formatInterviewDoc(interview));
      }

      // List all interviews belonging strictly to authenticated user
      const interviews = await interviewsCollection
        .find({ userId })
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray();

      return res.status(200).json(interviews.map(formatInterviewDoc));
    }

    // ── POST: Create new interview ──────────────────────────────────────────
    if (req.method === "POST") {
      // Rate limit interview creation (max 30 per min per user)
      const rateLimitMax = Number(process.env.RATE_LIMIT_INTERVIEWS_PER_MIN) || 30;
      const rateCheck = await checkRateLimit({
        key: `interviews:create:${userId}`,
        limit: rateLimitMax,
        windowMs: 60000,
      });
      setRateLimitHeaders(res, rateCheck, rateLimitMax);

      if (!rateCheck.allowed) {
        return res.status(429).json({
          error: "Too many interview creation requests. Please wait a moment.",
          retryAfter: rateCheck.resetInSeconds,
        });
      }

      const body = req.body || {};
      const {
        position,
        description,
        experience,
        techStack,
        duration = 10,
        interviewType = "Technical",
        focusAreas = "",
        mode = "practice",
        questions = [],
        status = "in-progress",
        conversationHistory = [],
        resumeBased = false,
        resumeFileName = "",
        resumeFileSize = 0,
        resumeAnalysis = null,
        resumeClaims = [],
      } = body;

      if (!position || typeof position !== "string" || position.trim().length === 0) {
        return res.status(400).json({ error: "Position/Role is required." });
      }

      if (position.length > 150) {
        return res.status(400).json({ error: "Position must be under 150 characters." });
      }

      const safeDescription = typeof description === "string" ? description.slice(0, 3000).trim() : "";
      const safeTechStack = typeof techStack === "string" ? techStack.slice(0, 500).trim() : "";
      const safeFocusAreas = typeof focusAreas === "string" ? focusAreas.slice(0, 500).trim() : "";
      const safeExp = Math.max(0, Math.min(70, Number(experience) || 0));
      const safeDuration = Math.max(1, Math.min(180, Number(duration) || 10));

      // Sanitize questions array
      const safeQuestions = (Array.isArray(questions) ? questions.slice(0, 50) : []).map((q) => {
        if (!q || typeof q !== "object") return { question: "", answer: "" };
        return {
          question: String(q.question || "").slice(0, 5000),
          answer: String(q.answer || "").slice(0, 5000),
          questionType: q.questionType ? String(q.questionType).slice(0, 100) : undefined,
          expectedKeyPoints: Array.isArray(q.expectedKeyPoints)
            ? q.expectedKeyPoints.slice(0, 10).map((p) => String(p).slice(0, 300))
            : undefined,
        };
      });

      // Sanitize conversation history
      const safeConversationHistory = (Array.isArray(conversationHistory) ? conversationHistory.slice(0, 100) : []).map(
        (turn) => ({
          role: turn.role === "candidate" ? "candidate" : "interviewer",
          content: String(turn.content || "").slice(0, 5000),
          timestamp: turn.timestamp ? new Date(turn.timestamp) : new Date(),
        })
      );

      const now = new Date();
      const newInterviewDoc = {
        userId, // Server-derived from verified Clerk session
        position: position.trim(),
        description: safeDescription,
        experience: safeExp,
        techStack: safeTechStack,
        duration: safeDuration,
        interviewType: String(interviewType || "Technical").slice(0, 50),
        focusAreas: safeFocusAreas,
        mode: ["practice", "live", "resume"].includes(mode) ? mode : "practice",
        questions: safeQuestions,
        status: ["in-progress", "completed", "draft"].includes(status) ? status : "in-progress",
        conversationHistory: safeConversationHistory,
        resumeBased: Boolean(resumeBased),
        resumeFileName: sanitizeFileName(resumeFileName),
        resumeFileSize: Math.max(0, Math.min(25 * 1024 * 1024, Number(resumeFileSize) || 0)),
        resumeAnalysis: resumeAnalysis && typeof resumeAnalysis === "object" ? resumeAnalysis : null,
        resumeClaims: Array.isArray(resumeClaims) ? resumeClaims.slice(0, 50) : [],
        createdAt: now,
        updatedAt: now,
      };

      const result = await interviewsCollection.insertOne(newInterviewDoc);
      return res.status(201).json({
        id: result.insertedId.toString(),
        ...newInterviewDoc,
      });
    }

    // ── PUT/PATCH: Update interview with strict field whitelist ─────────────
    if (req.method === "PUT" || req.method === "PATCH") {
      if (!interviewId) {
        return res.status(400).json({ error: "Interview ID is required to update." });
      }

      let filter;
      if (ObjectId.isValid(interviewId)) {
        filter = { _id: new ObjectId(interviewId) };
      } else {
        filter = { id: interviewId };
      }

      const existing = await interviewsCollection.findOne(filter);
      if (!existing) {
        return res.status(404).json({ error: "Interview not found." });
      }

      if (existing.userId !== userId) {
        return res.status(403).json({ error: "Forbidden: You do not own this interview." });
      }

      const rawBody = req.body || {};
      const safeUpdates = {
        updatedAt: new Date(),
      };

      // Strict Whitelist of Allowed Updates:
      if (typeof rawBody.position === "string" && rawBody.position.trim()) {
        safeUpdates.position = rawBody.position.trim().slice(0, 150);
      }
      if (typeof rawBody.description === "string") {
        safeUpdates.description = rawBody.description.slice(0, 3000);
      }
      if (rawBody.experience !== undefined) {
        safeUpdates.experience = Math.max(0, Math.min(70, Number(rawBody.experience) || 0));
      }
      if (typeof rawBody.techStack === "string") {
        safeUpdates.techStack = rawBody.techStack.slice(0, 500);
      }
      if (rawBody.duration !== undefined) {
        safeUpdates.duration = Math.max(1, Math.min(180, Number(rawBody.duration) || 10));
      }
      if (typeof rawBody.status === "string" && ["in-progress", "completed", "draft"].includes(rawBody.status)) {
        safeUpdates.status = rawBody.status;
      }
      if (typeof rawBody.mode === "string" && ["practice", "live", "resume"].includes(rawBody.mode)) {
        safeUpdates.mode = rawBody.mode;
      }
      if (Array.isArray(rawBody.questions)) {
        safeUpdates.questions = rawBody.questions.slice(0, 50).map((q) => ({
          question: String(q.question || "").slice(0, 5000),
          answer: String(q.answer || "").slice(0, 5000),
          questionType: q.questionType ? String(q.questionType).slice(0, 100) : undefined,
        }));
      }
      if (Array.isArray(rawBody.conversationHistory)) {
        safeUpdates.conversationHistory = rawBody.conversationHistory.slice(0, 100).map((turn) => ({
          role: turn.role === "candidate" ? "candidate" : "interviewer",
          content: String(turn.content || "").slice(0, 5000),
          timestamp: turn.timestamp ? new Date(turn.timestamp) : new Date(),
        }));
      }
      if (rawBody.feedback && typeof rawBody.feedback === "object") {
        safeUpdates.feedback = rawBody.feedback;
      }

      await interviewsCollection.updateOne(filter, { $set: safeUpdates });
      const updated = await interviewsCollection.findOne(filter);
      return res.status(200).json(formatInterviewDoc(updated));
    }

    // ── DELETE: Delete interview and associated userAnswers ─────────────────
    if (req.method === "DELETE") {
      if (!interviewId) {
        return res.status(400).json({ error: "Interview ID is required to delete." });
      }

      let filter;
      if (ObjectId.isValid(interviewId)) {
        filter = { _id: new ObjectId(interviewId) };
      } else {
        filter = { id: interviewId };
      }

      const existing = await interviewsCollection.findOne(filter);
      if (!existing) {
        return res.status(404).json({ error: "Interview not found." });
      }

      if (existing.userId !== userId) {
        return res.status(403).json({ error: "Forbidden: You do not own this interview." });
      }

      // Delete the interview document
      await interviewsCollection.deleteOne(filter);

      // Best-effort cleanup of associated practice answers strictly scoped to this user
      const mockIdString = existing._id.toString();
      await userAnswersCollection.deleteMany({
        $or: [
          { mockIdRef: interviewId, userId },
          { mockIdRef: mockIdString, userId },
        ],
      });

      return res.status(200).json({ success: true, id: interviewId });
    }

    res.setHeader("Allow", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    return res.status(405).json({ error: "Method not allowed." });
  } catch (error) {
    console.error("[api/interviews] Database error:", error.message);
    return res.status(500).json({ error: "Failed to process interview operation." });
  }
}

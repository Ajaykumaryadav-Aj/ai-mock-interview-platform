// api/interviews.js
// Vercel Serverless Function: Mock interviews management backed by MongoDB Atlas.
// Fully authenticated; strictly enforces that candidates can only access/manage their own interviews.

import { ObjectId } from "mongodb";
import { handleCors } from "./_cors.js";
import { authenticateRequest } from "./lib/auth.js";
import { getDb } from "./lib/mongodb.js";

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

export default async function handler(req, res) {
  // CORS Preflight
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

  // Authenticate user
  const { userId, error: authError } = await authenticateRequest(req);
  if (!userId) {
    return res.status(401).json({ error: authError || "Unauthorized." });
  }

  try {
    const db = await getDb();
    const interviewsCollection = db.collection("interviews");
    const userAnswersCollection = db.collection("userAnswers");

    const interviewId = req.query.id || req.query.interviewId;

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

        // Strict ownership enforcement
        if (interview.userId !== userId) {
          return res.status(403).json({ error: "Forbidden: You do not own this interview." });
        }

        return res.status(200).json(formatInterviewDoc(interview));
      }

      // List all interviews belonging to authenticated user
      const interviews = await interviewsCollection
        .find({ userId })
        .sort({ createdAt: -1 })
        .toArray();

      return res.status(200).json(interviews.map(formatInterviewDoc));
    }

    // ── POST: Create new interview ──────────────────────────────────────────
    if (req.method === "POST") {
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

      if (!position) {
        return res.status(400).json({ error: "Position/Role is required." });
      }

      const now = new Date();
      const newInterviewDoc = {
        userId, // Server-derived from verified Clerk session
        position: String(position).trim(),
        description: typeof description === "string" ? description.trim() : "",
        experience: typeof experience === "number" ? experience : Number(experience) || 0,
        techStack: typeof techStack === "string" ? techStack.trim() : "",
        duration: Number(duration) || 10,
        interviewType: String(interviewType || "Technical"),
        focusAreas: typeof focusAreas === "string" ? focusAreas.trim() : "",
        mode: String(mode || "practice"),
        questions: Array.isArray(questions) ? questions : [],
        status: String(status || "in-progress"),
        conversationHistory: Array.isArray(conversationHistory) ? conversationHistory : [],
        resumeBased: Boolean(resumeBased),
        resumeFileName: String(resumeFileName || ""),
        resumeFileSize: Number(resumeFileSize) || 0,
        resumeAnalysis: resumeAnalysis || null,
        resumeClaims: Array.isArray(resumeClaims) ? resumeClaims : [],
        createdAt: now,
        updatedAt: now,
      };

      const result = await interviewsCollection.insertOne(newInterviewDoc);
      return res.status(201).json({
        id: result.insertedId.toString(),
        ...newInterviewDoc,
      });
    }

    // ── PUT/PATCH: Update interview ─────────────────────────────────────────
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

      const body = { ...(req.body || {}) };
      delete body._id;
      delete body.id;
      delete body.userId; // Prevent hijacking ownership

      const updateFields = {
        ...body,
        updatedAt: new Date(),
      };

      await interviewsCollection.updateOne(filter, { $set: updateFields });
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

      // Best-effort cleanup of associated practice answers
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

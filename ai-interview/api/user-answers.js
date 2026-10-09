// api/user-answers.js
// Vercel Serverless Function: User answers and AI evaluations backed by MongoDB Atlas.
// Authenticated via Clerk; strictly isolates evaluations by authenticated userId and interviewId.

import { ObjectId } from "mongodb";
import { handleCors } from "./_cors.js";
import { authenticateRequest, applyPrivateSecurityHeaders } from "./_lib/auth.js";
import { getDb } from "./_lib/mongodb.js";

export function formatAnswerDoc(doc) {
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

  applyPrivateSecurityHeaders(res);

  // Authenticate user
  const { userId, error: authError } = await authenticateRequest(req);
  if (!userId) {
    return res.status(401).json({ error: authError || "Unauthorized." });
  }

  try {
    const db = await getDb();
    const userAnswersCollection = db.collection("userAnswers");

    // ── GET: Fetch all user answers for a specific interview ────────────────
    if (req.method === "GET") {
      const interviewId = req.query.interviewId || req.query.mockIdRef;
      if (!interviewId || typeof interviewId !== "string" || interviewId.length > 64) {
        return res.status(400).json({ error: "interviewId parameter is required and must be valid." });
      }

      const cleanInterviewId = String(interviewId).trim();

      // Check interview ownership
      const interviewsCollection = db.collection("interviews");
      let filter;
      const isHex24 = /^[0-9a-fA-F]{24}$/.test(cleanInterviewId);
      if (isHex24 && ObjectId.isValid(cleanInterviewId)) {
        filter = { $or: [{ _id: new ObjectId(cleanInterviewId) }, { id: cleanInterviewId }] };
      } else {
        filter = { id: cleanInterviewId };
      }
      const interview = await interviewsCollection.findOne(filter);
      if (interview && interview.userId !== userId) {
        return res.status(403).json({ error: "Forbidden: You do not own this interview." });
      }

      // Query answers strictly scoped to authenticated user and target interview
      const answers = await userAnswersCollection
        .find({
          mockIdRef: cleanInterviewId,
          userId,
        })
        .sort({ createdAt: 1 })
        .toArray();

      return res.status(200).json(answers.map(formatAnswerDoc));
    }

    // ── POST: Save or update answer and AI feedback ─────────────────────────
    if (req.method === "POST") {
      const {
        mockIdRef,
        question,
        correct_ans,
        user_ans,
        feedback,
        rating,
      } = req.body || {};

      if (!mockIdRef || typeof mockIdRef !== "string" || mockIdRef.trim().length === 0 || mockIdRef.length > 64) {
        return res.status(400).json({
          error: "mockIdRef is required (max 64 chars).",
        });
      }

      if (!question || typeof question !== "string" || question.trim().length === 0 || question.length > 5000) {
        return res.status(400).json({
          error: "question is required (1-5000 chars).",
        });
      }

      const cleanMockIdRef = String(mockIdRef).trim();
      const cleanQuestion = String(question).trim();

      const safeCorrectAns = typeof correct_ans === "string" ? correct_ans.slice(0, 15000) : "";
      const safeUserAns = typeof user_ans === "string" ? user_ans.slice(0, 15000) : "";
      const safeFeedback = typeof feedback === "string" ? feedback.slice(0, 15000) : "";
      const parsedRating = Number(rating);
      const safeRating = Number.isFinite(parsedRating) ? Math.max(0, Math.min(10, Math.round(parsedRating))) : 0;

      // Check interview ownership
      const interviewsCollection = db.collection("interviews");
      let interviewFilter;
      const isHex24 = /^[0-9a-fA-F]{24}$/.test(cleanMockIdRef);
      if (isHex24 && ObjectId.isValid(cleanMockIdRef)) {
        interviewFilter = { $or: [{ _id: new ObjectId(cleanMockIdRef) }, { id: cleanMockIdRef }] };
      } else {
        interviewFilter = { id: cleanMockIdRef };
      }
      const interview = await interviewsCollection.findOne(interviewFilter);
      if (interview && interview.userId !== userId) {
        return res.status(403).json({ error: "Forbidden: You do not own this interview." });
      }

      const now = new Date();
      const existing = await userAnswersCollection.findOne({
        mockIdRef: cleanMockIdRef,
        userId,
        question: cleanQuestion,
      });

      if (existing) {
        // Update existing answer
        await userAnswersCollection.updateOne(
          { _id: existing._id },
          {
            $set: {
              correct_ans: safeCorrectAns,
              user_ans: safeUserAns,
              feedback: safeFeedback,
              rating: safeRating,
              updatedAt: now,
            },
          }
        );

        return res.status(200).json({
          id: existing._id.toString(),
          updated: true,
          mockIdRef: cleanMockIdRef,
          userId,
          question: cleanQuestion,
          correct_ans: safeCorrectAns,
          user_ans: safeUserAns,
          feedback: safeFeedback,
          rating: safeRating,
          updatedAt: now,
        });
      }

      // Insert new answer record
      const newDoc = {
        mockIdRef: cleanMockIdRef,
        userId, // Server-derived from verified Clerk session
        question: cleanQuestion,
        correct_ans: safeCorrectAns,
        user_ans: safeUserAns,
        feedback: safeFeedback,
        rating: safeRating,
        createdAt: now,
        updatedAt: now,
      };

      const result = await userAnswersCollection.insertOne(newDoc);
      return res.status(201).json({
        id: result.insertedId.toString(),
        created: true,
        ...newDoc,
      });
    }

    res.setHeader("Allow", "GET, POST, OPTIONS");
    return res.status(405).json({ error: "Method not allowed. Use GET or POST." });
  } catch (error) {
    console.error("[api/user-answers] Database error:", error.message);
    return res.status(500).json({ error: "Failed to process user answer." });
  }
}

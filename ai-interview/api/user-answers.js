// api/user-answers.js
// Vercel Serverless Function: User answers and AI evaluations backed by MongoDB Atlas.
// Authenticated via Clerk; strictly isolates evaluations by authenticated userId and interviewId.

import { ObjectId } from "mongodb";
import { handleCors } from "./_cors.js";
import { authenticateRequest } from "./_lib/auth.js";
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
      if (!interviewId) {
        return res.status(400).json({ error: "interviewId parameter is required." });
      }

      // Check interview ownership
      const interviewsCollection = db.collection("interviews");
      let filter;
      if (ObjectId.isValid(String(interviewId))) {
        filter = { $or: [{ _id: new ObjectId(String(interviewId)) }, { id: String(interviewId) }] };
      } else {
        filter = { id: String(interviewId) };
      }
      const interview = await interviewsCollection.findOne(filter);
      if (interview && interview.userId !== userId) {
        return res.status(403).json({ error: "Forbidden: You do not own this interview." });
      }

      // Query answers strictly scoped to authenticated user and target interview
      const answers = await userAnswersCollection
        .find({
          mockIdRef: String(interviewId),
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

      if (!mockIdRef || !question) {
        return res.status(400).json({
          error: "mockIdRef and question are required to save an answer.",
        });
      }

      // Check interview ownership
      const interviewsCollection = db.collection("interviews");
      let interviewFilter;
      if (ObjectId.isValid(String(mockIdRef))) {
        interviewFilter = { $or: [{ _id: new ObjectId(String(mockIdRef)) }, { id: String(mockIdRef) }] };
      } else {
        interviewFilter = { id: String(mockIdRef) };
      }
      const interview = await interviewsCollection.findOne(interviewFilter);
      if (interview && interview.userId !== userId) {
        return res.status(403).json({ error: "Forbidden: You do not own this interview." });
      }

      const now = new Date();
      const existing = await userAnswersCollection.findOne({
        mockIdRef: String(mockIdRef),
        userId,
        question: String(question),
      });

      if (existing) {
        // Update existing answer
        await userAnswersCollection.updateOne(
          { _id: existing._id },
          {
            $set: {
              correct_ans: typeof correct_ans === "string" ? correct_ans : "",
              user_ans: typeof user_ans === "string" ? user_ans : "",
              feedback: typeof feedback === "string" ? feedback : "",
              rating: typeof rating === "number" ? rating : Number(rating) || 0,
              updatedAt: now,
            },
          }
        );

        return res.status(200).json({
          id: existing._id.toString(),
          updated: true,
          mockIdRef: String(mockIdRef),
          userId,
          question: String(question),
          correct_ans,
          user_ans,
          feedback,
          rating,
          updatedAt: now,
        });
      }

      // Insert new answer record
      const newDoc = {
        mockIdRef: String(mockIdRef),
        userId, // Server-derived from verified Clerk session
        question: String(question),
        correct_ans: typeof correct_ans === "string" ? correct_ans : "",
        user_ans: typeof user_ans === "string" ? user_ans : "",
        feedback: typeof feedback === "string" ? feedback : "",
        rating: typeof rating === "number" ? rating : Number(rating) || 0,
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

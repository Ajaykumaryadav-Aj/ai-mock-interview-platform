// api/users.js
// Vercel Serverless Function: User profile management backed by MongoDB Atlas.
// Authenticated via Clerk session token; strictly isolates data by authenticated userId.

import { handleCors } from "./_cors.js";
import { authenticateRequest, applyPrivateSecurityHeaders } from "./_lib/auth.js";
import { getDb } from "./_lib/mongodb.js";
import { checkRateLimit, setRateLimitHeaders } from "./_lib/rateLimiter.js";

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
    const usersCollection = db.collection("users");

    // ── GET: Fetch authenticated user's profile ─────────────────────────────
    if (req.method === "GET") {
      const userDoc = await usersCollection.findOne({ userId });
      if (!userDoc) {
        return res.status(404).json({ error: "User profile not found." });
      }

      return res.status(200).json({
        id: userDoc.userId,
        userId: userDoc.userId,
        name: userDoc.name || "Anonymous",
        email: userDoc.email || "N/A",
        imageUrl: userDoc.imageUrl || "",
        createdAt: userDoc.createdAt,
        updatedAt: userDoc.updatedAt,
      });
    }

    // ── POST: Upsert authenticated user's profile ───────────────────────────
    if (req.method === "POST") {
      const rateLimitKey = `user_profile_post_${userId}`;
      const rlResult = await checkRateLimit(rateLimitKey, {
        limit: 30,
        windowMs: 60 * 1000,
      });
      setRateLimitHeaders(res, rlResult);
      if (!rlResult.allowed) {
        return res.status(429).json({
          error: "Too many profile updates. Please slow down.",
        });
      }

      const { name, email, imageUrl } = req.body || {};
      const safeName = typeof name === "string" ? name.trim().slice(0, 120) : "Anonymous";
      const safeEmail = typeof email === "string" ? email.trim().slice(0, 255) : "N/A";
      let safeImageUrl = "";
      if (typeof imageUrl === "string") {
        const trimmed = imageUrl.trim();
        if (/^(https?:\/\/|\/|data:image\/)/i.test(trimmed) && trimmed.length <= 2048) {
          safeImageUrl = trimmed;
        }
      }

      const now = new Date();

      const updateDoc = {
        $set: {
          name: safeName || "Anonymous",
          email: safeEmail || "N/A",
          imageUrl: safeImageUrl,
          updatedAt: now,
        },
        $setOnInsert: {
          userId,
          createdAt: now,
        },
      };

      await usersCollection.updateOne({ userId }, updateDoc, { upsert: true });

      const updated = await usersCollection.findOne({ userId });
      return res.status(200).json({
        success: true,
        user: {
          id: updated.userId,
          userId: updated.userId,
          name: updated.name,
          email: updated.email,
          imageUrl: updated.imageUrl,
          createdAt: updated.createdAt,
          updatedAt: updated.updatedAt,
        },
      });
    }

    res.setHeader("Allow", "GET, POST, OPTIONS");
    return res.status(405).json({ error: "Method not allowed. Use GET or POST." });
  } catch (error) {
    console.error("[api/users] Database error:", error.message);
    return res.status(500).json({ error: "Failed to process user profile." });
  }
}

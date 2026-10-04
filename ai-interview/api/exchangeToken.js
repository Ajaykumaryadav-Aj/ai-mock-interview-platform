// api/exchangeToken.js
// Vercel Serverless Function: Exchanges a verified Clerk session JWT for a Firebase Custom Token.
// Runs on the Vercel Node.js serverless runtime — no Firebase Blaze plan required.

import admin from "firebase-admin";
import { verifyToken } from "@clerk/backend";

/**
 * Initializes Firebase Admin SDK once per serverless container using server-side credentials.
 */
function getFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Missing Firebase service account credentials in server environment variables.");
  }

  // Handle escaped \n characters from multiline environment variables
  if (privateKey.includes("\\n")) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

import { handleCors } from "./_cors.js";

/**
 * Serverless Function Handler
 *
 * POST /api/exchangeToken
 * Headers: Authorization: Bearer <clerk-session-jwt>
 * Response (200): { firebaseToken: "..." }
 */
export default async function handler(req, res) {
  // ── 1. Handle CORS Preflight ───────────────────────────────────────────────
  if (req.method === "OPTIONS") {
    const isOriginAllowed = handleCors(req, res);
    if (!isOriginAllowed) {
      return res.status(403).json({ error: "Origin not permitted by CORS policy." });
    }
    return res.status(204).end();
  }

  // ── 2. Enforce POST Method ─────────────────────────────────────────────────
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  // Check CORS for POST request
  const isOriginAllowed = handleCors(req, res);
  if (req.headers.origin && !isOriginAllowed) {
    return res.status(403).json({ error: "Origin not permitted by CORS policy." });
  }

  // ── 3. Extract Clerk Session Bearer Token ──────────────────────────────────
  const authHeader = req.headers.authorization || req.headers.Authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Missing or malformed Authorization header. Expected: Bearer <token>",
    });
  }

  const sessionToken = authHeader.slice(7).trim();
  if (!sessionToken) {
    return res.status(401).json({ error: "Clerk session token is empty." });
  }

  // ── 4. Verify the Clerk JWT Server-Side ────────────────────────────────────
  const secretKey = process.env.CLERK_SECRET_KEY;
  const rawJwtKey = process.env.CLERK_JWT_KEY;
  const jwtKey = rawJwtKey ? rawJwtKey.replace(/\\n/g, "\n") : undefined;

  if (!secretKey && !jwtKey) {
    console.error("[exchangeToken] Neither CLERK_SECRET_KEY nor CLERK_JWT_KEY is set in server environment.");
    return res.status(500).json({ error: "Authentication server configuration error." });
  }

  let clerkUserId;
  try {
    let payload;
    if (jwtKey) {
      try {
        payload = await verifyToken(sessionToken, { jwtKey });
      } catch (jwtErr) {
        if (secretKey) {
          payload = await verifyToken(sessionToken, { secretKey });
        } else {
          throw jwtErr;
        }
      }
    } else {
      payload = await verifyToken(sessionToken, { secretKey });
    }

    // Never trust client-sent IDs — extract authenticated subject directly from verified JWT
    clerkUserId = payload?.sub;
    if (!clerkUserId || typeof clerkUserId !== "string") {
      return res.status(401).json({ error: "Session token payload missing valid subject identifier." });
    }
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired session token." });
  }

  // ── 5. Generate Firebase Custom Token ──────────────────────────────────────
  try {
    getFirebaseAdmin();
    const firebaseToken = await admin.auth().createCustomToken(clerkUserId);
    return res.status(200).json({ firebaseToken });
  } catch (err) {
    console.error("[exchangeToken] Firebase custom token creation failed:", err.message);
    return res.status(500).json({ error: "Failed to generate Firebase authentication token." });
  }
}

// functions/index.js
// Clerk → Firebase Auth custom-token exchange
//
// PRODUCTION: secrets come from Firebase Secret Manager (defineSecret).
// LOCAL EMULATOR: secrets come from functions/.env.local (auto-loaded by the
//   Functions emulator — never committed to git).
//
// Environment variables required:
//   CLERK_SECRET_KEY       — Clerk Secret Key (sk_test_... or sk_live_...)
//   CLERK_PUBLISHABLE_KEY  — Clerk Publishable Key (pk_test_... or pk_live_...)
//   CLERK_JWT_KEY          — Clerk PEM public key (from Clerk Dashboard → API Keys)

"use strict";

const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const { verifyToken } = require("@clerk/backend");

// Initialize Firebase Admin SDK once.
// In the emulator, admin auto-connects to the local Auth emulator when
// FIREBASE_AUTH_EMULATOR_HOST is set (the emulator sets this automatically).
if (!admin.apps.length) {
  admin.initializeApp();
}

// Declare secrets for PRODUCTION deployment via Secret Manager.
// In the local emulator, these variables fall back to process.env values
// loaded from functions/.env.local.
const clerkSecretKey = defineSecret("CLERK_SECRET_KEY");
const clerkPublishableKey = defineSecret("CLERK_PUBLISHABLE_KEY");
const clerkJwtKey = defineSecret("CLERK_JWT_KEY");

/**
 * POST /exchangeToken
 *
 * Request headers:
 *   Authorization: Bearer <clerk-session-jwt>
 *
 * Response (200):
 *   { firebaseToken: "<firebase-custom-token>" }
 *
 * Response (401):
 *   { error: "..." }
 *
 * Response (500):
 *   { error: "..." }
 */
exports.exchangeToken = onRequest(
  {
    secrets: [clerkSecretKey, clerkPublishableKey, clerkJwtKey],
    cors: true,
  },
  async (req, res) => {
    // ── CORS pre-flight ──────────────────────────────────────────────────────
    if (req.method === "OPTIONS") {
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed. Use POST." });
      return;
    }

    // ── 1. Extract Bearer token ──────────────────────────────────────────────
    const authHeader = req.headers["authorization"] || "";
    if (!authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        error: "Missing or malformed Authorization header. Expected: Bearer <token>",
      });
      return;
    }

    const sessionToken = authHeader.slice(7).trim();
    if (!sessionToken) {
      res.status(401).json({ error: "Clerk session token is empty." });
      return;
    }

    // ── 2. Read secrets (Secret Manager in prod, process.env in emulator) ────
    const secretKey = process.env.CLERK_SECRET_KEY;
    const publishableKey = process.env.CLERK_PUBLISHABLE_KEY;
    const rawJwtKey = process.env.CLERK_JWT_KEY;
    const jwtKey = rawJwtKey ? rawJwtKey.replace(/\\n/g, "\n") : undefined;

    if (!secretKey || !publishableKey) {
      console.error("[exchangeToken] Missing Clerk secrets. " +
        "In emulator: add them to functions/.env.local. " +
        "In production: set via firebase functions:secrets:set");
      res.status(500).json({ error: "Server misconfiguration: Clerk secrets not set." });
      return;
    }

    // ── 3. Verify the Clerk JWT server-side ──────────────────────────────────
    let clerkUserId;
    try {
      let payload;
      if (jwtKey) {
        try {
          payload = await verifyToken(sessionToken, { jwtKey });
        } catch (jwtErr) {
          console.warn("[exchangeToken] Local JWT verification error, falling back to secretKey:", jwtErr.message);
          payload = await verifyToken(sessionToken, { secretKey });
        }
      } else {
        payload = await verifyToken(sessionToken, { secretKey });
      }

      clerkUserId = payload?.sub;
      if (!clerkUserId) {
        res.status(401).json({ error: "Clerk token did not contain a subject (userId)." });
        return;
      }
    } catch (err) {
      console.error("[exchangeToken] Clerk verification error:", err.message);
      res.status(401).json({ error: "Clerk token verification failed: " + err.message });
      return;
    }

    // ── 4. Mint a Firebase custom token ──────────────────────────────────────
    // In the emulator, admin.auth() points to the local Auth emulator.
    // The UID equals the Clerk user ID so existing Firestore documents match.
    let firebaseToken;
    try {
      firebaseToken = await admin.auth().createCustomToken(clerkUserId);
    } catch (err) {
      console.error("[exchangeToken] createCustomToken error:", err.message);
      res.status(500).json({ error: "Failed to create Firebase authentication token." });
      return;
    }

    console.log(`[exchangeToken] Token issued for user: ${clerkUserId.slice(0, 8)}…`);
    res.status(200).json({ firebaseToken });
  }
);

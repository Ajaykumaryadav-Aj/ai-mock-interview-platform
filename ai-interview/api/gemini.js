// api/gemini.js
// Vercel Serverless Function: Secure server-side proxy for Google Gemini AI.
// Protects the Gemini API key from exposure in frontend browser bundles.
// Hardened with Clerk Authentication, Strict Input Validation, Model Whitelisting,
// Persistent Rate Limiting, and Secure Header Enforcement.

import { GoogleGenAI } from "@google/genai";
import { handleCors } from "./_cors.js";
import { authenticateRequest, applyPrivateSecurityHeaders } from "./_lib/auth.js";
import { checkRateLimit, setRateLimitHeaders } from "./_lib/rateLimiter.js";

let geminiClient = null;

function getGeminiClient() {
  if (geminiClient) return geminiClient;

  let apiKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "").trim();
  if (
    (apiKey.startsWith('"') && apiKey.endsWith('"')) ||
    (apiKey.startsWith("'") && apiKey.endsWith("'"))
  ) {
    apiKey = apiKey.slice(1, -1);
  }

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in Vercel environment variables.");
  }

  geminiClient = new GoogleGenAI({ apiKey });
  return geminiClient;
}

/**
 * Whitelist of permitted Google Gemini models to prevent arbitrary model usage or quota drain.
 */
const ALLOWED_MODELS = new Set([
  "gemini-2.5-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-3.8-flash",
]);

const MAX_INPUT_CHARS = 60000; // ~15,000 tokens maximum payload limit

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

  // 2. HTTP Method Enforcement
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  // 3. Origin Verification
  const isAllowed = handleCors(req, res);
  if (req.headers.origin && !isAllowed) {
    return res.status(403).json({ error: "Origin not permitted by CORS policy." });
  }

  // 4. Mandatory Server-Side Clerk Authentication
  const { userId, error: authError } = await authenticateRequest(req);
  if (!userId) {
    return res.status(401).json({
      error: authError || "Authentication required. Please sign in to use AI interview generation.",
    });
  }

  // 5. Abuse Prevention & Persistent Rate Limiting (per authenticated user)
  const rateLimitMax = Number(process.env.RATE_LIMIT_AI_PER_MIN) || 20;
  const rateCheck = await checkRateLimit({
    key: `gemini:${userId}`,
    limit: rateLimitMax,
    windowMs: 60000,
  });

  setRateLimitHeaders(res, rateCheck, rateLimitMax);

  if (!rateCheck.allowed) {
    return res.status(429).json({
      error: `AI generation rate limit exceeded. Please wait ${rateCheck.resetInSeconds}s before trying again.`,
      retryAfter: rateCheck.resetInSeconds,
    });
  }

  // 6. Strict Request Body Validation
  const body = req.body;
  if (!body || typeof body !== "object") {
    return res.status(400).json({ error: "Invalid JSON request payload." });
  }

  const { model, input, response_format } = body;

  if (!input || typeof input !== "string" || input.trim().length === 0) {
    return res.status(400).json({ error: "Missing or invalid 'input' in request body." });
  }

  if (input.length > MAX_INPUT_CHARS) {
    return res.status(400).json({
      error: `Input length (${input.length} characters) exceeds the maximum allowed limit of ${MAX_INPUT_CHARS} characters.`,
    });
  }

  // Validate requested model against whitelist
  const targetModel = model ? String(model).trim() : "gemini-2.5-flash";
  if (!ALLOWED_MODELS.has(targetModel)) {
    return res.status(400).json({
      error: `Invalid or unsupported Gemini model: '${targetModel}'. Allowed models: ${Array.from(ALLOWED_MODELS).join(", ")}.`,
    });
  }

  // Validate response_format if provided
  if (response_format && typeof response_format !== "object") {
    return res.status(400).json({ error: "Invalid 'response_format' parameter." });
  }

  // 7. Execute AI Generation with Safe Error Handling
  try {
    const ai = getGeminiClient();
    const interaction = await ai.interactions.create({
      model: targetModel,
      input,
      ...(response_format ? { response_format } : {}),
    });

    return res.status(200).json({
      output_text: interaction?.output_text || "",
    });
  } catch (error) {
    const errorMsg = error?.message || "";
    const isRateLimit =
      error?.status === 429 ||
      error?.statusCode === 429 ||
      errorMsg.includes("429") ||
      errorMsg.toLowerCase().includes("rate limit") ||
      errorMsg.toLowerCase().includes("quota");

    if (isRateLimit) {
      return res.status(429).json({
        error: "Upstream AI rate limit reached. Please wait a moment before trying again.",
      });
    }

    // Server-side audit log without printing secrets or user prompt text
    console.error(`[Gemini Proxy] AI generation failure for user=${userId.slice(0, 8)}... model=${targetModel}`);
    return res.status(500).json({
      error: "Gemini AI generation request failed. Please try again.",
    });
  }
}

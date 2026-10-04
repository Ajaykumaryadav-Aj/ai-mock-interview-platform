// api/gemini.js
// Vercel Serverless Function: Secure server-side proxy for Google Gemini AI.
// Protects the Gemini API key from exposure in frontend browser bundles.

import { GoogleGenAI } from "@google/genai";

let geminiClient = null;

function getGeminiClient() {
  if (geminiClient) return geminiClient;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in server environment.");
  }

  geminiClient = new GoogleGenAI({ apiKey });
  return geminiClient;
}

function handleCors(req, res) {
  const requestOrigin = req.headers.origin;
  if (!requestOrigin) return true;

  const appOrigin = process.env.APP_ORIGIN ? process.env.APP_ORIGIN.replace(/\/$/, "") : "";
  const isLocalDev =
    process.env.NODE_ENV !== "production" &&
    (requestOrigin.startsWith("http://localhost:") || requestOrigin.startsWith("http://127.0.0.1:"));

  const isAllowed = isLocalDev || (appOrigin && requestOrigin === appOrigin);

  if (isAllowed) {
    res.setHeader("Access-Control-Allow-Origin", requestOrigin);
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
    res.setHeader("Vary", "Origin");
    return true;
  }

  return false;
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

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const isAllowed = handleCors(req, res);
  if (req.headers.origin && !isAllowed) {
    return res.status(403).json({ error: "Origin not permitted by CORS policy." });
  }

  const { model, input, response_format } = req.body || {};

  if (!input || typeof input !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'input' in request body." });
  }

  try {
    const ai = getGeminiClient();
    const interaction = await ai.interactions.create({
      model: model || "gemini-3.8-flash",
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
        error: "AI rate limit reached. Please wait a moment before trying again.",
      });
    }

    console.error("[Gemini Proxy] Request error:", errorMsg);
    return res.status(500).json({
      error: "Gemini AI generation request failed. Please try again.",
    });
  }
}

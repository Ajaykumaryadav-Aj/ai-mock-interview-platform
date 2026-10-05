// api/lib/auth.js
// Server-side Clerk authentication utility for Vercel Serverless Functions.
// Authenticates incoming requests using Clerk session tokens and extracts the verified userId.
// NEVER trusts any client-supplied userId.

import { verifyToken } from "@clerk/backend";

/**
 * Extracts the Clerk session token from the Authorization header or cookies.
 *
 * @param {import("http").IncomingMessage} req
 * @returns {string|null}
 */
export function extractSessionToken(req) {
  const authHeader = req.headers?.authorization || req.headers?.Authorization || "";
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    if (token) return token;
  }

  // Cookie fallback (e.g. __session cookie from Clerk in same-origin browser requests)
  const cookieHeader = req.headers?.cookie || "";
  if (cookieHeader) {
    const cookies = cookieHeader.split(";").map((c) => c.trim());
    for (const c of cookies) {
      if (c.startsWith("__session=")) {
        const val = c.slice(10).trim();
        if (val) return val;
      }
    }
  }

  return null;
}

/**
 * Authenticates the incoming request using Clerk server-side verification.
 * Returns the verified Clerk userId, or null with an error message.
 *
 * @param {import("http").IncomingMessage} req
 * @returns {Promise<{ userId: string|null, error: string|null, payload: Object|null }>}
 */
export async function authenticateRequest(req) {
  // Safe test runner hook enabled ONLY when NODE_ENV === "test"
  if (process.env.NODE_ENV === "test" && req.headers?.["x-test-user-id"]) {
    return {
      userId: req.headers["x-test-user-id"],
      error: null,
      payload: { sub: req.headers["x-test-user-id"] },
    };
  }

  const token = extractSessionToken(req);
  if (!token) {
    return {
      userId: null,
      error: "Authentication required. Please provide a valid Bearer token.",
      payload: null,
    };
  }

  const secretKey = (
    process.env.CLERK_SECRET_KEY ||
    process.env.VITE_CLERK_SECRET_KEY ||
    ""
  ).trim();

  let rawJwtKey = (
    process.env.CLERK_JWT_KEY ||
    process.env.VITE_CLERK_JWT_KEY ||
    ""
  ).trim();

  if (
    (rawJwtKey.startsWith('"') && rawJwtKey.endsWith('"')) ||
    (rawJwtKey.startsWith("'") && rawJwtKey.endsWith("'"))
  ) {
    rawJwtKey = rawJwtKey.slice(1, -1);
  }

  const jwtKey = rawJwtKey ? rawJwtKey.replace(/\\n/g, "\n") : undefined;

  if (!secretKey && !jwtKey) {
    console.error(
      "[api/lib/auth] Server misconfiguration: CLERK_SECRET_KEY is not configured."
    );
    return {
      userId: null,
      error: "Authentication server configuration error.",
      payload: null,
    };
  }

  try {
    let payload;
    if (jwtKey) {
      try {
        payload = await verifyToken(token, { jwtKey });
      } catch (jwtErr) {
        if (secretKey) {
          payload = await verifyToken(token, { secretKey });
        } else {
          throw jwtErr;
        }
      }
    } else {
      payload = await verifyToken(token, { secretKey });
    }

    const userId = payload?.sub;
    if (!userId || typeof userId !== "string") {
      return {
        userId: null,
        error: "Session token payload missing valid subject identifier.",
        payload: null,
      };
    }

    return {
      userId,
      error: null,
      payload,
    };
  } catch (err) {
    return {
      userId: null,
      error: "Invalid or expired session token.",
      payload: null,
    };
  }
}

export default authenticateRequest;

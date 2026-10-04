// api/_cors.js
// Shared, audited CORS utility for Vercel Serverless Functions.
// Enforces exact-origin matching without wildcards in production.

/**
 * Normalizes an origin string to its canonical scheme + hostname + port.
 * Returns null if the URL is invalid.
 *
 * @param {string} raw
 * @returns {string|null}
 */
export function normalizeOrigin(raw) {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    const withScheme =
      trimmed.startsWith("http://") || trimmed.startsWith("https://")
        ? trimmed
        : `https://${trimmed}`;
    const url = new URL(withScheme);
    return url.origin; // exact scheme + hostname + port
  } catch {
    return null;
  }
}

/**
 * Compiles a Set of all valid, allowed origins for this deployment.
 * Includes:
 * 1. Explicitly configured origins from APP_ORIGIN / ALLOWED_ORIGINS (comma/space-separated).
 * 2. Same-origin deployment host (from x-forwarded-host / host headers).
 * 3. Vercel deployment URLs (VERCEL_URL, VERCEL_PROJECT_PRODUCTION_URL).
 * 4. Localhost / 127.0.0.1 in non-production environments.
 *
 * @param {import('http').IncomingMessage} req
 * @returns {Set<string>}
 */
export function getAllowedOrigins(req) {
  const allowed = new Set();

  // 1. Explicitly configured production origins (supports comma-separated list)
  const envOrigins = [process.env.APP_ORIGIN, process.env.ALLOWED_ORIGINS]
    .filter(Boolean)
    .join(",");

  if (envOrigins) {
    for (const item of envOrigins.split(/[,\s]+/)) {
      const normalized = normalizeOrigin(item);
      if (normalized) {
        allowed.add(normalized);
      }
    }
  }

  // 2. Same-origin resolution from request headers (Vercel Edge / Reverse Proxy)
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const proto = req.headers["x-forwarded-proto"] || "https";
  if (host) {
    const selfOrigin = normalizeOrigin(`${proto}://${host}`);
    if (selfOrigin) {
      allowed.add(selfOrigin);
    }
  }

  // 3. Vercel automatic deployment variables
  if (process.env.VERCEL_URL) {
    const vercelOrigin = normalizeOrigin(`https://${process.env.VERCEL_URL}`);
    if (vercelOrigin) {
      allowed.add(vercelOrigin);
    }
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    const prodOrigin = normalizeOrigin(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
    if (prodOrigin) {
      allowed.add(prodOrigin);
    }
  }

  return allowed;
}

/**
 * Validates request Origin and applies CORS headers.
 * Never uses wildcard "*" in production.
 *
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 * @returns {boolean} Whether the origin is allowed to proceed
 */
export function handleCors(req, res) {
  const rawOrigin = req.headers.origin;

  // Requests without an Origin header (e.g. server-to-server or non-browser tools)
  if (!rawOrigin) {
    return true;
  }

  const normalizedRequestOrigin = normalizeOrigin(rawOrigin);
  if (!normalizedRequestOrigin) {
    // Malformed Origin header
    return false;
  }

  // Local development check (allows localhost on any port when not in production)
  const isLocalDev =
    process.env.NODE_ENV !== "production" &&
    (normalizedRequestOrigin.startsWith("http://localhost:") ||
      normalizedRequestOrigin.startsWith("http://127.0.0.1:") ||
      normalizedRequestOrigin === "http://localhost" ||
      normalizedRequestOrigin === "http://127.0.0.1");

  const allowedOrigins = getAllowedOrigins(req);
  const isAllowed = isLocalDev || allowedOrigins.has(normalizedRequestOrigin);

  if (isAllowed) {
    res.setHeader("Access-Control-Allow-Origin", normalizedRequestOrigin);
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
    res.setHeader("Access-Control-Max-Age", "86400"); // 24 hours
    res.setHeader("Vary", "Origin");
    return true;
  }

  return false;
}

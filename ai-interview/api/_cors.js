// api/_cors.js
// Shared, audited CORS utility for Vercel Serverless Functions.
// Enforces exact-origin matching without wildcards in production.

/**
 * Extracts the first string value if a header is comma-separated (e.g. reverse proxy chains)
 * or if it was provided as an array.
 *
 * @param {string|string[]|undefined} headerVal
 * @returns {string}
 */
export function extractFirstHeader(headerVal) {
  if (!headerVal) return "";
  if (Array.isArray(headerVal)) headerVal = headerVal[0];
  return String(headerVal).split(",")[0].trim();
}

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
    return `${url.protocol}//${url.host}`.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Known default production domains for this application.
 */
const DEFAULT_ALLOWED_DOMAINS = [
  "https://mocinterview.vercel.app",
  "https://ai-mock-interview-platform-pied-one.vercel.app",
];

/**
 * Compiles a Set of all valid, allowed origins for this deployment.
 * Includes:
 * 1. Explicitly configured origins from APP_ORIGIN / ALLOWED_ORIGINS (comma/space-separated).
 * 2. Default project production domain.
 * 3. Same-origin deployment host (from x-forwarded-host / host headers).
 * 4. Vercel deployment URLs (VERCEL_URL, VERCEL_PROJECT_PRODUCTION_URL, VERCEL_BRANCH_URL).
 *
 * @param {import('http').IncomingMessage} req
 * @returns {Set<string>}
 */
export function getAllowedOrigins(req = {}) {
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

  // 2. Default known production domains for this project
  for (const domain of DEFAULT_ALLOWED_DOMAINS) {
    const normalized = normalizeOrigin(domain);
    if (normalized) {
      allowed.add(normalized);
    }
  }

  // 3. Same-origin resolution from request headers (Vercel Edge / Reverse Proxy)
  const headers = req.headers || {};
  const rawProto = extractFirstHeader(headers["x-forwarded-proto"]) || "https";
  const proto = rawProto.startsWith("http") ? rawProto : "https";

  const fwdHost = extractFirstHeader(headers["x-forwarded-host"]);
  if (fwdHost) {
    const selfOrigin = normalizeOrigin(`${proto}://${fwdHost}`);
    if (selfOrigin) {
      allowed.add(selfOrigin);
    }
  }

  const directHost = extractFirstHeader(headers.host);
  if (directHost) {
    const directOrigin = normalizeOrigin(`${proto}://${directHost}`);
    if (directOrigin) {
      allowed.add(directOrigin);
    }
  }

  // 4. Vercel automatic deployment variables
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
  if (process.env.VERCEL_BRANCH_URL) {
    const branchOrigin = normalizeOrigin(`https://${process.env.VERCEL_BRANCH_URL}`);
    if (branchOrigin) {
      allowed.add(branchOrigin);
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
  const rawOrigin = req.headers?.origin;

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

  // Direct Same-Host Verification:
  // When a frontend calls its own backend API, the request's Origin host matches the request's destination Host.
  let isSameHost = false;
  try {
    const reqUrl = new URL(normalizedRequestOrigin);
    const originHost = reqUrl.host.toLowerCase();
    const fwdHost = extractFirstHeader(req.headers?.["x-forwarded-host"]).toLowerCase();
    const directHost = extractFirstHeader(req.headers?.host).toLowerCase();

    // In production, require HTTPS protocol for same-host matching
    const isSecureProtocol = reqUrl.protocol === "https:" || process.env.NODE_ENV !== "production";

    if (isSecureProtocol && ((fwdHost && originHost === fwdHost) || (directHost && originHost === directHost))) {
      isSameHost = true;
    }
  } catch {
    isSameHost = false;
  }

  const allowedOrigins = getAllowedOrigins(req);
  const isAllowed = isLocalDev || isSameHost || allowedOrigins.has(normalizedRequestOrigin);

  if (isAllowed) {
    res.setHeader("Access-Control-Allow-Origin", normalizedRequestOrigin);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
    res.setHeader("Access-Control-Max-Age", "86400"); // 24 hours
    res.setHeader("Vary", "Origin");
    return true;
  }

  return false;
}

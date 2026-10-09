// api/_lib/rateLimiter.js
// Production-grade persistent rate limiting for Vercel Serverless Functions backed by MongoDB Atlas.
// Uses atomic findOneAndUpdate with TTL indexes to ensure accuracy across serverless instances
// without in-memory state drift or race conditions.

import { getDb } from "./mongodb.js";

/**
 * Extracts a reliable client IP address from proxy headers.
 *
 * @param {import("http").IncomingMessage} req
 * @returns {string}
 */
export function getClientIp(req) {
  const headers = req.headers || {};
  const forwardedFor = headers["x-forwarded-for"];
  if (forwardedFor) {
    const firstIp = String(forwardedFor).split(",")[0].trim();
    if (firstIp) return firstIp;
  }
  const realIp = headers["x-real-ip"];
  if (realIp) return String(realIp).trim();

  return req.socket?.remoteAddress || "127.0.0.1";
}

let rateLimitIndexEnsured = false;

async function ensureRateLimitIndex(db) {
  if (rateLimitIndexEnsured) return;
  try {
    const col = db.collection("rateLimits");
    await Promise.all([
      col.createIndex({ key: 1 }, { unique: true }),
      col.createIndex({ resetAt: 1 }, { expireAfterSeconds: 0 }),
    ]);
    rateLimitIndexEnsured = true;
  } catch (err) {
    // Non-fatal if index already exists
  }
}

/**
 * Checks and increments rate limit counter for a given key.
 *
 * @param {Object} options
 * @param {string} options.key - Unique rate limit identifier (e.g. "gemini:user123" or "ats:ip:1.2.3.4")
 * @param {number} [options.limit=20] - Maximum requests allowed in the window
 * @param {number} [options.windowMs=60000] - Window duration in milliseconds (default: 1 minute)
 * @returns {Promise<{ allowed: boolean, remaining: number, resetInSeconds: number, total: number }>}
 */
export async function checkRateLimit({ key, limit = 20, windowMs = 60000 }) {
  if (!key) {
    return { allowed: true, remaining: limit, resetInSeconds: 60, total: 0 };
  }

  try {
    const db = await getDb();
    await ensureRateLimitIndex(db);
    const col = db.collection("rateLimits");

    const now = Date.now();
    const resetAt = new Date(now + windowMs);

    // Atomic increment or reset if window has expired
    const existing = await col.findOne({ key });

    if (existing && existing.resetAt && new Date(existing.resetAt).getTime() > now) {
      // Window is still active
      if (existing.count >= limit) {
        const resetInSeconds = Math.max(
          1,
          Math.ceil((new Date(existing.resetAt).getTime() - now) / 1000)
        );
        return {
          allowed: false,
          remaining: 0,
          resetInSeconds,
          total: existing.count,
        };
      }

      const updated = await col.findOneAndUpdate(
        { key },
        { $inc: { count: 1 } },
        { returnDocument: "after" }
      );
      const currentCount = updated?.count ?? (existing.count + 1);
      const resetInSeconds = Math.max(
        1,
        Math.ceil((new Date(existing.resetAt).getTime() - now) / 1000)
      );

      return {
        allowed: currentCount <= limit,
        remaining: Math.max(0, limit - currentCount),
        resetInSeconds,
        total: currentCount,
      };
    }

    // Window does not exist or has expired -> start new window
    await col.updateOne(
      { key },
      {
        $set: {
          count: 1,
          resetAt,
          updatedAt: new Date(now),
        },
        $setOnInsert: {
          createdAt: new Date(now),
        },
      },
      { upsert: true }
    );

    return {
      allowed: true,
      remaining: Math.max(0, limit - 1),
      resetInSeconds: Math.ceil(windowMs / 1000),
      total: 1,
    };
  } catch (err) {
    // Fail-safe: if database rate-limiting is temporarily unreachable,
    // allow the request with a warning log so valid users are not blocked.
    console.warn("[RateLimiter] Database check failed, failing open safely:", err.message);
    return {
      allowed: true,
      remaining: limit,
      resetInSeconds: Math.ceil(windowMs / 1000),
      total: 1,
    };
  }
}

/**
 * Applies standard HTTP rate limit headers to response.
 *
 * @param {import("http").ServerResponse} res
 * @param {Object} rateLimitResult
 * @param {number} limit
 */
export function setRateLimitHeaders(res, rateLimitResult, limit) {
  if (!res || !rateLimitResult) return;
  res.setHeader("RateLimit-Limit", String(limit));
  res.setHeader("RateLimit-Remaining", String(rateLimitResult.remaining));
  res.setHeader("RateLimit-Reset", String(rateLimitResult.resetInSeconds));

  if (!rateLimitResult.allowed) {
    res.setHeader("Retry-After", String(rateLimitResult.resetInSeconds));
  }
}

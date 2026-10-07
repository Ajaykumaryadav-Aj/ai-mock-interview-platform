// src/services/atsService.js
// Production API service for ATS Resume Analysis and Optimization.
// Robustly parses HTTP responses, protects against empty/non-JSON payloads,
// and securely attaches Clerk authorization headers.

async function getAuthHeaders() {
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    if (typeof window !== "undefined" && window.Clerk?.session) {
      const token = await window.Clerk.session.getToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }
  } catch (err) {
    console.warn("[atsService] Could not retrieve Clerk session token:", err);
  }

  return headers;
}

/**
 * Safely reads and parses the HTTP response from the server.
 * Guarantees that empty, HTML, or malformed responses do not trigger unhandled
 * "Unexpected end of JSON input" SyntaxErrors on the client.
 *
 * @param {Response} res
 * @param {string} [actionLabel]
 * @returns {Promise<any>}
 */
async function parseResponseJson(res, actionLabel = "ATS Request") {
  const rawText = await res.text();
  const trimmed = (rawText || "").trim();

  // Handle completely empty responses
  if (!trimmed) {
    if (!res.ok) {
      throw new Error(`${actionLabel} failed: Server returned HTTP ${res.status} with an empty response.`);
    }
    throw new Error("ATS analysis API returned an empty response.");
  }

  // Attempt structured JSON parse
  let parsed;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    // Non-JSON response (e.g. HTML 502/404 page or raw text)
    if (!res.ok) {
      const cleanSnippet = trimmed.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").slice(0, 150).trim();
      throw new Error(cleanSnippet || `${actionLabel} failed with HTTP status ${res.status}.`);
    }
    throw new Error(`${actionLabel} failed: Invalid response format from server.`);
  }

  // Handle HTTP error statuses with structured JSON error details
  if (!res.ok) {
    const errorMsg =
      parsed.error ||
      parsed.message ||
      `${actionLabel} failed with HTTP status ${res.status}.`;
    throw new Error(errorMsg);
  }

  return parsed;
}

/**
 * Sends resume text and optional Job Description for ATS scoring and AI analysis.
 */
export const analyzeAtsResume = async ({
  resumeText,
  jobDescription = "",
  targetRole = "",
  resumeFileName = "resume.pdf",
  resumeFileSize = 0,
}) => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch("/api/ats?action=analyze", {
      method: "POST",
      headers,
      body: JSON.stringify({
        resumeText,
        jobDescription,
        targetRole,
        resumeFileName,
        resumeFileSize,
      }),
    });

    const data = await parseResponseJson(res, "ATS Analysis");
    return data.analysis || data;
  } catch (err) {
    console.error("[atsService.analyzeAtsResume]", err);
    throw err;
  }
};

/**
 * Retrieves the authenticated candidate's ATS scan history.
 */
export const getAtsHistory = async () => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch("/api/ats?action=history", {
      method: "GET",
      headers,
    });

    const data = await parseResponseJson(res, "Fetch ATS History");
    return data.history || [];
  } catch (err) {
    console.error("[atsService.getAtsHistory]", err);
    throw err;
  }
};

/**
 * Retrieves a single ATS report by ID.
 */
export const getAtsAnalysis = async (id) => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/ats?action=analysis&id=${encodeURIComponent(id)}`, {
      method: "GET",
      headers,
    });

    const data = await parseResponseJson(res, "Fetch Analysis");
    return data.analysis;
  } catch (err) {
    console.error("[atsService.getAtsAnalysis]", err);
    throw err;
  }
};

/**
 * Deletes an ATS analysis from user history.
 */
export const deleteAtsAnalysis = async (id) => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/ats?action=analysis&id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers,
    });

    const data = await parseResponseJson(res, "Delete Analysis");
    return data;
  } catch (err) {
    console.error("[atsService.deleteAtsAnalysis]", err);
    throw err;
  }
};

/**
 * Generates an improved, ATS-optimized resume draft and recalculates score deterministically.
 */
export const improveResume = async ({ resumeText, jobDescription = "", analysisId }) => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch("/api/ats?action=improve", {
      method: "POST",
      headers,
      body: JSON.stringify({
        resumeText,
        jobDescription,
        analysisId,
      }),
    });

    const data = await parseResponseJson(res, "Improve Resume");
    return data;
  } catch (err) {
    console.error("[atsService.improveResume]", err);
    throw err;
  }
};

/**
 * Bridges ATS report findings directly to Mock Interview room.
 * Creates an interview populated with targeted questions testing candidate's resume & skill gaps.
 */
export const createInterviewFromAts = async ({ analysisId, position }) => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch("/api/ats?action=create-interview", {
      method: "POST",
      headers,
      body: JSON.stringify({
        analysisId,
        position,
      }),
    });

    const data = await parseResponseJson(res, "Create Interview from ATS");
    return data;
  } catch (err) {
    console.error("[atsService.createInterviewFromAts]", err);
    throw err;
  }
};

/**
 * Retrieves candidate's ATS performance analytics and skill growth tracking.
 */
export const getAtsAnalytics = async () => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch("/api/ats?action=analytics", {
      method: "GET",
      headers,
    });

    const data = await parseResponseJson(res, "Fetch ATS Analytics");
    return data.analytics || {
      highestScore: 0,
      latestScore: 0,
      averageScore: 0,
      improvementPercent: 0,
      totalScans: 0,
      skillGrowthTracking: [],
      scoreTrend: [],
    };
  } catch (err) {
    console.error("[atsService.getAtsAnalytics]", err);
    return {
      highestScore: 0,
      latestScore: 0,
      averageScore: 0,
      improvementPercent: 0,
      totalScans: 0,
      skillGrowthTracking: [],
      scoreTrend: [],
    };
  }
};

export default {
  analyzeAtsResume,
  getAtsHistory,
  getAtsAnalysis,
  deleteAtsAnalysis,
  improveResume,
  createInterviewFromAts,
  getAtsAnalytics,
};

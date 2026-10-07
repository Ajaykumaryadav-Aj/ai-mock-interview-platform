// src/services/codingService.js
// Client service for Coding Round problem sets, code execution, submission, and history.

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
    console.warn("[codingService] Unable to retrieve Clerk token:", err.message);
  }

  return headers;
}

export const getCodingQuestions = async () => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch("/api/coding?action=questions", { method: "GET", headers });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch questions (${res.status})`);
    }
    const data = await res.json();
    return data.questions || [];
  } catch (err) {
    console.error("[codingService.getCodingQuestions]", err);
    throw err;
  }
};

export const getCodingQuestion = async (questionId) => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/coding?action=question&id=${encodeURIComponent(questionId)}`, {
      method: "GET",
      headers,
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch question (${res.status})`);
    }
    const data = await res.json();
    return data.question;
  } catch (err) {
    console.error("[codingService.getCodingQuestion]", err);
    throw err;
  }
};

export const runCodingCode = async ({ questionId, language, code, customInput, isCustomInput }) => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch("/api/coding?action=run", {
      method: "POST",
      headers,
      body: JSON.stringify({
        questionId,
        language,
        code,
        customInput,
        isCustomInput,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `Execution failed with status ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error("[codingService.runCodingCode]", err);
    throw err;
  }
};

export const submitCodingCode = async ({ questionId, language, code }) => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch("/api/coding?action=submit", {
      method: "POST",
      headers,
      body: JSON.stringify({
        questionId,
        language,
        code,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `Submission failed with status ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error("[codingService.submitCodingCode]", err);
    throw err;
  }
};

export const getCodingHint = async ({ questionId, hintLevel, currentCode, language }) => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch("/api/coding?action=hint", {
      method: "POST",
      headers,
      body: JSON.stringify({
        questionId,
        hintLevel,
        currentCode,
        language,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `Failed to retrieve hint (${res.status})`);
    }
    return data;
  } catch (err) {
    console.error("[codingService.getCodingHint]", err);
    throw err;
  }
};

export const getCodingHistory = async (filters = {}) => {
  try {
    const headers = await getAuthHeaders();
    const params = new URLSearchParams({ action: "history", ...filters });
    const res = await fetch(`/api/coding?${params.toString()}`, {
      method: "GET",
      headers,
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch history (${res.status})`);
    }
    const data = await res.json();
    return data.submissions || [];
  } catch (err) {
    console.error("[codingService.getCodingHistory]", err);
    throw err;
  }
};

export const getCodingSubmission = async (submissionId) => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/coding?action=submission&id=${encodeURIComponent(submissionId)}`, {
      method: "GET",
      headers,
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch submission (${res.status})`);
    }
    const data = await res.json();
    return data.submission || data;
  } catch (err) {
    console.error("[codingService.getCodingSubmission]", err);
    throw err;
  }
};

export const deleteCodingSubmission = async (submissionId) => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/coding?action=submission&id=${encodeURIComponent(submissionId)}`, {
      method: "DELETE",
      headers,
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to delete submission (${res.status})`);
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("[codingService.deleteCodingSubmission]", err);
    throw err;
  }
};


// src/services/interviewService.js
// Production-quality client service for Mock Interviews, User Answers, and Profiles.
// Backed by MongoDB Atlas via secure Vercel Serverless APIs (/api/*) and Clerk authentication.
// Replaces all previous Firebase/Firestore dependencies while preserving exact method signatures.

/**
 * Safely converts MongoDB ISO Date, Date object, timestamp number, or string to a JavaScript Date object.
 *
 * @param {any} timestamp
 * @returns {Date}
 */
export const safeToDate = (timestamp) => {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  if (typeof timestamp === "string" || typeof timestamp === "number") {
    const parsed = new Date(timestamp);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }
  if (timestamp.seconds !== undefined) {
    return new Date(timestamp.seconds * 1000);
  }
  return new Date();
};

/**
 * Helper to obtain Clerk session Authorization headers for API calls.
 */
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
    console.warn("[interviewService] Unable to retrieve Clerk token:", err.message);
  }

  return headers;
}

/**
 * Fetches all mock interviews created by the authenticated user.
 *
 * @param {string} [userId] - Optional; server derives authenticated user from Clerk session
 * @returns {Promise<Array<Object>>}
 */
export const getInterviews = async (userId) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch("/api/interviews", {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Failed to fetch interviews (HTTP ${response.status})`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching interviews:", error);
    throw new Error(error.message || "Failed to fetch interviews.");
  }
};

/**
 * Subscribes to updates for user interviews using a polling interval.
 * Preserves the exact signature previously used with Firestore's onSnapshot.
 *
 * @param {string} userId
 * @param {(interviews: Array<Object>) => void} onData
 * @param {(error: Error) => void} [onError]
 * @returns {() => void} Unsubscribe function
 */
export const subscribeToInterviews = (userId, onData, onError) => {
  let isCancelled = false;

  const fetchData = async () => {
    try {
      const interviewList = await getInterviews(userId);
      if (!isCancelled && typeof onData === "function") {
        onData(interviewList);
      }
    } catch (err) {
      if (!isCancelled && typeof onError === "function") {
        onError(err);
      }
    }
  };

  // Immediate initial load
  fetchData();

  // Periodic polling every 12 seconds to keep dashboard updated
  const intervalId = setInterval(fetchData, 12000);

  return () => {
    isCancelled = true;
    clearInterval(intervalId);
  };
};

/**
 * Fetches a single interview document by its ID.
 *
 * @param {string} interviewId
 * @returns {Promise<Object|null>}
 */
export const getInterviewById = async (interviewId) => {
  if (!interviewId || interviewId === "create") {
    return null;
  }

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`/api/interviews/${interviewId}`, {
      method: "GET",
      headers,
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Failed to fetch interview (HTTP ${response.status})`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching interview with ID ${interviewId}:`, error);
    throw new Error(error.message || "Failed to fetch interview details.");
  }
};

/**
 * Creates a new interview record in MongoDB Atlas.
 *
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export const createInterview = async (data) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch("/api/interviews", {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Failed to create interview (HTTP ${response.status})`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating interview document:", error);
    throw new Error(error.message || "Failed to create mock interview.");
  }
};

/**
 * Updates an existing interview document in MongoDB Atlas.
 *
 * @param {string} interviewId
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export const updateInterview = async (interviewId, data) => {
  if (!interviewId) {
    throw new Error("Interview ID is required to update an interview.");
  }

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`/api/interviews/${interviewId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Failed to update interview (HTTP ${response.status})`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error updating interview ${interviewId}:`, error);
    throw new Error(error.message || "Failed to update mock interview.");
  }
};

/**
 * Deletes an interview document and its associated user answers in MongoDB Atlas.
 *
 * @param {string} interviewId
 * @returns {Promise<{success: boolean, id: string}>}
 */
export const deleteInterview = async (interviewId) => {
  if (!interviewId) {
    throw new Error("Interview ID is required to delete an interview.");
  }

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`/api/interviews/${interviewId}`, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Failed to delete interview (HTTP ${response.status})`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error deleting interview ${interviewId}:`, error);
    throw new Error(error.message || "Failed to delete mock interview.");
  }
};

/**
 * Saves or updates a user's answer and AI evaluation in MongoDB Atlas.
 * Scoped to (mockIdRef, userId, question).
 *
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export const saveUserAnswer = async (data) => {
  const { mockIdRef, question } = data || {};

  if (!mockIdRef || !question) {
    throw new Error("mockIdRef and question are required to save an answer.");
  }

  try {
    const headers = await getAuthHeaders();
    const response = await fetch("/api/user-answers", {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Failed to save answer (HTTP ${response.status})`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving user answer:", error);
    throw new Error(error.message || "Failed to save your answer.");
  }
};

/**
 * Fetches all answers and AI feedback submitted for a specific interview.
 *
 * @param {string} interviewId
 * @param {string} [userId]
 * @returns {Promise<Array<Object>>}
 */
export const getUserAnswersForInterview = async (interviewId, userId) => {
  if (!interviewId) {
    throw new Error("interviewId is required to fetch feedbacks.");
  }

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `/api/user-answers?interviewId=${encodeURIComponent(interviewId)}`,
      {
        method: "GET",
        headers,
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Failed to fetch feedbacks (HTTP ${response.status})`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching user answers for interview:", error);
    throw new Error(error.message || "Failed to fetch interview feedback.");
  }
};

/**
 * Saves or updates a user profile document in MongoDB Atlas.
 *
 * @param {Object} data
 * @param {string} data.id - Clerk User ID
 * @param {string} [data.name]
 * @param {string} [data.email]
 * @param {string} [data.imageUrl]
 * @returns {Promise<void>}
 */
export const saveUserProfile = async (data) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch("/api/users", {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: data?.name,
        email: data?.email,
        imageUrl: data?.imageUrl,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Failed to save user profile (HTTP ${response.status})`);
    }
  } catch (error) {
    console.error("Error saving user profile:", error);
    throw new Error(error.message || "Failed to save user profile.");
  }
};

export default {
  getInterviews,
  subscribeToInterviews,
  getInterviewById,
  createInterview,
  updateInterview,
  deleteInterview,
  saveUserAnswer,
  getUserAnswersForInterview,
  saveUserProfile,
  safeToDate,
};

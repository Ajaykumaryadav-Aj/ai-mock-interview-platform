import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { db, auth } from "./firebase";

/**
 * Safely converts Firestore Timestamp, Date, or string to a JavaScript Date object.
 * Prevents runtime errors if a timestamp is pending or serialized.
 *
 * @param {any} timestamp
 * @returns {Date}
 */
export const safeToDate = (timestamp) => {
  if (!timestamp) return new Date();
  if (typeof timestamp.toDate === "function") {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
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
 * Fetches all mock interviews created by a specific user.
 *
 * @param {string} userId
 * @returns {Promise<Array<Object>>}
 */
export const getInterviews = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required to fetch interviews.");
  }

  try {
    const q = query(
      collection(db, "interviews"),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
  } catch (error) {
    console.error("Error fetching interviews:", error);
    throw new Error(error.message || "Failed to fetch interviews.");
  }
};

/**
 * Subscribes to real-time updates for user interviews.
 *
 * @param {string} userId
 * @param {(interviews: Array<Object>) => void} onData
 * @param {(error: Error) => void} [onError]
 * @returns {() => void} Unsubscribe function
 */
export const subscribeToInterviews = (userId, onData, onError) => {
  if (!userId) {
    throw new Error("User ID is required to subscribe to interviews.");
  }

  const q = query(
    collection(db, "interviews"),
    where("userId", "==", userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const interviewList = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      onData(interviewList);
    },
    (err) => {
      console.error("Firestore subscription error:", err);
      if (onError) onError(err);
    }
  );
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
    const docRef = doc(db, "interviews", interviewId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    };
  } catch (error) {
    console.error(`Error fetching interview with ID ${interviewId}:`, error);
    throw new Error(error.message || "Failed to fetch interview details.");
  }
};

/**
 * Creates a new interview record in Firestore.
 *
 * @param {Object} data
 * @param {string} data.userId
 * @param {string} data.position
 * @param {string} data.description
 * @param {number} data.experience
 * @param {string} data.techStack
 * @param {Array<{question: string, answer: string}>} data.questions
 * @returns {Promise<Object>}
 */
export const createInterview = async (data) => {
  if (!data?.userId) {
    throw new Error("User ID is required to create an interview.");
  }

  try {
    const docRef = await addDoc(collection(db, "interviews"), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      id: docRef.id,
      ...data,
    };
  } catch (error) {
    console.error(
      "Error creating interview document:",
      "code:", error.code,
      "message:", error.message
    );
    throw new Error(error.message || "Failed to create mock interview.");
  }
};

/**
 * Updates an existing interview document.
 *
 * @param {string} interviewId
 * @param {Object} data
 * @returns {Promise<void>}
 */
export const updateInterview = async (interviewId, data) => {
  if (!interviewId) {
    throw new Error("Interview ID is required to update an interview.");
  }

  try {
    const docRef = doc(db, "interviews", interviewId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`Error updating interview ${interviewId}:`, error);
    throw new Error(error.message || "Failed to update mock interview.");
  }
};

/**
 * Deletes an interview document and its associated answers.
 * Enforces ownership via Firestore security rules (request.auth.uid == resource.data.userId).
 *
 * @param {string} interviewId
 * @returns {Promise<{success: boolean, id: string}>}
 */
export const deleteInterview = async (interviewId) => {
  if (!interviewId) {
    throw new Error("Interview ID is required to delete an interview.");
  }

  try {
    // 1. Delete the interview document in Firestore
    await deleteDoc(doc(db, "interviews", interviewId));

    // 2. Best-effort cleanup of associated practice answers for this mock interview
    const currentUid = auth.currentUser?.uid;
    if (currentUid) {
      try {
        const answersQuery = query(
          collection(db, "userAnswers"),
          where("mockIdRef", "==", interviewId),
          where("userId", "==", currentUid)
        );
        const answersSnap = await getDocs(answersQuery);
        if (!answersSnap.empty) {
          const deletePromises = answersSnap.docs.map((d) => deleteDoc(d.ref));
          await Promise.all(deletePromises);
        }
      } catch (cleanupErr) {
        console.warn("Could not cleanup associated userAnswers:", cleanupErr);
      }
    }

    return { success: true, id: interviewId };
  } catch (error) {
    console.error(`Error deleting interview ${interviewId}:`, error);
    throw new Error(error.message || "Failed to delete mock interview.");
  }
};

/**
 * Saves or updates a user's answer and AI feedback for a specific question in an interview.
 * Scoped to the interview (mockIdRef) to prevent false duplicate collisions across different interviews.
 *
 * @param {Object} data
 * @param {string} data.mockIdRef - Interview ID
 * @param {string} data.userId
 * @param {string} data.question
 * @param {string} data.correct_ans
 * @param {string} data.user_ans
 * @param {string} data.feedback
 * @param {number} data.rating
 * @returns {Promise<Object>}
 */
export const saveUserAnswer = async (data) => {
  const { mockIdRef, userId, question } = data;

  if (!mockIdRef || !userId || !question) {
    throw new Error("mockIdRef, userId, and question are required to save an answer.");
  }

  try {
    // Check if user already answered this specific question in this specific interview
    const q = query(
      collection(db, "userAnswers"),
      where("mockIdRef", "==", mockIdRef),
      where("userId", "==", userId),
      where("question", "==", question)
    );

    const snap = await getDocs(q);

    if (!snap.empty) {
      // Update the existing answer instead of creating a conflicting duplicate or blocking the user
      const existingDoc = snap.docs[0];
      await updateDoc(doc(db, "userAnswers", existingDoc.id), {
        ...data,
        updatedAt: serverTimestamp(),
      });
      return { id: existingDoc.id, updated: true, ...data };
    }

    const docRef = await addDoc(collection(db, "userAnswers"), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { id: docRef.id, created: true, ...data };
  } catch (error) {
    console.error("Error saving user answer:", error);
    throw new Error(error.message || "Failed to save your answer.");
  }
};

/**
 * Fetches all answers and AI feedback submitted for a specific interview by a user.
 *
 * @param {string} interviewId
 * @param {string} userId
 * @returns {Promise<Array<Object>>}
 */
export const getUserAnswersForInterview = async (interviewId, userId) => {
  if (!interviewId || !userId) {
    throw new Error("interviewId and userId are required to fetch feedbacks.");
  }

  try {
    const q = query(
      collection(db, "userAnswers"),
      where("mockIdRef", "==", interviewId),
      where("userId", "==", userId)
    );

    const snap = await getDocs(q);
    return snap.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
  } catch (error) {
    console.error("Error fetching user answers for interview:", error);
    throw new Error(error.message || "Failed to fetch interview feedback.");
  }
};

/**
 * Saves or updates a user profile document in Firestore.
 *
 * @param {Object} data
 * @param {string} data.id - Clerk User ID
 * @param {string} [data.name]
 * @param {string} [data.email]
 * @param {string} [data.imageUrl]
 * @returns {Promise<void>}
 */
export const saveUserProfile = async (data) => {
  if (!data?.id) {
    throw new Error("User ID is required to save user profile.");
  }

  try {
    const userRef = doc(db, "users", data.id);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        id: data.id,
        name: data.name || "Anonymous",
        email: data.email || "N/A",
        imageUrl: data.imageUrl || "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(
        userRef,
        {
          name: data.name || userSnap.data()?.name || "Anonymous",
          email: data.email || userSnap.data()?.email || "N/A",
          imageUrl: data.imageUrl || userSnap.data()?.imageUrl || "",
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
  } catch (error) {
    console.error("Error saving user profile in Firestore:", error);
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

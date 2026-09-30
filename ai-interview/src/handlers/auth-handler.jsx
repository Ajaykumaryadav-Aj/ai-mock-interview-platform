import { useEffect, useRef, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/services/firebase";
import { saveUserProfile } from "@/services/interviewService";
import { useFirebaseAuthBridge } from "@/services/firebaseAuthBridge";

export const AuthHandler = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const syncedUserIdRef = useRef(null);

  // Tracks whether Firebase Auth has a verified user (after exchangeToken succeeds)
  const [firebaseUid, setFirebaseUid] = useState(null);

  // ── Clerk → Firebase Auth token bridge ────────────────────────────────────
  // Fires once per Clerk session. On success, auth.currentUser is set and the
  // onAuthStateChanged listener below picks it up.
  useFirebaseAuthBridge();

  // ── Listen for Firebase Auth state changes ────────────────────────────────
  // This is the source of truth for when Firestore writes are safe to make.
  // It updates firebaseUid as soon as signInWithCustomToken() completes.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      const uid = firebaseUser?.uid ?? null;
      console.log(
        "[AuthHandler] Firebase auth state changed:",
        uid ? `uid=${uid.slice(0, 8)}…` : "signed out"
      );
      setFirebaseUid(uid);
    });
    return () => unsubscribe();
  }, []);

  // ── Clerk user profile sync to Firestore users collection ─────────────────
  // Only runs AFTER Firebase Auth is established (firebaseUid is set).
  // This prevents PERMISSION_DENIED errors from writing before auth is ready.
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;
    if (!firebaseUid) {
      // Firebase Auth not yet established — bridge is still exchanging the token.
      // The effect will re-run automatically when firebaseUid is set.
      console.log("[AuthHandler] Waiting for Firebase Auth before syncing profile…");
      return;
    }
    if (syncedUserIdRef.current === user.id) return;

    const syncUserData = async () => {
      try {
        console.log(
          `[AuthHandler] Syncing profile — Clerk uid=${user.id.slice(0, 8)}…`,
          `Firebase uid=${firebaseUid.slice(0, 8)}…`
        );
        const userData = {
          id: user.id,
          name: user.fullName || user.firstName || "Anonymous",
          email: user.primaryEmailAddress?.emailAddress || "N/A",
          imageUrl: user.imageUrl || "",
        };
        await saveUserProfile(userData);
        syncedUserIdRef.current = user.id;
        console.log("[AuthHandler] ✅ User profile synced to Firestore.");
      } catch (error) {
        console.error("[AuthHandler] Error syncing user profile:", error.code, error.message);
      }
    };

    syncUserData();
  }, [isSignedIn, isLoaded, user, firebaseUid]);

  return null;
};

export default AuthHandler;

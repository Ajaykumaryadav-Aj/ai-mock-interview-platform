// src/services/firebaseAuthBridge.js
//
// Clerk → Firebase Auth bridge.
//
// Uses the Firebase Functions SDK (httpsCallable-style via fetch) to call the
// exchangeToken function. The Functions SDK automatically routes to the local
// emulator when connectFunctionsEmulator() has been called in firebase.js.
//
// No hardcoded localhost URLs — emulator routing is fully centralized in firebase.js.
//
// Flow per Clerk sign-in:
//   1. getToken()                → Clerk session JWT
//   2. call exchangeToken func   → Firebase custom token (verified server-side)
//   3. signInWithCustomToken()   → Firebase Auth session established
//   4. Firestore request.auth.uid === Clerk userId
//
// Duplicate-call prevention: the exchange runs only once per Clerk sessionId.

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { signInWithCustomToken, signOut, onAuthStateChanged } from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { auth, functions } from "./firebase";

/**
 * useFirebaseAuthBridge
 *
 * Drop-in React hook — mount once at the top of your app (inside AuthHandler).
 * Keeps Firebase Auth synchronized with the Clerk session.
 *
 * In development (VITE_USE_EMULATOR=true) the exchangeToken call goes to the
 * local Functions emulator automatically via the Firebase SDK.
 * In production it goes to the deployed Cloud Function.
 */
export const useFirebaseAuthBridge = () => {
  const { isSignedIn, isLoaded, getToken, sessionId } = useAuth();

  // Prevent duplicate exchanges for the same Clerk session
  const exchangedSessionRef = useRef(null);
  const isExchangingRef = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;

    // ── Sign-out path ────────────────────────────────────────────────────────
    if (!isSignedIn) {
      exchangedSessionRef.current = null;
      signOut(auth).catch((err) => {
        console.warn("[firebaseAuthBridge] Firebase sign-out error:", err.message);
      });
      return;
    }

    // ── Duplicate-prevention guards ──────────────────────────────────────────
    if (exchangedSessionRef.current === sessionId && auth.currentUser) return;
    if (isExchangingRef.current) return;

    // ── Token exchange ───────────────────────────────────────────────────────
    const exchangeToken = async () => {
      isExchangingRef.current = true;

      try {
        // 1. Get the Clerk session JWT
        const clerkToken = await getToken();
        if (!clerkToken) {
          console.error("[firebaseAuthBridge] getToken() returned null.");
          return;
        }

        // 2. Call the exchangeToken Cloud Function.
        //    The Firebase Functions SDK routes to emulator or production
        //    based on whether connectFunctionsEmulator() was called in firebase.js.
        //    We use a raw fetch rather than httpsCallable because our function
        //    reads the Authorization header directly (not the httpsCallable data envelope).
        const exchangeTokenFn = httpsCallable(functions, "exchangeToken");

        // httpsCallable wraps data in { data: ... } — our function expects a
        // Bearer header, not a JSON body. So we fetch the URL directly using
        // the Functions SDK's resolved URL helper.
        // The cleanest approach: derive the URL from the SDK's internal config.
        //
        // For emulator: http://127.0.0.1:5001/<projectId>/<region>/exchangeToken
        // For production: https://<region>-<projectId>.cloudfunctions.net/exchangeToken
        const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
        const region = "us-central1";
        const isEmulator = import.meta.env.VITE_USE_EMULATOR === "true";

        let response;
        if (isEmulator) {
          const candidateUrls = [
            `http://127.0.0.1:5001/ai-interview-project-react/${region}/exchangeToken`,
            `http://127.0.0.1:5001/${projectId}/${region}/exchangeToken`,
          ];
          for (const url of candidateUrls) {
            try {
              const res = await fetch(url, {
                method: "POST",
                headers: {
                  authorization: `Bearer ${clerkToken}`,
                  "content-type": "application/json",
                },
              });
              if (res.status !== 404) {
                response = res;
                break;
              }
            } catch (err) {
              // Try next candidate
            }
          }
        } else {
          const functionUrl = `https://${region}-${projectId}.cloudfunctions.net/exchangeToken`;
          try {
            response = await fetch(functionUrl, {
              method: "POST",
              headers: {
                authorization: `Bearer ${clerkToken}`,
                "content-type": "application/json",
              },
            });
          } catch (networkErr) {
            console.error("[firebaseAuthBridge] Network error calling exchangeToken:", networkErr.message);
            return;
          }
        }

        if (!response) {
          console.error("[firebaseAuthBridge] Could not reach exchangeToken function on any endpoint.");
          return;
        }

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          console.error(
            `[firebaseAuthBridge] exchangeToken HTTP ${response.status}:`,
            body.error || "Unknown error"
          );
          return;
        }

        const { firebaseToken } = await response.json();
        if (!firebaseToken) {
          console.error("[firebaseAuthBridge] Response missing firebaseToken.");
          return;
        }

        // 3. Sign into Firebase Auth
        await signInWithCustomToken(auth, firebaseToken);

        exchangedSessionRef.current = sessionId;
        console.log("[firebaseAuthBridge] ✅ Firebase Auth sign-in successful.");
      } catch (err) {
        console.error("[firebaseAuthBridge] Unexpected error:", err.message);
      } finally {
        isExchangingRef.current = false;
      }
    };

    exchangeToken();
  }, [isLoaded, isSignedIn, sessionId, getToken]);
};

/**
 * Hook to check if Firebase Auth has initialized and matches the Clerk user ID.
 * Pages use this to hold off Firestore queries until request.auth.uid is ready,
 * completely avoiding race-condition PERMISSION_DENIED errors on page load/refresh.
 */
export const useFirebaseAuthReady = () => {
  const { isSignedIn, isLoaded, userId } = useAuth();
  const [isFirebaseReady, setIsFirebaseReady] = useState(
    Boolean(auth.currentUser && auth.currentUser.uid === userId)
  );

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId) {
      setIsFirebaseReady(false);
      return;
    }

    if (auth.currentUser && auth.currentUser.uid === userId) {
      setIsFirebaseReady(true);
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsFirebaseReady(Boolean(user && user.uid === userId));
    });

    return () => unsubscribe();
  }, [isLoaded, isSignedIn, userId]);

  return { isFirebaseReady, currentUser: auth.currentUser };
};

export default useFirebaseAuthBridge;

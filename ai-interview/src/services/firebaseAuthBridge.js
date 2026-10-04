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
import { auth } from "./firebase";

/**
 * useFirebaseAuthBridge
 *
 * Drop-in React hook — mount once at the top of your app (inside AuthHandler).
 * Keeps Firebase Auth synchronized with the Clerk session.
 *
 * In production it calls the Vercel Serverless Function `/api/exchangeToken`.
 * In development (VITE_USE_EMULATOR=true) the exchangeToken call routes to the
 * local Functions emulator.
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

        // 2. Call exchangeToken
        //    In local emulator mode: test emulator URLs on 127.0.0.1:5001.
        //    In production: call Vercel Serverless Function /api/exchangeToken (never calls localhost or Cloud Functions).
        const isEmulator = import.meta.env.VITE_USE_EMULATOR === "true";
        let response;

        if (isEmulator) {
          const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || "ai-interview-1842f";
          const region = "us-central1";
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
            } catch {
              // Try next candidate
            }
          }
        } else {
          // Production: Vercel Serverless API Function
          const endpoint = import.meta.env.VITE_EXCHANGE_TOKEN_URL || "/api/exchangeToken";
          try {
            response = await fetch(endpoint, {
              method: "POST",
              headers: {
                authorization: `Bearer ${clerkToken}`,
                "content-type": "application/json",
              },
            });
          } catch (networkErr) {
            console.error("[firebaseAuthBridge] Network error calling /api/exchangeToken:", networkErr.message);
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

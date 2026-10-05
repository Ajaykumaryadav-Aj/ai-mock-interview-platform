// src/handlers/auth-handler.jsx
// Handles Clerk user profile synchronization with MongoDB Atlas via /api/users.
// Completely replaces the old Firebase Auth bridge and Firestore sync.

import { useEffect, useRef } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { saveUserProfile } from "@/services/interviewService";

export const AuthHandler = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const syncedUserIdRef = useRef(null);

  // Sync Clerk user profile to MongoDB Atlas users collection
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;
    if (syncedUserIdRef.current === user.id) return;

    const syncUserData = async () => {
      try {
        const userData = {
          id: user.id,
          name: user.fullName || user.firstName || "Anonymous",
          email: user.primaryEmailAddress?.emailAddress || "N/A",
          imageUrl: user.imageUrl || "",
        };
        await saveUserProfile(userData);
        syncedUserIdRef.current = user.id;
        console.info("[AuthHandler] User profile synced to MongoDB Atlas.");
      } catch (error) {
        console.error("[AuthHandler] Error syncing user profile:", error.message);
      }
    };

    syncUserData();
  }, [isSignedIn, isLoaded, user]);

  return null;
};

export default AuthHandler;

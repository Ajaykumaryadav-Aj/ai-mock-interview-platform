import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

const isEmulator = import.meta.env.VITE_USE_EMULATOR === "true";

const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || "ai-interview-1842f";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase safely (avoid duplicate initialization in Vite hot-reload)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Services
const db = getFirestore(app);
const auth = getAuth(app);
const functions = getFunctions(app);

// ── Emulator configuration ──────────────────────────────────────────────────
// When VITE_USE_EMULATOR=true (set in .env.local for local development),
// all three services connect to the local Firebase Emulator Suite instead
// of production Firebase.
//
// This flag is read at runtime in the browser so it MUST be a VITE_ variable.
// Production builds must NOT set VITE_USE_EMULATOR, so they use real Firebase.
//
// Guard against double-connection on Vite HMR (hot module reload) — the
// emulator SDK throws if you call connectXxxEmulator() more than once.
const EMULATOR_PORTS = {
  auth: 9099,
  firestore: 8080,
  functions: 5001,
};
const EMULATOR_HOST = "127.0.0.1";

if (import.meta.env.VITE_USE_EMULATOR === "true") {
  // Vite HMR guard — only connect once per page load
  if (!globalThis.__emulatorConnected) {
    globalThis.__emulatorConnected = true;

    connectAuthEmulator(auth, `http://${EMULATOR_HOST}:${EMULATOR_PORTS.auth}`, {
      disableWarnings: false, // keep the warning banner so dev/prod is obvious
    });

    connectFirestoreEmulator(db, EMULATOR_HOST, EMULATOR_PORTS.firestore);

    connectFunctionsEmulator(functions, EMULATOR_HOST, EMULATOR_PORTS.functions);

    console.info(
      `[Firebase] 🔧 DEV MODE — connected to emulators:\n` +
      `  Auth      → http://${EMULATOR_HOST}:${EMULATOR_PORTS.auth}\n` +
      `  Firestore → http://${EMULATOR_HOST}:${EMULATOR_PORTS.firestore}\n` +
      `  Functions → http://${EMULATOR_HOST}:${EMULATOR_PORTS.functions}\n` +
      `  💡 If you see net::ERR_CONNECTION_REFUSED, start emulators with 'npm run emulators' or set VITE_USE_EMULATOR=false in .env.local to use live Firebase.`
    );
  }
}

export { app, db, auth, functions, firebaseConfig, EMULATOR_HOST, EMULATOR_PORTS };
export default db;

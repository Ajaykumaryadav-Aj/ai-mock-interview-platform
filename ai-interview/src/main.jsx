import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ClerkProvider } from "@clerk/clerk-react";
import { ToasterProvider } from "./provider/toast-provider.jsx";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element '#root' not found in DOM.");
}

const root = createRoot(rootElement);

if (!PUBLISHABLE_KEY) {
  root.render(
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6 text-gray-800">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-amber-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
          <h2 className="text-xl font-bold text-amber-700">
            Setup Required: Clerk Authentication
          </h2>
        </div>
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          The application requires a Clerk Publishable Key to initialize authentication.
        </p>
        <div className="bg-gray-900 text-emerald-400 p-3 rounded-lg text-xs font-mono mb-4 break-all shadow-inner">
          VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">
          Configure this in your <code className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-mono">.env.local</code> file in the project directory. You can copy the template from <code className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-mono">.env.example</code>.
        </p>
      </div>
    </div>
  );
} else {
  root.render(
    <StrictMode>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <App />
        <ToasterProvider />
      </ClerkProvider>
    </StrictMode>
  );
}

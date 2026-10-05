import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import PublicLayouts from "@/layouts/PublicLayouts";
import HomePage from "@/Routes/Home";
import AuthenticationLayout from "@/layouts/AuthenticationLayout";
import SignInPage from "@/Routes/SignIn";
import SignUpPage from "@/Routes/SignUp";
import ProtectedRoutes from "@/layouts/ProtectedRoutesLayout";
import MainLayouts from "@/layouts/MainLayouts";
import { Generate } from "@/components/Generate";
import { Dashboard } from "@/Routes/Dashboard";
import { CreateEditPage } from "@/Routes/CreateEditPage";
import { MockLoadPage } from "@/Routes/MockLoadPage";
import { MockInterviewPage } from "@/Routes/MockInterviewPage";
import { LiveInterviewPage } from "@/Routes/LiveInterviewPage";
import { FeedBack } from "@/Routes/FeedBack";
import ContactPage from "@/Routes/Contact";
import AboutPage from "@/Routes/About";
import ServicesPage from "@/Routes/Services";
import { AuthHandler } from "@/handlers/auth-handler";

const App = () => {
  return (
    <Router>
      {/* Synchronizes Clerk user profile with MongoDB Atlas across all routes */}
      <AuthHandler />

      <Routes>
        {/* Public routes */}
        <Route element={<PublicLayouts />}>
          <Route index element={<HomePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
        </Route>

        {/* Authentication routes */}
        <Route element={<AuthenticationLayout />}>
          <Route path="/signin/*" element={<SignInPage />} />
          <Route path="/signup/*" element={<SignUpPage />} />
        </Route>

        {/* Protected routes - only render when authenticated */}
        <Route
          element={
            <ProtectedRoutes>
              <MainLayouts />
            </ProtectedRoutes>
          }
        >
          <Route element={<Generate />} path="/generate">
            <Route index element={<Dashboard />} />
            <Route path=":interviewId" element={<CreateEditPage />} />
            <Route path="interview/:interviewId" element={<MockLoadPage />} />
            <Route
              path="interview/:interviewId/start"
              element={<MockInterviewPage />}
            />
            <Route
              path="interview/:interviewId/live"
              element={<LiveInterviewPage />}
            />
            <Route path="feedback/:interviewId" element={<FeedBack />} />
          </Route>
        </Route>

        {/* Dashboard alias redirect */}
        <Route path="/dashboard" element={<Navigate to="/generate" replace />} />

        {/* Wildcard 404 fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;

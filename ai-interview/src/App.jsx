import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import PublicLayouts from "@/layouts/PublicLayouts";
import HomePage from "@/Routes/Home";
import AuthenticationLayout from "@/layouts/AuthenticationLayout";
import ProtectedRoutes from "@/layouts/ProtectedRoutesLayout";
import MainLayouts from "@/layouts/MainLayouts";
import { Generate } from "@/components/Generate";
import { AuthHandler } from "@/handlers/auth-handler";
import ScrollToTop from "@/components/ScrollToTop";
import LoaderPage from "@/Routes/Loaderpage";

// Lazy-loaded heavy authenticated interview routes (isolates WebCam, speech-to-text, and Gemini SDK)
const Dashboard = lazy(() => import("@/Routes/Dashboard"));
const CreateEditPage = lazy(() => import("@/Routes/CreateEditPage"));
const MockLoadPage = lazy(() => import("@/Routes/MockLoadPage"));
const MockInterviewPage = lazy(() => import("@/Routes/MockInterviewPage"));
const LiveInterviewPage = lazy(() => import("@/Routes/LiveInterviewPage"));
const FeedBack = lazy(() => import("@/Routes/FeedBack"));
const CodingIndexPage = lazy(() => import("@/Routes/CodingIndexPage"));
const CodingRoundPage = lazy(() => import("@/Routes/CodingRoundPage"));
const AtsResumePage = lazy(() => import("@/Routes/AtsResumePage"));

// Lazy-loaded public routes and resources
const ContactPage = lazy(() => import("@/Routes/Contact"));
const AboutPage = lazy(() => import("@/Routes/About"));
const ServicesPage = lazy(() => import("@/Routes/Services"));
const LandingPageRoute = lazy(() => import("@/Routes/LandingPageRoute"));
const BlogIndexRoute = lazy(() => import("@/Routes/BlogIndexRoute"));
const BlogPostRoute = lazy(() => import("@/Routes/BlogPostRoute"));
const NotFoundPage = lazy(() => import("@/Routes/NotFoundPage"));
const SignInPage = lazy(() => import("@/Routes/SignIn"));
const SignUpPage = lazy(() => import("@/Routes/SignUp"));

const App = () => {
  return (
    <Router>
      {/* Automatically reset window scroll to top on page navigation */}
      <ScrollToTop />

      {/* Synchronizes Clerk user profile with MongoDB Atlas across all routes */}
      <AuthHandler />

      <Suspense fallback={<LoaderPage className="w-full min-h-[60vh] h-auto" />}>
        <Routes>
          {/* Public marketing, landing pages, and resource routes */}
          <Route element={<PublicLayouts />}>
            <Route index element={<HomePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />

            {/* High-Intent SEO Landing Pages */}
            <Route path="/ai-mock-interview" element={<LandingPageRoute targetSlug="ai-mock-interview" />} />
            <Route path="/mock-interview" element={<LandingPageRoute targetSlug="mock-interview" />} />
            <Route path="/ai-interview-practice" element={<LandingPageRoute targetSlug="ai-interview-practice" />} />
            <Route path="/interview-preparation" element={<LandingPageRoute targetSlug="interview-preparation" />} />
            <Route path="/technical-interview" element={<LandingPageRoute targetSlug="technical-interview" />} />
            <Route path="/hr-interview" element={<LandingPageRoute targetSlug="hr-interview" />} />
            <Route path="/behavioral-interview" element={<LandingPageRoute targetSlug="behavioral-interview" />} />
            <Route path="/software-developer-interview" element={<LandingPageRoute targetSlug="software-developer-interview" />} />
            <Route path="/frontend-interview" element={<LandingPageRoute targetSlug="frontend-interview" />} />
            <Route path="/react-interview" element={<LandingPageRoute targetSlug="react-interview" />} />
            <Route path="/javascript-interview" element={<LandingPageRoute targetSlug="javascript-interview" />} />
            <Route path="/flutter-interview" element={<LandingPageRoute targetSlug="flutter-interview" />} />
            <Route path="/fresher-interview" element={<LandingPageRoute targetSlug="fresher-interview" />} />
            <Route path="/resume-interview" element={<LandingPageRoute targetSlug="resume-interview" />} />

            {/* ATS Resume Checker - Public SEO & High-Intent Routes */}
            <Route path="/ats-resume" element={<AtsResumePage />} />
            <Route path="/ats" element={<Navigate to="/ats-resume" replace />} />
            <Route path="/resume-score" element={<Navigate to="/ats-resume" replace />} />
            <Route path="/ats-checker" element={<Navigate to="/ats-resume" replace />} />
            <Route path="/resume-analyzer" element={<Navigate to="/ats-resume" replace />} />

            {/* Blog & Interview Guides */}
            <Route path="/blog" element={<BlogIndexRoute />} />
            <Route path="/blog/:slug" element={<BlogPostRoute />} />

            {/* 404 Route */}
            <Route path="/404" element={<NotFoundPage />} />
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

            {/* Dedicated Coding Round Protected Routes */}
            <Route path="/coding" element={<CodingIndexPage />} />
            <Route path="/coding/:questionId" element={<CodingRoundPage />} />
          </Route>

          {/* Dashboard alias redirect */}
          <Route path="/dashboard" element={<Navigate to="/generate" replace />} />

          {/* 404 catch-all route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;

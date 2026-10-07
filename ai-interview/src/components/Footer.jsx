import { useState } from "react";
import { Link } from "react-router-dom";
import Containers from "@/components/Containers";
import { SITE_NAME } from "@/config/site";
import { Sparkles, ArrowRight, ShieldCheck, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const FooterLink = ({ to, children }) => {
  return (
    <li>
      <Link
        to={to}
        className="text-gray-400 hover:text-emerald-400 transition-colors text-sm inline-flex items-center gap-1 group"
      >
        <span className="group-hover:translate-x-0.5 transition-transform">{children}</span>
      </Link>
    </li>
  );
};

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [legalModal, setLegalModal] = useState(null); // 'privacy' | 'terms' | null

  return (
    <footer className="w-full bg-neutral-950 text-gray-300 pt-16 pb-12 border-t border-neutral-800">
      <Containers className="space-y-12">
        {/* Top Brand Banner */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-10 border-b border-neutral-800">
          <div className="space-y-2">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-extrabold text-2xl tracking-tight text-white flex items-center gap-1.5">
                Moc<span className="text-emerald-400">Interview</span>
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </span>
            </Link>
            <p className="text-sm text-gray-400 max-w-md leading-relaxed">
              AI-powered mock interview practice platform for software developers, freshers, and career changers.
            </p>
          </div>

          <Link to="/generate">
            <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2">
              Start Free Practice <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>

        {/* 4-Column SaaS Footer Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1: PRODUCT */}
          <div className="space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-white">Product</h3>
            <ul className="space-y-2.5">
              <FooterLink to="/ats-resume">ATS Resume Checker</FooterLink>
              <FooterLink to="/ai-mock-interview">AI Mock Interview</FooterLink>
              <FooterLink to="/technical-interview">Interview Types</FooterLink>
              <FooterLink to="/resume-interview">Resume Interview</FooterLink>
              <FooterLink to="/generate">Practice Now</FooterLink>
            </ul>
          </div>

          {/* Column 2: RESOURCES */}
          <div className="space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-white">Resources</h3>
            <ul className="space-y-2.5">
              <FooterLink to="/blog/common-interview-questions">Interview Questions</FooterLink>
              <FooterLink to="/blog/how-to-prepare-for-an-interview">Interview Guides</FooterLink>
              <FooterLink to="/blog">Blog & Articles</FooterLink>
            </ul>
          </div>

          {/* Column 3: COMPANY */}
          <div className="space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-white">Company</h3>
            <ul className="space-y-2.5">
              <FooterLink to="/about">About MocInterview</FooterLink>
              <FooterLink to="/contact">Contact Support</FooterLink>
            </ul>
          </div>

          {/* Column 4: LEGAL */}
          <div className="space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-white">Legal</h3>
            <ul className="space-y-2.5">
              <li>
                <button
                  type="button"
                  onClick={() => setLegalModal("privacy")}
                  className="text-gray-400 hover:text-emerald-400 transition-colors text-sm text-left inline-flex items-center gap-1 group"
                >
                  <span className="group-hover:translate-x-0.5 transition-transform">Privacy Policy</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setLegalModal("terms")}
                  className="text-gray-400 hover:text-emerald-400 transition-colors text-sm text-left inline-flex items-center gap-1 group"
                >
                  <span className="group-hover:translate-x-0.5 transition-transform">Terms of Service</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {currentYear} {SITE_NAME}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/ai-mock-interview" className="hover:text-gray-400 transition-colors">
              AI Mock Interview
            </Link>
            <Link to="/about" className="hover:text-gray-400 transition-colors">
              About
            </Link>
            <Link to="/contact" className="hover:text-gray-400 transition-colors">
              Contact
            </Link>
            <Link to="/blog" className="hover:text-gray-400 transition-colors">
              Resources
            </Link>
          </div>
        </div>
      </Containers>

      {/* Privacy Policy Dialog */}
      <Dialog open={legalModal === "privacy"} onOpenChange={(open) => !open && setLegalModal(null)}>
        <DialogContent className="max-w-lg bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <ShieldCheck className="w-5 h-5 text-emerald-600" /> Privacy Policy
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Last updated: 2026. Your privacy and data isolation are our highest priority.
            </DialogDescription>
          </DialogHeader>
          <div className="text-sm text-gray-600 space-y-3 pt-2 max-h-[60vh] overflow-y-auto pr-2 leading-relaxed">
            <p>
              <strong>Data Protection:</strong> MocInterview collects only the minimal profile data required to generate personalized mock interview sessions and deliver performance evaluations.
            </p>
            <p>
              <strong>Audio & Video:</strong> Webcam and microphone streams are processed locally in your browser during your session. Video streams are never recorded or stored on our servers. Speech is transcribed solely to evaluate technical accuracy and verbal communication.
            </p>
            <p>
              <strong>Account & Session Isolation:</strong> Your interview history, ratings, and feedback are strictly isolated to your Clerk authentication account and are never shared with third parties or employers.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Terms of Service Dialog */}
      <Dialog open={legalModal === "terms"} onOpenChange={(open) => !open && setLegalModal(null)}>
        <DialogContent className="max-w-lg bg-white p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <FileText className="w-5 h-5 text-emerald-600" /> Terms of Service
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Platform rules and practice guidelines.
            </DialogDescription>
          </DialogHeader>
          <div className="text-sm text-gray-600 space-y-3 pt-2 max-h-[60vh] overflow-y-auto pr-2 leading-relaxed">
            <p>
              <strong>Educational Practice:</strong> MocInterview is an AI-powered simulation tool designed to help candidates prepare for real-world hiring rounds. Feedback scores and suggestions are algorithmic assessments intended for educational improvement.
            </p>
            <p>
              <strong>User Responsibility:</strong> Users are responsible for maintaining the confidentiality of their login credentials and ensuring content submitted (including resume texts) does not violate third-party confidentiality agreements.
            </p>
            <p>
              <strong>Fair Usage:</strong> Free sessions are provided to support career development. Automated scraping, malicious probing, or denial-of-service attempts will result in immediate account termination.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </footer>
  );
};

export default Footer;

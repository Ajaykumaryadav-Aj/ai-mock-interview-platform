// src/Routes/LandingPageRoute.jsx
// Dynamic, crawlable SEO landing page component for high-intent search queries

import { useParams, Navigate, Link } from "react-router-dom";
import Containers from "@/components/Containers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SEO } from "@/components/SEO";
import { LANDING_PAGES } from "@/data/landingPagesData";
import { SITE_URL } from "@/config/site";
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Brain,
  HelpCircle,
  BookOpen,
} from "lucide-react";

export const LandingPageRoute = ({ targetSlug }) => {
  const { slug: paramSlug } = useParams();
  const slug = targetSlug || paramSlug;
  const pageData = LANDING_PAGES[slug];

  if (!pageData) {
    return <Navigate to="/404" replace />;
  }

  // Schema for FAQPage
  const faqSchema =
    pageData.faqs && pageData.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: pageData.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }
      : null;

  // Breadcrumbs data
  const breadcrumbs = [
    { name: "Home", item: "/" },
    { name: pageData.h1, item: `/${pageData.slug}` },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50 to-gray-100 py-12">
      <SEO
        title={pageData.title}
        description={pageData.description}
        canonical={`/${pageData.slug}`}
        structuredData={faqSchema}
        breadcrumbs={breadcrumbs}
      />

      <Containers className="space-y-16">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <ol className="flex items-center gap-2">
            <li>
              <Link to="/" className="hover:text-emerald-600 transition-colors">
                Home
              </Link>
            </li>
            <li>/</li>
            <li className="text-emerald-700 font-medium truncate max-w-xs md:max-w-md">
              {pageData.title.split("|")[0].trim()}
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <section className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-200 px-3 py-1">
                {pageData.badge}
              </Badge>
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                {pageData.category} Track
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-emerald-800 leading-tight">
              {pageData.h1}
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              {pageData.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/generate">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-lg px-8 py-6 rounded-xl text-base flex items-center justify-center gap-2"
                >
                  Start Free AI Interview <ArrowRight className="w-5 h-5 ml-1" />
                </Button>
              </Link>
              <Link to="/blog">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-emerald-300 text-emerald-700 hover:bg-emerald-50 px-8 py-6 rounded-xl text-base"
                >
                  Explore Guides <BookOpen className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex-1 relative w-full max-w-lg mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-emerald-100 bg-white">
              <img
                src={pageData.heroImage || "/assets/img/hero.jpg"}
                alt={pageData.h1}
                className="w-full h-80 md:h-96 object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                <div className="text-white">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                    <Sparkles className="w-5 h-5" /> Instant AI Evaluation
                  </div>
                  <p className="text-sm text-gray-200">
                    Voice-enabled, role-calibrated interview simulation with model answer comparisons.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Highlights / Pillars */}
        <section className="bg-white/80 backdrop-blur-md rounded-2xl p-8 md:p-10 shadow-lg border border-emerald-100">
          <h2 className="text-2xl md:text-3xl font-bold text-emerald-800 mb-6 flex items-center gap-3">
            <ShieldCheck className="w-7 h-7 text-emerald-600" /> Key Features & Takeaways
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pageData.keyTakeaways.map((takeaway, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-gray-800 text-sm md:text-base leading-snug">{takeaway}</span>
              </div>
            ))}
          </div>
        </section>

        {/* In-Depth Overview & Curriculum */}
        <section className="space-y-8">
          <div className="max-w-3xl">
            <h2 className="text-2xl md:text-4xl font-bold text-emerald-800 mb-4">
              What You Practice in this Track
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              {pageData.overview}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pageData.curriculum.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white shadow-md border border-gray-100 hover:shadow-xl hover:border-emerald-200 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg mb-4">
                    {idx + 1}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contextual Intent Callout */}
        {pageData.contextualCallout && (
          <div className="p-5 md:p-6 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-950 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="font-bold text-sm md:text-base flex items-center gap-2 text-emerald-900">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                {pageData.contextualCallout.title}
              </div>
              <p className="text-xs md:text-sm text-emerald-800 leading-relaxed">
                {pageData.contextualCallout.description}
              </p>
            </div>
            {pageData.contextualCallout.links && (
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {pageData.contextualCallout.links.map((linkItem, lIdx) => (
                  <Link
                    key={lIdx}
                    to={linkItem.href}
                    className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 hover:text-emerald-900 transition-colors inline-flex items-center gap-1.5 shadow-xs"
                  >
                    {linkItem.label} <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Which interview practice is right for you? - Cross-Linking Comparison */}
        {(pageData.showIntentComparison ||
          ["ai-mock-interview", "mock-interview", "ai-interview-practice"].includes(slug)) && (
          <section className="bg-white/90 backdrop-blur-md rounded-2xl p-8 md:p-10 shadow-lg border border-emerald-100 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50 px-3 py-1 text-xs">
                Preparation Guide
              </Badge>
              <h2 className="text-2xl md:text-3xl font-extrabold text-emerald-800">
                Which interview practice is right for you?
              </h2>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                Choose the preparation format that best aligns with your timeline, comfort level, and target goals.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Option 1: AI Mock Interview */}
              <div
                className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                  slug === "ai-mock-interview"
                    ? "bg-emerald-50/50 border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                    : "bg-white border-gray-200 hover:border-emerald-300 shadow-sm"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md">
                      Full Simulation
                    </span>
                    {slug === "ai-mock-interview" && (
                      <span className="text-xs font-medium text-emerald-700 bg-white border border-emerald-200 px-2 py-0.5 rounded">
                        Active Page
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">AI Mock Interview</h3>
                  <p className="text-xs font-semibold text-emerald-700">
                    Best for realistic AI-powered interview simulation.
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                    Simulate realistic, complete interview rounds with adaptive AI questions, voice answers, and immediate diagnostic scoring.
                  </p>
                </div>
                <div className="pt-6">
                  <Link to="/ai-mock-interview" className="block">
                    <Button
                      variant={slug === "ai-mock-interview" ? "default" : "outline"}
                      className={`w-full text-xs md:text-sm font-semibold rounded-xl ${
                        slug === "ai-mock-interview"
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : "border-emerald-300 text-emerald-700 hover:bg-emerald-50 bg-white"
                      }`}
                    >
                      Try AI Mock Interview
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Option 2: Online Mock Interview */}
              <div
                className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                  slug === "mock-interview"
                    ? "bg-emerald-50/50 border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                    : "bg-white border-gray-200 hover:border-emerald-300 shadow-sm"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-100 px-2.5 py-1 rounded-md">
                      General Prep
                    </span>
                    {slug === "mock-interview" && (
                      <span className="text-xs font-medium text-emerald-700 bg-white border border-emerald-200 px-2 py-0.5 rounded">
                        Active Page
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Online Mock Interview</h3>
                  <p className="text-xs font-semibold text-teal-700">
                    Best for general interview simulation and preparation.
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                    Practice real interview pacing and question formats to overcome hesitation, anxiety, and build lasting confidence.
                  </p>
                </div>
                <div className="pt-6">
                  <Link to="/mock-interview" className="block">
                    <Button
                      variant={slug === "mock-interview" ? "default" : "outline"}
                      className={`w-full text-xs md:text-sm font-semibold rounded-xl ${
                        slug === "mock-interview"
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : "border-emerald-300 text-emerald-700 hover:bg-emerald-50 bg-white"
                      }`}
                    >
                      Explore Mock Interviews
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Option 3: AI Interview Practice */}
              <div
                className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                  slug === "ai-interview-practice"
                    ? "bg-emerald-50/50 border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                    : "bg-white border-gray-200 hover:border-emerald-300 shadow-sm"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md">
                      Targeted Drills
                    </span>
                    {slug === "ai-interview-practice" && (
                      <span className="text-xs font-medium text-emerald-700 bg-white border border-emerald-200 px-2 py-0.5 rounded">
                        Active Page
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">AI Interview Practice</h3>
                  <p className="text-xs font-semibold text-emerald-800">
                    Best for repeated practice and targeted improvement.
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                    Isolate and drill weak spots question-by-question. Enjoy instant AI critiques, review sample answers, and retry indefinitely.
                  </p>
                </div>
                <div className="pt-6">
                  <Link to="/ai-interview-practice" className="block">
                    <Button
                      variant={slug === "ai-interview-practice" ? "default" : "outline"}
                      className={`w-full text-xs md:text-sm font-semibold rounded-xl ${
                        slug === "ai-interview-practice"
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : "border-emerald-300 text-emerald-700 hover:bg-emerald-50 bg-white"
                      }`}
                    >
                      Start AI Practice
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* FAQs Section */}
        {pageData.faqs && pageData.faqs.length > 0 && (
          <section className="max-w-3xl mx-auto space-y-6">
            <div className="text-center space-y-3">
              <h2 className="text-2xl md:text-4xl font-bold text-emerald-800 flex items-center justify-center gap-2">
                <HelpCircle className="w-7 h-7 text-emerald-600" /> Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground">
                Everything you need to know about {pageData.title.split("|")[0].trim().toLowerCase()}.
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full bg-white rounded-2xl shadow-sm border border-emerald-100 p-4">
              {pageData.faqs.map((faq, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`} className="border-b last:border-b-0 py-2">
                  <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-emerald-700">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed text-sm pt-2">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        )}

        {/* Internal Linking / Related Tracks */}
        {pageData.relatedSlugs && pageData.relatedSlugs.length > 0 && (
          <section className="pt-8 border-t border-emerald-100">
            <h2 className="text-xl md:text-2xl font-bold text-emerald-800 mb-6">
              Explore Related Interview Practice Tracks
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {pageData.relatedSlugs.map((relSlug) => {
                const rel = LANDING_PAGES[relSlug];
                if (!rel) return null;
                return (
                  <Link
                    key={relSlug}
                    to={`/${relSlug}`}
                    className="p-4 rounded-xl bg-white shadow-sm border border-gray-200 hover:border-emerald-500 hover:shadow-md transition-all group"
                  >
                    <div className="font-semibold text-sm text-gray-800 group-hover:text-emerald-600 transition-colors">
                      {rel.title.split("|")[0].trim()}
                    </div>
                    <span className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Practice now <ArrowRight className="w-3 h-3" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Bottom CTA Banner */}
        <section className="rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-8 md:p-14 text-center shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Ready to Ace Your Next Interview?
            </h2>
            <p className="text-emerald-100 text-base md:text-lg">
              Join thousands of candidates preparing with MocInterview. Practice questions, get instant evaluation, and walk into interviews with unshakeable confidence.
            </p>
            <Link to="/generate">
              <Button
                size="lg"
                className="bg-white text-emerald-800 hover:bg-emerald-50 shadow-xl px-10 py-6 text-lg font-bold rounded-xl hover:scale-105 transition-transform"
              >
                Start Your Practice Session <Sparkles className="w-5 h-5 ml-2 text-emerald-600" />
              </Button>
            </Link>
          </div>
        </section>
      </Containers>
    </div>
  );
};

export default LandingPageRoute;

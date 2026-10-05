// src/Routes/BlogPostRoute.jsx
// Individual blog post and question guide with Article JSON-LD schema

import { useParams, Navigate, Link } from "react-router-dom";
import Containers from "@/components/Containers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SEO } from "@/components/SEO";
import { BLOG_ARTICLES } from "@/data/blogArticlesData";
import { SITE_URL } from "@/config/site";
import { Calendar, Clock, ArrowLeft, ArrowRight, Sparkles, BookOpen, Share2 } from "lucide-react";

export const BlogPostRoute = () => {
  const { slug } = useParams();
  const article = BLOG_ARTICLES[slug];

  if (!article) {
    return <Navigate to="/404" replace />;
  }

  // Article JSON-LD structured data
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.h1,
    description: article.description,
    author: {
      "@type": "Organization",
      name: "MocInterview",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "MocInterview",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/assets/favicon.png`,
      },
    },
    datePublished: article.publishDate,
    dateModified: article.publishDate,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${article.slug}`,
    },
    image: `${SITE_URL}/assets/img/og-mocinterview.png`,
  };

  const breadcrumbs = [
    { name: "Home", item: "/" },
    { name: "Blog", item: "/blog" },
    { name: article.h1, item: `/blog/${article.slug}` },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50 to-gray-100 py-12">
      <SEO
        title={article.title}
        description={article.description}
        canonical={`/blog/${article.slug}`}
        ogType="article"
        structuredData={articleSchema}
        breadcrumbs={breadcrumbs}
      />

      <Containers className="max-w-4xl space-y-12">
        {/* Back Link */}
        <div className="flex items-center justify-between text-sm">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to All Guides
          </Link>
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-200">
            {article.category}
          </Badge>
        </div>

        {/* Article Header */}
        <header className="space-y-6">
          <h1 className="text-3xl md:text-5xl font-extrabold text-emerald-800 leading-tight">
            {article.h1}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-2 border-b pb-6">
            <span className="font-semibold text-gray-800">{article.author}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" /> {article.publishDate}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" /> {article.readTime}
            </span>
          </div>

          <p className="text-lg md:text-xl text-gray-700 leading-relaxed font-normal bg-white/70 p-6 rounded-2xl border border-emerald-100 shadow-sm">
            {article.summary}
          </p>
        </header>

        {/* Article Body Sections */}
        <article className="space-y-10 text-gray-800 leading-relaxed">
          {article.sections.map((sec, idx) => (
            <section key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-emerald-800">
                {sec.heading}
              </h2>
              <div className="prose prose-emerald max-w-none text-base md:text-lg leading-relaxed space-y-4 whitespace-pre-line">
                {sec.content}
              </div>
            </section>
          ))}
        </article>

        {/* FAQs if present */}
        {article.faqs && article.faqs.length > 0 && (
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-emerald-100 space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-emerald-800">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {article.faqs.map((faq, idx) => (
                <AccordionItem key={idx} value={`faq-${idx}`}>
                  <AccordionTrigger className="font-semibold text-gray-900 text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        )}

        {/* In-Article CTA Banner */}
        <section className="rounded-3xl bg-gradient-to-r from-emerald-700 to-teal-700 text-white p-8 md:p-10 shadow-xl text-center space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold">
            Practice These Questions with Live AI Feedback
          </h2>
          <p className="text-emerald-100 text-sm md:text-base max-w-xl mx-auto">
            Test yourself on these exact topics. Get graded on technical accuracy, structure, and clarity in real time.
          </p>
          <Link to="/generate">
            <Button size="lg" className="bg-white text-emerald-800 hover:bg-emerald-50 font-bold px-8 py-4 rounded-xl shadow">
              Start Free AI Practice Session <Sparkles className="w-4 h-4 ml-2 text-emerald-600" />
            </Button>
          </Link>
        </section>

        {/* Related Articles */}
        {article.relatedSlugs && article.relatedSlugs.length > 0 && (
          <section className="pt-8 border-t border-emerald-100">
            <h2 className="text-2xl font-bold text-emerald-800 mb-6 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-emerald-600" /> Related Interview Guides
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {article.relatedSlugs.map((relSlug) => {
                const rel = BLOG_ARTICLES[relSlug];
                if (!rel) return null;
                return (
                  <Link
                    key={relSlug}
                    to={`/blog/${relSlug}`}
                    className="p-5 rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <Badge variant="outline" className="text-xs text-emerald-700 mb-2">
                        {rel.category}
                      </Badge>
                      <h3 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-2 text-sm">
                        {rel.title}
                      </h3>
                    </div>
                    <span className="text-xs text-emerald-600 font-semibold mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Read guide <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </Containers>
    </div>
  );
};

export default BlogPostRoute;

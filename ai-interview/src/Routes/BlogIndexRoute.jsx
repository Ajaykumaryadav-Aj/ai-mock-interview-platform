// src/Routes/BlogIndexRoute.jsx
// Crawlable blog directory and resource library for MocInterview

import { useState } from "react";
import { Link } from "react-router-dom";
import Containers from "@/components/Containers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { BLOG_ARTICLES } from "@/data/blogArticlesData";
import { BookOpen, ArrowRight, Clock, Calendar, Search } from "lucide-react";

export const BlogIndexRoute = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const articles = Object.values(BLOG_ARTICLES);
  const categories = ["All", ...new Set(articles.map((a) => a.category))];

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === "All" || article.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const breadcrumbs = [
    { name: "Home", item: "/" },
    { name: "Blog & Guides", item: "/blog" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50 to-gray-100 py-12">
      <SEO
        title="Interview Preparation Guides & Question Bank | MocInterview Blog"
        description="Free, in-depth interview preparation guides, technical coding breakdowns, STAR method answers, and HR screening advice for developers and freshers."
        canonical="/blog"
        breadcrumbs={breadcrumbs}
      />

      <Containers className="space-y-12">
        {/* Header */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-200">
            Resources & Question Bank
          </Badge>
          <h1 className="text-3xl md:text-5xl font-extrabold text-emerald-800 tracking-tight">
            Interview Guides, Tips & Question Banks
          </h1>
          <p className="text-base md:text-lg text-muted-foreground">
            In-depth guides crafted by engineering interviewers to help you ace your next technical, behavioral, and HR interview round.
          </p>

          {/* Search bar */}
          <div className="pt-4 max-w-lg mx-auto relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search interview questions, React, HR, STAR method..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
            />
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? "bg-emerald-600 text-white shadow-md"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-emerald-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Article Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map((article) => (
            <article
              key={article.slug}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-emerald-200 transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50">
                    {article.category}
                  </Badge>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {article.readTime}
                  </span>
                </div>

                <Link to={`/blog/${article.slug}`}>
                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                    {article.title}
                  </h2>
                </Link>

                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {article.summary}
                </p>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {article.publishDate}
                </span>
                <Link
                  to={`/blog/${article.slug}`}
                  className="text-xs font-semibold text-emerald-600 group-hover:text-emerald-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                >
                  Read Guide <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </section>

        {/* Bottom Banner */}
        <section className="rounded-3xl bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-8 md:p-12 text-center shadow-xl">
          <div className="max-w-xl mx-auto space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold">
              Ready to Put These Tips into Practice?
            </h2>
            <p className="text-emerald-100 text-sm md:text-base">
              Reading about questions is only half the battle. Rehearse them verbally in realistic AI mock interviews today.
            </p>
            <Link to="/generate">
              <Button size="lg" className="bg-white text-emerald-800 hover:bg-emerald-50 font-bold px-8 py-4 rounded-xl shadow">
                Launch Mock Interview
              </Button>
            </Link>
          </div>
        </section>
      </Containers>
    </div>
  );
};

export default BlogIndexRoute;

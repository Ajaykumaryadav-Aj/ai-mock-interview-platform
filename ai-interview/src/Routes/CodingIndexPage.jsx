// src/Routes/CodingIndexPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Containers from "@/components/Containers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { getCodingQuestions } from "@/services/codingService";
import { CODING_QUESTIONS, CODING_CATEGORIES } from "@/data/codingQuestionsData";
import {
  Code,
  Search,
  Sparkles,
  ArrowRight,
  Terminal,
  Cpu,
  Layers,
  CheckCircle2,
  Clock,
  Filter,
} from "lucide-react";

export const CodingIndexPage = () => {
  const [questions, setQuestions] = useState(CODING_QUESTIONS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  useEffect(() => {
    let isMounted = true;
    const fetchCatalog = async () => {
      try {
        const data = await getCodingQuestions();
        if (isMounted && data && data.length > 0) {
          setQuestions(data);
        }
      } catch {
        // Fallback to local definitions
      }
    };
    fetchCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "All" || q.category === selectedCategory;
    const matchesDiff = selectedDifficulty === "All" || q.difficulty === selectedDifficulty;
    return matchesSearch && matchesCat && matchesDiff;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-12">
      <SEO
        title="Coding Interview Round | Practice Real Programming Challenges | MocInterview"
        description="Master coding interview rounds with real server-side code execution in JavaScript, Python, Java, C++, C#, and Dart. Hidden test cases, and instant AI Code Review."
        canonical="/coding"
        noindex={true}
      />

      <Containers className="space-y-12">
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-700">
            <Terminal className="w-3.5 h-3.5 text-emerald-600" />
            Interactive Coding Practice Round
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-emerald-900 dark:text-emerald-100 tracking-tight">
            Crack Technical Coding Rounds
          </h1>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            Practice essential data structures and algorithms with real, isolated container execution, automated hidden test suites, and instant Gemini AI code analysis.
          </p>

          {/* Quick stats banner */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs md:text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Real Server-Side Sandbox
            </div>
            <div className="flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 6 Programming Languages
            </div>
            <div className="flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> AI Code Review & Complexity
            </div>
          </div>
        </section>

        {/* Filter & Search Bar */}
        <section className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-800 space-y-5">
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Search Input */}
            <div className="relative w-full md:flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by problem title, category, or algorithm..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Difficulty Filter */}
            <div className="flex items-center gap-1.5 w-full md:w-auto">
              <span className="text-xs font-semibold text-gray-500 hidden sm:inline">Difficulty:</span>
              {["All", "Easy", "Medium", "Hard"].map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedDifficulty === diff
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
            {CODING_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  selectedCategory === cat
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-900/60 dark:text-emerald-200"
                    : "bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-emerald-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Questions Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>Showing {filteredQuestions.length} Coding Problems</span>
            <span>Languages: JavaScript, Python, Java, C++, C#, Dart</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredQuestions.map((q) => {
              const diffColor =
                q.difficulty === "Easy"
                  ? "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
                  : q.difficulty === "Medium"
                  ? "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300"
                  : "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300";

              return (
                <div
                  key={q.id}
                  className="p-6 rounded-2xl bg-white dark:bg-gray-900 shadow-sm hover:shadow-lg border border-gray-200 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className={`px-2.5 py-0.5 text-xs font-semibold ${diffColor}`}>
                        {q.difficulty}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-gray-400" /> {q.category}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                      {q.title}
                    </h3>

                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {q.shortDescription}
                    </p>
                  </div>

                  <div className="pt-6 flex items-center justify-between border-t border-gray-100 dark:border-gray-800/80 mt-4">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-mono">
                      <span>JS</span>
                      <span>•</span>
                      <span>Py</span>
                      <span>•</span>
                      <span>Java</span>
                      <span>•</span>
                      <span>C++</span>
                      <span>•</span>
                      <span>C#</span>
                      <span>•</span>
                      <span>Dart</span>
                    </div>

                    <Link to={`/coding/${q.id}`}>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm group-hover:scale-105 transition-transform"
                      >
                        Start Coding <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredQuestions.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-2">
              <Search className="w-8 h-8 text-gray-400 mx-auto" />
              <div className="font-bold text-gray-800 dark:text-gray-200">No matching questions found</div>
              <p className="text-xs text-muted-foreground">Try clearing your filters or search terms.</p>
            </div>
          )}
        </section>
      </Containers>
    </div>
  );
};

export default CodingIndexPage;

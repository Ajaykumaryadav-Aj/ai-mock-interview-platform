// src/Routes/NotFoundPage.jsx
// User-friendly, SEO-safe 404 Not Found page

import { Link } from "react-router-dom";
import Containers from "@/components/Containers";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { ArrowLeft, Home, BookOpen, Compass } from "lucide-react";

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-white via-emerald-50 to-gray-100 py-16">
      <SEO
        title="404: Page Not Found | MocInterview"
        description="The page you are looking for does not exist or has been moved. Explore our AI mock interview tracks, practice sessions, and preparation guides."
        noindex={true}
        nofollow={true}
      />

      <Containers className="text-center max-w-xl space-y-6">
        <div className="text-7xl font-extrabold text-emerald-600 tracking-tight">404</div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          Page Not Found
        </h1>
        <p className="text-muted-foreground text-base">
          The link you followed may be broken or the page has been moved. Don't worry—you can still practice your interview skills or explore our guides below.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link to="/">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 rounded-xl">
              <Home className="w-4 h-4" /> Go to Homepage
            </Button>
          </Link>
          <Link to="/ai-mock-interview">
            <Button size="lg" variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 rounded-xl gap-2">
              <Compass className="w-4 h-4" /> AI Mock Interview
            </Button>
          </Link>
          <Link to="/blog">
            <Button size="lg" variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 rounded-xl gap-2">
              <BookOpen className="w-4 h-4" /> Explore Guides
            </Button>
          </Link>
        </div>
      </Containers>
    </div>
  );
};

export default NotFoundPage;

import Containers from "@/components/Containers";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { Briefcase, BookOpen, Users, Sparkles, Code, UserCheck, Target, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  {
    icon: <Code className="w-8 h-8 text-emerald-500" />,
    title: "Technical Interview Preparation",
    desc: "Master software engineering rounds, coding fundamentals, system architecture, and algorithmic trade-offs with instant AI feedback.",
    link: "/technical-interview",
    cta: "Practice Technical Interview",
  },
  {
    icon: <UserCheck className="w-8 h-8 text-emerald-500" />,
    title: "HR Interview Preparation",
    desc: "Polish behavioral stories, leadership principles, conflict resolution, and situational responses for human resources screenings.",
    link: "/hr-interview",
    cta: "Practice HR Interview",
  },
  {
    icon: <BookOpen className="w-8 h-8 text-emerald-500" />,
    title: "Resume-Based Interview Preparation",
    desc: "Get cross-examined on your actual resume projects, technical claims, and metrics by our intelligent AI interviewer.",
    link: "/resume-interview",
    cta: "Practice Resume Interview",
  },
  {
    icon: <Sparkles className="w-8 h-8 text-emerald-500" />,
    title: "AI Mock Interview Simulation",
    desc: "Simulate live hiring rounds with voice recording, question timers, objective scoring, and line-by-line benchmark answers.",
    link: "/ai-mock-interview",
    cta: "Start AI Mock Interview",
  },
  {
    icon: <Target className="w-8 h-8 text-emerald-500" />,
    title: "AI Interview Practice Drills",
    desc: "Engage in deliberate question-by-question practice sessions to isolate weak spots with unlimited retries and instant critique.",
    link: "/ai-interview-practice",
    cta: "Start Practice Drills",
  },
  {
    icon: <Briefcase className="w-8 h-8 text-emerald-500" />,
    title: "Comprehensive Interview Preparation",
    desc: "End-to-end preparation aligning your target job description with tailored questions, STAR coaching, and scoring.",
    link: "/interview-preparation",
    cta: "Explore Comprehensive Prep",
  },
];

export const ServicesPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50 to-gray-100 py-16">
      <SEO
        title="AI Interview Practice Services | MocInterview"
        description="Explore MocInterview's suite of AI mock interview services: technical interview prep, HR interviews, resume cross-examination, and practice drills."
        canonical="/services"
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "Services", item: "/services" },
        ]}
      />
      <Containers>
        {/* Hero Section */}
        <section className="mb-16 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-emerald-700 mb-4">
            Our Services
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Unlock your full potential with our suite of AI-powered career services. Whether you’re preparing for technical rounds, behavioral interviews, or resume defense, we’re here to help you succeed.
          </p>
        </section>

        {/* Service Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between p-8 rounded-2xl bg-white shadow-md hover:shadow-xl transition-all border border-gray-100 hover:border-emerald-200 group"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  {service.icon}
                </div>
                <h3 className="font-bold text-xl text-gray-900 group-hover:text-emerald-700 transition-colors">
                  {service.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                  {service.desc}
                </p>
              </div>
              <div className="pt-6">
                <Link to={service.link} className="w-full block">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400 transition-colors flex items-center justify-center gap-2 rounded-xl text-sm font-semibold"
                  >
                    {service.cta} <ArrowRight className="w-4 h-4 text-emerald-600" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </section>

        {/* Specialized Role Practice Tracks */}
        <section className="bg-white/80 backdrop-blur-md rounded-2xl p-8 md:p-10 shadow-lg border border-emerald-100 mb-16">
          <div className="max-w-2xl mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-emerald-800 mb-2">
              Role-Specific Interview Tracks
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Targeting a specific engineering discipline or experience tier? Practice with questions calibrated to industry requirements:
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { label: "Software Developer", href: "/software-developer-interview" },
              { label: "Frontend Engineer", href: "/frontend-interview" },
              { label: "React Developer", href: "/react-interview" },
              { label: "JavaScript Dev", href: "/javascript-interview" },
              { label: "Flutter Engineer", href: "/flutter-interview" },
              { label: "Fresher & College", href: "/fresher-interview" },
            ].map((track, i) => (
              <Link
                key={i}
                to={track.href}
                className="p-3 text-center rounded-xl bg-emerald-50/70 border border-emerald-200/80 hover:bg-emerald-100/90 hover:border-emerald-400 text-xs md:text-sm font-semibold text-emerald-800 transition-all shadow-xs"
              >
                {track.label}
              </Link>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center mt-12 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-10 md:p-14 text-white shadow-xl">
          <h2 className="text-2xl md:text-4xl font-extrabold mb-4">
            Ready to boost your interview confidence?
          </h2>
          <p className="text-emerald-100 max-w-xl mx-auto mb-8 text-base md:text-lg">
            Create an interview customized to your target role in seconds. Practice with AI, get graded on the spot, and land your next offer.
          </p>
          <Link to="/generate">
            <Button
              size="lg"
              className="bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl shadow-lg px-8 py-6 text-base font-bold hover:scale-105 transition-transform"
            >
              Get Started for Free <Sparkles className="ml-2 w-5 h-5 text-emerald-600" />
            </Button>
          </Link>
        </section>
      </Containers>
    </div>
  );
};

export default ServicesPage;

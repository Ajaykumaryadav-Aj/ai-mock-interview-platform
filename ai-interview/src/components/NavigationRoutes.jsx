import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { InterviewTypeRoutes, ResourceRoutes } from "@/lib/helper";
import { NavLink } from "react-router-dom";
import { ChevronDown, Code, UserCheck, MessageSquare, Laptop, Layers, Atom, FileCode, Smartphone, GraduationCap, FileText, BookOpen, Sparkles, HelpCircle } from "lucide-react";

const getInterviewIcon = (label) => {
  switch (label) {
    case "Technical Interview":
      return <Code className="w-4 h-4 text-emerald-600" />;
    case "HR Interview":
      return <UserCheck className="w-4 h-4 text-purple-600" />;
    case "Behavioral Interview":
      return <MessageSquare className="w-4 h-4 text-amber-600" />;
    case "Software Developer Interview":
      return <Laptop className="w-4 h-4 text-blue-600" />;
    case "Frontend Interview":
      return <Layers className="w-4 h-4 text-teal-600" />;
    case "React Interview":
      return <Atom className="w-4 h-4 text-sky-600" />;
    case "JavaScript Interview":
      return <FileCode className="w-4 h-4 text-yellow-600" />;
    case "Flutter Interview":
      return <Smartphone className="w-4 h-4 text-cyan-600" />;
    case "Fresher Interview":
      return <GraduationCap className="w-4 h-4 text-rose-600" />;
    case "Resume Interview":
      return <FileText className="w-4 h-4 text-emerald-600" />;
    default:
      return <Sparkles className="w-4 h-4 text-emerald-600" />;
  }
};

export default function NavigationRoutes({ isMobile = false, onItemClick }) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const interviewTypesRef = useRef(null);
  const resourcesRef = useRef(null);

  // Close dropdown on outside click (desktop)
  useEffect(() => {
    if (isMobile) return;
    const handleClickOutside = (event) => {
      if (
        interviewTypesRef.current &&
        !interviewTypesRef.current.contains(event.target) &&
        resourcesRef.current &&
        !resourcesRef.current.contains(event.target)
      ) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpenDropdown(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLinkClick = () => {
    setOpenDropdown(null);
    if (onItemClick) onItemClick();
  };

  if (isMobile) {
    return (
      <div className="flex flex-col w-full gap-5 text-left">
        <NavLink
          to="/"
          onClick={handleLinkClick}
          className={({ isActive }) =>
            cn(
              "text-base font-medium py-1 transition-colors",
              isActive ? "text-emerald-700 font-bold" : "text-gray-700 hover:text-gray-900"
            )
          }
        >
          Home
        </NavLink>

        <NavLink
          to="/ai-mock-interview"
          onClick={handleLinkClick}
          className={({ isActive }) =>
            cn(
              "text-base font-medium py-1 transition-colors",
              isActive ? "text-emerald-700 font-bold" : "text-gray-700 hover:text-gray-900"
            )
          }
        >
          AI Mock Interview
        </NavLink>

        <NavLink
          to="/coding"
          onClick={handleLinkClick}
          className={({ isActive }) =>
            cn(
              "text-base font-medium py-1 transition-colors flex items-center gap-2",
              isActive ? "text-emerald-700 font-bold" : "text-gray-700 hover:text-gray-900"
            )
          }
        >
          <Code className="w-4 h-4 text-emerald-600" />
          Coding Round
        </NavLink>

        <NavLink
          to="/ats-resume"
          onClick={handleLinkClick}
          className={({ isActive }) =>
            cn(
              "text-base font-medium py-1 transition-colors flex items-center gap-2",
              isActive ? "text-indigo-700 font-bold" : "text-gray-700 hover:text-gray-900"
            )
          }
        >
          <FileText className="w-4 h-4 text-indigo-600" />
          ATS Resume Score
        </NavLink>

        {/* Mobile Accordion / Collapsible for Interview Types */}
        <div className="flex flex-col gap-2 pt-1 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === "types" ? null : "types")}
            className="flex items-center justify-between text-base font-semibold text-gray-900 py-1"
          >
            <span>Interview Types</span>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-gray-500 transition-transform duration-200",
                openDropdown === "types" && "rotate-180 text-emerald-600"
              )}
            />
          </button>
          {openDropdown === "types" && (
            <div className="grid grid-cols-1 gap-1 pl-2 border-l-2 border-emerald-200">
              {InterviewTypeRoutes.map((track) => (
                <NavLink
                  key={track.href}
                  to={track.href}
                  onClick={handleLinkClick}
                  className="py-1.5 px-2 text-sm text-gray-600 hover:text-emerald-700 rounded-md hover:bg-emerald-50/50"
                >
                  {track.label}
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* Mobile Accordion for Resources */}
        <div className="flex flex-col gap-2 pt-1 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === "resources" ? null : "resources")}
            className="flex items-center justify-between text-base font-semibold text-gray-900 py-1"
          >
            <span>Resources</span>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-gray-500 transition-transform duration-200",
                openDropdown === "resources" && "rotate-180 text-emerald-600"
              )}
            />
          </button>
          {openDropdown === "resources" && (
            <div className="grid grid-cols-1 gap-1 pl-2 border-l-2 border-emerald-200">
              {ResourceRoutes.map((res) => (
                <NavLink
                  key={res.href}
                  to={res.href}
                  onClick={handleLinkClick}
                  className="py-1.5 px-2 text-sm text-gray-600 hover:text-emerald-700 rounded-md hover:bg-emerald-50/50"
                >
                  {res.label}
                </NavLink>
              ))}
            </div>
          )}
        </div>

        <NavLink
          to="/about"
          onClick={handleLinkClick}
          className={({ isActive }) =>
            cn(
              "text-base font-medium py-1 transition-colors border-t border-gray-100 pt-3",
              isActive ? "text-emerald-700 font-bold" : "text-gray-700 hover:text-gray-900"
            )
          }
        >
          About
        </NavLink>
      </div>
    );
  }

  // Desktop Navigation
  return (
    <ul className="flex items-center gap-0.5 lg:gap-1 xl:gap-2">
      <li>
        <NavLink
          to="/"
          className={({ isActive }) =>
            cn(
              "px-2.5 xl:px-3 py-1.5 xl:py-2 rounded-lg text-xs xl:text-sm font-medium whitespace-nowrap transition-colors",
              isActive
                ? "text-emerald-700 bg-emerald-50/60 font-semibold"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            )
          }
        >
          Home
        </NavLink>
      </li>

      <li>
        <NavLink
          to="/ai-mock-interview"
          className={({ isActive }) =>
            cn(
              "px-2.5 xl:px-3 py-1.5 xl:py-2 rounded-lg text-xs xl:text-sm font-medium whitespace-nowrap transition-colors",
              isActive
                ? "text-emerald-700 bg-emerald-50/60 font-semibold"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            )
          }
        >
          <span className="hidden xl:inline">AI </span>Mock Interview
        </NavLink>
      </li>

      <li>
        <NavLink
          to="/coding"
          className={({ isActive }) =>
            cn(
              "px-2.5 xl:px-3 py-1.5 xl:py-2 rounded-lg text-xs xl:text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 xl:gap-1.5",
              isActive
                ? "text-emerald-700 bg-emerald-50/60 font-semibold"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            )
          }
        >
          <Code className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Coding<span className="hidden xl:inline"> Round</span></span>
        </NavLink>
      </li>

      <li>
        <NavLink
          to="/ats-resume"
          className={({ isActive }) =>
            cn(
              "px-2.5 xl:px-3 py-1.5 xl:py-2 rounded-lg text-xs xl:text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 xl:gap-1.5",
              isActive
                ? "text-indigo-700 bg-indigo-50/60 font-semibold"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            )
          }
        >
          <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span>ATS <span className="hidden xl:inline">Resume </span>Score</span>
        </NavLink>
      </li>

      {/* Desktop Interview Types Dropdown */}
      <li
        ref={interviewTypesRef}
        className="relative"
        onMouseEnter={() => setOpenDropdown("types")}
        onMouseLeave={() => setOpenDropdown(null)}
      >
        <button
          type="button"
          onClick={() => setOpenDropdown(openDropdown === "types" ? null : "types")}
          aria-expanded={openDropdown === "types"}
          className={cn(
            "flex items-center gap-1 xl:gap-1.5 px-2.5 xl:px-3 py-1.5 xl:py-2 rounded-lg text-xs xl:text-sm font-medium whitespace-nowrap transition-colors",
            openDropdown === "types"
              ? "text-emerald-700 bg-emerald-50/60 font-semibold"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          )}
        >
          <span><span className="hidden xl:inline">Interview </span>Types</span>
          <ChevronDown
            className={cn(
              "w-3.5 h-3.5 transition-transform duration-200 text-gray-400 shrink-0",
              openDropdown === "types" && "rotate-180 text-emerald-600"
            )}
          />
        </button>

        {openDropdown === "types" && (
          <div className="absolute left-0 top-full pt-2 w-[540px] z-50 animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="bg-white rounded-2xl p-4 shadow-xl border border-gray-100 ring-1 ring-black/5 grid grid-cols-2 gap-2">
              {InterviewTypeRoutes.map((track) => (
                <NavLink
                  key={track.href}
                  to={track.href}
                  onClick={handleLinkClick}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-emerald-50/70 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-white shadow-xs shrink-0 mt-0.5 transition-colors">
                    {getInterviewIcon(track.label)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                      {track.label}
                    </div>
                    <div className="text-xs text-gray-500 line-clamp-1 leading-snug">
                      {track.desc}
                    </div>
                  </div>
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </li>

      {/* Desktop Resources Dropdown */}
      <li
        ref={resourcesRef}
        className="relative"
        onMouseEnter={() => setOpenDropdown("resources")}
        onMouseLeave={() => setOpenDropdown(null)}
      >
        <button
          type="button"
          onClick={() => setOpenDropdown(openDropdown === "resources" ? null : "resources")}
          aria-expanded={openDropdown === "resources"}
          className={cn(
            "flex items-center gap-1 xl:gap-1.5 px-2.5 xl:px-3 py-1.5 xl:py-2 rounded-lg text-xs xl:text-sm font-medium whitespace-nowrap transition-colors",
            openDropdown === "resources"
              ? "text-emerald-700 bg-emerald-50/60 font-semibold"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          )}
        >
          <span>Resources</span>
          <ChevronDown
            className={cn(
              "w-3.5 h-3.5 transition-transform duration-200 text-gray-400 shrink-0",
              openDropdown === "resources" && "rotate-180 text-emerald-600"
            )}
          />
        </button>

        {openDropdown === "resources" && (
          <div className="absolute left-0 top-full pt-2 w-80 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="bg-white rounded-2xl p-3 shadow-xl border border-gray-100 ring-1 ring-black/5 flex flex-col gap-1.5">
              {ResourceRoutes.map((res) => (
                <NavLink
                  key={res.href}
                  to={res.href}
                  onClick={handleLinkClick}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-emerald-50/70 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-white shadow-xs shrink-0 mt-0.5 transition-colors">
                    {res.label.includes("Questions") ? (
                      <HelpCircle className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <BookOpen className="w-4 h-4 text-teal-600" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                      {res.label}
                    </div>
                    <div className="text-xs text-gray-500 line-clamp-1 leading-snug">
                      {res.desc}
                    </div>
                  </div>
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </li>

      <li>
        <NavLink
          to="/about"
          className={({ isActive }) =>
            cn(
              "px-2.5 xl:px-3 py-1.5 xl:py-2 rounded-lg text-xs xl:text-sm font-medium whitespace-nowrap transition-colors",
              isActive
                ? "text-emerald-700 bg-emerald-50/60 font-semibold"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            )
          }
        >
          About
        </NavLink>
      </li>
    </ul>
  );
}

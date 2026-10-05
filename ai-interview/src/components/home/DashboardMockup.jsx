import React from "react";
import {
  Calendar,
  Clock,
  TrendingUp,
  Sparkles,
  Award,
  ChevronRight,
  Code,
  UserCheck,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const DashboardMockup = () => {
  const recentInterviews = [
    {
      role: "Senior React Engineer",
      type: "Technical & System Design",
      score: "9.1/10",
      date: "Yesterday",
      status: "Completed",
      badgeColor: "bg-emerald-100 text-emerald-800",
      icon: <Code className="w-4 h-4 text-emerald-600" />,
    },
    {
      role: "Engineering Team Lead",
      type: "Behavioral & Leadership (STAR)",
      score: "8.6/10",
      date: "3 days ago",
      status: "Completed",
      badgeColor: "bg-purple-100 text-purple-800",
      icon: <UserCheck className="w-4 h-4 text-purple-600" />,
    },
    {
      role: "Full-Stack Developer",
      type: "Resume Cross-Examination",
      score: "8.8/10",
      date: "Oct 2",
      status: "Completed",
      badgeColor: "bg-blue-100 text-blue-800",
      icon: <FileText className="w-4 h-4 text-blue-600" />,
    },
  ];

  return (
    <div className="w-full max-w-lg mx-auto rounded-3xl bg-white border border-gray-200 shadow-xl overflow-hidden text-left">
      {/* Top Header */}
      <div className="p-5 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
            Candidate Analytics
          </div>
          <h4 className="font-bold text-base text-gray-900 mt-0.5">
            Preparation Progress
          </h4>
        </div>

        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 font-mono text-xs">
          +18% Score Growth
        </Badge>
      </div>

      <div className="p-5 space-y-5">
        {/* Trend Highlight Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between shadow-md">
          <div className="space-y-1">
            <div className="text-xs text-emerald-100 font-medium">
              Average Interview Readiness
            </div>
            <div className="text-2xl font-black">
              8.8 <span className="text-sm font-normal text-emerald-200">/ 10</span>
            </div>
            <div className="text-[11px] text-emerald-100/90 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Ready for Top Tier Tech Screens
            </div>
          </div>

          <div className="h-14 w-28 flex items-end gap-1.5 px-2 py-1 bg-white/10 rounded-xl border border-white/20">
            <div className="w-4 bg-white/40 rounded-t h-[40%]"></div>
            <div className="w-4 bg-white/60 rounded-t h-[60%]"></div>
            <div className="w-4 bg-white/80 rounded-t h-[75%]"></div>
            <div className="w-4 bg-white rounded-t h-[95%]"></div>
          </div>
        </div>

        {/* Recent Session History List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
            <span>Recent Completed Sessions</span>
            <span className="text-emerald-700 font-normal capitalize">All Saved</span>
          </div>

          <div className="space-y-2">
            {recentInterviews.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-white border border-gray-100">
                    {item.icon}
                  </div>
                  <div>
                    <h5 className="font-semibold text-xs text-gray-900 group-hover:text-emerald-700 transition-colors">
                      {item.role}
                    </h5>
                    <p className="text-[11px] text-gray-500">{item.type}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-gray-900">
                    {item.score}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardMockup;

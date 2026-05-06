"use client";

// Convex integration ready — useQuery commented out for mock mode
// import { useQuery } from "convex/react";
// import { api } from "@convex/_generated/api";
import Link from "next/link";
import {
  BookOpen, Plus, Brain, Target, Repeat, Timer,
  BarChart3, TrendingUp, FileText, ChevronRight,
  Sparkles, GraduationCap, ClipboardList, Clock,
} from "lucide-react";

const mockNotebooks = [
  { _id: "nb1", title: "Biology 101", description: "Cell biology, genetics, and evolution", subject: "Biology", color: "#10b981", icon: "🧬", createdAt: Date.now() - 86400000 * 7 },
  { _id: "nb2", title: "MCAT Prep", description: "Comprehensive MCAT study materials", subject: "Medicine", color: "#6366f1", icon: "🩺", createdAt: Date.now() - 86400000 * 14 },
  { _id: "nb3", title: "Machine Learning", description: "CS229 lecture notes and papers", subject: "Computer Science", color: "#f59e0b", icon: "🤖", createdAt: Date.now() - 86400000 * 3 },
  { _id: "nb4", title: "Organic Chemistry", description: "Reactions, mechanisms, and synthesis", subject: "Chemistry", color: "#ef4444", icon: "⚗️", createdAt: Date.now() - 86400000 * 21 },
];

export default function DashboardPage() {
  const notebooks = mockNotebooks;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome back, Sean</h1>
          <p className="text-slate-500 mt-1">Your AI-powered learning platform</p>
        </div>
        <Link
          href="/notebook/new"
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Notebook
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <QuickStat icon={BookOpen} label="Notebooks" value={notebooks.length} color="indigo" />
        <QuickStat icon={Target} label="Due for Review" value={12} color="amber" />
        <QuickStat icon={TrendingUp} label="Avg Mastery" value="73%" color="emerald" />
        <QuickStat icon={Clock} label="Study Streak" value="5 days" color="violet" />
      </div>

      {/* Notebooks Grid */}
      <h2 className="text-xl font-bold text-slate-900 mb-4">Your Notebooks</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {notebooks.map((nb) => (
          <Link
            key={nb._id}
            href={`/notebook/${nb._id}`}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-indigo-200 transition-all group"
          >
            <div className="h-2" style={{ backgroundColor: nb.color }} />
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{nb.icon}</span>
                  <div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">
                      {nb.title}
                    </h3>
                    <p className="text-xs text-slate-500">{nb.subject}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
              </div>
              <p className="text-sm text-slate-600 mb-4">{nb.description}</p>

              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  4 materials
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  8 units
                </span>
                <span className="flex items-center gap-1">
                  <Target className="w-3.5 h-3.5" />
                  68% mastery
                </span>
              </div>
            </div>
          </Link>
        ))}

        {/* New Notebook Card */}
        <Link
          href="/notebook/new"
          className="bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center p-8 hover:border-indigo-400 hover:bg-indigo-50 transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-3 shadow-sm group-hover:shadow-md transition-shadow">
            <Plus className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <p className="font-medium text-slate-600 group-hover:text-indigo-700 transition-colors">
            Create Notebook
          </p>
          <p className="text-xs text-slate-400 mt-1">Biology, MCAT, CS, and more</p>
        </Link>
      </div>
    </div>
  );
}

function QuickStat({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  const colors: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-600",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
    violet: "bg-violet-50 text-violet-600",
  };
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

"use client";

import { NotebookLayout } from "../notebook-layout";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  TrendingUp, Brain, Target, Clock, Award,
  BarChart3, ChevronRight, Calendar, Trophy,
  Star, Zap,
} from "lucide-react";

const mockNotebook = { title: "Biology 101", color: "#10b981" };

const progressData = {
  overall: 48,
  thisWeek: { minutes: 180, sessions: 5, mastered: 1, quizzesTaken: 8 },
  units: [
    { title: "Cell Structure", mastery: 92, status: "mastered", estimatedMinutes: 45 },
    { title: "Cellular Respiration", mastery: 62, status: "practicing", estimatedMinutes: 60 },
    { title: "DNA & Protein Synthesis", mastery: 38, status: "learning", estimatedMinutes: 55 },
    { title: "Genetics & Inheritance", mastery: 0, status: "not_started", estimatedMinutes: 70 },
  ],
  weakAreas: [
    { topic: "Electron Transport Chain", mastery: 28, unit: "Cellular Respiration" },
    { topic: "Krebs Cycle", mastery: 45, unit: "Cellular Respiration" },
    { topic: "Translation", mastery: 32, unit: "DNA & Protein Synthesis" },
  ],
  streak: 7,
  totalCards: 65,
  cardsMastered: 23,
};

export default function ProgressPage() {
  const params = useParams();
  const notebookId = params.id as string;
  const notebook = mockNotebook;

  return (
    <NotebookLayout notebookId={notebookId} notebookTitle={notebook.title} notebookColor={notebook.color}>
      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={TrendingUp} label="Overall Mastery" value={`${progressData.overall}%`} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard icon={Clock} label="This Week" value={`${progressData.thisWeek.minutes} min`} color="text-blue-600" bg="bg-blue-50" />
        <StatCard icon={Calendar} label="Study Streak" value={`${progressData.streak} days`} color="text-amber-600" bg="bg-amber-50" />
        <StatCard icon={Award} label="Units Mastered" value={`${progressData.thisWeek.mastered}`} color="text-violet-600" bg="bg-violet-50" />
      </div>

      {/* Unit Mastery Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h3 className="font-bold text-slate-900 mb-4">Unit Mastery Progress</h3>
        <div className="space-y-4">
          {progressData.units.map((unit) => (
            <div key={unit.title}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-700">{unit.title}</span>
                <span className="text-sm font-bold" style={{ color: unit.mastery >= 80 ? "#10b981" : unit.mastery >= 50 ? "#f59e0b" : "#94a3b8" }}>
                  {unit.mastery}%
                </span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${unit.mastery}%`,
                    backgroundColor: unit.mastery >= 80 ? "#10b981" : unit.mastery >= 50 ? "#f59e0b" : unit.mastery > 0 ? "#6366f1" : "#e2e8f0",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weak Areas */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h3 className="font-bold text-slate-900 mb-4">Areas to Review</h3>
        <div className="space-y-3">
          {progressData.weakAreas.map((area) => (
            <div key={area.topic} className="flex items-center gap-4 p-3 bg-red-50 rounded-lg border border-red-100">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                <Target className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">{area.topic}</p>
                <p className="text-xs text-slate-500">{area.unit}</p>
              </div>
              <span className="text-sm font-bold text-red-600">{area.mastery}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Flashcard Stats */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-bold text-slate-900 mb-4">Flashcard Progress</h3>
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="10" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#6366f1" strokeWidth="10" strokeDasharray={`${(progressData.cardsMastered / progressData.totalCards) * 251.2} 251.2`} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-slate-900">{progressData.cardsMastered}/{progressData.totalCards}</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-600">Cards mastered this session</p>
            <p className="text-lg font-bold text-indigo-600">23 of 65</p>
          </div>
        </div>
      </div>
    </NotebookLayout>
  );
}

function StatCard({ icon: Icon, label, value, color, bg }: any) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    </div>
  );
}

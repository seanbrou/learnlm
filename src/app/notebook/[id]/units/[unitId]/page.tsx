"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { NotebookLayout } from "../../notebook-layout";
import {
  BookOpen, ChevronRight, Target,
  Clock, Brain, GraduationCap, Repeat,
  Lightbulb, ClipboardList, Award, PlayCircle,
  Zap, AlertTriangle, FileText,
  Check,
} from "lucide-react";

const mockNotebook = { title: "Biology 101", color: "#10b981", icon: "🧬" };

const mockUnit = {
  _id: "u2",
  number: 2,
  title: "Cellular Respiration",
  overview: "Understand how cells extract energy from nutrients through a series of interconnected metabolic pathways.",
  objectives: [
    "Explain the three stages of cellular respiration",
    "Calculate net ATP yield from glucose",
    "Describe the role of electron carriers",
    "Compare aerobic and anaerobic respiration",
  ],
  prerequisites: ["Cell Structure (Unit 1)", "Basic chemistry knowledge"],
  estimatedMinutes: 60,
  difficulty: "intermediate" as "beginner" | "intermediate" | "advanced",
  mastery: 62,
  subunits: [
    { _id: "s1", title: "Glycolysis", mastery: 78, desc: "Breakdown of glucose into pyruvate in the cytoplasm" },
    { _id: "s2", title: "Krebs Cycle", mastery: 45, desc: "Citric acid cycle in the mitochondrial matrix" },
    { _id: "s3", title: "Electron Transport Chain", mastery: 28, desc: "Proton gradient creation on the inner membrane" },
    { _id: "s4", title: "ATP Synthase & Chemiosmosis", mastery: 55, desc: "ATP production driven by the proton gradient" },
  ],
};

const activityGroups = [
  {
    label: "Learn",
    color: "indigo",
    activities: [
      { icon: BookOpen, title: "AI Lesson", desc: "Generated lesson from your materials", href: "/learn" },
      { icon: FileText, title: "Key Terms", desc: "15 terms with definitions", href: "/learn" },
      { icon: Lightbulb, title: "Worked Examples", desc: "Step-by-step walkthroughs", href: "/learn" },
    ],
  },
  {
    label: "Practice",
    color: "amber",
    activities: [
      { icon: Brain, title: "Flashcards", desc: "18 cards for active memorization", href: "/flashcards" },
      { icon: Repeat, title: "Active Recall", desc: "Test memory without looking", href: "/recall" },
      { icon: ClipboardList, title: "Quick Quiz", desc: "20 questions with feedback", href: "/quiz" },
    ],
  },
  {
    label: "Assess",
    color: "red",
    activities: [
      { icon: AlertTriangle, title: "Misconception Checks", desc: "8 common pitfalls addressed", href: "/recall" },
      { icon: GraduationCap, title: "Exam Questions", desc: "Harder, test-level problems", href: "/exam" },
      { icon: Award, title: "Unit Mastery Test", desc: "Earn mastery badge — 80%+", href: "/mastery" },
    ],
  },
];

export default function UnitDetailPage() {
  const params = useParams();
  const notebookId = params.id as string;
  const unitId = params.unitId as string;
  const notebook = mockNotebook;
  const unit = mockUnit;

  const currentSubunit = unit.subunits.reduce((a, b) => a.mastery > 0 && a.mastery < 80 && (b.mastery === 0 || b.mastery < a.mastery) ? b : a, unit.subunits[0]);
  const avgSubunitMastery = Math.round(unit.subunits.reduce((a, b) => a + b.mastery, 0) / unit.subunits.length);
  const circumference = 2 * Math.PI * 28;

  return (
    <NotebookLayout notebookId={notebookId} notebookTitle={notebook.title} notebookColor={notebook.color}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-5">
        <Link href={`/notebook/${notebookId}`} className="hover:text-indigo-600 transition-colors">Overview</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href={`/notebook/${notebookId}/units`} className="hover:text-indigo-600 transition-colors">Units</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-medium">Unit {unit.number}</span>
      </div>

      {/* Unit Header */}
      <div className="rounded-2xl overflow-hidden mb-6 bg-gradient-to-br from-indigo-50 via-violet-50 to-indigo-50 border border-indigo-100">
        <div className="p-5 md:p-6">
          <div className="flex items-start gap-5">
            {/* Mastery Ring */}
            <div className="shrink-0">
              <div className="relative">
                <svg width="68" height="68" viewBox="0 0 68 68" className="-rotate-90">
                  <circle cx="34" cy="34" r="28" fill="none" stroke="rgba(99,102,241,0.12)" strokeWidth="5" />
                  <circle
                    cx="34" cy="34" r="28" fill="none"
                    stroke={unit.mastery >= 80 ? "#10b981" : unit.mastery >= 50 ? "#f59e0b" : "#6366f1"}
                    strokeWidth="5" strokeLinecap="round"
                    strokeDasharray={`${(unit.mastery / 100) * circumference} ${circumference}`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-lg font-black ${
                    unit.mastery >= 80 ? "text-emerald-600" : unit.mastery >= 50 ? "text-amber-600" : "text-indigo-600"
                  }`}>{unit.mastery}%</span>
                </div>
              </div>
            </div>

            {/* Title & Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-bold text-indigo-600/70 uppercase tracking-wider">Unit {unit.number}</span>
                <span className="text-indigo-300">·</span>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                  unit.difficulty === "beginner" ? "bg-emerald-100 text-emerald-700" :
                  unit.difficulty === "intermediate" ? "bg-amber-100 text-amber-700" :
                  "bg-red-100 text-red-700"
                }`}>{unit.difficulty}</span>
                <span className="text-indigo-300">·</span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {unit.estimatedMinutes} min
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-1">{unit.title}</h1>
              <p className="text-sm text-slate-600 leading-snug">{unit.overview}</p>
            </div>
          </div>

          {/* Objectives */}
          <div className="mt-4 pt-4 border-t border-indigo-100/60">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {unit.objectives.map((obj, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <div className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  </div>
                  <span className="leading-snug">{obj}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Subunits */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Subunits</h2>
          <span className="text-xs text-slate-400">Avg {avgSubunitMastery}%</span>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
          {unit.subunits.map((sub, i) => (
            <Link
              key={sub._id}
              href={`/notebook/${notebookId}/units/${unitId}/learn?s=${sub._id}`}
              className="flex items-center gap-4 p-4 hover:bg-indigo-50/40 transition-colors group"
            >
              {/* Number */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                sub.mastery >= 80 ? "bg-emerald-100" :
                sub.mastery > 0 ? "bg-amber-100" :
                "bg-slate-100"
              }`}>
                <span className={`text-xs font-bold ${
                  sub.mastery >= 80 ? "text-emerald-600" :
                  sub.mastery > 0 ? "text-amber-600" :
                  "text-slate-400"
                }`}>{i + 1}</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">{sub.title}</p>
                <p className="text-xs text-slate-500 truncate">{sub.desc}</p>
              </div>

              {/* Progress */}
              <div className="hidden sm:block w-20">
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      sub.mastery >= 80 ? "bg-emerald-500" :
                      sub.mastery > 0 ? "bg-amber-500" :
                      "bg-slate-300"
                    }`}
                    style={{ width: `${sub.mastery}%` }}
                  />
                </div>
              </div>

              {/* Mastery % */}
              <span className={`text-sm font-bold w-10 text-right shrink-0 ${
                sub.mastery >= 80 ? "text-emerald-600" :
                sub.mastery > 0 ? "text-amber-600" :
                "text-slate-400"
              }`}>{sub.mastery}%</span>

              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* Learning Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {activityGroups.map((group) => {
          const groupColors: Record<string, { header: string; bg: string; border: string; iconBg: string; icon: string }> = {
            indigo: { header: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200", iconBg: "bg-indigo-100", icon: "text-indigo-600" },
            amber: { header: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", iconBg: "bg-amber-100", icon: "text-amber-600" },
            red: { header: "text-red-600", bg: "bg-red-50", border: "border-red-200", iconBg: "bg-red-100", icon: "text-red-600" },
          };
          const c = groupColors[group.color];

          return (
            <div key={group.label} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className={`px-4 py-3 border-b ${c.bg} ${c.border}`}>
                <h3 className={`text-sm font-bold uppercase tracking-wider ${c.header}`}>{group.label}</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {group.activities.map((act) => (
                  <Link
                    key={act.title}
                    href={`/notebook/${notebookId}/units/${unitId}${act.href}`}
                    className="flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors group"
                  >
                    <div className={`w-8 h-8 rounded-lg ${c.iconBg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                      <act.icon className={`w-4 h-4 ${c.icon}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 group-hover:text-indigo-700 transition-colors">{act.title}</p>
                      <p className="text-xs text-slate-500">{act.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 shrink-0 mt-1" />
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Focus Area */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-amber-900">Focus: {currentSubunit.title}</h3>
            <p className="text-sm text-amber-700 mt-1">
              Weakest subunit at {currentSubunit.mastery}%. Start here.
            </p>
            <div className="flex gap-2 mt-3">
              <Link
                href={`/notebook/${notebookId}/units/${unitId}/flashcards`}
                className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
              >
                Flashcards
              </Link>
              <Link
                href={`/notebook/${notebookId}/units/${unitId}/recall`}
                className="px-4 py-2 bg-white text-amber-700 text-sm font-medium rounded-lg border border-amber-200 hover:bg-amber-50 transition-colors"
              >
                Recall
              </Link>
              <Link
                href={`/notebook/${notebookId}/units/${unitId}/quiz`}
                className="px-4 py-2 bg-white text-amber-700 text-sm font-medium rounded-lg border border-amber-200 hover:bg-amber-50 transition-colors"
              >
                Quiz
              </Link>
            </div>
          </div>
        </div>
      </div>
    </NotebookLayout>
  );
}

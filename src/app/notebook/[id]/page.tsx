"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { NotebookLayout } from "./notebook-layout";
import {
  FileText, Repeat,
  Timer, ChevronRight, TrendingUp,
  Brain, PlayCircle, Zap,
  Check, Lock, FlaskConical, Dna, Sprout, Brain as BrainIcon,
} from "lucide-react";

const mockNotebook = { title: "Biology 101", color: "#10b981", icon: "🧬" };

const mockUnits = [
  { _id: "u1", title: "Cell Structure", order: 1, icon: Sprout, color: "#10b981", difficulty: "beginner" as const, estimatedMinutes: 45, status: "mastered" as const, mastery: 92, subunits: ["Cell Membrane", "Nucleus", "Organelles", "Cell Types"] },
  { _id: "u2", title: "Cellular Respiration", order: 2, icon: FlaskConical, color: "#f59e0b", difficulty: "intermediate" as const, estimatedMinutes: 60, status: "practicing" as const, mastery: 62, subunits: ["Glycolysis", "Krebs Cycle", "ETC", "ATP Synthase"] },
  { _id: "u3", title: "DNA & Protein Synthesis", order: 3, icon: Dna, color: "#6366f1", difficulty: "intermediate" as const, estimatedMinutes: 55, status: "learning" as const, mastery: 38, subunits: ["DNA Structure", "Replication", "Transcription & Translation"] },
  { _id: "u4", title: "Genetics & Inheritance", order: 4, icon: BrainIcon, color: "#8b5cf6", difficulty: "advanced" as const, estimatedMinutes: 70, status: "not_started" as const, mastery: 0, subunits: ["Mendelian Genetics", "Beyond Mendel", "Population Genetics"] },
];

export default function NotebookPage() {
  const params = useParams();
  const notebookId = params.id as string;
  const notebook = mockNotebook;
  const units = mockUnits;

  const currentUnit = units.find((u) => u.status === "practicing" || u.status === "learning");
  const overallMastery = Math.round(units.reduce((a, b) => a + b.mastery, 0) / units.length);

  return (
    <NotebookLayout notebookId={notebookId} notebookTitle={notebook.title} notebookColor={notebook.color}>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard label="Mastery" value={`${overallMastery}%`} icon={TrendingUp} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard label="Materials" value="4" icon={FileText} color="text-blue-600" bg="bg-blue-50" />
        <StatCard label="Reviews" value="12" icon={Repeat} color="text-amber-600" bg="bg-amber-50" />
        <StatCard label="Time Left" value="3.5h" icon={Timer} color="text-violet-600" bg="bg-violet-50" />
      </div>

      {/* Learning Path */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Learning Path</h2>
            <p className="text-sm text-slate-500 mt-0.5">{units.length} units · {units.filter((u) => u.status === "mastered").length} complete</p>
          </div>
          <Link
            href={`/notebook/${notebookId}/units`}
            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Horizontal pill cards */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {units.map((unit, idx) => {
            const isCurrent = unit.status === "practicing" || unit.status === "learning";
            const isLocked = unit.status === "not_started" && idx > 0 && units[idx - 1]?.mastery < 50;
            const Icon = unit.icon;

            return (
              <div key={unit._id} className="flex items-center gap-3 shrink-0">
                {/* Connector arrow */}
                {idx > 0 && (
                  <div className="text-slate-300 shrink-0">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                )}

                <Link
                  href={isLocked ? "#" : `/notebook/${notebookId}/units/${unit._id}`}
                  className={`shrink-0 flex items-center gap-3 px-4 py-3 rounded-full border-2 transition-all ${
                    isCurrent
                      ? "border-[var(--unit-color)] bg-white shadow-md"
                      : unit.status === "mastered"
                        ? "border-slate-200 bg-white hover:shadow-sm"
                        : isLocked
                          ? "border-slate-100 bg-slate-50/50 opacity-40 cursor-not-allowed"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                  }`}
                  style={isCurrent ? { boxShadow: `0 4px 14px ${unit.color}20` } as React.CSSProperties : undefined}
                >
                  {/* Icon circle */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      unit.status === "mastered"
                        ? "text-white"
                        : isLocked
                          ? "bg-slate-100 text-slate-400"
                          : "text-white"
                    }`}
                    style={{ backgroundColor: unit.status === "mastered" ? unit.color : isLocked ? undefined : unit.color }}
                  >
                    {unit.status === "mastered" ? (
                      <Check className="w-4 h-4" />
                    ) : isLocked ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>

                  {/* Text */}
                  <div>
                    <p className={`text-sm font-bold whitespace-nowrap ${
                      isLocked ? "text-slate-400" : "text-slate-900"
                    }`}>{unit.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {/* Mini progress bar */}
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${unit.mastery}%`,
                            backgroundColor: unit.mastery >= 80 ? "#10b981" : unit.mastery >= 50 ? unit.color : unit.mastery > 0 ? unit.color : "#e2e8f0",
                          }}
                        />
                      </div>
                      <span className={`text-xs font-semibold ${
                        unit.mastery >= 80 ? "text-emerald-600" :
                        unit.mastery >= 50 ? "text-amber-600" :
                        unit.mastery > 0 ? "text-indigo-600" :
                        "text-slate-400"
                      }`}>{unit.mastery}%</span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Continue Banner */}
      {currentUnit && (
        <div
          className="rounded-xl p-5 text-white mb-6"
          style={{ background: `linear-gradient(135deg, ${currentUnit.color}, ${currentUnit.color}dd)` }}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-white/80" />
                <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">Recommended</span>
              </div>
              <h3 className="text-lg font-bold mb-1">Continue: {currentUnit.title}</h3>
              <p className="text-sm text-white/70 mb-4">{currentUnit.mastery}% mastery</p>
              <div className="flex gap-3">
                <Link
                  href={`/notebook/${notebookId}/units/${currentUnit._id}`}
                  className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-lg font-medium hover:bg-white/90 transition-colors text-sm"
                  style={{ color: currentUnit.color }}
                >
                  <PlayCircle className="w-4 h-4" />
                  Continue
                </Link>
                <Link
                  href={`/notebook/${notebookId}/units/${currentUnit._id}/recall`}
                  className="flex items-center gap-2 bg-white/20 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-white/30 transition-colors text-sm border border-white/20"
                >
                  <Brain className="w-4 h-4" />
                  Recall
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </NotebookLayout>
  );
}

function StatCard({ label, value, icon: Icon, color, bg }: { label: string; value: string; icon: any; color: string; bg: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className={`text-xl font-bold mt-0.5 ${color}`}>{value}</p>
        </div>
        <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
      </div>
    </div>
  );
}

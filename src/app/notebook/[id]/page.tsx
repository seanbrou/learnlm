"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { NotebookLayout } from "./notebook-layout";
import {
  FileText, Repeat, Timer, TrendingUp,
  Brain, PlayCircle, Zap, Clock,
  Check, Lock, ArrowRight,
} from "lucide-react";

const mockNotebook = { title: "Biology 101", color: "#10b981", icon: "🧬" };

const mockUnits = [
  { _id: "u1", title: "Cell Structure", order: 1, difficulty: "beginner" as const, estimatedMinutes: 45, status: "mastered" as const, mastery: 92, subunits: ["Cell Membrane", "Nucleus", "Organelles", "Cell Types"] },
  { _id: "u2", title: "Cellular Respiration", order: 2, difficulty: "intermediate" as const, estimatedMinutes: 60, status: "practicing" as const, mastery: 62, subunits: ["Glycolysis", "Krebs Cycle", "ETC", "ATP Synthase"] },
  { _id: "u3", title: "DNA & Protein Synthesis", order: 3, difficulty: "intermediate" as const, estimatedMinutes: 55, status: "learning" as const, mastery: 38, subunits: ["DNA Structure", "Replication", "Transcription & Translation"] },
  { _id: "u4", title: "Genetics & Inheritance", order: 4, difficulty: "advanced" as const, estimatedMinutes: 70, status: "not_started" as const, mastery: 0, subunits: ["Mendelian Genetics", "Beyond Mendel", "Population Genetics"] },
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
        <div className="mb-5">
          <h2 className="text-xl font-bold text-slate-900">Learning Path</h2>
          <p className="text-sm text-slate-500 mt-0.5">{units.length} modules · {units.filter((u) => u.status === "mastered").length} complete</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {units.map((unit, idx) => {
            const isCompleted = unit.status === "mastered";
            const isActive = unit.status === "practicing";
            const isStarted = unit.status === "learning";
            const isLocked = unit.status === "not_started";
            const segmentProgress = unit.subunits.map((_, si) => {
              const threshold = ((si + 1) / unit.subunits.length) * 100;
              return unit.mastery >= threshold;
            });

            return (
              <div key={unit._id} className="relative group">
                {/* Connector arrow — shows on xl grid, pointing right from card 2-4 */}
                {idx > 0 && (
                  <div className="hidden xl:flex absolute -left-[14px] top-1/2 -translate-y-1/2 z-10 items-center justify-center w-5">
                    <ArrowRight className="w-4 h-4" style={{ color: isCompleted ? "#10b981" : "#cbd5e1" }} />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-5 border-t-2 border-dashed" style={{ borderColor: isCompleted ? "#10b981" : "#e2e8f0" }} />
                  </div>
                )}

                {/* Module Card */}
                <Link
                  href={isLocked ? "#" : `/notebook/${notebookId}/units/${unit._id}`}
                  className={`block rounded-xl border p-4 transition-all h-full flex flex-col ${
                    isCompleted
                      ? "bg-white border-emerald-200 hover:shadow-md hover:border-emerald-300"
                      : isActive
                        ? "bg-white border-amber-300 shadow-sm shadow-amber-100/50 ring-1 ring-amber-100 hover:shadow-md"
                        : isStarted
                          ? "bg-white border-indigo-200 hover:shadow-md hover:border-indigo-300"
                          : isLocked
                            ? "bg-slate-50/50 border-slate-200 border-dashed"
                            : "bg-white border-slate-200 hover:shadow-sm hover:border-slate-300"
                  }`}
                >
                  {/* Header: Step + Title + Percentage */}
                  <div className="flex items-start justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        isCompleted ? "bg-emerald-500 text-white" :
                        isActive ? "bg-amber-500 text-white" :
                        isStarted ? "bg-indigo-500 text-white" :
                        "bg-slate-200 text-slate-500"
                      }`}>
                        {isCompleted ? <Check className="w-3.5 h-3.5" /> : isLocked ? <Lock className="w-3 h-3" /> : unit.order}
                      </div>
                      <h3 className={`text-sm font-semibold leading-tight ${isLocked ? "text-slate-400" : "text-slate-900"}`}>{unit.title}</h3>
                    </div>
                    <span className={`text-base font-bold ${
                      isCompleted ? "text-emerald-600" :
                      isActive ? "text-amber-600" :
                      isStarted ? "text-indigo-600" :
                      "text-slate-300"
                    }`}>{unit.mastery}%</span>
                  </div>

                  {/* Metadata Row */}
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-2.5">
                    <span>{unit.subunits.length} subunits</span>
                    <span className="text-slate-300">·</span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-3 h-3" />
                      {unit.estimatedMinutes} min
                    </span>
                  </div>

                  {/* Subunit Pills */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {unit.subunits.slice(0, 3).map((sub, si) => (
                      <span key={si} className={`text-[10px] px-1.5 py-px rounded-full font-medium ${
                        isCompleted ? "bg-emerald-50 text-emerald-700" :
                        isLocked ? "bg-slate-100 text-slate-400" :
                        "bg-slate-50 text-slate-600"
                      }`}>{sub}</span>
                    ))}
                    {unit.subunits.length > 3 && (
                      <span className="text-[10px] px-1.5 py-px rounded-full bg-slate-100 text-slate-400 font-medium">+{unit.subunits.length - 3}</span>
                    )}
                  </div>

                  {/* Segmented Progress Bar */}
                  <div className="flex gap-1 mb-3">
                    {unit.subunits.map((_, si) => (
                      <div key={si} className={`flex-1 h-1 rounded-full transition-all ${
                        segmentProgress[si]
                          ? isCompleted ? "bg-emerald-500"
                            : isActive ? "bg-amber-500"
                            : isStarted ? "bg-indigo-500"
                            : "bg-slate-400"
                          : isLocked ? "bg-slate-200" : "bg-slate-100"
                      }`} />
                    ))}
                  </div>

                  {/* Action Footer */}
                  <div className="mt-auto pt-2.5 border-t border-slate-100">
                    {isLocked ? (
                      <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs font-medium">
                        <Lock className="w-3 h-3" />
                        Locked
                      </div>
                    ) : isCompleted ? (
                      <div className="flex items-center justify-center gap-1.5 text-emerald-600 text-xs font-semibold">
                        <Check className="w-3 h-3" />
                        Review
                      </div>
                    ) : (
                      <div className={`flex items-center justify-center gap-1.5 text-xs font-semibold ${
                        isActive ? "text-amber-600" : "text-indigo-600"
                      }`}>
                        <PlayCircle className="w-3 h-3" />
                        Continue
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Continue Banner */}
      {currentUnit && (
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl p-5 text-white mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-amber-300" />
            <span className="text-xs font-semibold text-indigo-200 uppercase tracking-wider">Recommended</span>
          </div>
          <h3 className="text-lg font-bold mb-1">Continue: {currentUnit.title}</h3>
          <p className="text-sm text-indigo-200 mb-4">{currentUnit.mastery}% mastery</p>
          <div className="flex gap-3">
            <Link
              href={`/notebook/${notebookId}/units/${currentUnit._id}`}
              className="flex items-center gap-2 bg-white text-indigo-700 px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-50 transition-colors text-sm"
            >
              <PlayCircle className="w-4 h-4" />
              Continue
            </Link>
            <Link
              href={`/notebook/${notebookId}/units/${currentUnit._id}/recall`}
              className="flex items-center gap-2 bg-indigo-500/50 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-500/70 transition-colors text-sm border border-indigo-400/30"
            >
              <Brain className="w-4 h-4" />
              Recall
            </Link>
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

"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { NotebookLayout } from "./notebook-layout";
import {
  BookOpen, FileText, Repeat,
  Timer, ChevronRight, TrendingUp,
  Brain, PlayCircle, Zap, Clock,
  Check, Lock,
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
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">Learning Path</h2>
          <p className="text-sm text-slate-500 mt-1">{units.length} units · {units.filter((u) => u.status === "mastered").length} complete</p>
        </div>

        <div className="relative">
          {/* Connector line */}
          <div className="absolute left-5 top-5 bottom-5 w-px bg-slate-200" />

          <div className="space-y-4">
            {units.map((unit, idx) => {
              const isCurrent = (unit.status === "practicing" || unit.status === "learning") as boolean;
              const isLocked = unit.status === "not_started" && idx > 0 && units[idx - 1]?.mastery < 50;

              const borderColor = unit.status === "mastered" ? "border-l-emerald-500" :
                unit.status === "practicing" ? "border-l-amber-500" :
                unit.status === "learning" ? "border-l-indigo-500" :
                "border-l-slate-300";

              return (
                <div key={unit._id} className="relative pl-14">
                  {/* Node */}
                  <div className={`absolute left-[11px] top-4 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    unit.status === "mastered" ? "bg-emerald-500 border-emerald-500" :
                    isCurrent ? "bg-amber-500 border-amber-500 shadow-lg shadow-amber-200" :
                    unit.status === "learning" ? "bg-indigo-500 border-indigo-500" :
                    "bg-white border-slate-300"
                  }`}>
                    {unit.status === "mastered" ? (
                      <Check className="w-3 h-3 text-white" />
                    ) : isLocked ? (
                      <Lock className="w-2.5 h-2.5 text-slate-400" />
                    ) : (
                      <span className="text-[10px] font-bold text-white">{unit.order}</span>
                    )}
                  </div>

                  {/* Card */}
                  <Link
                    href={isLocked ? "#" : `/notebook/${notebookId}/units/${unit._id}`}
                    className={`block rounded-xl bg-white border border-slate-200 border-l-4 ${borderColor} p-4 transition-all ${
                      isCurrent
                        ? "shadow-md shadow-indigo-100/50 scale-[1.01]"
                        : isLocked
                          ? "opacity-40 cursor-not-allowed"
                          : "hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`text-base font-bold ${
                            isLocked ? "text-slate-400" : "text-slate-900"
                          }`}>{unit.title}</h3>
                          {isCurrent && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                              In Progress
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                          <span>{unit.subunits.length} subunits</span>
                          <span className="text-slate-300">·</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {unit.estimatedMinutes} min
                          </span>
                        </div>

                        {/* Progress */}
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                unit.mastery >= 80 ? "bg-emerald-500" :
                                unit.mastery >= 50 ? "bg-amber-500" :
                                unit.mastery > 0 ? "bg-indigo-500" :
                                "bg-slate-300"
                              }`}
                              style={{ width: `${unit.mastery}%` }}
                            />
                          </div>
                          <span className={`text-sm font-bold ${
                            unit.mastery >= 80 ? "text-emerald-600" :
                            unit.mastery >= 50 ? "text-amber-600" :
                            unit.mastery > 0 ? "text-indigo-600" :
                            "text-slate-400"
                          }`}>{unit.mastery}%</span>
                        </div>
                      </div>

                      {!isLocked && (
                        <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
                          isCurrent
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-400"
                        }`}>
                          {isCurrent ? (
                            <PlayCircle className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
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

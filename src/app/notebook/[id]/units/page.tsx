"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { NotebookLayout } from "../notebook-layout";
import {
  BookOpen, Sparkles, ChevronRight, Target,
  Clock, Brain, GraduationCap, Repeat,
  Lightbulb, ClipboardList, ArrowRight,
} from "lucide-react";

const mockNotebook = { title: "Biology 101", color: "#10b981", icon: "🧬" };

const mockUnits = [
  {
    _id: "u1", title: "Cell Structure",
    overview: "Explore the fundamental building blocks of life. This unit covers the organization, structure, and function of cellular components.",
    objectives: ["Identify major cell organelles and their functions", "Compare prokaryotic and eukaryotic cells", "Describe the fluid mosaic model"],
    prerequisites: ["Basic chemistry knowledge"],
    estimatedMinutes: 45, difficulty: "beginner" as const,
    mastery: 92, status: "mastered" as const,
    subunitCount: 4, flashcardCount: 12, quizCount: 15,
  },
  {
    _id: "u2", title: "Cellular Respiration",
    overview: "Understand how cells extract energy from nutrients. Covers the complete pathway from glycolysis to oxidative phosphorylation.",
    objectives: ["Explain the steps of glycolysis", "Describe the Krebs cycle", "Map the electron transport chain"],
    prerequisites: ["Cell Structure (Unit 1)"],
    estimatedMinutes: 60, difficulty: "intermediate" as const,
    mastery: 62, status: "practicing" as const,
    subunitCount: 4, flashcardCount: 18, quizCount: 20,
  },
  {
    _id: "u3", title: "DNA & Protein Synthesis",
    overview: "From genetic code to functional proteins. Understand transcription, translation, and gene regulation.",
    objectives: ["Describe DNA replication", "Explain transcription and translation", "Understand gene regulation"],
    prerequisites: ["Cell Structure (Unit 1)"],
    estimatedMinutes: 55, difficulty: "intermediate" as const,
    mastery: 38, status: "learning" as const,
    subunitCount: 3, flashcardCount: 15, quizCount: 18,
  },
  {
    _id: "u4", title: "Genetics & Inheritance",
    overview: "How traits are passed from generation to generation. Mendelian genetics, beyond Mendel, and population genetics.",
    objectives: ["Solve Punnett square problems", "Explain non-Mendelian inheritance", "Apply Hardy-Weinberg principle"],
    prerequisites: ["DNA & Protein Synthesis (Unit 3)"],
    estimatedMinutes: 70, difficulty: "advanced" as const,
    mastery: 0, status: "not_started" as const,
    subunitCount: 5, flashcardCount: 20, quizCount: 25,
  },
];

export default function NotebookUnitsPage() {
  const params = useParams();
  const notebookId = params.id as string;
  const notebook = mockNotebook;

  return (
    <NotebookLayout notebookId={notebookId} notebookTitle={notebook.title} notebookColor={notebook.color}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Study Units</h2>
        <p className="text-slate-500 mt-1">AI-generated curriculum from your uploaded materials</p>
      </div>

      {/* Learning Path Visual */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {mockUnits.map((unit, idx) => (
          <div key={unit._id} className="flex items-center">
            <Link
              href={`/notebook/${notebookId}/units/${unit._id}`}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                unit.status === "mastered" ? "bg-emerald-100 text-emerald-700" :
                unit.status === "practicing" ? "bg-amber-100 text-amber-700" :
                unit.status === "learning" ? "bg-indigo-100 text-indigo-700 ring-2 ring-indigo-200" :
                "bg-slate-100 text-slate-500"
              }`}
            >
              <span className="text-xs">{idx + 1}.</span>
              {unit.title}
            </Link>
            {idx < mockUnits.length - 1 && (
              <ChevronRight className="w-4 h-4 text-slate-300 mx-1" />
            )}
          </div>
        ))}
      </div>

      {/* Unit Cards */}
      <div className="space-y-4">
        {mockUnits.map((unit) => (
          <div
            key={unit._id}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="flex items-start p-6">
              {/* Unit Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    unit.difficulty === "beginner" ? "bg-emerald-100 text-emerald-700" :
                    unit.difficulty === "intermediate" ? "bg-amber-100 text-amber-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {unit.difficulty}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {unit.estimatedMinutes} min
                  </span>
                  <span className="text-xs text-slate-400">
                    {unit.subunitCount} topics · {unit.flashcardCount} flashcards · {unit.quizCount} questions
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-1">{unit.title}</h3>
                <p className="text-sm text-slate-600 mb-3">{unit.overview}</p>

                {/* Objectives */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {unit.objectives.map((obj, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-slate-50 text-slate-600 text-xs rounded-md">
                      <Target className="w-3 h-3" />
                      {obj}
                    </span>
                  ))}
                </div>

                {/* Mastery Progress */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        unit.mastery >= 80 ? "bg-emerald-500" :
                        unit.mastery >= 50 ? "bg-amber-500" :
                        unit.mastery > 0 ? "bg-indigo-500" :
                        "bg-slate-200"
                      }`}
                      style={{ width: `${unit.mastery}%` }}
                    />
                  </div>
                  <span className={`text-sm font-bold ${
                    unit.mastery >= 80 ? "text-emerald-600" :
                    unit.mastery >= 50 ? "text-amber-600" :
                    "text-slate-400"
                  }`}>
                    {unit.mastery}%
                  </span>
                </div>
              </div>

              {/* Entry Point */}
              <Link
                href={`/notebook/${notebookId}/units/${unit._id}`}
                className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors shrink-0 ml-4"
              >
                Start
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </NotebookLayout>
  );
}

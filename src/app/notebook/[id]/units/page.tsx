"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { NotebookLayout } from "../notebook-layout";
import { useLearnLM } from "@/lib/learnlm-data";
import {
  ChevronRight, Target, Clock, ArrowRight,
} from "lucide-react";


export default function NotebookUnitsPage() {
  const params = useParams();
  const notebookId = params.id as string;
  const { getNotebook, getUnits, getSubunits, getFlashcards, getQuestions } = useLearnLM();
  const notebook = getNotebook(notebookId);
  const units = getUnits(notebookId).map((unit) => ({
    ...unit,
    subunitCount: getSubunits(unit._id).length,
    flashcardCount: getFlashcards(unit._id).length,
    quizCount: getQuestions(unit._id).length,
  }));
  if (!notebook) return null;

  return (
    <NotebookLayout notebookId={notebookId} notebookTitle={notebook.title} notebookColor={notebook.color}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Study Units</h2>
        <p className="text-slate-500 mt-1">AI-generated curriculum from your uploaded materials</p>
      </div>

      {/* Learning Path Visual */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {units.map((unit, idx) => (
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
            {idx < units.length - 1 && (
              <ChevronRight className="w-4 h-4 text-slate-300 mx-1" />
            )}
          </div>
        ))}
      </div>

      {/* Unit Cards */}
      <div className="space-y-4">
        {units.map((unit) => (
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

"use client";

import { useState } from "react";
import Link from "next/link";
import { Repeat, Brain, Clock, Target, Check, X, ArrowRight, ChevronRight, BookOpen } from "lucide-react";

const mockNotebooks = [
  { _id: "bio101", title: "Biology 101", color: "#10b981", icon: "🧬" },
  { _id: "cs201", title: "Computer Science 201", color: "#6366f1", icon: "💻" },
];

const reviewItems = [
  { id: 1, notebookId: "bio101", notebookTitle: "Biology 101", type: "flashcard" as const, front: "What is the electron transport chain?", back: "A series of protein complexes (I-IV) embedded in the inner mitochondrial membrane that transfer electrons from NADH/FADH₂ to oxygen, pumping protons to create a gradient for ATP synthesis.", interval: 3, due: "Today", mastery: 65, unitId: "u2", unitTitle: "Cellular Respiration" },
  { id: 2, notebookId: "bio101", notebookTitle: "Biology 101", type: "concept" as const, title: "Glycolysis Steps", desc: "Review the 10 steps of glycolysis — investment and payoff phases", interval: 1, due: "Today", mastery: 42, unitId: "u2", unitTitle: "Cellular Respiration" },
  { id: 3, notebookId: "cs201", notebookTitle: "Computer Science 201", type: "flashcard" as const, front: "What is Big-O notation?", back: "Big-O describes the upper bound of an algorithm's time or space complexity as the input size grows. It characterizes worst-case performance.", interval: 5, due: "Today", mastery: 78, unitId: "u1", unitTitle: "Algorithm Analysis" },
  { id: 4, notebookId: "bio101", notebookTitle: "Biology 101", type: "concept" as const, title: "Krebs Cycle Inputs/Outputs", desc: "Review what goes in and what comes out", interval: 2, due: "Overdue", mastery: 35, unitId: "u2", unitTitle: "Cellular Respiration" },
  { id: 5, notebookId: "bio101", notebookTitle: "Biology 101", type: "flashcard" as const, front: "What role does ATP synthase play?", back: "ATP synthase produces ATP by harnessing the proton gradient created by the ETC.", interval: 7, due: "Tomorrow", mastery: 88, unitId: "u2", unitTitle: "Cellular Respiration" },
];

export default function ReviewPage() {
  const [currentItem, setCurrentItem] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [completed, setCompleted] = useState<string[]>([]);

  const item = reviewItems[currentItem];
  const dueToday = reviewItems.filter((r) => r.due === "Today" || r.due === "Overdue");

  const handleResponse = (quality: number) => {
    setCompleted((prev) => [...prev, item.id.toString()]);
    if (currentItem < dueToday.length - 1) {
      const nextIdx = reviewItems.findIndex((_, idx) => !completed.includes(reviewItems[idx].id.toString()) && idx > currentItem);
      if (nextIdx >= 0) { setCurrentItem(nextIdx); setShowAnswer(false); }
      else setCompleted((prev) => [...prev, "done"]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
            <Repeat className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Spaced Repetition Review</h1>
            <p className="text-sm text-slate-500">{dueToday.length} items due today across all notebooks</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        {/* Queue */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {dueToday.map((ri, idx) => (
            <button key={ri.id} onClick={() => { const realIdx = reviewItems.findIndex((r) => r.id === ri.id); setCurrentItem(realIdx); setShowAnswer(false); }}
              className={`shrink-0 px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${
                ri.id === item.id ? "bg-violet-600 text-white" :
                completed.includes(ri.id.toString()) ? "bg-emerald-100 text-emerald-700" :
                ri.due === "Overdue" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"
              }`}>
              <span className="text-xs">{ri.type === "flashcard" ? "🃏" : "📖"}</span>
              {ri.notebookTitle}
            </button>
          ))}
        </div>

        {/* Current Item */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-violet-100 text-violet-700">
              {item.type === "flashcard" ? "Flashcard" : "Concept Review"}
            </span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              item.due === "Overdue" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"
            }`}>{item.due}</span>
            <span className="text-xs text-slate-400 ml-auto">Interval: {item.interval}d</span>
          </div>

          {item.type === "flashcard" ? (
            <>
              <p className="text-xl font-semibold text-slate-900 mb-6">{item.front}</p>
              {!showAnswer ? (
                <button onClick={() => setShowAnswer(true)} className="w-full bg-violet-600 text-white py-3 rounded-lg font-medium hover:bg-violet-700 transition-colors">Show Answer</button>
              ) : (
                <>
                  <div className="bg-slate-50 rounded-lg p-4 mb-4"><p className="text-sm text-slate-700">{item.back}</p></div>
                  <div className="grid grid-cols-4 gap-2">
                    {[["Again", "bg-red-100 text-red-700"], ["Hard", "bg-amber-100 text-amber-700"], ["Good", "bg-emerald-100 text-emerald-700"], ["Easy", "bg-blue-100 text-blue-700"]].map(([label, cls]) => (
                      <button key={label} onClick={() => handleResponse(0)} className={`py-2.5 rounded-lg font-medium text-sm transition-colors ${cls} hover:opacity-80`}>{label}</button>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-600 mb-4">{item.desc}</p>
              <Link href={`/notebook/${item.notebookId}/units/${item.unitId}`} className="w-full bg-violet-600 text-white py-3 rounded-lg font-medium hover:bg-violet-700 transition-colors flex items-center justify-center gap-2">
                <Target className="w-4 h-4" /> Review This Topic
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

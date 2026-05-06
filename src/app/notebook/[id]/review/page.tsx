"use client";

import { useState } from "react";
import { NotebookLayout } from "../notebook-layout";
import { useParams } from "next/navigation";
import { Repeat, Brain, Clock, Target, Check, X, ArrowRight } from "lucide-react";

const mockNotebook = { title: "Biology 101", color: "#10b981" };

const reviewItems = [
  { id: 1, type: "flashcard" as const, front: "What is the electron transport chain?", back: "A series of protein complexes (I-IV) embedded in the inner mitochondrial membrane that transfer electrons from NADH/FADH₂ to oxygen, pumping protons to create a gradient for ATP synthesis.", interval: 3, due: "Today", mastery: 65 },
  { id: 2, type: "concept" as const, title: "Glycolysis Steps", desc: "Review the 10 steps of glycolysis — investment and payoff phases", interval: 1, due: "Today", mastery: 42 },
  { id: 3, type: "flashcard" as const, front: "What is chemiosmosis?", back: "ATP synthesis driven by a proton gradient across a membrane. H+ flows through ATP synthase, converting ADP + Pi → ATP.", interval: 5, due: "Today", mastery: 78 },
  { id: 4, type: "concept" as const, title: "Krebs Cycle Inputs/Outputs", desc: "Review what goes in (Acetyl-CoA, NAD+, FAD, ADP) and what comes out (CO₂, NADH, FADH₂, ATP)", interval: 2, due: "Overdue", mastery: 35 },
  { id: 5, type: "flashcard" as const, front: "What role does ATP synthase play?", back: "ATP synthase is the enzyme that produces ATP by harnessing the proton gradient created by the ETC. As protons flow through it, it rotates and catalyzes ADP + Pi → ATP.", interval: 7, due: "Tomorrow", mastery: 88 },
];

export default function ReviewPage() {
  const params = useParams();
  const notebookId = params.id as string;
  const notebook = mockNotebook;

  const [currentItem, setCurrentItem] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [completed, setCompleted] = useState<string[]>([]);

  const item = reviewItems[currentItem];

  const handleResponse = (quality: number) => {
    setCompleted((prev) => [...prev, item.id.toString()]);
    if (currentItem < reviewItems.length - 1) {
      setCurrentItem((p) => p + 1);
      setShowAnswer(false);
    }
  };

  return (
    <NotebookLayout notebookId={notebookId} notebookTitle={notebook.title} notebookColor={notebook.color}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
          <Repeat className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Spaced Repetition Review</h2>
          <p className="text-sm text-slate-500">{reviewItems.filter((i) => i.due === "Today" || i.due === "Overdue").length} items due today</p>
        </div>
      </div>

      {/* Review Queue */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {reviewItems.map((ri, idx) => (
          <button
            key={ri.id}
            onClick={() => { setCurrentItem(idx); setShowAnswer(false); }}
            className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
              idx === currentItem ? "bg-indigo-600 text-white ring-2 ring-indigo-300" :
              completed.includes(ri.id.toString()) ? "bg-emerald-100 text-emerald-700" :
              ri.due === "Overdue" ? "bg-red-100 text-red-700" :
              "bg-slate-100 text-slate-600"
            }`}
          >
            {completed.includes(ri.id.toString()) ? <Check className="w-4 h-4" /> : idx + 1}
          </button>
        ))}
      </div>

      {/* Current Item */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          {item.type === "flashcard" ? (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">Flashcard</span>
          ) : (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-violet-100 text-violet-700">Concept Review</span>
          )}
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
            item.due === "Overdue" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"
          }`}>
            {item.due}
          </span>
          <span className="text-xs text-slate-400 ml-auto">Interval: {item.interval} days</span>
        </div>

        {item.type === "flashcard" ? (
          <>
            <p className="text-xl font-semibold text-slate-900 mb-6">{item.front}</p>
            {!showAnswer ? (
              <button onClick={() => setShowAnswer(true)} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors">Show Answer</button>
            ) : (
              <>
                <div className="bg-slate-50 rounded-lg p-4 mb-4"><p className="text-sm text-slate-700">{item.back}</p></div>
                <div className="grid grid-cols-4 gap-2">
                  {["Again", "Hard", "Good", "Easy"].map((label, i) => (
                    <button key={label} onClick={() => handleResponse(i)} className={`py-2.5 rounded-lg font-medium text-sm transition-colors ${
                      i === 0 ? "bg-red-100 text-red-700 hover:bg-red-200" :
                      i === 1 ? "bg-amber-100 text-amber-700 hover:bg-amber-200" :
                      i === 2 ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" :
                      "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    }`}>{label}</button>
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
            <p className="text-sm text-slate-600 mb-4">{item.desc}</p>
            <button onClick={() => handleResponse(2)} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
              <Target className="w-4 h-4" /> Review This Topic
            </button>
          </>
        )}
      </div>
    </NotebookLayout>
  );
}

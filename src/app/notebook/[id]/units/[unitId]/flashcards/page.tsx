"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { NotebookLayout } from "../../../notebook-layout";
import {
  ChevronLeft, RotateCcw, Check, X, Shuffle,
  Star, ChevronRight, Trophy, Quote, ArrowRight,
} from "lucide-react";

const mockNotebook = { title: "Biology 101", color: "#10b981", icon: "🧬" };
const mockUnit = { _id: "u2", title: "Cellular Respiration" };

const flashcards = [
  { front: "What is the net ATP yield from glycolysis?", back: "2 ATP (net) — glycolysis produces 4 ATP gross but uses 2 ATP in the investment phase, resulting in a net gain of 2 ATP per glucose molecule.", difficulty: "easy" as const, source: "Lecture Notes Week 7, p. 4" },
  { front: "Where does the Krebs cycle take place?", back: "The mitochondrial matrix — the innermost compartment of the mitochondrion, enclosed by the inner membrane.", difficulty: "easy" as const, source: "Campbell Biology Ch. 9, p. 166" },
  { front: "What is chemiosmosis?", back: "The mechanism of ATP synthesis using a proton (H+) gradient across a membrane. Protons flow through ATP synthase, driving the phosphorylation of ADP to ATP. This occurs across the inner mitochondrial membrane during oxidative phosphorylation.", difficulty: "hard" as const, source: "Lecture Notes Week 7, p. 7" },
  { front: "What are NADH and FADH₂?", back: "Electron carriers that transport high-energy electrons to the electron transport chain. NADH produces ~2.5 ATP per molecule; FADH₂ produces ~1.5 ATP per molecule (it enters the chain at a later point).", difficulty: "medium" as const, source: "Lecture Notes Week 7, p. 6" },
  { front: "What happens to pyruvate after glycolysis?", back: "Pyruvate enters the mitochondrion and is converted to Acetyl-CoA by the enzyme pyruvate dehydrogenase. This produces 1 NADH and releases 1 CO₂ per pyruvate. Acetyl-CoA then enters the Krebs cycle.", difficulty: "medium" as const, source: "Campbell Biology Ch. 9, p. 167" },
  { front: "How many total ATP are produced from one glucose molecule?", back: "~36-38 ATP total: 2 from glycolysis, 2 from the Krebs cycle, and ~32-34 from oxidative phosphorylation (ETC + chemiosmosis).", difficulty: "medium" as const, source: "Lecture Notes Week 7, p. 8" },
];

export default function FlashcardsPage() {
  const params = useParams();
  const notebookId = params.id as string;
  const unitId = params.unitId as string;
  const notebook = mockNotebook;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [completed, setCompleted] = useState(false);

  const card = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  const handleResponse = (correct: boolean) => {
    setScore((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      incorrect: prev.incorrect + (correct ? 0 : 1),
    }));
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    } else {
      setCompleted(true);
    }
  };

  const resetDeck = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setScore({ correct: 0, incorrect: 0 });
    setCompleted(false);
  };

  if (completed) {
    const accuracy = Math.round((score.correct / flashcards.length) * 100);
    return (
      <NotebookLayout notebookId={notebookId} notebookTitle={notebook.title} notebookColor={notebook.color}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center max-w-md">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">
              {accuracy >= 80 ? "Excellent!" : accuracy >= 60 ? "Good job!" : "Keep practicing!"}
            </h2>
            <p className="text-3xl font-bold text-indigo-600 mb-2">{accuracy}%</p>
            <p className="text-slate-600 mb-4">
              {score.correct} out of {flashcards.length} correct
            </p>
            <div className="flex justify-center gap-4 mb-6">
              <div className="text-center px-4 py-2 bg-emerald-50 rounded-lg">
                <p className="text-xl font-bold text-emerald-600">{score.correct}</p>
                <p className="text-xs text-emerald-700">Correct</p>
              </div>
              <div className="text-center px-4 py-2 bg-red-50 rounded-lg">
                <p className="text-xl font-bold text-red-600">{score.incorrect}</p>
                <p className="text-xs text-red-700">Incorrect</p>
              </div>
            </div>
            <button onClick={resetDeck} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors mx-auto">
              <RotateCcw className="w-5 h-5" />
              Review Again
            </button>
          </div>
        </div>
      </NotebookLayout>
    );
  }

  return (
    <NotebookLayout notebookId={notebookId} notebookTitle={notebook.title} notebookColor={notebook.color}>
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-500">Card {currentIndex + 1} of {flashcards.length}</span>
          <span className="text-sm font-medium text-emerald-600">{score.correct} correct</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Card */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="cursor-pointer mb-6"
        style={{ perspective: "1000px" }}
      >
        <div
          className="bg-white rounded-2xl border border-slate-200 shadow-lg min-h-[320px] transition-all duration-500 relative"
          style={{ transformStyle: "preserve-3d", transform: isFlipped ? "rotateY(180deg)" : "rotateY(0)" }}
        >
          {/* Front */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8" style={{ backfaceVisibility: "hidden" }}>
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                card.difficulty === "easy" ? "bg-emerald-100 text-emerald-700" :
                card.difficulty === "medium" ? "bg-amber-100 text-amber-700" :
                "bg-red-100 text-red-700"
              }`}>
                {card.difficulty}
              </span>
            </div>
            <p className="text-xl font-medium text-slate-900 text-center leading-relaxed">{card.front}</p>
            <p className="text-sm text-slate-400 mt-6">Click to reveal answer</p>
          </div>
          {/* Back */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-4">Answer</span>
            <p className="text-lg text-slate-700 text-center leading-relaxed">{card.back}</p>
            {card.source && (
              <div className="mt-4 flex items-center gap-1.5 text-amber-600 text-xs">
                <Quote className="w-3 h-3" />
                {card.source}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button onClick={() => { if (currentIndex > 0) { setCurrentIndex((p) => p - 1); setIsFlipped(false); }}} disabled={currentIndex === 0} className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 disabled:opacity-30 transition-colors">
          <ChevronLeft className="w-5 h-5" /> Previous
        </button>

        {!isFlipped ? (
          <button onClick={() => setIsFlipped(true)} className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
            Show Answer
          </button>
        ) : (
          <div className="flex gap-3">
            <button onClick={() => handleResponse(false)} className="flex items-center gap-2 bg-red-50 text-red-700 px-5 py-2.5 rounded-lg font-medium hover:bg-red-100 transition-colors">
              <X className="w-4 h-4" /> Still Learning
            </button>
            <button onClick={() => handleResponse(true)} className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-5 py-2.5 rounded-lg font-medium hover:bg-emerald-100 transition-colors">
              <Check className="w-4 h-4" /> Got It
            </button>
          </div>
        )}

        <button onClick={() => { setCurrentIndex(0); setIsFlipped(false); }} className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors">
          <Shuffle className="w-5 h-5" /> Shuffle
        </button>
      </div>
    </NotebookLayout>
  );
}

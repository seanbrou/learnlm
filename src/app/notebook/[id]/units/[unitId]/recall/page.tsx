"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { NotebookLayout } from "../../../notebook-layout";
import { Check, X, Brain, ArrowRight, Quote, RotateCcw } from "lucide-react";

const mockNotebook = { title: "Biology 101", color: "#10b981" };
const mockUnit = { _id: "u2", title: "Cellular Respiration" };

const recallQuestions = [
  { prompt: "What are the three stages of cellular respiration? Name each and where it occurs.", answer: "1. Glycolysis (cytoplasm) — glucose → 2 pyruvate + 2 ATP + 2 NADH\n2. Krebs Cycle (mitochondrial matrix) — pyruvate → CO₂ + ATP + NADH + FADH₂\n3. Electron Transport Chain (inner mitochondrial membrane) — NADH/FADH₂ → ~32 ATP via oxidative phosphorylation", source: "Lecture Notes Week 7" },
  { prompt: "What is the overall equation for cellular Respiration?", answer: "C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ~36-38 ATP\nGlucose + Oxygen → Carbon Dioxide + Water + ATP", source: "Campbell Biology Ch. 9, p. 162" },
  { prompt: "Explain the difference between substrate-level phosphorylation and oxidative phosphorylation.", answer: "Substrate-level phosphorylation: Direct transfer of a phosphate group from a substrate molecule to ADP. Occurs in glycolysis (2 ATP) and Krebs cycle (2 ATP).\n\nOxidative phosphorylation: ATP synthesis driven by the electron transport chain creating a proton gradient, which powers ATP synthase. Produces ~32 ATP — the vast majority of cellular ATP.", source: "Lecture Notes Week 7, p. 6" },
  { prompt: "What is the role of oxygen in cellular respiration? What happens without it?", answer: "Oxygen is the final electron acceptor in the ETC. It combines with electrons and protons to form water. Without oxygen, the ETC stops, NADH can't be recycled to NAD+, and cells must rely on fermentation (producing only 2 ATP from glycolysis).", source: "Campbell Biology Ch. 9, p. 173" },
];

export default function RecallPage() {
  const params = useParams();
  const notebookId = params.id as string;
  const unitId = params.unitId as string;
  const notebook = mockNotebook;

  const [currentQ, setCurrentQ] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState({ got: 0, missed: 0 });
  const [complete, setComplete] = useState(false);

  const q = recallQuestions[currentQ];
  const progress = ((currentQ + 1) / recallQuestions.length) * 100;

  const handleResponse = (correct: boolean) => {
    setScore((prev) => ({ got: prev.got + (correct ? 1 : 0), missed: prev.missed + (correct ? 0 : 1) }));
    if (currentQ < recallQuestions.length - 1) {
      setCurrentQ((p) => p + 1);
      setShowAnswer(false);
    } else {
      setComplete(true);
    }
  };

  if (complete) {
    const accuracy = Math.round((score.got / recallQuestions.length) * 100);
    return (
      <NotebookLayout notebookId={notebookId} notebookTitle={notebook.title} notebookColor={notebook.color}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-100 flex items-center justify-center">
              <Brain className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Recall Complete</h2>
            <p className="text-3xl font-bold text-indigo-600 mb-2">{accuracy}%</p>
            <p className="text-slate-600 mb-4">Active recall strengthens long-term memory</p>
            <button onClick={() => { setCurrentQ(0); setShowAnswer(false); setScore({ got: 0, missed: 0 }); setComplete(false); }} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors mx-auto">
              <RotateCcw className="w-5 h-5" /> Practice Again
            </button>
          </div>
        </div>
      </NotebookLayout>
    );
  }

  return (
    <NotebookLayout notebookId={notebookId} notebookTitle={notebook.title} notebookColor={notebook.color}>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Active Recall</h2>
            <p className="text-sm text-slate-500">Test your memory without looking at the material</p>
          </div>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-slate-400 mt-1">{currentQ + 1} of {recallQuestions.length}</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <span className="text-xs font-medium text-indigo-600 uppercase tracking-wider">Prompt</span>
        <p className="text-xl font-semibold text-slate-900 mt-2 mb-6">{q.prompt}</p>

        {!showAnswer ? (
          <button onClick={() => setShowAnswer(true)} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
            Reveal Answer
          </button>
        ) : (
          <>
            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <span className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Answer</span>
              <p className="text-sm text-slate-700 mt-2 whitespace-pre-line">{q.answer}</p>
              {q.source && <p className="text-xs text-amber-600 mt-3 flex items-center gap-1"><Quote className="w-3 h-3" />{q.source}</p>}
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleResponse(false)} className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-700 py-3 rounded-lg font-medium hover:bg-red-100 transition-colors">
                <X className="w-4 h-4" /> Missed It
              </button>
              <button onClick={() => handleResponse(true)} className="flex-1 flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 py-3 rounded-lg font-medium hover:bg-emerald-100 transition-colors">
                <Check className="w-4 h-4" /> Nailed It
              </button>
            </div>
          </>
        )}
      </div>
    </NotebookLayout>
  );
}

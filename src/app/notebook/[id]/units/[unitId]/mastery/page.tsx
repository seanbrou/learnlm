"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { NotebookLayout } from "../../../notebook-layout";
import { Trophy, Check, X, ArrowRight, Award, Star } from "lucide-react";

const mockNotebook = { title: "Biology 101", color: "#10b981" };
const mockUnit = { _id: "u2", title: "Cellular Respiration" };

const masteryQuestions = [
  { question: "Explain how the proton gradient is established and how it drives ATP synthesis.", answer: "As electrons flow through the ETC, protein complexes (I, III, IV) pump H+ from the matrix into the intermembrane space, creating an electrochemical gradient (proton motive force). H+ flows back through ATP synthase, driving rotation of the enzyme's rotor and phosphorylation of ADP → ATP.", type: "text" as const },
  { question: "Why do cells use both substrate-level and oxidative phosphorylation?", answer: "Substrate-level phosphorylation provides immediate, small ATP yields without requiring mitochondria or oxygen (useful in anaerobic conditions). Oxidative phosphorylation is much more efficient (~32 ATP per glucose) but requires oxygen and functional mitochondria.", type: "text" as const },
  { question: "Compare and contrast aerobic and anaerobic respiration.", answer: "Aerobic respiration uses O2 as the final electron acceptor and yields ~36-38 ATP. Anaerobic respiration (fermentation) uses organic molecules as acceptors and yields only 2 ATP from glycolysis. Aerobic involves all three stages; anaerobic involves only glycolysis followed by fermentation.", type: "text" as const },
  { question: "What is the Pasteur effect?", answer: "The increase in glycolysis rate when oxygen is absent. Without the ETC, NADH can't be oxidized, so fermentation is needed to regenerate NAD+. This allows glycolysis to continue, but at a lower ATP yield per glucose, so more glucose is consumed to meet ATP demand.", type: "text" as const },
  { question: "What would happen to a cell that lost its inner mitochondrial membrane?", answer: "Oxidative phosphorylation would cease completely — no proton gradient could be established without the inner membrane. The cell could only produce 2 ATP per glucose via glycolysis. Most eukaryotic cells would not survive.", type: "text" as const },
];

export default function MasteryPage() {
  const params = useParams();
  const notebookId = params.id as string;
  const unitId = params.unitId as string;
  const notebook = mockNotebook;

  const [step, setStep] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState({ pass: 0, fail: 0 });
  const [complete, setComplete] = useState(false);

  const q = masteryQuestions[step];
  const threshold = Math.ceil(masteryQuestions.length * 0.8); // Need 80%

  const handleResponse = (correct: boolean) => {
    setScore((prev) => ({ pass: prev.pass + (correct ? 1 : 0), fail: prev.fail + (correct ? 0 : 1) }));
    if (step < masteryQuestions.length - 1) {
      setStep((p) => p + 1);
      setShowAnswer(false);
    } else {
      setComplete(true);
    }
  };

  if (complete) {
    const earned = score.pass >= threshold;
    return (
      <NotebookLayout notebookId={notebookId} notebookTitle={notebook.title} notebookColor={notebook.color}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center max-w-md">
            <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${earned ? "bg-gradient-to-br from-yellow-400 to-amber-500" : "bg-slate-200"}`}>
              {earned ? <Award className="w-10 h-10 text-white" /> : <Star className="w-10 h-10 text-slate-400" />}
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">{earned ? "Mastery Earned!" : "Not Yet — Keep Going"}</h2>
            <p className="text-3xl font-bold mb-2" style={{ color: earned ? "#f59e0b" : "#94a3b8" }}>{Math.round((score.pass / masteryQuestions.length) * 100)}%</p>
            <p className="text-slate-600 mb-4">You needed 80% ({threshold}/{masteryQuestions.length}) — got {score.pass}/{masteryQuestions.length}</p>
            <Link href={`/notebook/${notebookId}/units/${unitId}`} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors mx-auto justify-center">
              <ArrowRight className="w-5 h-5" /> Back to Unit
            </Link>
          </div>
        </div>
      </NotebookLayout>
    );
  }

  return (
    <NotebookLayout notebookId={notebookId} notebookTitle={notebook.title} notebookColor={notebook.color}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
          <Award className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Unit Mastery Test</h2>
          <p className="text-sm text-slate-500">Earn 80%+ to master this unit</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <p className="text-sm text-slate-500 mb-4">Question {step + 1} of {masteryQuestions.length}</p>
        <p className="text-lg font-semibold text-slate-900 mb-6">{q.question}</p>

        {!showAnswer ? (
          <button onClick={() => setShowAnswer(true)} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors">Show Answer</button>
        ) : (
          <>
            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-slate-700 whitespace-pre-line">{q.answer}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleResponse(false)} className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-700 py-3 rounded-lg font-medium hover:bg-red-100 transition-colors"><X className="w-4 h-4" /> Didn't Know</button>
              <button onClick={() => handleResponse(true)} className="flex-1 flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 py-3 rounded-lg font-medium hover:bg-emerald-100 transition-colors"><Check className="w-4 h-4" /> Knew It</button>
            </div>
          </>
        )}
      </div>
    </NotebookLayout>
  );
}

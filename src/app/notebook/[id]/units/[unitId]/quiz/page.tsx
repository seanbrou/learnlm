"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { NotebookLayout } from "../../../notebook-layout";
import { useLearnLM } from "@/lib/learnlm-data";
import { Check, X, ArrowRight, Trophy, Clock, Brain, Quote } from "lucide-react";

export default function QuizPage() {
  const params = useParams();
  const notebookId = params.id as string;
  const unitId = params.unitId as string;
  const { getNotebook, getQuestions, answerQuestion } = useLearnLM();
  const notebook = getNotebook(notebookId);
  const questions = getQuestions(unitId).filter((q) => q.type !== "exam").slice(0, 10);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<{ selected: number; correct: boolean }[]>([]);
  const [complete, setComplete] = useState(false);
  const [startTime] = useState(Date.now());
  const q = questions[currentQ];
  const progress = questions.length ? ((currentQ + 1) / questions.length) * 100 : 0;
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const min = Math.floor(elapsed / 60); const sec = elapsed % 60;

  const select = (idx: number) => { if (showExplanation || !q) return; const correct = answerQuestion(q.id, idx); setSelected(idx); setShowExplanation(true); setAnswers((prev) => [...prev, { selected: idx, correct }]); };
  const next = () => { if (currentQ < questions.length - 1) { setCurrentQ((p) => p + 1); setSelected(null); setShowExplanation(false); } else setComplete(true); };

  if (!notebook || !q) return <NotebookLayout notebookId={notebookId} notebookTitle={notebook?.title || "Notebook"} notebookColor={notebook?.color || "#6366f1"}><div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-600">No quiz questions yet. Generate units from Materials first.</div></NotebookLayout>;

  if (complete) {
    const correct = answers.filter((a) => a.correct).length; const accuracy = Math.round((correct / questions.length) * 100);
    return <NotebookLayout notebookId={notebookId} notebookTitle={notebook.title} notebookColor={notebook.color}><div className="flex items-center justify-center min-h-[60vh]"><div className="bg-white rounded-xl border border-slate-200 p-8 text-center max-w-lg w-full"><div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center"><Trophy className="w-10 h-10 text-white" /></div><h2 className="text-2xl font-bold text-slate-900 mb-1">Quiz Complete</h2><p className="text-3xl font-bold text-indigo-600 mb-2">{accuracy}%</p><p className="text-slate-600 mb-4">{correct}/{questions.length} correct · {min}:{sec.toString().padStart(2, "0")}</p><div className="space-y-2 mb-6 text-left">{questions.map((qq, i) => <div key={qq.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg"><div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${answers[i]?.correct ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}>{answers[i]?.correct ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}</div><p className="text-sm text-slate-700 truncate flex-1">{qq.question}</p>{qq.source && <Quote className="w-3 h-3 text-amber-400 shrink-0" />}</div>)}</div><Link href={`/notebook/${notebookId}/units/${unitId}`} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors mx-auto justify-center"><Brain className="w-5 h-5" /> Back to Unit</Link></div></div></NotebookLayout>;
  }

  return <NotebookLayout notebookId={notebookId} notebookTitle={notebook.title} notebookColor={notebook.color}>
    <div className="mb-6"><div className="flex items-center justify-between mb-2"><span className="text-sm text-slate-500">Question {currentQ + 1} of {questions.length}</span><div className="flex items-center gap-4"><span className="text-sm text-slate-500 flex items-center gap-1.5"><Clock className="w-4 h-4" />{min}:{sec.toString().padStart(2, "0")}</span><span className="text-sm font-medium text-emerald-600">{answers.filter((a) => a.correct).length} correct</span></div></div><div className="h-2 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }} /></div></div>
    <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6"><div className="flex items-center gap-2 mb-4"><span className={`text-xs font-medium px-2.5 py-1 rounded-full ${q.difficulty === "easy" ? "bg-emerald-100 text-emerald-700" : q.difficulty === "medium" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{q.difficulty}</span><span className="text-xs text-slate-400">{q.type}</span></div><h2 className="text-xl font-semibold text-slate-900 mb-6">{q.question}</h2><div className="space-y-3">{q.options.map((opt, idx) => { const isSel = selected === idx; const isCorrect = idx === q.correctIndex; let style = "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50"; if (showExplanation) style = isCorrect ? "border-emerald-400 bg-emerald-50" : isSel ? "border-red-400 bg-red-50" : "border-slate-200 opacity-50"; else if (isSel) style = "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200"; return <button key={idx} onClick={() => select(idx)} disabled={showExplanation} className={`w-full flex items-center gap-4 p-4 border-2 rounded-lg text-left transition-all ${style}`}><div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-medium text-sm ${showExplanation && isCorrect ? "bg-emerald-500 text-white" : showExplanation && isSel ? "bg-red-500 text-white" : "bg-slate-100 text-slate-600"}`}>{showExplanation && isCorrect ? <Check className="w-4 h-4" /> : showExplanation && isSel ? <X className="w-4 h-4" /> : String.fromCharCode(65 + idx)}</div><span className="font-medium text-slate-700">{opt}</span></button>; })}</div>{showExplanation && <div className={`mt-6 p-4 rounded-lg border ${selected === q.correctIndex ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}><p className={`text-sm font-medium mb-1 ${selected === q.correctIndex ? "text-emerald-800" : "text-amber-800"}`}>{selected === q.correctIndex ? "Correct!" : "Not quite — here's why:"}</p><p className="text-sm text-slate-700">{q.explanation}</p>{q.source && <p className="text-xs text-amber-600 mt-2 flex items-center gap-1"><Quote className="w-3 h-3" />{q.source}</p>}</div>}</div>
    {showExplanation && <div className="flex justify-end"><button onClick={next} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors">{currentQ < questions.length - 1 ? "Next Question" : "See Results"}<ArrowRight className="w-5 h-5" /></button></div>}
  </NotebookLayout>;
}

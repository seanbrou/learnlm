"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { NotebookLayout } from "../../../notebook-layout";
import {
  BookOpen, ChevronRight, ChevronLeft, ChevronRight as ChevronRightIcon,
  Lightbulb, Quote, ArrowRight, CheckCircle,
  PlayCircle, Zap,
} from "lucide-react";

const mockNotebook = { title: "Biology 101", color: "#10b981", icon: "🧬" };
const mockUnit = { _id: "u2", title: "Cellular Respiration" };

const lessonSections = [
  {
    title: "Overview: How Cells Generate Energy",
    content: `Every living cell needs energy to survive. Cells obtain this energy by breaking down nutrients through a process called **cellular respiration**.

Cellular respiration is the process by which cells extract energy from organic molecules (primarily glucose) and convert it into **ATP (adenosine triphosphate)**, the cell's energy currency.

The overall equation for cellular respiration is:
**C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ~36-38 ATP**

This means one molecule of glucose, in the presence of oxygen, yields approximately 36-38 molecules of ATP.`,
    sourceRefs: ["Campbell Biology Ch. 9, p. 162", "Lecture Notes Week 7, p. 1"],
  },
  {
    title: "The Three Stages",
    content: `Cellular respiration occurs in three major stages:

**1. Glycolysis** (Cytoplasm)
Glucose (6 carbons) is split into two molecules of pyruvate (3 carbons each). This process produces a **net gain of 2 ATP** and 2 NADH. Glycolysis does NOT require oxygen — it is anaerobic.

**2. The Krebs Cycle** (Mitochondrial Matrix)
Each pyruvate enters the mitochondrion and is converted to Acetyl-CoA, which enters the Krebs cycle (also called the Citric Acid Cycle). For each glucose molecule, the Krebs cycle produces **2 ATP, 6 NADH, and 2 FADH₂**.

**3. Electron Transport Chain & Oxidative Phosphorylation** (Inner Mitochondrial Membrane)
NADH and FADH₂ donate electrons to the ETC. As electrons flow through the chain, protons are pumped into the intermembrane space, creating a gradient. This gradient drives ATP synthase to produce **~32-34 ATP**.

Think of it like a hydroelectric dam: the ETC builds up the water behind the dam (proton gradient), and ATP synthase is the turbine that generates power.`,
    sourceRefs: ["Lecture Notes Week 7, pp. 3-8", "Lab Manual — Respiration", "Campbell Biology Ch. 9, pp. 164-172"],
  },
  {
    title: "Key Terms",
    content: null,
    keyTerms: [
      { term: "ATP (Adenosine Triphosphate)", definition: "The cell's energy currency; stores energy in its high-energy phosphate bonds" },
      { term: "NADH", definition: "An electron carrier that transports electrons to the ETC; produced during glycolysis and the Krebs cycle" },
      { term: "FADH₂", definition: "Another electron carrier; produces fewer ATP than NADH in the ETC" },
      { term: "Glycolysis", definition: "The first stage; breaks glucose into pyruvate in the cytoplasm" },
      { term: "Krebs Cycle", definition: "The second stage; completes the breakdown of glucose in the mitochondrial matrix" },
      { term: "Chemiosmosis", definition: "The mechanism of ATP synthesis using a proton gradient across a membrane" },
      { term: "Oxidative Phosphorylation", definition: "ATP production coupled to the ETC; the major source of ATP in respiration" },
      { term: "Cristae", definition: "Folds of the inner mitochondrial membrane that increase surface area for the ETC" },
    ],
    sourceRefs: [],
  },
];

export default function LessonPage() {
  const params = useParams();
  const notebookId = params.id as string;
  const unitId = params.unitId as string;
  const notebook = mockNotebook;

  return (
    <NotebookLayout notebookId={notebookId} notebookTitle={notebook.title} notebookColor={notebook.color}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href={`/notebook/${notebookId}`} className="hover:text-indigo-600">Overview</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href={`/notebook/${notebookId}/units/${unitId}`} className="hover:text-indigo-600">{mockUnit.title}</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-900 font-medium">Lesson</span>
      </div>

      {/* Lesson Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl p-6 mb-6 text-white">
        <div className="flex items-center gap-2 text-indigo-200 text-sm mb-2">
          <BookOpen className="w-4 h-4" />
          Unit 2, Lesson 1
        </div>
        <h1 className="text-2xl font-bold">{mockUnit.title}</h1>
        <p className="text-indigo-100 mt-1">How cells extract energy from nutrients through metabolic pathways</p>
      </div>

      {/* Lesson Content */}
      <div className="space-y-6 mb-8">
        {lessonSections.map((section, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold text-indigo-600">{idx + 1}</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">{section.title}</h2>
            </div>

            {/* Content */}
            {section.content && (
              <div className="prose prose-slate max-w-none">
                {section.content.split("\n\n").map((paragraph, pi) => (
                  <p key={pi} className="text-slate-700 leading-relaxed mb-3 last:mb-0">
                    {paragraph.split("**").map((segment, si) =>
                      si % 2 === 1 ? (
                        <strong key={si} className="font-semibold text-slate-900">{segment}</strong>
                      ) : segment
                    )}
                  </p>
                ))}
              </div>
            )}

            {/* Key Terms */}
            {section.keyTerms && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {section.keyTerms.map((kt, ti) => (
                  <div key={ti} className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm font-semibold text-indigo-700 mb-1">{kt.term}</p>
                    <p className="text-xs text-slate-600">{kt.definition}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Source Citations */}
            {section.sourceRefs && section.sourceRefs.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <Quote className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-xs font-semibold text-slate-400 uppercase">Sources</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {section.sourceRefs.map((ref, ri) => (
                    <span key={ri} className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs rounded-md border border-amber-200">
                      <Quote className="w-3 h-3" />
                      {ref}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium">Previous Section</span>
        </button>

        <div className="flex gap-2">
          <Link
            href={`/notebook/${notebookId}/units/${unitId}/flashcards`}
            className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg font-medium hover:bg-amber-100 transition-colors text-sm"
          >
            <Sparkles className="w-4 h-4" />
            Flashcards
          </Link>
          <Link
            href={`/notebook/${notebookId}/units/${unitId}/quiz`}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Take Quiz
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <button className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors">
          <span className="font-medium">Next Section</span>
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
    </NotebookLayout>
  );
}

function Sparkles(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}

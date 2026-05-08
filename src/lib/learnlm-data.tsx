"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Difficulty = "beginner" | "intermediate" | "advanced";
export type CardDifficulty = "easy" | "medium" | "hard";
export type QuestionType = "recall" | "application" | "analysis" | "exam";
export type ProgressStatus = "not_started" | "learning" | "practicing" | "mastered";

export interface Notebook {
  _id: string;
  title: string;
  description: string;
  subject: string;
  color: string;
  icon: string;
  createdAt: number;
  lastStudiedAt?: number;
  studyStreak: number;
}

export interface Material {
  id: string;
  notebookId: string;
  name: string;
  type: string;
  content: string;
  wordCount: number;
  pages: number;
  size: string;
  date: string;
  status: "processed" | "processing" | "failed";
}

export interface Subunit {
  _id: string;
  unitId: string;
  title: string;
  content: string;
  desc: string;
  mastery: number;
  keyTerms: { term: string; definition: string }[];
  examples: string[];
  misconceptions: { myth: string; reality: string }[];
  sourceRefs: string[];
  order: number;
}

export interface Unit {
  _id: string;
  notebookId: string;
  title: string;
  overview: string;
  objectives: string[];
  prerequisites: string[];
  estimatedMinutes: number;
  difficulty: Difficulty;
  order: number;
  mastery: number;
  status: ProgressStatus;
}

export interface Flashcard {
  id: string;
  unitId: string;
  subunitId: string;
  front: string;
  back: string;
  difficulty: CardDifficulty;
  source: string;
  interval: number;
  easeFactor: number;
  nextReview: number;
  repetitions: number;
  mastery: number;
}

export interface QuizQuestion {
  id: string;
  unitId: string;
  subunitId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: CardDifficulty | "exam";
  type: QuestionType;
  source: string;
}

export interface ChatMessage {
  id: string;
  notebookId: string;
  role: "user" | "assistant" | "system";
  content: string;
  citations?: string[];
  timestamp: number;
}

export interface AppSettings {
  userName: string;
  dailyGoalMinutes: number;
  notifications: boolean;
  theme: "system" | "light" | "dark";
}

export interface LearnLMState {
  notebooks: Notebook[];
  materials: Material[];
  units: Unit[];
  subunits: Subunit[];
  flashcards: Flashcard[];
  questions: QuizQuestion[];
  chatMessages: ChatMessage[];
  settings: AppSettings;
  studyEvents: { id: string; notebookId: string; minutes: number; timestamp: number; kind: string }[];
}

const now = Date.now();
const day = 86400000;
const id = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;

function buildUnit(notebookId: string, index: number, title: string, overview: string, difficulty: Difficulty, mastery: number, subTitles: string[]): Pick<LearnLMState, "units" | "subunits" | "flashcards" | "questions"> {
  const unitId = `${notebookId}_u${index}`;
  const unit: Unit = {
    _id: unitId,
    notebookId,
    title,
    overview,
    difficulty,
    order: index,
    estimatedMinutes: 35 + subTitles.length * 8,
    mastery,
    status: mastery >= 85 ? "mastered" : mastery >= 50 ? "practicing" : mastery > 0 ? "learning" : "not_started",
    prerequisites: index === 1 ? ["No prerequisites"] : [`Complete Unit ${index - 1}`],
    objectives: [
      `Explain the core mechanisms behind ${title}`,
      `Apply ${title} concepts to realistic practice problems`,
      `Identify common misconceptions and fix weak areas`,
    ],
  };
  const subunits: Subunit[] = [];
  const flashcards: Flashcard[] = [];
  const questions: QuizQuestion[] = [];
  subTitles.forEach((subTitle, sIdx) => {
    const subId = `${unitId}_s${sIdx + 1}`;
    const subMastery = Math.max(0, Math.min(100, mastery + (sIdx - 1) * 12));
    subunits.push({
      _id: subId,
      unitId,
      title: subTitle,
      desc: `A focused lesson on ${subTitle.toLowerCase()} inside ${title}.`,
      content: `${subTitle} is one of the essential ideas in ${title}. LearnLM turns the uploaded material into a structured explanation, then reinforces it with examples, retrieval practice, and quiz feedback. Start by connecting the vocabulary to the big picture, then test yourself without looking.`,
      mastery: subMastery,
      keyTerms: [
        { term: subTitle, definition: `The central concept for this subunit in ${title}.` },
        { term: "Mechanism", definition: "The step-by-step process that explains why the concept works." },
        { term: "Application", definition: "Using the concept in a new example or exam-style question." },
      ],
      examples: [
        `Worked example: map ${subTitle.toLowerCase()} from definition → mechanism → consequence.`,
        `Practice example: explain ${subTitle.toLowerCase()} to a beginner in three sentences.`,
      ],
      misconceptions: [
        { myth: `${subTitle} is just memorization.`, reality: `You master ${subTitle} by using it in varied contexts and checking feedback.` },
      ],
      sourceRefs: ["Generated from notebook materials", "AI synthesis"],
      order: sIdx + 1,
    });
    flashcards.push({
      id: `${subId}_fc1`, unitId, subunitId: subId,
      front: `What is the key idea behind ${subTitle}?`,
      back: `${subTitle} explains an important part of ${title}: define it, connect it to the mechanism, then apply it to a problem.`,
      difficulty: sIdx % 3 === 0 ? "easy" : sIdx % 3 === 1 ? "medium" : "hard",
      source: "Generated from notebook materials",
      interval: Math.max(1, 1 + sIdx), easeFactor: 2.5, nextReview: now - day * (sIdx % 2), repetitions: sIdx, mastery: subMastery,
    });
    questions.push({
      id: `${subId}_q1`, unitId, subunitId: subId,
      question: `Which statement best describes ${subTitle}?`,
      options: [
        `It is a core part of ${title} that connects definition, mechanism, and application.`,
        "It is unrelated background information.",
        "It only matters for memorizing vocabulary.",
        "It cannot be tested with examples.",
      ],
      correctIndex: 0,
      explanation: `${subTitle} matters because it helps you reason through ${title}, not just memorize facts.`,
      difficulty: sIdx > 1 ? "medium" : "easy", type: "recall", source: "Generated quiz",
    });
    questions.push({
      id: `${subId}_q2`, unitId, subunitId: subId,
      question: `A student confuses ${subTitle} with a neighboring idea. What should they do first?`,
      options: ["Skip the topic", "Compare definitions and work a concrete example", "Memorize the answer key only", "Stop reviewing"],
      correctIndex: 1,
      explanation: "Contrast plus worked examples is the fastest way to repair a misconception.",
      difficulty: "hard", type: sIdx % 2 ? "analysis" : "application", source: "Adaptive practice",
    });
  });
  questions.push({
    id: `${unitId}_exam1`, unitId, subunitId: subunits[0]._id,
    question: `Exam synthesis: how do the subtopics in ${title} work together?`,
    options: ["They form a connected process", "They are isolated facts", "They only matter in the first lesson", "They cannot be practiced"],
    correctIndex: 0,
    explanation: `A strong answer connects each subunit in ${title} into one causal chain.`,
    difficulty: "exam", type: "exam", source: "Mastery exam",
  });
  return { units: [unit], subunits, flashcards, questions };
}

function seedNotebook(nb: Notebook, specs: [string, string, Difficulty, number, string[]][]) {
  const acc: Pick<LearnLMState, "units" | "subunits" | "flashcards" | "questions"> = { units: [], subunits: [], flashcards: [], questions: [] };
  specs.forEach((spec, i) => {
    const built = buildUnit(nb._id, i + 1, spec[0], spec[1], spec[2], spec[3], spec[4]);
    acc.units.push(...built.units); acc.subunits.push(...built.subunits); acc.flashcards.push(...built.flashcards); acc.questions.push(...built.questions);
  });
  return acc;
}

const notebooks: Notebook[] = [
  { _id: "nb1", title: "Biology 101", description: "Cell biology, genetics, and evolution", subject: "Biology", color: "#10b981", icon: "🧬", createdAt: now - day * 7, studyStreak: 5, lastStudiedAt: now - day },
  { _id: "nb2", title: "MCAT Prep", description: "Comprehensive MCAT study materials", subject: "Medicine", color: "#6366f1", icon: "🩺", createdAt: now - day * 14, studyStreak: 3, lastStudiedAt: now - day * 2 },
  { _id: "nb3", title: "Machine Learning", description: "CS229 lecture notes and papers", subject: "Computer Science", color: "#f59e0b", icon: "🤖", createdAt: now - day * 3, studyStreak: 7, lastStudiedAt: now },
  { _id: "nb4", title: "Organic Chemistry", description: "Reactions, mechanisms, and synthesis", subject: "Chemistry", color: "#ef4444", icon: "⚗️", createdAt: now - day * 21, studyStreak: 2, lastStudiedAt: now - day * 3 },
];

const bio = seedNotebook(notebooks[0], [
  ["Cell Structure", "Explore the organization and function of cellular components.", "beginner", 92, ["Cell Membrane", "Nucleus", "Organelles", "Cell Types"]],
  ["Cellular Respiration", "Understand how cells extract energy from nutrients.", "intermediate", 62, ["Glycolysis", "Krebs Cycle", "Electron Transport Chain", "ATP Synthase & Chemiosmosis"]],
  ["DNA & Protein Synthesis", "From genetic code to functional proteins.", "intermediate", 38, ["DNA Structure", "Replication", "Transcription & Translation"]],
  ["Genetics & Inheritance", "How traits pass from generation to generation.", "advanced", 0, ["Mendelian Genetics", "Beyond Mendel", "Population Genetics"]],
]);
const mcat = seedNotebook(notebooks[1], [
  ["Biochemistry Foundations", "Enzymes, amino acids, and metabolism for the MCAT.", "intermediate", 70, ["Amino Acids", "Enzymes", "Metabolism"]],
  ["Psych/Soc High Yield", "Behavior, development, and research methods.", "beginner", 54, ["Learning", "Memory", "Sociology"]],
]);
const ml = seedNotebook(notebooks[2], [
  ["Supervised Learning", "Regression, classification, and generalization.", "intermediate", 78, ["Linear Models", "Loss Functions", "Validation"]],
  ["Neural Networks", "Representation learning and backpropagation.", "advanced", 44, ["Perceptrons", "Backprop", "Regularization"]],
]);
const chem = seedNotebook(notebooks[3], [
  ["Substitution Reactions", "SN1/SN2 mechanisms and stereochemistry.", "intermediate", 48, ["Leaving Groups", "Nucleophiles", "Stereochemistry"]],
  ["Carbonyl Chemistry", "Reactivity patterns for aldehydes and ketones.", "advanced", 24, ["Nucleophilic Addition", "Acetals", "Enolates"]],
]);

export const initialState: LearnLMState = {
  notebooks,
  materials: notebooks.flatMap((nb, idx) => [
    { id: `${nb._id}_m1`, notebookId: nb._id, name: `${nb.title} Lecture Notes`, type: "pdf", content: `${nb.title} uploaded notes covering the first major units.`, wordCount: 3200, pages: 18 + idx, size: "2.3 MB", date: "May 1, 2026", status: "processed" as const },
    { id: `${nb._id}_m2`, notebookId: nb._id, name: `${nb.title} Study Guide`, type: "doc", content: `Study guide for ${nb.title}.`, wordCount: 1100, pages: 6, size: "0.8 MB", date: "May 4, 2026", status: "processed" as const },
  ]),
  units: [...bio.units, ...mcat.units, ...ml.units, ...chem.units],
  subunits: [...bio.subunits, ...mcat.subunits, ...ml.subunits, ...chem.subunits],
  flashcards: [...bio.flashcards, ...mcat.flashcards, ...ml.flashcards, ...chem.flashcards],
  questions: [...bio.questions, ...mcat.questions, ...ml.questions, ...chem.questions],
  chatMessages: [{ id: "welcome", notebookId: "nb1", role: "assistant", content: "I’m ready to tutor from your notebook materials. Ask a concept question, request quiz questions, or tell me what you’re stuck on.", citations: ["Notebook materials"], timestamp: now - 60000 }],
  settings: { userName: "Sean", dailyGoalMinutes: 30, notifications: true, theme: "system" },
  studyEvents: [0,1,2,4,5,8,9,12].map((d, i) => ({ id: `ev${i}`, notebookId: notebooks[i % notebooks.length]._id, minutes: 20 + i * 5, timestamp: now - day * d, kind: "study" })),
};

const KEY = "learnlm-functional-state-v2";

type Ctx = {
  state: LearnLMState;
  setState: React.Dispatch<React.SetStateAction<LearnLMState>>;
  getNotebook: (id: string) => Notebook | undefined;
  getUnits: (notebookId: string) => Unit[];
  getUnit: (unitId: string) => Unit | undefined;
  getSubunits: (unitId: string) => Subunit[];
  getMaterials: (notebookId: string) => Material[];
  getFlashcards: (unitId?: string, notebookId?: string) => Flashcard[];
  getQuestions: (unitId?: string, type?: QuestionType) => QuizQuestion[];
  notebookStats: (notebookId: string) => { materials: number; units: number; mastery: number; reviews: number; minutesLeft: number };
  createNotebook: (input: { title: string; description: string; subject?: string; color: string; icon: string }) => string;
  addMaterial: (notebookId: string, input: { name: string; content: string; type?: string }) => string;
  removeMaterial: (id: string) => void;
  addGeneratedUnits: (notebookId: string, generated: any) => void;
  addChatMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
  answerQuestion: (questionId: string, selectedIndex: number) => boolean;
  reviewFlashcard: (cardId: string, quality: number) => void;
  markStudied: (notebookId: string, minutes?: number) => void;
  resetData: () => void;
  importData: (json: string) => void;
};

const LearnLMContext = createContext<Ctx | null>(null);

function safeLoad(): LearnLMState {
  if (typeof window === "undefined") return initialState;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw);
    return { ...initialState, ...parsed, settings: { ...initialState.settings, ...parsed.settings } };
  } catch { return initialState; }
}

function recalcUnits(state: LearnLMState): LearnLMState {
  const units = state.units.map((u) => {
    const subs = state.subunits.filter((s) => s.unitId === u._id);
    const mastery = subs.length ? Math.round(subs.reduce((sum, s) => sum + s.mastery, 0) / subs.length) : u.mastery;
    return { ...u, mastery, status: mastery >= 85 ? "mastered" : mastery >= 50 ? "practicing" : mastery > 0 ? "learning" : "not_started" as ProgressStatus };
  });
  return { ...state, units };
}

export function LearnLMProvider({ children }: { children: React.ReactNode }) {
  const [state, setStateBase] = useState<LearnLMState>(initialState);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { setStateBase(safeLoad()); setLoaded(true); }, []);
  useEffect(() => { if (loaded) window.localStorage.setItem(KEY, JSON.stringify(state)); }, [state, loaded]);

  const setState: React.Dispatch<React.SetStateAction<LearnLMState>> = useCallback((next) => {
    setStateBase((prev) => recalcUnits(typeof next === "function" ? (next as (p: LearnLMState) => LearnLMState)(prev) : next));
  }, []);

  const ctx = useMemo<Ctx>(() => ({
    state,
    setState,
    getNotebook: (id) => state.notebooks.find((n) => n._id === id) ?? state.notebooks[0],
    getUnits: (notebookId) => state.units.filter((u) => u.notebookId === notebookId).sort((a,b)=>a.order-b.order),
    getUnit: (unitId) => state.units.find((u) => u._id === unitId) ?? state.units[0],
    getSubunits: (unitId) => state.subunits.filter((s) => s.unitId === unitId).sort((a,b)=>a.order-b.order),
    getMaterials: (notebookId) => state.materials.filter((m) => m.notebookId === notebookId),
    getFlashcards: (unitId, notebookId) => state.flashcards.filter((f) => unitId ? f.unitId === unitId : notebookId ? state.units.some((u)=>u.notebookId===notebookId && u._id===f.unitId) : true),
    getQuestions: (unitId, type) => state.questions.filter((q) => (!unitId || q.unitId === unitId) && (!type || q.type === type)),
    notebookStats: (notebookId) => {
      const units = state.units.filter((u) => u.notebookId === notebookId);
      const materials = state.materials.filter((m) => m.notebookId === notebookId).length;
      const mastery = units.length ? Math.round(units.reduce((s,u)=>s+u.mastery,0)/units.length) : 0;
      const reviews = state.flashcards.filter((f) => units.some((u)=>u._id===f.unitId) && f.nextReview <= Date.now()).length;
      const minutesLeft = Math.round(units.filter((u)=>u.status!=="mastered").reduce((s,u)=>s+u.estimatedMinutes*(1-u.mastery/100),0));
      return { materials, units: units.length, mastery, reviews, minutesLeft };
    },
    createNotebook: (input) => {
      const newId = id("nb");
      setState((s) => ({ ...s, notebooks: [{ _id: newId, subject: input.subject || "General", createdAt: Date.now(), studyStreak: 0, ...input }, ...s.notebooks] }));
      return newId;
    },
    addMaterial: (notebookId, input) => {
      const mid = id("mat");
      const words = input.content.trim().split(/\s+/).filter(Boolean).length;
      setState((s) => ({ ...s, materials: [{ id: mid, notebookId, name: input.name, type: input.type || "txt", content: input.content, wordCount: words, pages: Math.max(1, Math.ceil(words / 450)), size: `${Math.max(1, Math.round(input.content.length / 1024))} KB`, date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), status: "processed" }, ...s.materials] }));
      return mid;
    },
    removeMaterial: (mid) => setState((s) => ({ ...s, materials: s.materials.filter((m)=>m.id!==mid) })),
    addGeneratedUnits: (notebookId, generated) => {
      const unitInputs = Array.isArray(generated?.units) ? generated.units : [];
      setState((s) => {
        const existing = s.units.filter((u)=>u.notebookId===notebookId).length;
        const next = { ...s, units: [...s.units], subunits: [...s.subunits], flashcards: [...s.flashcards], questions: [...s.questions] };
        unitInputs.slice(0, 8).forEach((gu: any, idx: number) => {
          const unitId = id("unit");
          next.units.push({ _id: unitId, notebookId, title: gu.title || `Generated Unit ${idx+1}`, overview: gu.overview || gu.description || "AI generated unit from your materials.", objectives: gu.objectives || gu.learningObjectives || ["Understand the concept", "Practice retrieval", "Apply with feedback"], prerequisites: gu.prerequisites || [], estimatedMinutes: Number(gu.estimatedMinutes || 45), difficulty: ["beginner","intermediate","advanced"].includes(gu.difficulty) ? gu.difficulty : "intermediate", order: existing + idx + 1, mastery: 0, status: "not_started" });
          const subs = Array.isArray(gu.subunits) && gu.subunits.length ? gu.subunits : [{ title: "Core Concepts", content: gu.content || gu.overview || "Generated lesson" }];
          subs.slice(0, 6).forEach((gs: any, si: number) => {
            const subId = id("sub");
            next.subunits.push({ _id: subId, unitId, title: gs.title || `Subunit ${si+1}`, content: gs.content || "AI generated lesson content.", desc: gs.desc || gs.summary || "Generated from your material", mastery: 0, keyTerms: gs.keyTerms || [], examples: gs.examples || [], misconceptions: gs.misconceptions || gs.misconceptionChecks || [], sourceRefs: gs.sourceRefs || gs.sourceLinks?.map((x:any)=>x.snippet) || ["AI generated"], order: si + 1 });
            (gs.flashcards || [{ front: `What is ${gs.title || gu.title}?`, back: gs.content || gu.overview || "Review the lesson." }]).slice(0, 6).forEach((fc: any) => next.flashcards.push({ id: id("fc"), unitId, subunitId: subId, front: fc.front || fc.question || "Review prompt", back: fc.back || fc.answer || "Review the lesson content.", difficulty: "medium", source: "AI generated", interval: 1, easeFactor: 2.5, nextReview: Date.now(), repetitions: 0, mastery: 0 }));
            (gs.quiz || gu.quiz || []).slice(0, 6).forEach((qq: any) => next.questions.push({ id: id("q"), unitId, subunitId: subId, question: qq.question || "Practice question", options: qq.options || ["A", "B", "C", "D"], correctIndex: Number(qq.correctIndex ?? qq.correctOption ?? 0), explanation: qq.explanation || "Review the source material.", difficulty: "medium", type: "recall", source: "AI generated" }));
          });
        });
        return next;
      });
    },
    addChatMessage: (message) => setState((s) => ({ ...s, chatMessages: [...s.chatMessages, { ...message, id: id("msg"), timestamp: Date.now() }] })),
    answerQuestion: (questionId, selectedIndex) => {
      const q = state.questions.find((x) => x.id === questionId);
      const correct = q ? q.correctIndex === selectedIndex : false;
      if (q) setState((s) => ({ ...s,
        subunits: s.subunits.map((sub) => sub._id === q.subunitId ? { ...sub, mastery: Math.max(0, Math.min(100, sub.mastery + (correct ? 8 : -3))) } : sub),
        studyEvents: [...s.studyEvents, { id: id("ev"), notebookId: s.units.find((u)=>u._id===q.unitId)?.notebookId || "nb1", minutes: 5, timestamp: Date.now(), kind: correct ? "correct" : "practice" }],
      }));
      return correct;
    },
    reviewFlashcard: (cardId, quality) => setState((s) => ({ ...s, flashcards: s.flashcards.map((f) => {
      if (f.id !== cardId) return f;
      let interval = f.interval, easeFactor = f.easeFactor, repetitions = f.repetitions;
      if (quality < 3) { repetitions = 0; interval = 1; } else { interval = repetitions === 0 ? 1 : repetitions === 1 ? 6 : Math.round(interval * easeFactor); easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))); repetitions += 1; }
      return { ...f, interval, easeFactor, repetitions, nextReview: Date.now() + interval * day, mastery: Math.max(0, Math.min(100, f.mastery + (quality >= 3 ? 10 : -8))) };
    }) })),
    markStudied: (notebookId, minutes = 10) => setState((s) => ({ ...s,
      notebooks: s.notebooks.map((n) => n._id !== notebookId ? n : { ...n, lastStudiedAt: Date.now(), studyStreak: n.lastStudiedAt && Date.now() - n.lastStudiedAt < day * 2 ? Math.max(1, n.studyStreak) : 1 }),
      studyEvents: [...s.studyEvents, { id: id("ev"), notebookId, minutes, timestamp: Date.now(), kind: "study" }],
    })),
    resetData: () => { window.localStorage.removeItem(KEY); setState(initialState); },
    importData: (json) => setState(JSON.parse(json)),
  }), [state, setState]);

  return <LearnLMContext.Provider value={ctx}>{children}</LearnLMContext.Provider>;
}

export function useLearnLM() {
  const ctx = useContext(LearnLMContext);
  if (!ctx) throw new Error("useLearnLM must be used inside LearnLMProvider");
  return ctx;
}

export function getStatus(mastery: number): ProgressStatus {
  return mastery >= 85 ? "mastered" : mastery >= 50 ? "practicing" : mastery > 0 ? "learning" : "not_started";
}

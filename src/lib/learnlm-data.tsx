"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  addGeneratedUnitsToState,
  day,
  id,
  initialState,
  migrateState,
  resolveUnitId,
  reviewFlashcardInState,
  type ChatMessage,
  type Flashcard,
  type LearnLMState,
  type Material,
  type Notebook,
  type ProgressStatus,
  type QuestionType,
  type QuizQuestion,
  type Subunit,
  type Unit,
} from "./learnlm-logic";

export { initialState } from "./learnlm-logic";
const KEY = "learnlm-functional-state-v2";

type Ctx = {
  state: LearnLMState;
  setState: React.Dispatch<React.SetStateAction<LearnLMState>>;
  getNotebook: (id: string) => Notebook | undefined;
  getUnits: (notebookId: string) => Unit[];
  getUnit: (unitId: string, notebookId?: string) => Unit | undefined;
  getSubunits: (unitId: string, notebookId?: string) => Subunit[];
  getMaterials: (notebookId: string) => Material[];
  getFlashcards: (unitId?: string, notebookId?: string) => Flashcard[];
  getQuestions: (unitId?: string, type?: QuestionType, notebookId?: string) => QuizQuestion[];
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
    return migrateState(JSON.parse(raw));
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

  const markStudied = useCallback((notebookId: string, minutes = 10) => setState((s) => {
    const now = Date.now();
    const todayKey = new Date(now).toDateString();
    const alreadyMarkedToday = s.studyEvents.some((e) => e.notebookId === notebookId && e.kind === "study" && new Date(e.timestamp).toDateString() === todayKey);
    return {
      ...s,
      notebooks: s.notebooks.map((n) => n._id !== notebookId ? n : { ...n, lastStudiedAt: now, studyStreak: n.lastStudiedAt && now - n.lastStudiedAt < day * 2 ? Math.max(1, n.studyStreak) : 1 }),
      studyEvents: alreadyMarkedToday ? s.studyEvents : [...s.studyEvents, { id: id("ev"), notebookId, minutes, timestamp: now, kind: "study" }],
    };
  }), [setState]);

  const ctx = useMemo<Ctx>(() => ({
    state,
    setState,
    getNotebook: (id) => state.notebooks.find((n) => n._id === id),
    getUnits: (notebookId) => state.units.filter((u) => u.notebookId === notebookId).sort((a,b)=>a.order-b.order),
    getUnit: (unitId, notebookId) => {
      const resolved = resolveUnitId(state, unitId, notebookId);
      return resolved ? state.units.find((u) => u._id === resolved) : undefined;
    },
    getSubunits: (unitId, notebookId) => {
      const resolved = resolveUnitId(state, unitId, notebookId) || unitId;
      return state.subunits.filter((s) => s.unitId === resolved).sort((a,b)=>a.order-b.order);
    },
    getMaterials: (notebookId) => state.materials.filter((m) => m.notebookId === notebookId),
    getFlashcards: (unitId, notebookId) => {
      const resolved = unitId ? resolveUnitId(state, unitId, notebookId) : undefined;
      return state.flashcards.filter((f) => resolved ? f.unitId === resolved : notebookId ? state.units.some((u)=>u.notebookId===notebookId && u._id===f.unitId) : true);
    },
    getQuestions: (unitId, type, notebookId) => {
      const resolved = unitId ? resolveUnitId(state, unitId, notebookId) : undefined;
      return state.questions.filter((q) => (!unitId || q.unitId === resolved) && (!type || q.type === type));
    },
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
    addGeneratedUnits: (notebookId, generated) => setState((s) => addGeneratedUnitsToState(s, notebookId, generated)),
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
    reviewFlashcard: (cardId, quality) => setState((s) => reviewFlashcardInState(s, cardId, quality)),
    markStudied,
    resetData: () => { window.localStorage.removeItem(KEY); setState(initialState); },
    importData: (json) => {
      try { setState(migrateState(JSON.parse(json))); }
      catch { setState((s) => s); }
    },
  }), [state, setState, markStudied]);

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
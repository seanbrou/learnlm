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

export const now = Date.now();
export const day = 86400000;
export const id = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;

export function buildUnit(notebookId: string, index: number, title: string, overview: string, difficulty: Difficulty, mastery: number, subTitles: string[]): Pick<LearnLMState, "units" | "subunits" | "flashcards" | "questions"> {
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

export function seedNotebook(nb: Notebook, specs: [string, string, Difficulty, number, string[]][]) {
  const acc: Pick<LearnLMState, "units" | "subunits" | "flashcards" | "questions"> = { units: [], subunits: [], flashcards: [], questions: [] };
  specs.forEach((spec, i) => {
    const built = buildUnit(nb._id, i + 1, spec[0], spec[1], spec[2], spec[3], spec[4]);
    acc.units.push(...built.units); acc.subunits.push(...built.subunits); acc.flashcards.push(...built.flashcards); acc.questions.push(...built.questions);
  });
  return acc;
}

export const notebooks: Notebook[] = [
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



export function migrateState(parsed: Partial<LearnLMState> | null | undefined): LearnLMState {
  const base: LearnLMState = {
    ...initialState,
    ...(parsed || {}),
    notebooks: Array.isArray(parsed?.notebooks) ? parsed.notebooks : initialState.notebooks,
    units: Array.isArray(parsed?.units) ? parsed.units : initialState.units,
    subunits: Array.isArray(parsed?.subunits) ? parsed.subunits : initialState.subunits,
    materials: Array.isArray(parsed?.materials) ? parsed.materials : initialState.materials,
    flashcards: Array.isArray(parsed?.flashcards) ? parsed.flashcards : initialState.flashcards,
    questions: Array.isArray(parsed?.questions) ? parsed.questions : initialState.questions,
    chatMessages: Array.isArray(parsed?.chatMessages) ? parsed.chatMessages : initialState.chatMessages,
    studyEvents: Array.isArray(parsed?.studyEvents) ? parsed.studyEvents : initialState.studyEvents,
    settings: { ...initialState.settings, ...(parsed?.settings || {}) },
  };

  const withSeededCompleteness: LearnLMState = {
    ...base,
    notebooks: [...base.notebooks],
    units: [...base.units],
    subunits: [...base.subunits],
    materials: [...base.materials],
    flashcards: [...base.flashcards],
    questions: [...base.questions],
  };

  initialState.notebooks.forEach((seed) => {
    if (!withSeededCompleteness.notebooks.some((n) => n._id === seed._id)) withSeededCompleteness.notebooks.push(seed);
  });
  initialState.units.forEach((seed) => {
    if (!withSeededCompleteness.units.some((u) => u._id === seed._id)) withSeededCompleteness.units.push(seed);
  });
  initialState.subunits.forEach((seed) => {
    if (!withSeededCompleteness.subunits.some((s) => s._id === seed._id)) withSeededCompleteness.subunits.push(seed);
  });
  initialState.materials.forEach((seed) => {
    if (!withSeededCompleteness.materials.some((m) => m.id === seed.id)) withSeededCompleteness.materials.push(seed);
  });

  const units = withSeededCompleteness.units.map((u) => u._id);
  units.forEach((unitId) => {
    const unit = withSeededCompleteness.units.find((u) => u._id === unitId)!;
    const existingSubunits = withSeededCompleteness.subunits.filter((s) => s.unitId === unitId);
    if (existingSubunits.length === 0) {
      const subId = `${unitId}_auto_s1`;
      withSeededCompleteness.subunits.push({
        _id: subId,
        unitId,
        title: "Core Concepts",
        desc: "Auto-restored lesson content",
        content: unit.overview || `Core ideas for ${unit.title}.`,
        mastery: unit.mastery || 0,
        keyTerms: [{ term: unit.title, definition: `The core concept covered by ${unit.title}.` }],
        examples: [`Explain ${unit.title} with one concrete example.`],
        misconceptions: [{ myth: "Recognition is mastery", reality: "You need recall plus application to prove mastery." }],
        sourceRefs: ["Restored learning path"],
        order: 1,
      });
    }
    const currentSubunits = withSeededCompleteness.subunits.filter((s) => s.unitId === unitId);
    if (!withSeededCompleteness.flashcards.some((f) => f.unitId === unitId)) {
      currentSubunits.slice(0, 4).forEach((s) => withSeededCompleteness.flashcards.push({
        id: `${s._id}_auto_fc`, unitId, subunitId: s._id,
        front: `What is ${s.title}?`, back: s.content,
        difficulty: "medium", source: "Restored flashcard", interval: 1, easeFactor: 2.5, nextReview: now, repetitions: 0, mastery: 0,
      }));
    }
    if (!withSeededCompleteness.questions.some((q) => q.unitId === unitId && q.type !== "exam")) {
      currentSubunits.slice(0, 4).forEach((s) => withSeededCompleteness.questions.push({
        id: `${s._id}_auto_q`, unitId, subunitId: s._id,
        question: `Which statement best explains ${s.title}?`,
        options: ["It connects definition, mechanism, and application", "It is just background trivia", "It cannot be practiced", "It only requires rereading"],
        correctIndex: 0,
        explanation: `${s.title} is mastered by connecting the concept to mechanism and application.`,
        difficulty: "medium", type: "recall", source: "Restored quiz",
      }));
    }
    if (!withSeededCompleteness.questions.some((q) => q.unitId === unitId && q.type === "exam")) {
      const firstSub = currentSubunits[0];
      withSeededCompleteness.questions.push({
        id: `${unitId}_auto_exam`, unitId, subunitId: firstSub._id,
        question: `Exam synthesis: how do the ideas in ${unit.title} fit together?`,
        options: ["They form a connected model", "They are isolated facts", "They are unrelated to examples", "They should only be reread"],
        correctIndex: 0,
        explanation: `A strong exam answer connects ${unit.title} into one usable model.`,
        difficulty: "exam", type: "exam", source: "Restored exam",
      });
    }
  });

  return withSeededCompleteness;
}

export function normalizeGeneratedQuestion(raw: any, fallbackQuestion: string, fallbackExplanation: string, type: QuestionType = "recall"): Omit<QuizQuestion, "id" | "unitId" | "subunitId"> {
  const options = Array.isArray(raw?.options) && raw.options.length >= 2
    ? raw.options.slice(0, 4).map(String)
    : ["Connect the definition, mechanism, and application", "Memorize random facts only", "Skip feedback", "Avoid examples"];
  while (options.length < 4) options.push(`Option ${options.length + 1}`);
  const correctIndex = Math.max(0, Math.min(options.length - 1, Number(raw?.correctIndex ?? raw?.correctOption ?? 0) || 0));
  return {
    question: raw?.question || fallbackQuestion,
    options,
    correctIndex,
    explanation: raw?.explanation || fallbackExplanation,
    difficulty: type === "exam" ? "exam" : "medium",
    type,
    source: raw?.source || "AI generated",
  };
}

export function addGeneratedUnitsToState(state: LearnLMState, notebookId: string, generated: any, timestamp = Date.now()): LearnLMState {
  const unitInputs = Array.isArray(generated?.units) ? generated.units : [];
  const existing = state.units.filter((u) => u.notebookId === notebookId).length;
  const next: LearnLMState = {
    ...state,
    units: [...state.units],
    subunits: [...state.subunits],
    flashcards: [...state.flashcards],
    questions: [...state.questions],
  };

  unitInputs.slice(0, 8).forEach((gu: any, idx: number) => {
    const unitId = id("unit");
    const title = gu?.title || `Generated Unit ${idx + 1}`;
    const overview = gu?.overview || gu?.description || "AI generated unit from your materials.";
    next.units.push({
      _id: unitId,
      notebookId,
      title,
      overview,
      objectives: Array.isArray(gu?.objectives) ? gu.objectives : Array.isArray(gu?.learningObjectives) ? gu.learningObjectives : ["Understand the concept", "Practice retrieval", "Apply with feedback"],
      prerequisites: Array.isArray(gu?.prerequisites) ? gu.prerequisites : [],
      estimatedMinutes: Number(gu?.estimatedMinutes || 45),
      difficulty: ["beginner", "intermediate", "advanced"].includes(gu?.difficulty) ? gu.difficulty : "intermediate",
      order: existing + idx + 1,
      mastery: 0,
      status: "not_started",
    });

    const rawSubs = Array.isArray(gu?.subunits) && gu.subunits.length ? gu.subunits : [{ title: "Core Concepts", content: gu?.content || overview }];
    const createdSubIds: string[] = [];
    rawSubs.slice(0, 6).forEach((gs: any, si: number) => {
      const subId = id("sub");
      createdSubIds.push(subId);
      const subTitle = gs?.title || `Subunit ${si + 1}`;
      const content = gs?.content || `Study ${subTitle} inside ${title}.`;
      next.subunits.push({
        _id: subId,
        unitId,
        title: subTitle,
        content,
        desc: gs?.desc || gs?.summary || "Generated from your material",
        mastery: 0,
        keyTerms: Array.isArray(gs?.keyTerms) ? gs.keyTerms : [],
        examples: Array.isArray(gs?.examples) ? gs.examples : [`Apply ${subTitle} to a concrete example.`],
        misconceptions: Array.isArray(gs?.misconceptions) ? gs.misconceptions : Array.isArray(gs?.misconceptionChecks) ? gs.misconceptionChecks : [],
        sourceRefs: Array.isArray(gs?.sourceRefs) ? gs.sourceRefs : Array.isArray(gs?.sourceLinks) ? gs.sourceLinks.map((x: any) => x.snippet || x.sourceId || "Source") : ["AI generated"],
        order: si + 1,
      });

      const rawFlashcards = Array.isArray(gs?.flashcards) && gs.flashcards.length ? gs.flashcards : [
        { front: `What is ${subTitle}?`, back: content },
        { front: `Why does ${subTitle} matter in ${title}?`, back: `It helps connect ${title} concepts to practice and assessment.` },
      ];
      rawFlashcards.slice(0, 6).forEach((fc: any) => next.flashcards.push({
        id: id("fc"), unitId, subunitId: subId,
        front: fc?.front || fc?.question || `Review ${subTitle}`,
        back: fc?.back || fc?.answer || content,
        difficulty: "medium", source: fc?.source || "AI generated",
        interval: 1, easeFactor: 2.5, nextReview: timestamp, repetitions: 0, mastery: 0,
      }));

      const rawQuiz = Array.isArray(gs?.quiz) && gs.quiz.length ? gs.quiz : Array.isArray(gu?.quiz) && gu.quiz.length ? gu.quiz : [{}];
      rawQuiz.slice(0, 6).forEach((qq: any, qi: number) => {
        const normalized = normalizeGeneratedQuestion(
          qq,
          qi === 0 ? `Which statement best explains ${subTitle}?` : `How would you apply ${subTitle}?`,
          `${subTitle} should be understood through definition, mechanism, and application.`,
          "recall",
        );
        next.questions.push({ id: id("q"), unitId, subunitId: subId, ...normalized });
      });
    });

    const firstSubId = createdSubIds[0] || id("sub");
    const exam = normalizeGeneratedQuestion(
      Array.isArray(gu?.exam) ? gu.exam[0] : undefined,
      `Exam synthesis: how do the key ideas in ${title} work together?`,
      `A strong exam answer connects the unit's concepts into one causal model and applies it to a new example.`,
      "exam",
    );
    next.questions.push({ id: id("q"), unitId, subunitId: firstSubId, ...exam });
  });
  return next;
}

export function resolveUnitId(state: LearnLMState, unitId?: string, notebookId?: string): string | undefined {
  if (!unitId) return undefined;
  if (state.units.some((u) => u._id === unitId)) return unitId;
  const compact = unitId.replace(/^unit[-_]?/i, "").replace(/^u/i, "");
  const candidates = notebookId ? state.units.filter((u) => u.notebookId === notebookId) : state.units;
  return candidates.find((u) => u._id.endsWith(`_u${compact}`) || String(u.order) === compact)?._id;
}

export function reviewFlashcardInState(state: LearnLMState, cardId: string, quality: number, timestamp = Date.now()): LearnLMState {
  return {
    ...state,
    flashcards: state.flashcards.map((f) => {
      if (f.id !== cardId) return f;
      let interval = f.interval, easeFactor = f.easeFactor, repetitions = f.repetitions;
      if (quality < 3) {
        repetitions = 0;
        interval = 1;
      } else {
        interval = repetitions === 0 ? 1 : repetitions === 1 ? 6 : Math.round(interval * easeFactor);
        easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
        repetitions += 1;
      }
      return { ...f, interval, easeFactor, repetitions, nextReview: timestamp + interval * day, mastery: Math.max(0, Math.min(100, f.mastery + (quality >= 3 ? 10 : -8))) };
    }),
  };
}

export function fisherYatesOrder(length: number, random: () => number = Math.random): number[] {
  const order = Array.from({ length }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

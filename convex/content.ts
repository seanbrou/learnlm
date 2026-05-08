import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

type Difficulty = "beginner" | "intermediate" | "advanced";
type CardDifficulty = "easy" | "medium" | "hard";
type QuestionType = "recall" | "application" | "analysis" | "exam";
type MasteryStatus = "not_started" | "learning" | "practicing" | "mastered";

async function ownerId(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  return identity?.subject ?? "demo";
}

function asDifficulty(value: unknown): Difficulty {
  return value === "beginner" || value === "advanced" ? value : "intermediate";
}

function asCardDifficulty(value: unknown): CardDifficulty {
  return value === "easy" || value === "hard" ? value : "medium";
}

function asQuestionType(value: unknown): QuestionType {
  return value === "application" || value === "analysis" || value === "exam" ? value : "recall";
}

function asStatus(mastery: number): MasteryStatus {
  return mastery >= 85 ? "mastered" : mastery >= 50 ? "practicing" : mastery > 0 ? "learning" : "not_started";
}

function strings(value: unknown, fallback: string[] = []) {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : fallback;
}

function keyTerms(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 30).map((x: any) => ({ term: String(x?.term ?? "Term"), definition: String(x?.definition ?? "Definition") }));
}

function misconceptions(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 20).map((x: any) => ({ myth: String(x?.myth ?? x?.question ?? "Misconception"), reality: String(x?.reality ?? x?.answer ?? "Correction") }));
}

// ===== NOTEBOOKS =====
export const createNotebook = mutation({
  args: { title: v.string(), description: v.string(), subject: v.optional(v.string()), color: v.string(), icon: v.string() },
  handler: async (ctx, args) => {
    const user = await ownerId(ctx);
    return await ctx.db.insert("notebooks", {
      ownerId: user,
      title: args.title,
      description: args.description,
      subject: args.subject ?? "General",
      color: args.color,
      icon: args.icon,
      createdAt: Date.now(),
      lastStudiedAt: undefined,
      studyStreak: 0,
    });
  },
});

export const getNotebooks = query({
  handler: async (ctx) => {
    const user = await ownerId(ctx);
    return await ctx.db.query("notebooks").withIndex("by_owner", (q) => q.eq("ownerId", user)).order("desc").collect();
  },
});

export const getNotebook = query({
  args: { id: v.id("notebooks") },
  handler: async (ctx, args) => {
    const user = await ownerId(ctx);
    const notebook = await ctx.db.get(args.id);
    if (!notebook || notebook.ownerId !== user) return null;
    return notebook;
  },
});

export const markStudied = mutation({
  args: { notebookId: v.id("notebooks"), minutes: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await ownerId(ctx);
    const notebook = await ctx.db.get(args.notebookId);
    if (!notebook || notebook.ownerId !== user) return;
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const streak = notebook.lastStudiedAt && now - notebook.lastStudiedAt < day * 2 ? Math.max(1, notebook.studyStreak ?? 1) : 1;
    await ctx.db.patch(args.notebookId, { lastStudiedAt: now, studyStreak: streak });
    await ctx.db.insert("studyEvents", { ownerId: user, notebookId: args.notebookId, minutes: args.minutes ?? 10, kind: "study", timestamp: now });
  },
});

export const deleteNotebook = mutation({
  args: { id: v.id("notebooks") },
  handler: async (ctx, args) => {
    const user = await ownerId(ctx);
    const notebook = await ctx.db.get(args.id);
    if (!notebook || notebook.ownerId !== user) return;

    for (const m of await ctx.db.query("materials").withIndex("by_notebook", (q) => q.eq("notebookId", args.id)).collect()) await ctx.db.delete(m._id);
    for (const u of await ctx.db.query("units").withIndex("by_notebook", (q) => q.eq("notebookId", args.id)).collect()) {
      for (const s of await ctx.db.query("subunits").withIndex("by_unit", (q) => q.eq("unitId", u._id)).collect()) {
        for (const f of await ctx.db.query("flashcards").withIndex("by_subunit", (q) => q.eq("subunitId", s._id)).collect()) await ctx.db.delete(f._id);
        for (const qq of await ctx.db.query("quizQuestions").withIndex("by_subunit", (q) => q.eq("subunitId", s._id)).collect()) await ctx.db.delete(qq._id);
        await ctx.db.delete(s._id);
      }
      for (const attempt of await ctx.db.query("quizAttempts").withIndex("by_unit", (q) => q.eq("unitId", u._id)).collect()) await ctx.db.delete(attempt._id);
      await ctx.db.delete(u._id);
    }
    for (const p of await ctx.db.query("progress").withIndex("by_notebook", (q) => q.eq("notebookId", args.id)).collect()) await ctx.db.delete(p._id);
    for (const c of await ctx.db.query("chatMessages").withIndex("by_notebook", (q) => q.eq("notebookId", args.id)).collect()) await ctx.db.delete(c._id);
    for (const e of await ctx.db.query("studyEvents").withIndex("by_notebook", (q) => q.eq("notebookId", args.id)).collect()) await ctx.db.delete(e._id);
    await ctx.db.delete(args.id);
  },
});

// ===== MATERIALS =====
export const uploadMaterial = mutation({
  args: { notebookId: v.id("notebooks"), name: v.string(), content: v.string(), fileType: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await ownerId(ctx);
    const wordCount = args.content.trim().split(/\s+/).filter(Boolean).length;
    return await ctx.db.insert("materials", {
      ownerId: user,
      notebookId: args.notebookId,
      name: args.name,
      content: args.content,
      fileType: args.fileType ?? "txt",
      wordCount,
      pages: Math.max(1, Math.ceil(wordCount / 450)),
      size: `${Math.max(1, Math.round(args.content.length / 1024))} KB`,
      processed: true,
      createdAt: Date.now(),
    });
  },
});

export const getMaterials = query({
  args: { notebookId: v.id("notebooks") },
  handler: async (ctx, args) => await ctx.db.query("materials").withIndex("by_notebook", (q) => q.eq("notebookId", args.notebookId)).order("desc").collect(),
});

export const deleteMaterial = mutation({
  args: { id: v.id("materials") },
  handler: async (ctx, args) => {
    const user = await ownerId(ctx);
    const material = await ctx.db.get(args.id);
    if (material && material.ownerId === user) await ctx.db.delete(args.id);
  },
});

export const markMaterialProcessed = mutation({
  args: { id: v.id("materials") },
  handler: async (ctx, args) => await ctx.db.patch(args.id, { processed: true }),
});

// ===== UNITS / GENERATED CONTENT =====
export const createUnit = mutation({
  args: { notebookId: v.id("notebooks"), title: v.string(), overview: v.string(), objectives: v.array(v.string()), prerequisites: v.array(v.string()), estimatedMinutes: v.number(), difficulty: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")), order: v.number() },
  handler: async (ctx, args) => await ctx.db.insert("units", { ...(args as any), ownerId: await ownerId(ctx), mastery: 0, status: "not_started" }),
});

export const getUnits = query({
  args: { notebookId: v.id("notebooks") },
  handler: async (ctx, args) => await ctx.db.query("units").withIndex("by_notebook", (q) => q.eq("notebookId", args.notebookId)).order("asc").collect(),
});

export const getUnit = query({ args: { id: v.id("units") }, handler: async (ctx, args) => await ctx.db.get(args.id) });

export const createSubunit = mutation({
  args: { unitId: v.id("units"), title: v.string(), content: v.string(), keyTerms: v.array(v.object({ term: v.string(), definition: v.string() })), examples: v.array(v.string()), misconceptions: v.array(v.object({ myth: v.string(), reality: v.string() })), sourceRefs: v.array(v.string()), order: v.number() },
  handler: async (ctx, args) => await ctx.db.insert("subunits", { ...(args as any), ownerId: await ownerId(ctx), mastery: 0 }),
});

export const getSubunits = query({
  args: { unitId: v.id("units") },
  handler: async (ctx, args) => await ctx.db.query("subunits").withIndex("by_unit", (q) => q.eq("unitId", args.unitId)).order("asc").collect(),
});

export const addGeneratedUnits = mutation({
  args: { notebookId: v.id("notebooks"), generated: v.any() },
  handler: async (ctx, args) => {
    const user = await ownerId(ctx);
    const existing = await ctx.db.query("units").withIndex("by_notebook", (q) => q.eq("notebookId", args.notebookId)).collect();
    const created: Id<"units">[] = [];
    const unitInputs = Array.isArray(args.generated?.units) ? args.generated.units : [];
    for (const [idx, gu] of unitInputs.slice(0, 8).entries()) {
      const unitId = await ctx.db.insert("units", {
        ownerId: user,
        notebookId: args.notebookId,
        title: String(gu?.title ?? `Generated Unit ${idx + 1}`),
        overview: String(gu?.overview ?? gu?.description ?? "AI generated unit from your materials."),
        objectives: strings(gu?.objectives ?? gu?.learningObjectives, ["Understand the concept", "Practice retrieval", "Apply with feedback"]),
        prerequisites: strings(gu?.prerequisites),
        estimatedMinutes: Number(gu?.estimatedMinutes ?? 45),
        difficulty: asDifficulty(gu?.difficulty),
        order: existing.length + idx + 1,
        mastery: 0,
        status: "not_started",
      });
      created.push(unitId);
      const subInputs = Array.isArray(gu?.subunits) && gu.subunits.length ? gu.subunits : [{ title: "Core Concepts", content: gu?.content ?? gu?.overview ?? "Generated lesson" }];
      for (const [si, gs] of subInputs.slice(0, 8).entries()) {
        const subunitId = await ctx.db.insert("subunits", {
          ownerId: user,
          unitId,
          title: String(gs?.title ?? `Subunit ${si + 1}`),
          desc: String(gs?.desc ?? gs?.summary ?? "Generated from your material"),
          content: String(gs?.content ?? "AI generated lesson content."),
          mastery: 0,
          keyTerms: keyTerms(gs?.keyTerms),
          examples: strings(gs?.examples),
          misconceptions: misconceptions(gs?.misconceptions ?? gs?.misconceptionChecks),
          sourceRefs: strings(gs?.sourceRefs ?? gs?.sourceLinks?.map((x: any) => x?.snippet), ["AI generated"]),
          order: si + 1,
        });
        const cards = Array.isArray(gs?.flashcards) && gs.flashcards.length ? gs.flashcards : [{ front: `What is ${gs?.title ?? gu?.title ?? "this concept"}?`, back: gs?.content ?? gu?.overview ?? "Review the lesson." }];
        for (const fc of cards.slice(0, 10)) {
          await ctx.db.insert("flashcards", { ownerId: user, unitId, subunitId, front: String(fc?.front ?? fc?.question ?? "Review prompt"), back: String(fc?.back ?? fc?.answer ?? "Review the lesson content."), difficulty: asCardDifficulty(fc?.difficulty), source: "AI generated", interval: 1, easeFactor: 2.5, nextReview: Date.now(), repetitions: 0, mastery: 0 });
        }
        const qs = Array.isArray(gs?.quiz) ? gs.quiz : Array.isArray(gu?.quiz) ? gu.quiz : [];
        for (const qq of qs.slice(0, 10)) {
          await ctx.db.insert("quizQuestions", { ownerId: user, unitId, subunitId, question: String(qq?.question ?? "Practice question"), options: strings(qq?.options, ["A", "B", "C", "D"]).slice(0, 4), correctIndex: Number(qq?.correctIndex ?? qq?.correctOption ?? 0), explanation: String(qq?.explanation ?? "Review the source material."), difficulty: asCardDifficulty(qq?.difficulty), type: asQuestionType(qq?.type), sourceRefs: ["AI generated"] });
        }
      }
    }
    return created;
  },
});

// ===== FLASHCARDS / QUIZ / PROGRESS =====
export const getFlashcards = query({
  args: { unitId: v.optional(v.id("units")), subunitId: v.optional(v.id("subunits")) },
  handler: async (ctx, args) => {
    if (args.unitId) return await ctx.db.query("flashcards").withIndex("by_unit", (q) => q.eq("unitId", args.unitId!)).collect();
    if (args.subunitId) return await ctx.db.query("flashcards").withIndex("by_subunit", (q) => q.eq("subunitId", args.subunitId!)).collect();
    const user = await ownerId(ctx);
    return await ctx.db.query("flashcards").withIndex("by_owner", (q) => q.eq("ownerId", user)).collect();
  },
});

export const getFlashcardsForReview = query({
  args: { notebookId: v.optional(v.id("notebooks")) },
  handler: async (ctx, args) => {
    const now = Date.now();
    const user = await ownerId(ctx);
    const cards = (await ctx.db.query("flashcards").withIndex("by_owner", (q) => q.eq("ownerId", user)).collect()).filter((fc) => fc.nextReview <= now);
    if (!args.notebookId) return cards;
    const units = await ctx.db.query("units").withIndex("by_notebook", (q) => q.eq("notebookId", args.notebookId!)).collect();
    const unitIds = new Set(units.map((u) => u._id));
    return cards.filter((fc) => unitIds.has(fc.unitId));
  },
});

export const updateFlashcardReview = mutation({
  args: { id: v.id("flashcards"), quality: v.number() },
  handler: async (ctx, args) => {
    const fc = await ctx.db.get(args.id);
    if (!fc) return;
    let { interval, easeFactor, repetitions } = fc;
    const quality = Math.max(0, Math.min(5, args.quality));
    if (quality < 3) { repetitions = 0; interval = 1; }
    else { interval = repetitions === 0 ? 1 : repetitions === 1 ? 6 : Math.round(interval * easeFactor); easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))); repetitions++; }
    await ctx.db.patch(args.id, { interval, easeFactor, repetitions, nextReview: Date.now() + interval * 24 * 60 * 60 * 1000, mastery: Math.max(0, Math.min(100, (fc.mastery ?? 0) + (quality >= 3 ? 10 : -8))) });
  },
});

export const getQuizQuestions = query({
  args: { unitId: v.optional(v.id("units")), subunitId: v.optional(v.id("subunits")), type: v.optional(v.union(v.literal("recall"), v.literal("application"), v.literal("analysis"), v.literal("exam"))) },
  handler: async (ctx, args) => {
    let rows;
    if (args.unitId) rows = await ctx.db.query("quizQuestions").withIndex("by_unit", (q) => q.eq("unitId", args.unitId!)).collect();
    else if (args.subunitId) rows = await ctx.db.query("quizQuestions").withIndex("by_subunit", (q) => q.eq("subunitId", args.subunitId!)).collect();
    else {
      const user = await ownerId(ctx);
      rows = await ctx.db.query("quizQuestions").withIndex("by_owner", (q) => q.eq("ownerId", user)).collect();
    }
    return args.type ? rows.filter((q) => q.type === args.type) : rows;
  },
});

export const recordQuizAnswer = mutation({
  args: { notebookId: v.id("notebooks"), unitId: v.id("units"), questionId: v.optional(v.id("quizQuestions")), question: v.string(), selectedIndex: v.number(), correctIndex: v.number(), subunitId: v.optional(v.id("subunits")) },
  handler: async (ctx, args) => {
    const user = await ownerId(ctx);
    const isCorrect = args.selectedIndex === args.correctIndex;
    await ctx.db.insert("quizAttempts", { ownerId: user, notebookId: args.notebookId, unitId: args.unitId, questionId: args.questionId, question: args.question, selectedIndex: args.selectedIndex, correctIndex: args.correctIndex, isCorrect, createdAt: Date.now() });
    if (args.subunitId) await updateSubunitProgress(ctx, user, args.notebookId, args.subunitId, isCorrect);
    return isCorrect;
  },
});

async function updateSubunitProgress(ctx: any, user: string, notebookId: Id<"notebooks">, subunitId: Id<"subunits">, correct: boolean) {
  const existing = await ctx.db.query("progress").withIndex("by_subunit", (q: any) => q.eq("subunitId", subunitId)).first();
  if (existing) {
    const attempts = existing.attempts + 1;
    const correctAnswers = existing.correctAnswers + (correct ? 1 : 0);
    const incorrectAnswers = existing.incorrectAnswers + (correct ? 0 : 1);
    const mastery = Math.min(100, Math.round((correctAnswers / attempts) * 100));
    await ctx.db.patch(existing._id, { mastery, lastStudied: Date.now(), attempts, correctAnswers, incorrectAnswers, streak: correct ? existing.streak + 1 : 0, status: asStatus(mastery) });
    await ctx.db.patch(subunitId, { mastery });
  } else {
    const mastery = correct ? 100 : 0;
    await ctx.db.insert("progress", { ownerId: user, notebookId, subunitId, mastery, lastStudied: Date.now(), attempts: 1, correctAnswers: correct ? 1 : 0, incorrectAnswers: correct ? 0 : 1, streak: correct ? 1 : 0, status: asStatus(mastery) });
    await ctx.db.patch(subunitId, { mastery });
  }
}

export const setSubunitMastery = mutation({
  args: { notebookId: v.id("notebooks"), subunitId: v.id("subunits"), mastery: v.number() },
  handler: async (ctx, args) => await updateSubunitProgress(ctx, await ownerId(ctx), args.notebookId, args.subunitId, args.mastery >= 70),
});

export const getProgress = query({
  args: { notebookId: v.optional(v.id("notebooks")), subunitId: v.optional(v.id("subunits")) },
  handler: async (ctx, args) => {
    if (args.subunitId) return await ctx.db.query("progress").withIndex("by_subunit", (q) => q.eq("subunitId", args.subunitId!)).first();
    if (args.notebookId) return await ctx.db.query("progress").withIndex("by_notebook", (q) => q.eq("notebookId", args.notebookId!)).collect();
    const user = await ownerId(ctx);
    return await ctx.db.query("progress").withIndex("by_owner", (q) => q.eq("ownerId", user)).collect();
  },
});

// ===== CHAT / SETTINGS / DASHBOARD =====
export const addChatMessage = mutation({
  args: { notebookId: v.optional(v.id("notebooks")), role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")), content: v.string(), citations: v.optional(v.array(v.string())) },
  handler: async (ctx, args) => await ctx.db.insert("chatMessages", { ...(args as any), ownerId: await ownerId(ctx), timestamp: Date.now() }),
});

export const getChatMessages = query({
  args: { notebookId: v.optional(v.id("notebooks")), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    let messages;
    if (args.notebookId) messages = await ctx.db.query("chatMessages").withIndex("by_notebook", (q) => q.eq("notebookId", args.notebookId!)).order("desc").collect();
    else {
      const user = await ownerId(ctx);
      messages = await ctx.db.query("chatMessages").withIndex("by_owner", (q) => q.eq("ownerId", user)).order("desc").collect();
    }
    return messages.slice(0, args.limit ?? 50).reverse();
  },
});

export const clearChat = mutation({
  args: { notebookId: v.optional(v.id("notebooks")) },
  handler: async (ctx, args) => {
    let messages;
    if (args.notebookId) messages = await ctx.db.query("chatMessages").withIndex("by_notebook", (q) => q.eq("notebookId", args.notebookId!)).collect();
    else {
      const user = await ownerId(ctx);
      messages = await ctx.db.query("chatMessages").withIndex("by_owner", (q) => q.eq("ownerId", user)).collect();
    }
    for (const msg of messages) await ctx.db.delete(msg._id);
  },
});

export const getSettings = query({
  handler: async (ctx) => {
    const user = await ownerId(ctx);
    return await ctx.db.query("settings").withIndex("by_owner", (q) => q.eq("ownerId", user)).first();
  },
});

export const updateSettings = mutation({
  args: { userName: v.optional(v.string()), dailyGoalMinutes: v.optional(v.number()), notifications: v.optional(v.boolean()), theme: v.optional(v.union(v.literal("light"), v.literal("dark"), v.literal("system"))) },
  handler: async (ctx, args) => {
    const user = await ownerId(ctx);
    const existing = await ctx.db.query("settings").withIndex("by_owner", (q) => q.eq("ownerId", user)).first();
    const patch = { userName: args.userName ?? existing?.userName ?? "Sean", dailyGoalMinutes: args.dailyGoalMinutes ?? existing?.dailyGoalMinutes ?? 30, notifications: args.notifications ?? existing?.notifications ?? true, theme: args.theme ?? existing?.theme ?? "system", updatedAt: Date.now() };
    if (existing) await ctx.db.patch(existing._id, patch);
    else await ctx.db.insert("settings", { ownerId: user, ...patch });
  },
});

export const getNotebookStats = query({
  args: { notebookId: v.id("notebooks") },
  handler: async (ctx, args) => {
    const units = await ctx.db.query("units").withIndex("by_notebook", (q) => q.eq("notebookId", args.notebookId)).collect();
    const materials = await ctx.db.query("materials").withIndex("by_notebook", (q) => q.eq("notebookId", args.notebookId)).collect();
    const progress = await ctx.db.query("progress").withIndex("by_notebook", (q) => q.eq("notebookId", args.notebookId)).collect();
    const user = await ownerId(ctx);
    const cards = await ctx.db.query("flashcards").withIndex("by_owner", (q) => q.eq("ownerId", user)).collect();
    const unitIds = new Set(units.map((u) => u._id));
    return {
      unitsCount: units.length,
      materialsCount: materials.length,
      totalSubunits: progress.length,
      mastered: progress.filter((p) => p.status === "mastered").length,
      practicing: progress.filter((p) => p.status === "practicing").length,
      learning: progress.filter((p) => p.status === "learning").length,
      avgMastery: progress.length ? Math.round(progress.reduce((s, p) => s + p.mastery, 0) / progress.length) : Math.round(units.reduce((s, u) => s + (u.mastery ?? 0), 0) / Math.max(1, units.length)),
      dueForReview: cards.filter((fc) => unitIds.has(fc.unitId) && fc.nextReview <= Date.now()).length,
      totalWordCount: materials.reduce((s, m) => s + m.wordCount, 0),
    };
  },
});

export const exportAll = query({
  handler: async (ctx) => {
    const user = await ownerId(ctx);
    const byOwner = (table: any) => ctx.db.query(table).withIndex("by_owner", (q: any) => q.eq("ownerId", user)).collect();
    return {
      notebooks: await byOwner("notebooks"),
      materials: await byOwner("materials"),
      units: await byOwner("units"),
      subunits: await byOwner("subunits"),
      flashcards: await byOwner("flashcards"),
      questions: await byOwner("quizQuestions"),
      progress: await byOwner("progress"),
      attempts: await byOwner("quizAttempts"),
      messages: await byOwner("chatMessages"),
      events: await byOwner("studyEvents"),
      settings: await byOwner("settings"),
    };
  },
});

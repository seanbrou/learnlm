import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ===== NOTEBOOKS =====
export const createNotebook = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    subject: v.string(),
    color: v.string(),
    icon: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notebooks", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getNotebooks = query({
  handler: async (ctx) => {
    return await ctx.db.query("notebooks").order("desc").collect();
  },
});

export const getNotebook = query({
  args: { id: v.id("notebooks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const deleteNotebook = mutation({
  args: { id: v.id("notebooks") },
  handler: async (ctx, args) => {
    // Delete related materials, units, progress, chats
    const materials = await ctx.db.query("materials").withIndex("by_notebook", (q) => q.eq("notebookId", args.id)).collect();
    for (const m of materials) await ctx.db.delete(m._id);

    const units = await ctx.db.query("units").withIndex("by_notebook", (q) => q.eq("notebookId", args.id)).collect();
    for (const u of units) {
      const subs = await ctx.db.query("subunits").withIndex("by_unit", (q) => q.eq("unitId", u._id)).collect();
      for (const s of subs) {
        const fcs = await ctx.db.query("flashcards").withIndex("by_subunit", (q) => q.eq("subunitId", s._id)).collect();
        for (const f of fcs) await ctx.db.delete(f._id);
        const qs = await ctx.db.query("quizQuestions").withIndex("by_subunit", (q) => q.eq("subunitId", s._id)).collect();
        for (const q of qs) await ctx.db.delete(q._id);
        await ctx.db.delete(s._id);
      }
      await ctx.db.delete(u._id);
    }

    const prog = await ctx.db.query("progress").withIndex("by_notebook", (q) => q.eq("notebookId", args.id)).collect();
    for (const p of prog) await ctx.db.delete(p._id);

    const chats = await ctx.db.query("chatMessages").withIndex("by_notebook", (q) => q.eq("notebookId", args.id)).collect();
    for (const c of chats) await ctx.db.delete(c._id);

    await ctx.db.delete(args.id);
  },
});

// ===== MATERIALS =====
export const uploadMaterial = mutation({
  args: {
    notebookId: v.id("notebooks"),
    name: v.string(),
    content: v.string(),
    fileType: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("materials", {
      ...args,
      wordCount: args.content.split(/\s+/).length,
      processed: false,
      createdAt: Date.now(),
    });
  },
});

export const getMaterials = query({
  args: { notebookId: v.id("notebooks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("materials")
      .withIndex("by_notebook", (q) => q.eq("notebookId", args.notebookId))
      .order("desc")
      .collect();
  },
});

export const markMaterialProcessed = mutation({
  args: { id: v.id("materials") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { processed: true });
  },
});

// ===== UNITS =====
export const createUnit = mutation({
  args: {
    notebookId: v.id("notebooks"),
    title: v.string(),
    overview: v.string(),
    objectives: v.array(v.string()),
    prerequisites: v.array(v.string()),
    estimatedMinutes: v.number(),
    difficulty: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("units", args);
  },
});

export const getUnits = query({
  args: { notebookId: v.id("notebooks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("units")
      .withIndex("by_notebook", (q) => q.eq("notebookId", args.notebookId))
      .order("asc")
      .collect();
  },
});

export const getUnit = query({
  args: { id: v.id("units") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// ===== SUBUNITS =====
export const createSubunit = mutation({
  args: {
    unitId: v.id("units"),
    title: v.string(),
    content: v.string(),
    keyTerms: v.array(v.object({ term: v.string(), definition: v.string() })),
    examples: v.array(v.string()),
    misconceptions: v.array(v.object({ myth: v.string(), reality: v.string() })),
    sourceRefs: v.array(v.string()),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("subunits", args);
  },
});

export const getSubunits = query({
  args: { unitId: v.id("units") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subunits")
      .withIndex("by_unit", (q) => q.eq("unitId", args.unitId))
      .order("asc")
      .collect();
  },
});

export const getSubunit = query({
  args: { id: v.id("subunits") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// ===== FLASHCARDS =====
export const createFlashcard = mutation({
  args: {
    subunitId: v.id("subunits"),
    unitId: v.id("units"),
    front: v.string(),
    back: v.string(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("flashcards", {
      ...args,
      interval: 1,
      easeFactor: 2.5,
      nextReview: Date.now(),
      repetitions: 0,
    });
  },
});

export const getFlashcards = query({
  args: { unitId: v.optional(v.id("units")), subunitId: v.optional(v.id("subunits")) },
  handler: async (ctx, args) => {
    if (args.unitId) {
      return await ctx.db
        .query("flashcards")
        .withIndex("by_unit", (q) => q.eq("unitId", args.unitId!))
        .collect();
    }
    if (args.subunitId) {
      return await ctx.db
        .query("flashcards")
        .withIndex("by_subunit", (q) => q.eq("subunitId", args.subunitId!))
        .collect();
    }
    return await ctx.db.query("flashcards").collect();
  },
});

export const getFlashcardsForReview = query({
  handler: async (ctx) => {
    const now = Date.now();
    const all = await ctx.db.query("flashcards").withIndex("by_review").collect();
    return all.filter((fc) => fc.nextReview <= now);
  },
});

export const updateFlashcardReview = mutation({
  args: { id: v.id("flashcards"), quality: v.number() },
  handler: async (ctx, args) => {
    const fc = await ctx.db.get(args.id);
    if (!fc) return;

    let { interval, easeFactor, repetitions } = fc;
    const quality = args.quality; // 0-5

    if (quality < 3) {
      repetitions = 0;
      interval = 1;
    } else {
      if (repetitions === 0) interval = 1;
      else if (repetitions === 1) interval = 6;
      else interval = Math.round(interval * easeFactor);

      easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
      if (easeFactor < 1.3) easeFactor = 1.3;
      repetitions++;
    }

    const nextReview = Date.now() + interval * 24 * 60 * 60 * 1000;

    await ctx.db.patch(args.id, { interval, easeFactor, repetitions, nextReview });
  },
});

// ===== QUIZ QUESTIONS =====
export const createQuizQuestion = mutation({
  args: {
    subunitId: v.id("subunits"),
    unitId: v.id("units"),
    question: v.string(),
    options: v.array(v.string()),
    correctIndex: v.number(),
    explanation: v.string(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    type: v.union(v.literal("recall"), v.literal("application"), v.literal("analysis"), v.literal("exam")),
    sourceRefs: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("quizQuestions", args);
  },
});

export const getQuizQuestions = query({
  args: { unitId: v.optional(v.id("units")), subunitId: v.optional(v.id("subunits")) },
  handler: async (ctx, args) => {
    if (args.unitId) {
      return await ctx.db
        .query("quizQuestions")
        .withIndex("by_unit", (q) => q.eq("unitId", args.unitId!))
        .collect();
    }
    if (args.subunitId) {
      return await ctx.db
        .query("quizQuestions")
        .withIndex("by_subunit", (q) => q.eq("subunitId", args.subunitId!))
        .collect();
    }
    return await ctx.db.query("quizQuestions").collect();
  },
});

export const getQuizQuestionsByType = query({
  args: { unitId: v.id("units"), type: v.union(v.literal("recall"), v.literal("application"), v.literal("analysis"), v.literal("exam")) },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("quizQuestions")
      .withIndex("by_unit", (q) => q.eq("unitId", args.unitId))
      .collect();
    return all.filter((q) => q.type === args.type);
  },
});

// ===== PROGRESS =====
export const updateProgress = mutation({
  args: {
    notebookId: v.id("notebooks"),
    subunitId: v.id("subunits"),
    correct: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("progress")
      .withIndex("by_subunit", (q) => q.eq("subunitId", args.subunitId))
      .first();

    if (existing) {
      const attempts = existing.attempts + 1;
      const correctAnswers = existing.correctAnswers + (args.correct ? 1 : 0);
      const incorrectAnswers = existing.incorrectAnswers + (args.correct ? 0 : 1);
      const mastery = Math.min(100, Math.round((correctAnswers / attempts) * 100));
      const streak = args.correct ? existing.streak + 1 : 0;
      let status: "not_started" | "learning" | "practicing" | "mastered" = "learning";
      if (mastery >= 90) status = "mastered";
      else if (mastery >= 50) status = "practicing";

      await ctx.db.patch(existing._id, {
        mastery, lastStudied: Date.now(), attempts, correctAnswers, incorrectAnswers, streak, status,
      });
    } else {
      await ctx.db.insert("progress", {
        ...args,
        mastery: args.correct ? 100 : 0,
        lastStudied: Date.now(),
        attempts: 1,
        correctAnswers: args.correct ? 1 : 0,
        incorrectAnswers: args.correct ? 0 : 1,
        streak: args.correct ? 1 : 0,
        status: args.correct ? "mastered" : "learning",
      });
    }
  },
});

export const getProgress = query({
  args: { notebookId: v.optional(v.id("notebooks")), subunitId: v.optional(v.id("subunits")) },
  handler: async (ctx, args) => {
    if (args.subunitId) {
      return await ctx.db
        .query("progress")
        .withIndex("by_subunit", (q) => q.eq("subunitId", args.subunitId!))
        .first();
    }
    if (args.notebookId) {
      return await ctx.db
        .query("progress")
        .withIndex("by_notebook", (q) => q.eq("notebookId", args.notebookId!))
        .collect();
    }
    return await ctx.db.query("progress").collect();
  },
});

export const getWeakAreas = query({
  args: { notebookId: v.id("notebooks") },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("progress")
      .withIndex("by_notebook", (q) => q.eq("notebookId", args.notebookId))
      .collect();
    return all.filter((p) => p.mastery < 70).sort((a, b) => a.mastery - b.mastery);
  },
});

// ===== CHAT =====
export const addChatMessage = mutation({
  args: {
    notebookId: v.optional(v.id("notebooks")),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    citations: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("chatMessages", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

export const getChatMessages = query({
  args: { notebookId: v.optional(v.id("notebooks")), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    let messages;
    if (args.notebookId) {
      messages = await ctx.db
        .query("chatMessages")
        .withIndex("by_notebook", (q) => q.eq("notebookId", args.notebookId!))
        .order("desc")
        .collect();
    } else {
      messages = await ctx.db
        .query("chatMessages")
        .withIndex("by_timestamp")
        .order("desc")
        .collect();
    }
    const limit = args.limit ?? 50;
    return messages.slice(0, limit).reverse();
  },
});

export const clearChat = mutation({
  args: { notebookId: v.optional(v.id("notebooks")) },
  handler: async (ctx, args) => {
    let messages;
    if (args.notebookId) {
      messages = await ctx.db
        .query("chatMessages")
        .withIndex("by_notebook", (q) => q.eq("notebookId", args.notebookId!))
        .collect();
    } else {
      messages = await ctx.db.query("chatMessages").collect();
    }
    for (const msg of messages) await ctx.db.delete(msg._id);
  },
});

// ===== DASHBOARD STATS =====
export const getNotebookStats = query({
  args: { notebookId: v.id("notebooks") },
  handler: async (ctx, args) => {
    const units = await ctx.db.query("units").withIndex("by_notebook", (q) => q.eq("notebookId", args.notebookId)).collect();
    const materials = await ctx.db.query("materials").withIndex("by_notebook", (q) => q.eq("notebookId", args.notebookId)).collect();
    const progress = await ctx.db.query("progress").withIndex("by_notebook", (q) => q.eq("notebookId", args.notebookId)).collect();

    const mastered = progress.filter((p) => p.status === "mastered").length;
    const practicing = progress.filter((p) => p.status === "practicing").length;
    const learning = progress.filter((p) => p.status === "learning").length;
    const totalSubunits = progress.length;
    const avgMastery = totalSubunits > 0
      ? Math.round(progress.reduce((s, p) => s + p.mastery, 0) / totalSubunits)
      : 0;

    const reviewFlashcards = await ctx.db.query("flashcards").withIndex("by_review").collect();
    const dueForReview = reviewFlashcards.filter((fc) => fc.nextReview <= Date.now()).length;

    return {
      unitsCount: units.length,
      materialsCount: materials.length,
      totalSubunits,
      mastered,
      practicing,
      learning,
      avgMastery,
      dueForReview,
      totalWordCount: materials.reduce((s, m) => s + m.wordCount, 0),
    };
  },
});

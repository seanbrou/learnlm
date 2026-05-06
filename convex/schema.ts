import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  notebooks: defineTable({
    title: v.string(),
    description: v.string(),
    subject: v.string(),
    color: v.string(),
    icon: v.string(),
    createdAt: v.number(),
  }),

  materials: defineTable({
    notebookId: v.id("notebooks"),
    name: v.string(),
    content: v.string(),
    fileType: v.string(),
    wordCount: v.number(),
    processed: v.boolean(),
    createdAt: v.number(),
  }).index("by_notebook", ["notebookId"]),

  units: defineTable({
    notebookId: v.id("notebooks"),
    title: v.string(),
    overview: v.string(),
    objectives: v.array(v.string()),
    prerequisites: v.array(v.string()),
    estimatedMinutes: v.number(),
    difficulty: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    order: v.number(),
  }).index("by_notebook", ["notebookId"]),

  subunits: defineTable({
    unitId: v.id("units"),
    title: v.string(),
    content: v.string(),
    keyTerms: v.array(v.object({ term: v.string(), definition: v.string() })),
    examples: v.array(v.string()),
    misconceptions: v.array(v.object({ myth: v.string(), reality: v.string() })),
    sourceRefs: v.array(v.string()),
    order: v.number(),
  }).index("by_unit", ["unitId"]),

  flashcards: defineTable({
    subunitId: v.id("subunits"),
    unitId: v.id("units"),
    front: v.string(),
    back: v.string(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    interval: v.number(), // spaced repetition interval in days
    easeFactor: v.number(), // SM-2 ease factor
    nextReview: v.number(), // timestamp of next review
    repetitions: v.number(),
  }).index("by_subunit", ["subunitId"]).index("by_unit", ["unitId"]).index("by_review", ["nextReview"]),

  quizQuestions: defineTable({
    subunitId: v.id("subunits"),
    unitId: v.id("units"),
    question: v.string(),
    options: v.array(v.string()),
    correctIndex: v.number(),
    explanation: v.string(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    type: v.union(v.literal("recall"), v.literal("application"), v.literal("analysis"), v.literal("exam")),
    sourceRefs: v.array(v.string()),
  }).index("by_subunit", ["subunitId"]).index("by_unit", ["unitId"]),

  progress: defineTable({
    notebookId: v.id("notebooks"),
    subunitId: v.id("subunits"),
    mastery: v.number(),
    lastStudied: v.number(),
    attempts: v.number(),
    correctAnswers: v.number(),
    incorrectAnswers: v.number(),
    streak: v.number(),
    status: v.union(v.literal("not_started"), v.literal("learning"), v.literal("practicing"), v.literal("mastered")),
  }).index("by_notebook", ["notebookId"]).index("by_subunit", ["subunitId"]),

  chatMessages: defineTable({
    notebookId: v.optional(v.id("notebooks")),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    citations: v.optional(v.array(v.string())),
    timestamp: v.number(),
  }).index("by_notebook", ["notebookId"]).index("by_timestamp", ["timestamp"]),
});

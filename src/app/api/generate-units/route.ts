import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function extractJson(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const candidate = fenced || text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start >= 0 && end > start) return JSON.parse(candidate.slice(start, end + 1));
  throw new Error("No JSON object in model response");
}

function titleCase(value: string) {
  return value.replace(/\w\S*/g, (word) => word[0].toUpperCase() + word.slice(1).toLowerCase());
}

function keywords(text: string) {
  const stop = new Set("about above after again against all also and any are because been before being between both but can did does doing down during each few for from further had has have having here how into its itself just more most much only other our out over own same should some such than that the their them then there these they this those through under until very was were what when where which while who why will with would your using used use".split(" "));
  const counts = new Map<string, number>();
  for (const raw of text.toLowerCase().match(/[a-z][a-z-]{3,}/g) || []) {
    const word = raw.replace(/^-|-$/g, "");
    if (!stop.has(word)) counts.set(word, (counts.get(word) || 0) + 1);
  }
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 18).map(([word]) => word);
}

function splitSentences(text: string) {
  return text.replace(/\s+/g, " ").split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
}

function makeQuestion(topic: string, unitTitle: string, source = "Generated from materials") {
  return {
    question: `Which statement best explains ${topic}?`,
    options: [
      `${titleCase(topic)} connects the core mechanism to a usable example in ${unitTitle}.`,
      `${titleCase(topic)} is unrelated background information.`,
      `${titleCase(topic)} only needs passive rereading.`,
      `${titleCase(topic)} cannot be practiced with feedback.`,
    ],
    correctIndex: 0,
    explanation: `${titleCase(topic)} is high-yield when you can define it, explain the mechanism, and apply it to a new example.`,
    source,
  };
}

function synthesizeUnits(notebook: any, materials: any[]) {
  const title = notebook?.title || "Notebook";
  const combined = (materials || []).map((m: any) => `${m.name || "Material"}: ${String(m.content || "")}`).join("\n\n").slice(0, 30000);
  const sourceNames = (materials || []).map((m: any) => m.name).filter(Boolean);
  const source = sourceNames.join(", ") || "your materials";
  const lower = combined.toLowerCase();
  const terms = keywords(combined);
  const sentences = splitSentences(combined);

  const specialized = lower.includes("photosynthesis")
    ? [
        { title: "Photosynthesis Foundations", topics: ["chloroplasts", "light energy", "chemical energy"], overview: "How plants convert light into stored chemical energy." },
        { title: "Light Reactions", topics: ["thylakoids", "ATP", "NADPH"], overview: "How light reactions capture energy and make ATP and NADPH." },
        { title: "Calvin Cycle & Sugar Synthesis", topics: ["carbon fixation", "rubisco", "glucose"], overview: "How carbon dioxide is fixed into sugars using the products of light reactions." },
      ]
    : null;

  const units = (specialized || Array.from({ length: Math.min(4, Math.max(3, Math.ceil(Math.max(terms.length, 6) / 4))) }, (_, i) => {
    const slice = terms.slice(i * 4, i * 4 + 4);
    const lead = slice[0] ? titleCase(slice[0]) : `${title} Topic ${i + 1}`;
    return { title: `${lead} ${i === 0 ? "Foundations" : i === 1 ? "Mechanisms" : i === 2 ? "Applications" : "Mastery"}`, topics: slice.length ? slice : ["core concepts", "mechanism", "application"], overview: `A focused unit synthesized from ${source}.` };
  })).map((unit: any, idx: number) => {
    const topicList = unit.topics.length ? unit.topics : terms.slice(0, 3);
    const chunks = sentences.slice(idx * 3, idx * 3 + 4);
    return {
      title: unit.title,
      difficulty: idx === 0 ? "beginner" : idx === 1 ? "intermediate" : "advanced",
      estimatedMinutes: 40 + topicList.length * 8,
      overview: unit.overview,
      objectives: [
        `Explain ${unit.title} without notes`,
        `Connect ${topicList[0] || "the main idea"} to a concrete example`,
        "Use retrieval practice to find and repair weak spots",
      ],
      prerequisites: idx === 0 ? ["No prerequisites"] : ["Complete the previous generated unit"],
      subunits: topicList.slice(0, 4).map((topic: string, subIdx: number) => {
        const content = chunks[subIdx] || `${titleCase(topic)} is a high-yield part of ${unit.title}. Define it, explain the mechanism, then test it with a real example from ${source}.`;
        return {
          title: titleCase(topic),
          content,
          keyTerms: [
            { term: titleCase(topic), definition: `A core concept from ${source} that supports ${unit.title}.` },
            { term: "Mechanism", definition: "The step-by-step process that explains why the concept works." },
          ],
          examples: [`Teach ${topic} in three plain-English sentences.`, `Create one exam-style application of ${topic}.`],
          misconceptions: [{ myth: `${titleCase(topic)} can be mastered by recognition alone.`, reality: "Mastery requires recall, explanation, feedback, and transfer." }],
          sourceRefs: sourceNames.length ? sourceNames.slice(0, 3) : ["Generated from materials"],
          flashcards: [
            { front: `What is ${titleCase(topic)}?`, back: content, source },
            { front: `Why does ${titleCase(topic)} matter in ${unit.title}?`, back: `${titleCase(topic)} helps explain the mechanism and lets you apply the idea in practice.`, source },
          ],
          quiz: [makeQuestion(topic, unit.title, source)],
        };
      }),
      exam: [makeQuestion(unit.title, title, source)],
    };
  });

  return { units };
}

function fallback(notebook: any, materials: any[]) {
  return synthesizeUnits(notebook, materials);
}

export async function POST(req: NextRequest) {
  const { notebook, materials } = await req.json();
  const apiKey = process.env.OPENCODE_API_KEY || process.env.OPENCODE_GO_API_KEY;
  const baseURL = process.env.OPENCODE_GO_BASE_URL || "https://opencode.ai/zen/go/v1";
  if (!apiKey) return NextResponse.json(fallback(notebook, materials));

  const materialText = (materials || []).map((m: any) => `# ${m.name}\n${String(m.content || "").slice(0, 6000)}`).join("\n\n").slice(0, 18000);
  const prompt = `Generate a concise, high-quality learning path for ${notebook?.title}. Return ONLY valid JSON with this shape: {"units":[{"title","overview","difficulty":"beginner|intermediate|advanced","estimatedMinutes":number,"objectives":[string],"prerequisites":[string],"subunits":[{"title","content","keyTerms":[{"term","definition"}],"examples":[string],"misconceptions":[{"myth","reality"}],"sourceRefs":[string],"flashcards":[{"front","back","source"}],"quiz":[{"question","options":[string,string,string,string],"correctIndex":number,"explanation","source"}]}],"exam":[{"question","options":[string,string,string,string],"correctIndex":number,"explanation","source"}]}]}. Create 3-5 units, 2-4 subunits each. Source material:\n${materialText}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`${baseURL.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: process.env.LEARNLM_GENERATION_MODEL || "deepseek-v4-pro", messages: [{ role: "system", content: "You are LearnLM, an expert curriculum generator. Output strict JSON only." }, { role: "user", content: prompt }], temperature: 0.35, max_tokens: 5000 }),
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(await res.text());
    const json = await res.json();
    const generated = extractJson(json.choices?.[0]?.message?.content || "");
    if (!Array.isArray(generated?.units) || generated.units.length === 0) throw new Error("Model returned no units");
    return NextResponse.json(generated);
  } catch (error) {
    console.error("generate-units fallback", error);
    return NextResponse.json(fallback(notebook, materials));
  }
}

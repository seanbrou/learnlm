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

function fallback(notebook: any, materials: any[]) {
  const title = notebook?.title || "Notebook";
  const source = materials?.map((m) => m.name).join(", ") || "your materials";
  return {
    units: [
      {
        title: `${title} Foundations`, difficulty: "beginner", estimatedMinutes: 45,
        overview: `Core concepts synthesized from ${source}.`,
        objectives: ["Build a precise vocabulary", "Connect ideas into one mental model", "Check understanding with retrieval"],
        prerequisites: [],
        subunits: [
          { title: "Big Picture", content: `The big picture of ${title}: organize the material into concepts, mechanisms, and applications.`, keyTerms: [{ term: "Core model", definition: "The compact explanation that ties the unit together." }], examples: ["Explain the unit in five bullets."], misconceptions: [{ myth: "Reading equals mastery", reality: "Retrieval plus feedback creates durable mastery." }], flashcards: [{ front: `What is the goal of ${title} Foundations?`, back: "Build a working model you can use in quizzes and exams." }], quiz: [{ question: "What is the most effective first pass?", options: ["Connect concepts", "Memorize random facts", "Skip practice", "Only reread"], correctIndex: 0, explanation: "Connected concepts transfer better." }] },
          { title: "High-Yield Details", content: "Prioritize definitions, mechanisms, exceptions, and examples that appear repeatedly in the material.", keyTerms: [], examples: ["Turn headings into recall questions."], misconceptions: [], flashcards: [{ front: "What details are high-yield?", back: "Repeated, causal, exception-heavy, or assessment-linked details." }], quiz: [] },
        ],
      },
    ],
  };
}

export async function POST(req: NextRequest) {
  const { notebook, materials } = await req.json();
  const apiKey = process.env.OPENCODE_API_KEY || process.env.OPENCODE_GO_API_KEY;
  const baseURL = process.env.OPENCODE_GO_BASE_URL || "https://opencode.ai/zen/go/v1";
  if (!apiKey) return NextResponse.json(fallback(notebook, materials));

  const materialText = (materials || []).map((m: any) => `# ${m.name}\n${String(m.content || "").slice(0, 6000)}`).join("\n\n").slice(0, 18000);
  const prompt = `Generate a concise, high-quality learning path for ${notebook?.title}. Return ONLY valid JSON with this shape: {"units":[{"title","overview","difficulty":"beginner|intermediate|advanced","estimatedMinutes":number,"objectives":[string],"prerequisites":[string],"subunits":[{"title","content","keyTerms":[{"term","definition"}],"examples":[string],"misconceptions":[{"myth","reality"}],"flashcards":[{"front","back"}],"quiz":[{"question","options":[string,string,string,string],"correctIndex":number,"explanation"}]}]}]}. Create 3-5 units, 2-4 subunits each. Source material:\n${materialText}`;

  try {
    const res = await fetch(`${baseURL.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: "deepseek-v4-pro", messages: [{ role: "system", content: "You are LearnLM, an expert curriculum generator. Output strict JSON only." }, { role: "user", content: prompt }], temperature: 0.35, max_tokens: 5000 }),
    });
    if (!res.ok) throw new Error(await res.text());
    const json = await res.json();
    return NextResponse.json(extractJson(json.choices?.[0]?.message?.content || ""));
  } catch (error) {
    console.error("generate-units fallback", error);
    return NextResponse.json(fallback(notebook, materials));
  }
}

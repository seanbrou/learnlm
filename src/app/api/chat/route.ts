import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { message, notebook, materials, units, history } = await req.json();
  const apiKey = process.env.OPENCODE_API_KEY || process.env.OPENCODE_GO_API_KEY;
  const baseURL = process.env.OPENCODE_GO_BASE_URL || "https://opencode.ai/zen/go/v1";
  const citations = (materials || []).slice(0, 3).map((m: any) => m.name || "Notebook material");
  if (!apiKey) {
    return NextResponse.json({ content: `Here’s a focused way to study this: connect your question to ${notebook?.title || "this notebook"}, retrieve the definition from memory, then test it with one example. Based on your saved units, the most relevant next step is to open the weakest unit and do a quick quiz.`, citations });
  }
  const context = `Notebook: ${notebook?.title}\nMaterials: ${(materials || []).map((m: any) => `${m.name}: ${String(m.content || "").slice(0, 1000)}`).join("\n")}\nUnits: ${(units || []).map((u: any) => `${u.title} (${u.mastery}% mastery): ${u.overview}`).join("\n")}`.slice(0, 16000);
  try {
    const res = await fetch(`${baseURL.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "deepseek-v4-pro",
        temperature: 0.45,
        max_tokens: 1600,
        messages: [
          { role: "system", content: "You are LearnLM, a precise AI tutor. Use the student's notebook context, be clear, cite available material names, and end with a small active-recall prompt." },
          { role: "user", content: context },
          ...(history || []).slice(-8).map((m: any) => ({ role: m.role, content: m.content })),
          { role: "user", content: message },
        ],
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    const json = await res.json();
    return NextResponse.json({ content: json.choices?.[0]?.message?.content || "I’m ready — ask me to explain, quiz, or plan your next study block.", citations });
  } catch (error) {
    console.error("chat fallback", error);
    return NextResponse.json({ content: `I couldn’t reach the AI endpoint, but here’s the best next move: answer this from memory first, then verify against your materials. What is the core definition, what mechanism makes it work, and what example proves you can apply it?`, citations });
  }
}

"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { NotebookLayout } from "../notebook-layout";
import {
  Send, Brain, BookOpen, Lightbulb, FileText,
  RotateCcw, Sparkles, ArrowRight, Quote,
} from "lucide-react";

const mockNotebook = { title: "Biology 101", color: "#10b981", icon: "🧬" };

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  citations?: string[];
  timestamp: number;
}

const mockResponses: Record<string, { content: string; citations: string[] }> = {
  default: {
    content: "Based on your uploaded materials, this topic involves several interconnected concepts. Your lecture notes from Week 3 cover the fundamentals, and the textbook chapter provides deeper context. Would you like me to break this down further or generate some practice questions?",
    citations: ["Lecture Notes — Week 3, p. 12", "Textbook Ch. 4, pp. 89-91"],
  },
  mitochondria: {
    content: "Mitochondria are the powerhouses of eukaryotic cells. Here's a breakdown from your materials:\n\n**Structure:** Double membrane — the outer membrane is smooth, while the inner membrane is folded into cristae to increase surface area for ATP production.\n\n**Key Processes:**\n1. **Glycolysis** — occurs in the cytoplasm (not the mitochondria), breaks glucose into pyruvate\n2. **Krebs Cycle** — takes place in the mitochondrial matrix\n3. **Electron Transport Chain** — embedded in the inner membrane\n\n**ATP Yield:** ~36-38 ATP per glucose molecule through oxidative phosphorylation.\n\nThink of it like a power plant: glycolism is the raw material prep, the Krebs cycle is the turbine, and the ETC is the generator.",
    citations: ["Biology Notes — Cellular Respiration, pp. 23-25", "Campbell Biology Ch. 9, pp. 162-175"],
  },
  dna: {
    content: "DNA replication is **semi-conservative** — each new DNA molecule contains one original (parent) strand and one newly synthesized strand.\n\n**Key Steps:**\n1. **Initiation** — Helicase unwinds the double helix at the origin of replication\n2. **Elongation** — DNA polymerase III adds nucleotides 5'→3'\n3. **Leading strand** — synthesized continuously\n4. **Lagging strand** — synthesized discontinuously as Okazaki fragments\n5. **Termination** — Ligase seals the gaps\n\n**Enzymes:** Helicase, Primase, DNA Pol III, DNA Pol I, Ligase\n\nYour Week 5 notes have a great diagram of the replication fork on page 8!",
    citations: ["Lecture Notes — Week 5, pp. 7-9", "Lab Manual — DNA Replication"],
  },
};

const suggestedQuestions = [
  "Explain how mitochondria produce ATP",
  "What happens during DNA replication?",
  "Compare mitosis and meiosis",
  "How does osmosis work?",
  "What is the role of enzymes?",
];

export default function NotebookChatPage() {
  const params = useParams();
  const notebookId = params.id as string;
  const notebook = mockNotebook;

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hi! I'm your AI tutor for **${notebook.title}**. I've analyzed your uploaded materials and can help you understand concepts, generate practice questions, explain difficult topics, and guide your study sessions.\n\nWhat would you like to work on?`,
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [mode, setMode] = useState<"chat" | "explain" | "quiz" | "summarize">("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [messages]);

  const getAIResponse = (userMessage: string) => {
    const lower = userMessage.toLowerCase();
    if (lower.includes("mitochondria") || lower.includes("atp") || lower.includes("respiration")) return mockResponses.mitochondria;
    if (lower.includes("dna") || lower.includes("replication") || lower.includes("transcription")) return mockResponses.dna;
    return mockResponses.default;
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMsg: Message = { role: "user", content: input.trim(), timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const resp = getAIResponse(userMsg.content);
      const aiMsg: Message = {
        role: "assistant",
        content: resp.content,
        citations: resp.citations,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1500);
  };

  return (
    <NotebookLayout notebookId={notebookId} notebookTitle={notebook.title} notebookColor={notebook.color}>
      <div className="flex flex-col h-[calc(100vh-14rem)]">
        {/* Mode Selector */}
        <div className="flex items-center gap-2 mb-4">
          {(["chat", "explain", "quiz", "summarize"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                mode === m
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {m === "chat" ? "💬 Chat" : m === "explain" ? "💡 Explain" : m === "quiz" ? "🧠 Quiz Me" : "📋 Summarize"}
            </button>
          ))}
          <div className="flex-1" />
          <button className="text-slate-400 hover:text-slate-600 transition-colors">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] ${msg.role === "user" ? "order-2" : ""}`}>
                <div className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    msg.role === "user" ? "bg-indigo-600" : "bg-violet-100"
                  }`}>
                    {msg.role === "user" ? (
                      <span className="text-white text-xs font-bold">U</span>
                    ) : (
                      <Brain className="w-4 h-4 text-violet-600" />
                    )}
                  </div>
                  <div className={`px-4 py-3 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-tr-sm"
                      : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm"
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>

                {/* Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-2 ml-11 flex flex-wrap gap-2">
                    {msg.citations.map((cite, ci) => (
                      <span
                        key={ci}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-md border border-amber-200"
                      >
                        <Quote className="w-3 h-3" />
                        {cite}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                <Brain className="w-4 h-4 text-violet-600" />
              </div>
              <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-sm">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="mb-4">
            <p className="text-xs text-slate-400 mb-2">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 hover:border-indigo-300 hover:text-indigo-700 transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="bg-white border border-slate-200 rounded-xl p-3">
          <div className="flex items-end gap-3">
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <FileText className="w-5 h-5" />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
              placeholder="Ask about your materials..."
              rows={1}
              className="flex-1 resize-none outline-none text-sm text-slate-900 placeholder:text-slate-400 max-h-32 py-2"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
              className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-200 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </NotebookLayout>
  );
}

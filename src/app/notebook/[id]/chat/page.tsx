"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { NotebookLayout } from "../notebook-layout";
import { useLearnLM } from "@/lib/learnlm-data";
import {
  Send, Brain, FileText,
  RotateCcw, Sparkles, Quote,
} from "lucide-react";


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
  const { state, getNotebook, getMaterials, getUnits, addChatMessage } = useLearnLM();
  const notebook = getNotebook(notebookId);
  const messages = useMemo(() => {
    const storedMessages = state.chatMessages.filter((m) => m.notebookId === notebookId);
    if (storedMessages.length) return storedMessages;
    return [{
      id: "intro",
      notebookId,
      role: "assistant" as const,
      content: `Hi! I'm your AI tutor for **${notebook?.title || "this notebook"}**. I've analyzed your uploaded materials and can help you understand concepts, generate practice questions, explain difficult topics, and guide your study sessions.\n\nWhat would you like to work on?`,
      timestamp: Date.now(),
    }];
  }, [notebook?.title, notebookId, state.chatMessages]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [mode, setMode] = useState<"chat" | "explain" | "quiz" | "summarize">("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [messages]);


  const sendMessage = async () => {
    if (!input.trim() || !notebook || isTyping) return;

    const userText = input.trim();
    addChatMessage({ notebookId, role: "user", content: userText });
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `${mode !== "chat" ? `[${mode}] ` : ""}${userText}`,
          notebook,
          materials: getMaterials(notebookId),
          units: getUnits(notebookId),
          history: messages,
        }),
      });
      if (!res.ok) throw new Error(`AI request failed with status ${res.status}`);
      const json = await res.json();
      addChatMessage({ notebookId, role: "assistant", content: json.content, citations: json.citations });
    } catch (error) {
      console.error("AI tutor request failed", error);
      addChatMessage({
        notebookId,
        role: "assistant",
        content: "I couldn’t reach the AI tutor for that response, but your message was saved. Try again in a moment, or ask me to summarize a specific unit.",
        citations: [],
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <NotebookLayout notebookId={notebookId} notebookTitle={notebook?.title || "Notebook"} notebookColor={notebook?.color || "#6366f1"}>
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

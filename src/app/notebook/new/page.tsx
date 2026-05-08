"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLearnLM } from "@/lib/learnlm-data";
import { ArrowLeft, Plus } from "lucide-react";

const colors = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f43f5e", "#84cc16"];
const icons = ["📚", "🧬", "🧮", "💻", "📊", "🎨", "🔬", "🌍", "📝", "🎵", "⚗️", "🧠"];

export default function NewNotebookPage() {
  const router = useRouter();
  const { createNotebook } = useLearnLM();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [color, setColor] = useState(colors[0]);
  const [icon, setIcon] = useState(icons[0]);

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="text-slate-400 hover:text-slate-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Create New Notebook</h1>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          {/* Preview */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg mb-6">
            <span className="text-3xl">{icon}</span>
            <div>
              <p className="font-semibold text-slate-900">{title || "Notebook Title"}</p>
              <p className="text-sm text-slate-400">{description || "Description"}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Biology 101" className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., Fall 2025 semester — Dr. Smith" rows={3} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none" />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Subject</label>
              <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g., Biology" className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Icon</label>
              <div className="flex flex-wrap gap-2">
                {icons.map((ic) => (
                  <button key={ic} onClick={() => setIcon(ic)} className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all ${icon === ic ? "bg-indigo-100 ring-2 ring-indigo-500" : "bg-slate-100 hover:bg-slate-200"}`}>
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Color</label>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full transition-all ${color === c ? "ring-2 ring-offset-2 ring-slate-400 scale-110" : "hover:scale-110"}`} style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>

            <button onClick={() => {
              if (!title.trim()) return;
              const notebookId = createNotebook({ title: title.trim(), description: description.trim() || "Personal learning notebook", subject: subject.trim() || "General", color, icon });
              router.push(`/notebook/${notebookId}`);
            }} className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
              <Plus className="w-5 h-5" />
              Create Notebook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

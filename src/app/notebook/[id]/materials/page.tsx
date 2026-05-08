"use client";

import { useRef, useState } from "react";
import { NotebookLayout } from "../notebook-layout";
import { useParams } from "next/navigation";
import { useLearnLM } from "@/lib/learnlm-data";
import { Upload, FileText, Trash2, Eye, Plus, FileSpreadsheet, File, Presentation, Sparkles } from "lucide-react";

const typeIcons: Record<string, { icon: any; color: string }> = {
  pdf: { icon: FileText, color: "text-red-600 bg-red-50" },
  txt: { icon: FileText, color: "text-slate-600 bg-slate-50" },
  doc: { icon: File, color: "text-blue-600 bg-blue-50" },
  ppt: { icon: Presentation, color: "text-orange-600 bg-orange-50" },
  xls: { icon: FileSpreadsheet, color: "text-emerald-600 bg-emerald-50" },
};

export default function MaterialsPage() {
  const params = useParams();
  const notebookId = params.id as string;
  const { getNotebook, getMaterials, addMaterial, removeMaterial, addGeneratedUnits } = useLearnLM();
  const notebook = getNotebook(notebookId);
  const materials = getMaterials(notebookId);
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [generating, setGenerating] = useState(false);
  if (!notebook) return null;

  async function addTextMaterial() {
    if (!content.trim()) return;
    addMaterial(notebookId, { name: name.trim() || "Pasted notes", content, type: "txt" });
    setName(""); setContent("");
  }

  async function onFile(file?: File) {
    if (!file) return;
    const text = await file.text().catch(() => "");
    addMaterial(notebookId, { name: file.name, content: text || `${file.name} uploaded. Add extracted text here for richer AI generation.`, type: file.name.split(".").pop() || "txt" });
  }

  async function generateUnits() {
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-units", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notebook, materials }),
      });
      const json = await res.json();
      addGeneratedUnits(notebookId, json);
    } finally { setGenerating(false); }
  }

  return (
    <NotebookLayout notebookId={notebookId} notebookTitle={notebook.title} notebookColor={notebook.color}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Study Materials</h2>
          <p className="text-sm text-slate-500">{materials.length} documents uploaded</p>
        </div>
        <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" />
          Upload
        </button>
      </div>

      {/* Upload Area */}
      <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center mb-6 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all cursor-pointer">
        <input ref={fileRef} type="file" className="hidden" accept=".txt,.md,.csv,.json,.pdf,.doc,.docx" onChange={(e) => onFile(e.target.files?.[0])} />
        <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <p className="text-slate-600 font-medium">Drop files here or click to upload</p>
        <p className="text-sm text-slate-400 mt-1">PDF, DOC, PPT, TXT, images — up to 50 MB each</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Material name" className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
          <button onClick={addTextMaterial} className="flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors"><Plus className="w-4 h-4" /> Add Text</button>
          <button disabled={generating || materials.length === 0} onClick={generateUnits} className="flex items-center justify-center gap-2 bg-indigo-600 disabled:bg-slate-300 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"><Sparkles className="w-4 h-4" /> {generating ? "Generating..." : "Generate Units"}</button>
        </div>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} placeholder="Paste notes, a URL summary, textbook excerpts, transcript, or study guide text..." className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none" />
      </div>

      {/* Materials List */}
      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        {materials.map((mat) => {
          const { icon: Icon, color } = typeIcons[mat.type] || typeIcons.pdf;
          return (
            <div key={mat.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
              <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 truncate">{mat.name}</p>
                <p className="text-xs text-slate-400">{mat.pages} pages · {mat.size} · {mat.date}</p>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                mat.status === "processed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
              }`}>
                {mat.status === "processed" ? "Processed" : "Processing..."}
              </span>
              <button onClick={() => setContent(mat.content)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><Eye className="w-4 h-4" /></button>
              <button onClick={() => removeMaterial(mat.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          );
        })}
      </div>
    </NotebookLayout>
  );
}

"use client";

import { NotebookLayout } from "../notebook-layout";
import { useParams } from "next/navigation";
import {
  Upload, FileText, Trash2, Eye, Plus, Search,
  Calendar, FileSpreadsheet, File, Presentation,
} from "lucide-react";

const mockNotebook = { title: "Biology 101", color: "#10b981" };

const materials = [
  { id: 1, name: "Biology Lecture Notes — Weeks 1-8", type: "pdf", pages: 47, size: "2.3 MB", date: "May 1, 2025", status: "processed" as const },
  { id: 2, name: "Campbell Biology Ch. 9 (Respiration)", type: "pdf", pages: 14, size: "4.1 MB", date: "May 2, 2025", status: "processed" as const },
  { id: 3, name: "Lab Manual — Cellular Respiration", type: "pdf", pages: 8, size: "1.2 MB", date: "May 3, 2025", status: "processed" as const },
  { id: 4, name: "Midterm Study Guide", type: "pdf", pages: 5, size: "0.8 MB", date: "May 4, 2025", status: "processing" as const },
];

const typeIcons: Record<string, { icon: any; color: string }> = {
  pdf: { icon: FileText, color: "text-red-600 bg-red-50" },
  doc: { icon: File, color: "text-blue-600 bg-blue-50" },
  ppt: { icon: Presentation, color: "text-orange-600 bg-orange-50" },
  xls: { icon: FileSpreadsheet, color: "text-emerald-600 bg-emerald-50" },
};

export default function MaterialsPage() {
  const params = useParams();
  const notebookId = params.id as string;
  const notebook = mockNotebook;

  return (
    <NotebookLayout notebookId={notebookId} notebookTitle={notebook.title} notebookColor={notebook.color}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Study Materials</h2>
          <p className="text-sm text-slate-500">{materials.length} documents uploaded</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" />
          Upload
        </button>
      </div>

      {/* Upload Area */}
      <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center mb-6 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all cursor-pointer">
        <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <p className="text-slate-600 font-medium">Drop files here or click to upload</p>
        <p className="text-sm text-slate-400 mt-1">PDF, DOC, PPT, TXT, images — up to 50 MB each</p>
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
              <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><Eye className="w-4 h-4" /></button>
              <button className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          );
        })}
      </div>
    </NotebookLayout>
  );
}

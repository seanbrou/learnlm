"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { NotebookLayout } from "../../../notebook-layout";
import { useLearnLM } from "@/lib/learnlm-data";
import { BookOpen, ChevronRight, ChevronLeft, ChevronRight as ChevronRightIcon, Quote, ArrowRight, Sparkles } from "lucide-react";

export default function LessonPage() {
  const params = useParams();
  const notebookId = params.id as string;
  const unitId = params.unitId as string;
  const { getNotebook, getUnit, getSubunits } = useLearnLM();
  const notebook = getNotebook(notebookId);
  const unit = getUnit(unitId);
  const subunits = getSubunits(unitId);
  const lessonSections = [
    { title: `Overview: ${unit?.title || "Lesson"}`, content: unit?.overview || "Generated lesson overview.", sourceRefs: ["AI unit overview"] },
    ...subunits.map((s) => ({ title: s.title, content: s.content, keyTerms: s.keyTerms, sourceRefs: s.sourceRefs })),
    { title: "Key Terms", content: null, keyTerms: subunits.flatMap((s) => s.keyTerms), sourceRefs: [] },
  ];
  if (!notebook || !unit) return null;
  const scroll = (dir: 1 | -1) => { const y = Math.max(0, window.scrollY + dir * 520); window.scrollTo({ top: y, behavior: "smooth" }); };

  return (
    <NotebookLayout notebookId={notebookId} notebookTitle={notebook.title} notebookColor={notebook.color}>
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6"><Link href={`/notebook/${notebookId}`} className="hover:text-indigo-600">Overview</Link><ChevronRight className="w-4 h-4" /><Link href={`/notebook/${notebookId}/units/${unitId}`} className="hover:text-indigo-600">{unit.title}</Link><ChevronRight className="w-4 h-4" /><span className="text-slate-900 font-medium">Lesson</span></div>
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl p-6 mb-6 text-white"><div className="flex items-center gap-2 text-indigo-200 text-sm mb-2"><BookOpen className="w-4 h-4" />Unit {unit.order}, Lesson</div><h1 className="text-2xl font-bold">{unit.title}</h1><p className="text-indigo-100 mt-1">{unit.overview}</p></div>
      <div className="space-y-6 mb-8">
        {lessonSections.map((section, idx) => (
          <div key={idx} id={`section-${idx}`} className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4"><div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center"><span className="text-sm font-bold text-indigo-600">{idx + 1}</span></div><h2 className="text-lg font-bold text-slate-900">{section.title}</h2></div>
            {section.content && <div className="prose prose-slate max-w-none">{String(section.content).split("\n\n").map((paragraph, pi) => <p key={pi} className="text-slate-700 leading-relaxed mb-3 last:mb-0">{paragraph.split("**").map((segment, si) => si % 2 === 1 ? <strong key={si} className="font-semibold text-slate-900">{segment}</strong> : segment)}</p>)}</div>}
            {section.keyTerms && section.keyTerms.length > 0 && <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{section.keyTerms.map((kt: any, ti: number) => <div key={`${kt.term}-${ti}`} className="bg-slate-50 rounded-lg p-4"><p className="text-sm font-semibold text-indigo-700 mb-1">{kt.term}</p><p className="text-xs text-slate-600">{kt.definition}</p></div>)}</div>}
            {section.sourceRefs && section.sourceRefs.length > 0 && <div className="mt-4 pt-4 border-t border-slate-100"><div className="flex items-center gap-2 mb-2"><Quote className="w-3.5 h-3.5 text-amber-500" /><span className="text-xs font-semibold text-slate-400 uppercase">Sources</span></div><div className="flex flex-wrap gap-2">{section.sourceRefs.map((ref: string, ri: number) => <span key={ri} className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs rounded-md border border-amber-200"><Quote className="w-3 h-3" />{ref}</span>)}</div></div>}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between"><button onClick={() => scroll(-1)} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"><ChevronLeft className="w-5 h-5" /><span className="font-medium">Previous Section</span></button><div className="flex gap-2"><Link href={`/notebook/${notebookId}/units/${unitId}/flashcards`} className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg font-medium hover:bg-amber-100 transition-colors text-sm"><Sparkles className="w-4 h-4" />Flashcards</Link><Link href={`/notebook/${notebookId}/units/${unitId}/quiz`} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">Take Quiz<ArrowRight className="w-4 h-4" /></Link></div><button onClick={() => scroll(1)} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors"><span className="font-medium">Next Section</span><ChevronRightIcon className="w-5 h-5" /></button></div>
    </NotebookLayout>
  );
}

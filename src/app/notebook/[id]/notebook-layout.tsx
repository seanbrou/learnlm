"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen, MessageSquare, FileText,
  Sparkles, ArrowLeft,
} from "lucide-react";

export function NotebookLayout({
  children,
  notebookId,
  notebookTitle,
  notebookColor,
}: {
  children: React.ReactNode;
  notebookId: string;
  notebookTitle: string;
  notebookColor: string;
}) {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === `/notebook/${notebookId}${path}`;

  const tabs = [
    { href: "", icon: BookOpen, label: "Overview" },
    { href: "/units", icon: Sparkles, label: "Study Units" },
    { href: "/chat", icon: MessageSquare, label: "AI Tutor" },
    { href: "/materials", icon: FileText, label: "Materials" },
  ];

  return (
    <div>
      {/* Notebook Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/" className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: notebookColor }} />
            <h1 className="text-2xl font-bold text-slate-900">{notebookTitle}</h1>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 mb-6 bg-white rounded-xl border border-slate-200 p-1.5 w-fit">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={`/notebook/${notebookId}${tab.href}`}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive(tab.href)
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </Link>
        ))}
      </div>

      {children}
    </div>
  );
}

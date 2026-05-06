"use client";

import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";
import { ConvexProvider } from "convex/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  LayoutDashboard,
  MessageSquare,
  Brain,
  FileText,
  BarChart3,
  Target,
  Timer,
  Repeat,
  GraduationCap,
  Sparkles,
  BookMarked,
  ClipboardList,
  ChevronRight,
  Search,
  Settings,
  Lightbulb,
  ChevronDown,
  Plus,
} from "lucide-react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Mock data for sidebar
const mockNotebooks = [
  { _id: "bio101", title: "Biology 101", color: "#10b981", icon: "🧬" },
  { _id: "cs201", title: "Computer Science 201", color: "#6366f1", icon: "💻" },
  { _id: "chem102", title: "Organic Chemistry", color: "#f59e0b", icon: "⚗️" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + "/");

  return (
    <ConvexProvider client={convex}>
      <div className="flex min-h-screen bg-slate-50">
        {/* Sidebar */}
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col fixed h-full z-10 overflow-y-auto">
          {/* Logo */}
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <BookMarked className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900 text-lg leading-tight">LearnLM</h1>
                <p className="text-xs text-slate-500">AI Learning Platform</p>
              </div>
            </div>
          </div>

          {/* Quick Nav */}
          <nav className="p-4 space-y-1">
            <NavItem href="/" icon={LayoutDashboard} label="Dashboard" active={isActive("/") && !isActive("/notebook")} />
            <NavItem href="/review" icon={Repeat} label="Spaced Review" active={isActive("/review")} badge={3} />
            <NavItem href="/progress" icon={BarChart3} label="Progress" active={isActive("/progress")} />
          </nav>

          {/* Notebooks */}
          <div className="px-4 mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Notebooks</span>
              <Link href="/notebook/new" className="text-slate-400 hover:text-indigo-600 transition-colors">
                <Plus className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-0.5">
              {mockNotebooks.map((nb) => (
                <Link
                  key={nb._id}
                  href={`/notebook/${nb._id}`}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                    pathname?.includes(nb._id)
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span className="text-sm">{nb.icon}</span>
                  <span className="truncate">{nb.title}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Bottom Nav */}
          <div className="mt-auto p-4 border-t border-slate-100 space-y-1">
            <NavItem href="/settings" icon={Settings} label="Settings" active={isActive("/settings")} />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-72">
          <div className="p-8 max-w-7xl">{children}</div>
        </main>
      </div>
    </ConvexProvider>
  );
}

function NavItem({
  href, icon: Icon, label, active, badge,
}: {
  href: string; icon: any; label: string; active?: boolean; badge?: number;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
        active
          ? "bg-indigo-50 text-indigo-700 shadow-sm"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <Icon className={`w-5 h-5 shrink-0 ${active ? "text-indigo-600" : "text-slate-400"}`} />
      <span className="flex-1">{label}</span>
      {badge && badge > 0 && (
        <span className="bg-indigo-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
    </Link>
  );
}

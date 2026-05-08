"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import { useLearnLM } from "@/lib/learnlm-data";
import { LayoutDashboard, BarChart3, Repeat, BookMarked, Settings, Plus } from "lucide-react";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { state, getFlashcards } = useLearnLM();
  const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + "/");
  const due = getFlashcards().filter((f) => f.nextReview <= Date.now()).length;

  return (
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
          <NavItem href="/review" icon={Repeat} label="Spaced Review" active={isActive("/review")} badge={due} />
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
            {state.notebooks.slice(0, 8).map((nb) => (
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
          {clerkEnabled && <AuthSlot />}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72">
        <div className="p-8 max-w-7xl">
          {clerkEnabled ? <AuthGate>{children}</AuthGate> : children}
        </div>
      </main>
    </div>
  );
}

function AuthSlot() {
  const { isSignedIn } = useUser();
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600">
      {isSignedIn ? <UserButton /> : <SignInButton mode="modal"><button>Sign in</button></SignInButton>}
    </div>
  );
}

function AuthGate({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useUser();
  if (!isLoaded) return null;
  if (isSignedIn) return <>{children}</>;
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-8 max-w-lg">
      <h2 className="text-xl font-bold text-slate-900 mb-2">Sign in to LearnLM</h2>
      <p className="text-sm text-slate-500 mb-5">Your notebooks, progress, AI chats, and spaced repetition schedule stay tied to your account.</p>
      <SignInButton mode="modal">
        <button className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors">Continue with Clerk</button>
      </SignInButton>
    </div>
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
      {badge !== undefined && badge > 0 && (
        <span className="bg-indigo-600 text-white text-xs font-bold min-w-5 h-5 px-1 rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
    </Link>
  );
}

"use client";

import { Settings, Brain, Repeat, Trophy, Bell, Palette, Shield, ChevronRight, Monitor, Download, Upload, RotateCcw } from "lucide-react";
import { useLearnLM } from "@/lib/learnlm-data";

export default function SettingsPage() {
  const { state, setState, resetData, importData } = useLearnLM();
  const exportData = () => { const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "learnlm-data.json"; a.click(); URL.revokeObjectURL(url); };
  const pickImport = () => { const input = document.createElement("input"); input.type = "file"; input.accept = "application/json"; input.onchange = async () => { const file = input.files?.[0]; if (file) importData(await file.text()); }; input.click(); };
  const toggleNotifications = () => setState((s) => ({ ...s, settings: { ...s.settings, notifications: !s.settings.notifications } }));
  const cycleTheme = () => setState((s) => ({ ...s, settings: { ...s.settings, theme: s.settings.theme === "system" ? "light" : s.settings.theme === "light" ? "dark" : "system" } }));
  const increaseGoal = () => setState((s) => ({ ...s, settings: { ...s.settings, dailyGoalMinutes: s.settings.dailyGoalMinutes >= 90 ? 15 : s.settings.dailyGoalMinutes + 15 } }));
  const settingsSections = [
    { title: "Learning Preferences", items: [
      { label: "Default Difficulty", value: "Adaptive", icon: Brain, action: undefined },
      { label: "Spaced Repetition", value: "Enabled (SM-2)", icon: Repeat, action: undefined },
      { label: "Daily Goal", value: `${state.settings.dailyGoalMinutes} minutes`, icon: Trophy, action: increaseGoal },
      { label: "Notifications", value: state.settings.notifications ? "Due reminders enabled" : "Disabled", icon: Bell, action: toggleNotifications },
    ]},
    { title: "Appearance", items: [
      { label: "Theme", value: state.settings.theme[0].toUpperCase() + state.settings.theme.slice(1), icon: Monitor, action: cycleTheme },
      { label: "Font Size", value: "Medium", icon: Palette, action: undefined },
    ]},
    { title: "Data", items: [
      { label: "Export Data", value: "Download notebooks and progress", icon: Download, action: exportData },
      { label: "Import Data", value: "Restore from JSON", icon: Upload, action: pickImport },
      { label: "Reset Demo Data", value: "Restore seeded notebooks", icon: RotateCcw, action: resetData },
    ]},
    { title: "Account", items: [{ label: "User", value: state.settings.userName || "Local learner", icon: Shield, action: undefined }]},
  ];
  return <div className="min-h-screen bg-slate-50 p-4"><div className="max-w-2xl mx-auto"><div className="mb-8"><h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3"><Settings className="w-6 h-6" />Settings</h1></div><div className="space-y-6">{settingsSections.map((section) => <div key={section.title} className="bg-white rounded-xl border border-slate-200 overflow-hidden"><h3 className="px-6 py-3 bg-slate-50 text-sm font-semibold text-slate-500 uppercase tracking-wider">{section.title}</h3>{section.items.map((item, idx) => { const Icon = item.icon; const row = <div className="flex items-center gap-4 px-6 py-4 border-t border-slate-100 cursor-pointer hover:bg-slate-50"><Icon className="w-5 h-5 text-slate-400" /><div className="flex-1"><p className="text-sm font-medium text-slate-900">{item.label}</p><p className="text-xs text-slate-500">{item.value}</p></div><ChevronRight className="w-4 h-4 text-slate-300" /></div>; return item.action ? <button key={idx} onClick={item.action} className="w-full text-left">{row}</button> : <div key={idx}>{row}</div>; })}</div>)}</div></div></div>;
}

"use client";

import Link from "next/link";
import {
  BookOpen, Settings, Brain, Repeat, Trophy, Bell,
  Palette, Shield, ChevronRight, Moon, Sun, Monitor,
} from "lucide-react";

export default function SettingsPage() {
  const settingsSections = [
    {
      title: "Learning Preferences",
      items: [
        { label: "Default Difficulty", value: "Intermediate", icon: Brain },
        { label: "Spaced Repetition", value: "Enabled (SM-2)", icon: Repeat },
        { label: "Daily Goal", value: "30 minutes", icon: Trophy },
        { label: "Notifications", value: "Due reminders at 9 AM", icon: Bell },
      ],
    },
    {
      title: "Appearance",
      items: [
        { label: "Theme", value: "System", icon: Monitor },
        { label: "Font Size", value: "Medium", icon: Palette },
      ],
    },
    {
      title: "Account",
      items: [
        { label: "Email", value: "user@example.com", icon: Shield },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Settings className="w-6 h-6" />
            Settings
          </h1>
        </div>

        <div className="space-y-6">
          {settingsSections.map((section) => (
            <div key={section.title} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <h3 className="px-6 py-3 bg-slate-50 text-sm font-semibold text-slate-500 uppercase tracking-wider">
                {section.title}
              </h3>
              {section.items.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex items-center gap-4 px-6 py-4 border-t border-slate-100 cursor-pointer hover:bg-slate-50">
                    <Icon className="w-5 h-5 text-slate-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.value}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

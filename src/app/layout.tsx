import type { Metadata } from "next";
import "./globals.css";
import ClientWrapper from "./client-wrapper";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "LearnLM — AI Learning Platform",
  description: "Turn your study materials into personalized AI-powered courses.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 font-sans antialiased">
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}

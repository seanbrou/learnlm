"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useMemo } from "react";
import { LearnLMProvider } from "@/lib/learnlm-data";

function isValidUrl(value?: string) {
  if (!value) return false;
  try { new URL(value); return true; } catch { return false; }
}

function ConvexMaybeProvider({ children }: { children: ReactNode }) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "";
  const client = useMemo(() => isValidUrl(convexUrl) ? new ConvexReactClient(convexUrl) : null, [convexUrl]);
  if (!client) return <>{children}</>;
  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}

function ClerkMaybeProvider({ children }: { children: ReactNode }) {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!key) return <>{children}</>;
  return <ClerkProvider publishableKey={key}>{children}</ClerkProvider>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ClerkMaybeProvider>
      <ConvexMaybeProvider>
        <LearnLMProvider>{children}</LearnLMProvider>
      </ConvexMaybeProvider>
    </ClerkMaybeProvider>
  );
}

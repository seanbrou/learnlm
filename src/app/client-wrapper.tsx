"use client";

import { AppShell } from "./app-shell";
import { Providers } from "./providers";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <AppShell>{children}</AppShell>
    </Providers>
  );
}

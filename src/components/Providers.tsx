"use client";

import { MotionConfig } from "motion/react";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="theme"
    >
      {/* Honour the OS "reduce motion" setting in one place: movement is
          skipped, fades stay. Components render the same markup either way,
          so the server's HTML always matches the browser's. (Swapping a
          motion element for a plain div when motion was reduced left the
          server's opacity: 0 in place and hid the content.) */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </ThemeProvider>
  );
}

"use client";

import { useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const emptySubscribe = () => () => {};

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  // Client-only flag: during SSR/hydration this is false (matches the
  // server-rendered dark default), flipping to true after hydration - avoids
  // a hydration mismatch on the icon/label without calling setState in an effect.
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const isDark = isMounted ? resolvedTheme === "dark" : true;

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "rounded-md border border-border/60 bg-bg-surface/60 text-text-muted backdrop-blur transition-colors hover:text-text-primary",
        className
      )}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
}
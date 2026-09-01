"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRightIcon, EyeIcon, LockIcon, SwordsIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const heads = [
  {
    key: "contain",
    icon: LockIcon,
    label: "CONTAIN",
    blurb: "zero standing credentials",
  },
  {
    key: "attack",
    icon: SwordsIcon,
    label: "ATTACK",
    blurb: "real multi-day fuzzing",
  },
  {
    key: "watch",
    icon: EyeIcon,
    label: "WATCH",
    blurb: "every call logged",
  },
];

export function LandingHero() {
  const [phase, setPhase] = useState(() => {
    if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return 3;
    }
    return 0;
  });

  useEffect(() => {
    if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const timers = [400, 700, 1000].map((delay, index) =>
      window.setTimeout(() => setPhase((current) => Math.max(current, index + 1)), delay),
    );
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-bg-base px-6 text-center">
      {/* faint top-edge security line - decorative, no color meaning */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-status-complete/40 to-transparent"
      />

      <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-10 py-24">
        <div
          className={cn(
            "flex flex-col items-center gap-5 transition-all duration-500 ease-out",
            phase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
          )}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-bg-surface text-status-complete shadow-sm">
            <LockIcon className="size-5" aria-hidden />
          </div>

          <h1 className="max-w-2xl font-heading text-4xl font-bold leading-tight tracking-tight text-text-primary md:text-5xl lg:text-6xl">
            Every AI tool your team plugs in is a stranger with root access.
          </h1>

          <p className="max-w-xl text-lg leading-relaxed text-text-muted">
            Tool poisoning hides a malicious payload inside a tool&apos;s description &mdash; invisible to human
            reviewers, it hijacks any agent that loads it.
          </p>
        </div>

        <div className="flex w-full max-w-2xl items-start justify-center gap-6 py-4 md:gap-8">
          {heads.map(({ key, icon: Icon, label, blurb }) => (
            <div
              key={key}
              className={cn(
                "flex flex-col items-center gap-2 px-2 transition-all duration-500 ease-out",
                phase >= 1 + heads.findIndex((h) => h.key === key)
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-3",
              )}
            >
              <Icon className="size-6 text-text-muted" aria-hidden />
              <p className="font-mono text-xs font-semibold tracking-[0.2em] text-text-primary">
                {label}
              </p>
              <p className="max-w-40 text-sm leading-snug text-text-muted">{blurb}</p>
            </div>
          ))}
        </div>

        <div
          className={cn(
            "flex flex-col items-center gap-6 transition-all duration-500 ease-out",
            phase >= 4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
          )}
        >
          <Button
            size="lg"
            variant="default"
            nativeButton={false}
            render={<Link href="/submit" />}
            className="h-10 gap-2 px-6 text-base"
          >
            Vet a Tool
            <ArrowRightIcon className="size-4" aria-hidden />
          </Button>
        </div>

        <p className="font-mono text-xs text-text-muted/70">
          247 tools vetted &#183; 31 rejected &#183; 3 caught mid-session
          <span className="pl-2 text-text-muted/50">&mdash; illustrative mock stats, not production data</span>
        </p>
      </section>
    </main>
  );
}
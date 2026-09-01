"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon, LockIcon, TriangleAlertIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * SignInForm - internal-tool sign-in, deliberately minimal.
 *
 * This is NOT real auth: submitting with any input proceeds. After a short
 * fake delay (~600ms) the user is redirected to /submit.
 *
 * showError - documented-but-unused prop. In a real app this would be driven by
 * backend auth failures. For the MVP the visual state can also be previewed via
 * the dev toggle `?error=1` in the URL.
 */
export function SignInForm({
  showError = false,
  className,
}: {
  showError?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [devError, setDevError] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Dev toggle: ?error=1 surfaces the inline error state (visual demo only).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (new URLSearchParams(window.location.search).has("error")) {
      const id = window.setTimeout(() => setDevError(true), 0);
      return () => window.clearTimeout(id);
    }
  }, []);

  useEffect(
    () => () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    },
    [],
  );

  const errorVisible = showError || devError;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    timerRef.current = window.setTimeout(() => {
      router.push("/submit");
    }, 600);
  };

  return (
    <div
      className={cn(
        "flex min-h-screen w-full items-center justify-center bg-bg-base px-4",
        className,
      )}
    >
      <div className="w-full max-w-[400px]">
        <div className="mb-6 flex flex-col items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-xl border border-border bg-bg-surface text-status-complete">
            <LockIcon className="size-5" aria-hidden />
          </span>
          <div className="flex flex-col items-center gap-1">
            <span className="font-heading text-lg font-semibold tracking-tight text-text-primary">
              Cerberus
            </span>
            <span className="font-mono text-xs text-text-muted">internal registry access</span>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-xl border border-border bg-bg-surface p-6"
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="signin-email" className="text-sm font-medium text-text-primary">
              Email
            </label>
            <Input
              id="signin-email"
              name="email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              aria-invalid={errorVisible || undefined}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="signin-password" className="text-sm font-medium text-text-primary">
              Password
            </label>
            <Input
              id="signin-password"
              name="password"
              type="password"
              placeholder="Your password"
              autoComplete="current-password"
              aria-invalid={errorVisible || undefined}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {errorVisible && (
            <p
              role="alert"
              className="-mt-1 flex items-center gap-1.5 text-xs font-medium text-destructive"
            >
              <TriangleAlertIcon className="size-3.5 shrink-0" aria-hidden />
              Incorrect email or password
            </p>
          )}

          <Button type="submit" variant="default" disabled={pending} className="mt-1 w-full gap-2">
            {pending && <Loader2Icon className="size-4 animate-spin" aria-hidden />}
            {pending ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="mt-4 text-center font-mono text-[10px] text-text-muted/60">
          no real auth - any credentials proceed
        </p>
      </div>
    </div>
  );
}
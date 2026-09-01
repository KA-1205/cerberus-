"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { AttackPanel, ContainPanel, WatchPanel } from "@/components/shared/session-panels";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { VerdictBadge } from "@/components/shared/VerdictBadge";
import { Button } from "@/components/ui/button";
import type { EgressLogEntry, Finding, Session, SessionStatus, Verdict } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * SessionPlayback - the live vetting screen.
 *
 * The Session object is static and fully known up front (see lib/mock-data.ts).
 * Playback is pure presentation: a local `revealedCount` state staggers the
 * reveal of a timestamp-merged timeline of findings + egress entries. Nothing
 * in the mock data is ever mutated; no timers touch anything but local state.
 */

type TimelineEvent =
  | { key: string; kind: "finding"; at: number; finding: Finding }
  | { key: string; kind: "egress"; at: number; egress: EgressLogEntry };

const QUEUE_DELAY_MS = 800; // queued -> running
const FIRST_REVEAL_MS = 1600; // pause before the first item lands
const BASE_INTERVAL_MS = 1900; // per-item cadence for normal sessions
const SLOW_INTERVAL_MS = 3200; // few-item sessions play slower (e.g. caught-immediately)
const BLOCKED_HOLD_MS = 2600; // extra dramatic pause after a blocked finding lands
const COMPLETE_DELAY_MS = 1000; // settle time before flipping to complete

const verdictGlow: Record<Verdict, string> = {
  approved: "bg-verdict-approved/30",
  rejected: "bg-verdict-rejected/30",
  conditional: "bg-verdict-conditional/30",
};

export function SessionPlayback({ session }: { session: Session }) {
  const totalEvents = session.findings.length + session.egressLog.length;
  const hasEvents = totalEvents > 0;

    const [status, setStatus] = useState<SessionStatus>(hasEvents ? "queued" : session.status);
  const [revealedCount, setRevealedCount] = useState(0);

  const isPhase2 = session.planPhase === "phase2";

  /** Findings + egress entries merged into one chronological reveal order. */
  const timeline = useMemo<TimelineEvent[]>(
    () =>
      [
        ...session.findings.map(
          (finding): TimelineEvent => ({
            key: finding.id,
            kind: "finding",
            at: Date.parse(finding.timestamp),
            finding,
          }),
        ),
        ...session.egressLog.map(
          (entry): TimelineEvent => ({
            key: entry.id,
            kind: "egress",
            at: Date.parse(entry.timestamp),
            egress: entry,
          }),
        ),
      ].sort((a, b) => a.at - b.at),
    [session],
  );

  /* queued -> running after a short beat. */
  useEffect(() => {
    if (!hasEvents || status !== "queued") return;
    const timer = window.setTimeout(() => setStatus("running"), QUEUE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [hasEvents, status]);

  /* Reveal chain: one timer per step, cleared on every state change. */
  useEffect(() => {
    if (!hasEvents || status !== "running") return;

    if (revealedCount >= timeline.length) {
      const timer = window.setTimeout(() => setStatus("complete"), COMPLETE_DELAY_MS);
      return () => window.clearTimeout(timer);
    }

    const previous = revealedCount > 0 ? timeline[revealedCount - 1] : undefined;
    const hold =
      previous?.kind === "finding" && previous.finding.result === "blocked"
        ? BLOCKED_HOLD_MS
        : 0;
        // Phase 2 reveals as a single time-staggered wave (one checkpoint); only
    // phase4-preview sessions keep the multi-checkpoint staggered cadence.
    const interval = isPhase2
      ? BASE_INTERVAL_MS
      : timeline.length <= 3
        ? SLOW_INTERVAL_MS
        : BASE_INTERVAL_MS;
    const delay = (revealedCount === 0 ? FIRST_REVEAL_MS : interval) + hold;

    const timer = window.setTimeout(
      () => setRevealedCount((count) => Math.min(count + 1, timeline.length)),
      delay,
    );
    return () => window.clearTimeout(timer);
    }, [hasEvents, status, revealedCount, timeline, isPhase2]);

  const revealed = timeline.slice(0, revealedCount);
  const revealedFindings = revealed
    .filter((event) => event.kind === "finding")
    .map((event) => event.finding);
  const revealedEgress = revealed
    .filter((event) => event.kind === "egress")
    .map((event) => event.egress);

  /** Findings spread evenly across checkpoints (pure index math, no data mutation). */
  const checkpointOfIndex = (index: number) =>
    Math.min(
      session.totalCheckpoints,
      Math.floor((index * session.totalCheckpoints) / Math.max(1, session.findings.length)) + 1,
    );

  const currentCheckpoint =
    revealedFindings.length === 0
      ? status === "queued"
        ? 0
        : 1
      : checkpointOfIndex(revealedFindings.length - 1);

  const progressPct =
    totalEvents === 0 ? (status === "complete" ? 100 : 0) : Math.round((revealedCount / totalEvents) * 100);

  const waitingForFirstFinding =
    status !== "complete" && revealedFindings.length === 0 && session.findings.length > 0;

  return (
    <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="truncate font-heading text-lg font-semibold tracking-tight text-text-primary">
              {session.candidate.toolName}
              <span className="text-text-muted">
                {" "}
                &middot; {session.candidate.vendor} &middot; v{session.candidate.version}
              </span>
            </h1>
            <p className="font-mono text-xs text-text-muted">session {session.id}</p>
          </div>
                    <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-4 self-end">
              <span className="text-sm text-text-muted">
                {isPhase2
                  ? `Window: ${session.windowHours}h — single checkpoint at session end`
                  : `Checkpoint ${currentCheckpoint} of ${session.totalCheckpoints}`}
              </span>
              <StatusBadge status={status} />
            </div>
            {session.planPhase === "phase4-preview" && (
              <>
                <span className="inline-flex items-center rounded-md border border-violet-400/40 bg-violet-500/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-violet-400">
                  Phase 4 preview
                </span>
                <p className="font-mono text-[10px] text-text-muted">
                  Multi-checkpoint time-delayed detection is a Phase 4 capability — this session
                  previews it ahead of schedule.
                </p>
              </>
            )}
          </div>
        </div>

        <div
          role="progressbar"
          aria-label="Vetting progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressPct}
          className="h-1 w-full overflow-hidden rounded-full bg-border"
        >
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700 ease-out",
              status === "complete" ? "bg-status-complete" : "bg-status-running",
            )}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </header>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <ContainPanel session={session} status={status} findings={revealedFindings} />
        <AttackPanel findings={revealedFindings} waiting={waitingForFirstFinding} />
                <WatchPanel
          entries={revealedEgress}
          trustScore={status === "complete" ? session.trustScore : undefined}
          windowHours={session.windowHours}
        />
      </div>

      {status === "complete" && session.verdict && (
        <footer className="animate-in fade-in slide-in-from-bottom-2 duration-700">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-bg-surface p-6">
            <div className="flex flex-wrap items-center gap-3">
              <VerdictBadge verdict={session.verdict} />
              <span className="text-sm text-text-muted">
                All checkpoints processed. Verdict ready.
              </span>
            </div>
            <Button
              nativeButton={false}
              render={<Link href={`/sessions/${session.id}/verdict`} />}
              className="relative"
            >
              <span
                aria-hidden
                className={cn(
                  "absolute -inset-1 -z-10 animate-pulse rounded-lg blur-md",
                  verdictGlow[session.verdict as Verdict],
                )}
              />
              View Verdict Report
              <ArrowRightIcon className="size-4" aria-hidden />
            </Button>
          </div>
        </footer>
      )}
    </main>
  );
}

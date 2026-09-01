import {
  ArrowDownIcon,
  ArrowUpIcon,
  BanIcon,
  CheckIcon,
  ClockIcon,
  FlagIcon,
  LockIcon,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import type { EgressLogEntry, Finding, TrustDelta } from "@/lib/types";
import { cn } from "@/lib/utils";

/** ISO timestamp -> "HH:MM:SS" (pure string slice, locale-safe). */
function timeOf(timestamp: string): string {
  return timestamp.slice(11, 19);
}

function PanelHeading({ children }: { children: string }) {
  return (
    <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-text-muted">
      {children}
    </h2>
  );
}

/**
 * Finding result chips. Related to, but visually distinct from, verdict badges:
 * square mono uppercase chips (vs. rounded pill badges) and a different icon set.
 */
const findingResultConfig = {
  blocked: {
    label: "blocked",
    icon: BanIcon,
    tone: "border-verdict-rejected/40 bg-verdict-rejected/10 text-verdict-rejected",
  },
  flagged: {
    label: "flagged",
    icon: FlagIcon,
    tone: "border-status-stalled/40 bg-status-stalled/10 text-status-stalled",
  },
  passed: {
    label: "passed",
    icon: CheckIcon,
    tone: "border-verdict-approved/40 bg-verdict-approved/10 text-verdict-approved",
  },
} as const;

function FindingRow({ finding }: { finding: Finding }) {
  const { label, icon: Icon, tone } = findingResultConfig[finding.result];

  return (
    <li className="animate-in fade-in slide-in-from-bottom-2 flex flex-col gap-2 rounded-lg border border-border bg-bg-base p-4 duration-500">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs text-text-muted">{timeOf(finding.timestamp)}</span>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider",
            tone,
          )}
        >
          <Icon className="size-3" aria-hidden />
          {label}
        </span>
      </div>
      <p className="text-sm font-medium text-text-primary">{finding.category}</p>
      <p className="text-xs leading-relaxed text-text-muted">{finding.detail}</p>
      {finding.pattern === "time-delayed" && (
        <span className="inline-flex w-fit items-center gap-1 rounded-sm border border-dashed border-status-stalled/50 px-1.5 py-0.5 font-mono text-[10px] tracking-wide text-status-stalled">
          <ClockIcon className="size-3" aria-hidden />
          time-delayed pattern
        </span>
      )}
    </li>
  );
}

/** Panel 1 - "Contain": sandbox posture. Static content. */
export function ContainPanel() {
  return (
    <section className="flex flex-col gap-5 rounded-xl border border-border bg-bg-surface p-6">
      <PanelHeading>Contain</PanelHeading>

      <div className="flex items-center gap-2.5 text-sm text-text-primary">
        <span
          aria-hidden
          className="size-2 shrink-0 rounded-full bg-verdict-approved shadow-[0_0_8px] shadow-verdict-approved/60"
        />
        Isolated container active
      </div>

      <div className="flex items-center gap-2.5 text-sm text-text-primary">
        <LockIcon className="size-4 shrink-0 text-status-queued" aria-hidden />
        0 standing credentials issued
      </div>

      <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-bg-base p-3">
        <p className="truncate font-mono text-xs text-text-muted" title="scoped session token (mock)">
          eyJhbGciOiJIUzI1NiJ9.eyJzY29wZSI6InNjb3BlZDp0b29sOnJ1biIsImp0aSI6ImNiXzdmM2U5YSIsImV4cCI6MTc4Nzg5MzYwMH0.9f2aQ7cE
        </p>
        <p className="text-xs text-text-muted">scoped, short-lived - expires in 15m</p>
      </div>
    </section>
  );
}

/** Panel 2 - "Attack": live findings feed (reveal-driven by the parent). */
export function AttackPanel({
  findings,
  waiting,
}: {
  findings: Finding[];
  waiting: boolean;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border bg-bg-surface p-6">
      <div className="flex items-center justify-between gap-2">
        <PanelHeading>Attack</PanelHeading>
        <span className="font-mono text-xs text-text-muted">
          {findings.length} finding{findings.length === 1 ? "" : "s"}
        </span>
      </div>

      <ul aria-live="polite" className="flex flex-col gap-3">
        {findings.map((finding) => (
          <FindingRow key={finding.id} finding={finding} />
        ))}

        {waiting && (
          <>
            <li className="flex flex-col gap-2 rounded-lg border border-border p-4">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-3 w-full" />
            </li>
            <li className="flex flex-col gap-2 rounded-lg border border-border p-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-4/5" />
            </li>
          </>
        )}

        {!waiting && findings.length === 0 && (
          <li className="py-8 text-center font-mono text-xs text-text-muted">
            listening for probe results...
          </li>
        )}
      </ul>
    </section>
  );
}

/** Panel 3 - "Watch": egress log + trust delta. */
export function WatchPanel({
  entries,
  trustDelta,
}: {
  entries: EgressLogEntry[];
  trustDelta?: TrustDelta;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border bg-bg-surface p-6">
      <div className="flex items-center justify-between gap-2">
        <PanelHeading>Watch</PanelHeading>
        <span className="font-mono text-xs text-text-muted">{entries.length} calls</span>
      </div>

      <ul aria-live="polite" className="flex flex-col gap-2">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="animate-in fade-in slide-in-from-bottom-2 flex items-center gap-3 rounded-lg border border-border bg-bg-base px-3 py-2 font-mono text-xs duration-500"
          >
            <span className="shrink-0 text-text-muted">{timeOf(entry.timestamp)}</span>
            <span className="w-9 shrink-0 text-text-primary">{entry.method}</span>
            <span className="min-w-0 flex-1 truncate text-text-primary">{entry.destination}</span>
            {entry.blocked ? (
              <span className="inline-flex shrink-0 items-center rounded-sm border border-verdict-rejected/40 bg-verdict-rejected/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-verdict-rejected">
                blocked
              </span>
            ) : (
              <span className="shrink-0 text-[10px] uppercase tracking-wider text-text-muted">
                allowed
              </span>
            )}
          </li>
        ))}

        {entries.length === 0 && (
          <li className="py-4 text-center font-mono text-xs text-text-muted">
            listening for outbound traffic...
          </li>
        )}
      </ul>

      {trustDelta && (
        <div className="mt-auto flex flex-col gap-2 rounded-lg border border-border bg-bg-base p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
            Trust Delta
          </p>
          <div className="flex items-center gap-2 text-sm">
            {trustDelta.direction === "up" && (
              <ArrowUpIcon className="size-4 shrink-0 text-verdict-approved" aria-hidden />
            )}
            {trustDelta.direction === "down" && (
              <ArrowDownIcon className="size-4 shrink-0 text-verdict-rejected" aria-hidden />
            )}
            {trustDelta.direction === "none" && (
              <ArrowUpIcon className="size-4 shrink-0 text-status-queued" aria-hidden />
            )}
            <span
              className={cn(
                "font-medium",
                trustDelta.direction === "up" && "text-verdict-approved",
                trustDelta.direction === "down" && "text-verdict-rejected",
                trustDelta.direction === "none" && "text-text-muted",
              )}
            >
              {trustDelta.label}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}


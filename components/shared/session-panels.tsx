"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BanIcon,
  CheckIcon,
  ClockIcon,
  FlagIcon,
  LockIcon,
  ShieldAlertIcon,
  ShieldIcon,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import type { EgressLogEntry, Finding, Session, SessionStatus, TrustScore } from "@/lib/types";
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
    <li
      id={`finding-${finding.id}`}
      className="animate-in fade-in slide-in-from-bottom-2 flex flex-col gap-2 rounded-lg border border-border bg-bg-base p-4 duration-500"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex flex-col">
          <span className="font-mono text-xs text-text-muted">{timeOf(finding.timestamp)}</span>
          <span className="font-mono text-[11px] text-text-muted">
            {finding.payloadId} · {finding.corpusVersion}
          </span>
        </span>
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

/* ------------------------------------------------------------------ */
/*  Contain helpers - pure, client-side simulation only               */
/* ------------------------------------------------------------------ */

/** Fixed placeholder for the token's third segment. Deliberately NOT a
 *  verifiable signature — only the Verdict's signature (real Phase 2:
 *  Ed25519, independently re-verifiable) carries that claim. */
const SIMULATED_TOKEN_SIGNATURE = "SIMULATED_SIG";

/** Standard JWT base64url: URL-safe alphabet substitution, padding stripped. */
function base64UrlEncode(value: string): string {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function encodeTokenPart(part: object): string {
  return base64UrlEncode(JSON.stringify(part));
}

/** Realistic-LOOKING three-part JWT built from the session's token material.
 *  The structure mirrors a PyJWT-issued scoped token; nothing here is signed. */
function buildMockToken(session: Session): string {
  return [
    encodeTokenPart(session.scopedToken.header),
    encodeTokenPart(session.scopedToken.payload),
    SIMULATED_TOKEN_SIGNATURE,
  ].join(".");
}

/** Smooth-scroll to a finding in the Attack panel and flash-highlight it.
 *  No-op while playback has not yet revealed that finding. */
function scrollToFinding(findingId: string): void {
  const el = document.getElementById(`finding-${findingId}`);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.add("ring-2", "ring-verdict-rejected/70");
  window.setTimeout(() => el.classList.remove("ring-2", "ring-verdict-rejected/70"), 2000);
}

/** Panel 1 - "Contain": sandbox lifecycle, scoped zero-credential token,
 *  structural escalation guarantee, egress bypass test. */
export function ContainPanel({
  session,
  status,
  findings,
}: {
  /** The session under playback (mock data is never mutated). */
  session: Session;
  /** Live playback status — may lag behind session.status until teardown lands. */
  status: SessionStatus;
  /** Findings revealed so far — the escalation callout appears in lockstep
   *  with the Attack feed, never before the finding itself exists. */
  findings: Finding[];
}) {
  const [showFullToken, setShowFullToken] = useState(false);

  const { scopedToken, bypassTestResult, teardownVerifiedWithinSeconds } = session;
  const token = useMemo(() => buildMockToken(session), [session]);
  const tokenTtlMinutes = Math.round((scopedToken.payload.exp - scopedToken.payload.iat) / 60);

  const isComplete = status === "complete";
  /** DoD: teardown verified within 30s. The value is rendered verbatim — if
   *  the mock data ever exceeds 30s, that is a mock-data bug, surfaced loudly
   *  here rather than hidden. */
  const teardownOverDod = teardownVerifiedWithinSeconds >= 30;

  const escalationFinding = findings.find((finding) => finding.category === "escalation_attempt");

  return (
    <section className="flex flex-col gap-5 rounded-xl border border-border bg-bg-surface p-6">
      <PanelHeading>Contain</PanelHeading>

      {/* Sandbox lifecycle — state tied to playback status, not one static line. */}
      {isComplete ? (
        <div className="flex items-center gap-2.5 text-sm text-text-primary">
          <span
            aria-hidden
            className={cn(
              "size-2 shrink-0 rounded-full shadow-[0_0_8px]",
              teardownOverDod
                ? "bg-status-stalled shadow-status-stalled/60"
                : "bg-verdict-approved shadow-verdict-approved/60",
            )}
          />
          <span>Torn down — verified clean within {teardownVerifiedWithinSeconds}s</span>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 text-sm text-text-primary">
          <span
            aria-hidden
            className="size-2 shrink-0 rounded-full bg-verdict-approved shadow-[0_0_8px] shadow-verdict-approved/60"
          />
          Isolated container active
        </div>
      )}

      <div className="flex items-center gap-2.5 text-sm text-text-primary">
        <LockIcon className="size-4 shrink-0 text-status-queued" aria-hidden />
        0 standing credentials issued
      </div>

      {/* Scoped token — real-looking structure, honest placeholder signature. */}
      <div className="flex flex-col gap-2 rounded-lg border border-border bg-bg-base p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
            Scoped token
          </p>
          <button
            type="button"
            onClick={() => setShowFullToken((visible) => !visible)}
            className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-text-muted underline-offset-2 hover:text-text-primary hover:underline"
          >
            {showFullToken ? "Hide full token" : "Show full token"}
          </button>
        </div>

        <p
          className={cn(
            "font-mono text-xs leading-relaxed text-text-muted",
            !showFullToken && "truncate",
          )}
          title={showFullToken ? undefined : "scoped session token (simulated)"}
        >
          {token}
        </p>

        <p className="text-xs text-text-muted">
          zero standing credentials — <code className="font-mono">&quot;scope&quot;: []</code> at
          issuance · expires in {tokenTtlMinutes}m
        </p>

        <Accordion>
          <AccordionItem value="decode-token">
            <AccordionTrigger className="py-1.5 font-mono text-xs text-text-muted">
              Decode token
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
                    header
                  </p>
                  <pre className="overflow-x-auto rounded-md border border-border bg-bg-surface p-2.5 font-mono text-[11px] leading-relaxed text-text-primary">
                    {JSON.stringify(scopedToken.header, null, 2)}
                  </pre>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
                    payload
                  </p>
                  <pre className="overflow-x-auto rounded-md border border-border bg-bg-surface p-2.5 font-mono text-[11px] leading-relaxed text-text-primary">
                    {JSON.stringify(scopedToken.payload, null, 2)}
                  </pre>
                </div>
                <p className="text-xs leading-relaxed text-text-muted">
                  <code className="font-mono text-verdict-approved">&quot;scope&quot;: []</code> —
                  the visual proof of zero standing credentials: no permission exists until the
                  candidate loads, and any widening attempt is denied at the identity layer.
                </p>
                <p className="text-[11px] leading-relaxed text-text-muted">
                  Simulated token — the signature segment is a fixed placeholder, not verifiable.
                  Real Phase 2 issues a PyJWT-scoped token; only the verdict is signed (Ed25519).
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      {/* Escalation callout — Story B only; omitted entirely otherwise. */}
      {escalationFinding && (
        <div
          role="alert"
          className="flex flex-col gap-2 rounded-lg border border-verdict-rejected/40 bg-verdict-rejected/10 p-4"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-verdict-rejected">
            <ShieldAlertIcon className="size-4 shrink-0" aria-hidden />
            Escalation attempt blocked structurally
          </div>
          <p className="text-xs leading-relaxed text-text-muted">
            Candidate requested scope beyond what was granted; denied before any credential
            existed — this is a structural guarantee, not a scanner catching it after the fact.
          </p>
          <button
            type="button"
            onClick={() => scrollToFinding(escalationFinding.id)}
            className="inline-flex w-fit items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-verdict-rejected underline-offset-2 hover:underline"
          >
            View finding in Attack panel
            <ArrowDownIcon className="size-3" aria-hidden />
          </button>
        </div>
      )}

      {/* Bypass test — "documented limitation, not claimed as covered". */}
      <div className="flex flex-col gap-1.5">
        {bypassTestResult.blocked ? (
          <>
            <span className="inline-flex w-fit items-center gap-1 rounded-sm border border-verdict-approved/40 bg-verdict-approved/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-verdict-approved">
              <ShieldIcon className="size-3" aria-hidden />
              HTTP(S) bypass test: blocked
            </span>
            <p className="text-xs leading-relaxed text-text-muted">{bypassTestResult.note}</p>
          </>
        ) : isComplete ? (
          <>
            <span className="inline-flex w-fit items-center gap-1 rounded-sm border border-verdict-rejected/40 bg-verdict-rejected/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-verdict-rejected">
              <ShieldAlertIcon className="size-3" aria-hidden />
              HTTP(S) bypass test: NOT blocked
            </span>
            <p className="text-xs leading-relaxed text-text-muted">{bypassTestResult.note}</p>
          </>
        ) : (
          <>
            <span className="inline-flex w-fit items-center gap-1 rounded-sm border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-text-muted">
              <ShieldIcon className="size-3" aria-hidden />
              HTTP(S) bypass test: pending
            </span>
            <p className="text-xs leading-relaxed text-text-muted">{bypassTestResult.note}</p>
          </>
        )}
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

      <div className="flex flex-col gap-1">
        <p className="font-mono text-xs text-text-muted">
          Scanned with NeMo Guardrails — static metadata pass only (name, description,
          docstrings). No candidate code executes outside the sandbox.
        </p>
        <p className="font-mono text-xs text-text-muted">Corpus corpus-v1 · 5 seed patterns</p>
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
  trustScore,
  windowHours,
}: {
  entries: EgressLogEntry[];
  trustScore?: TrustScore;
  windowHours: number;
}) {
  const [rawEntries, setRawEntries] = useState<Set<string>>(new Set());
  const toggleRaw = (id: string) =>
    setRawEntries((set) => {
      const next = new Set(set);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border bg-bg-surface p-6">
      <div className="flex items-center justify-between gap-2">
        <PanelHeading>Watch</PanelHeading>
        <span className="font-mono text-xs text-text-muted">{entries.length} calls</span>
      </div>

      <p className="font-mono text-xs text-text-muted">
        Session window: {windowHours}h (fixed — full 1–30 day configurable async engine is
        Phase 4)
      </p>

      <ul aria-live="polite" className="flex flex-col gap-2">
                {entries.map((entry) => (
          <li
            key={entry.id}
            className="animate-in fade-in slide-in-from-bottom-2 flex flex-col gap-1 rounded-lg border border-border bg-bg-base px-3 py-2 duration-500"
          >
            <div className="flex items-center gap-3 font-mono text-xs">
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
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => toggleRaw(entry.id)}
                className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-text-muted hover:text-text-primary"
              >
                {rawEntries.has(entry.id) ? "redacted" : "raw"}
              </button>
              <span className="font-mono text-[11px] text-text-muted break-all">
                {rawEntries.has(entry.id) ? entry.rawPreview : entry.redactedPreview}
              </span>
            </div>
          </li>
        ))}

        {entries.length === 0 && (
          <li className="py-4 text-center font-mono text-xs text-text-muted">
            listening for outbound traffic...
          </li>
        )}
      </ul>

      {trustScore && (
        <div className="mt-auto flex flex-col gap-2 rounded-lg border border-border bg-bg-base p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
            {trustScore.status === "delta" ? "Trust Delta" : "Trust Score"}
          </p>
          <div className="flex items-center gap-2 text-sm">
            {trustScore.direction === "up" && (
              <ArrowUpIcon className="size-4 shrink-0 text-verdict-approved" aria-hidden />
            )}
            {trustScore.direction === "down" && (
              <ArrowDownIcon className="size-4 shrink-0 text-verdict-rejected" aria-hidden />
            )}
            <span
              className={cn(
                "font-medium",
                trustScore.direction === "up" && "text-verdict-approved",
                trustScore.direction === "down" && "text-verdict-rejected",
                trustScore.direction === undefined && "text-text-muted",
              )}
            >
              {trustScore.label}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}


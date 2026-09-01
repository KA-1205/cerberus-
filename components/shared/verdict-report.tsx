import Link from "next/link";
import { ArrowLeftIcon, ArrowDownIcon, ArrowUpIcon, CircleCheckIcon, FileDownIcon, TriangleAlertIcon } from "lucide-react";

import { VerdictBadge } from "@/components/shared/VerdictBadge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Session } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * VerdictReport - the final audit artifact for a session.
 *
 * Rendered as a static "paper" document: no playback, no timers - the live
 * revealing already happened on the Session Detail screen. Calm by design.
 */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Deterministic date formatting (no locale drift): "2026-09-01" -> "Sep 1, 2026". */
function formatIssued(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split("-");
  return `${MONTHS[Number(month) - 1]} ${Number(day)}, ${year}`;
}

/** "f41d7a09...b8d" style short hash for the signature block. */
function shortHash(hash: string): string {
  return `ed25519:${hash.slice(0, 6)}...${hash.slice(-4)}`;
}

/** Placeholder raw-trace dump - pseudo-JSON, deliberately not parsed anywhere. */
function buildRawTrace(session: Session): string {
  return `{
  "trace_id": "trc_cerberus_${session.candidate.id.replace("cand_", "")}",
  "session": "${session.id}",
  "tool": {
    "name": "${session.candidate.toolName}",
    "vendor": "${session.candidate.vendor}",
    "version": "${session.candidate.version}",
    "source": "${session.candidate.sourceUrl}"
  },
  "sandbox": {
    "image": "cerberus/sandbox:0.9-mvp",
    "network": "egress-proxy-only",
    "standing_credentials": 0
  },
  "checkpoints": { "completed": ${session.checkpoint}, "total": ${session.totalCheckpoints} },
  "findings": [
${session.findings
  .map(
    (finding) => `    { "id": "${finding.id}", "ts": "${finding.timestamp}", "category": "${finding.category}", "result": "${finding.result}", "pattern": "${finding.pattern}" }`,
  )
  .join(",\n")}
  ],
  "egress": [
${session.egressLog
  .map(
    (entry) => `    { "id": "${entry.id}", "ts": "${entry.timestamp}", "dst": "${entry.destination}", "method": "${entry.method}", "blocked": ${entry.blocked} }`,
  )
  .join(",\n")}
  ],
  "verdict": "${session.verdict ?? "pending"}",
  "signature": { "valid": ${session.signatureValid ?? false}, "alg": "ed25519" }
}`;
}

function StatBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-bg-base p-4">
      <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">{label}</p>
      {children}
    </div>
  );
}

export function VerdictReport({ session }: { session: Session }) {
  const blockedCount = session.egressLog.filter((entry) => entry.blocked).length;

  return (
    <main className="mx-auto flex w-full max-w-[800px] flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8">
      <Button
        variant="ghost"
        size="sm"
        nativeButton={false}
        render={<Link href={`/sessions/${session.id}`} />}
        className="w-fit gap-2 self-start text-text-muted hover:text-text-primary"
      >
        <ArrowLeftIcon className="size-4" aria-hidden />
        Back to Session
      </Button>

      {/* The "paper" - deliberately reads as a printed artifact, not a UI panel. */}
      <article className="flex flex-col gap-6 rounded-xl border border-border bg-bg-surface p-6 shadow-xl shadow-black/20 md:p-12">
        <header className="flex flex-col gap-3">
          <VerdictBadge
            verdict={session.verdict ?? "conditional"}
            className="h-10 gap-2 px-4 text-base [&_svg]:size-5"
          />
          <h1 className="font-heading text-xl font-semibold tracking-tight text-text-primary md:text-2xl">
            {session.candidate.toolName}
            <span className="text-text-muted">
              {" "}
              &middot; {session.candidate.vendor} &middot; v{session.candidate.version}
            </span>
          </h1>
          <p className="font-mono text-xs text-text-muted">
            Issued {formatIssued(session.startedAt)} &middot; session {session.id} &middot;{" "}
            {session.checkpoint}/{session.totalCheckpoints} checkpoints
          </p>
        </header>

        <Separator />

        {/* Signature verification block */}
        {session.signatureValid ? (
          <div className="flex flex-col gap-1.5 rounded-lg border border-verdict-approved/30 bg-verdict-approved/5 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-verdict-approved">
              <CircleCheckIcon className="size-4 shrink-0" aria-hidden />
              Signature verified
            </div>
            <p className="truncate font-mono text-xs text-text-muted">
              {session.signatureHash ? shortHash(session.signatureHash) : "ed25519:..."}
            </p>
          </div>
        ) : (
          <div
            role="alert"
            className="flex items-center gap-2.5 rounded-lg border-2 border-verdict-rejected bg-verdict-rejected/10 p-4 text-sm font-semibold text-verdict-rejected"
          >
            <TriangleAlertIcon className="size-5 shrink-0" aria-hidden />
            Signature invalid
          </div>
        )}

        {/* Plain-English reason - the one line a judge must understand instantly */}
        {session.verdictReason && (
          <blockquote className="border-l-2 border-border pl-4 text-base leading-relaxed text-text-primary">
            {session.verdictReason}
          </blockquote>
        )}

        {/* Summary stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatBlock label="Findings">
            <p className="text-2xl font-semibold text-text-primary">{session.findings.length}</p>
          </StatBlock>
          <StatBlock label="Blocked egress">
            <p className="text-2xl font-semibold text-text-primary">{blockedCount}</p>
          </StatBlock>
          <StatBlock label="Trust delta">
            {session.trustDelta ? (
              <div className="flex items-center gap-1.5 text-sm font-medium">
                {session.trustDelta.direction === "up" && (
                  <ArrowUpIcon className="size-4 text-verdict-approved" aria-hidden />
                )}
                {session.trustDelta.direction === "down" && (
                  <ArrowDownIcon className="size-4 text-verdict-rejected" aria-hidden />
                )}
                <span
                  className={cn(
                    session.trustDelta.direction === "up" && "text-verdict-approved",
                    session.trustDelta.direction === "down" && "text-verdict-rejected",
                    session.trustDelta.direction === "none" && "text-text-muted",
                  )}
                >
                  {session.trustDelta.label}
                </span>
              </div>
            ) : (
              <p className="text-sm text-text-muted">none recorded</p>
            )}
          </StatBlock>
        </div>

        {/* Raw trace */}
        <Accordion>
          <AccordionItem value="raw-trace">
            <AccordionTrigger>View raw trace</AccordionTrigger>
            <AccordionContent>
              <pre className="max-h-80 overflow-auto rounded-lg border border-border bg-bg-base p-4 font-mono text-xs leading-relaxed text-text-muted">
                {buildRawTrace(session)}
              </pre>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Separator />

        <footer className="flex flex-wrap items-center justify-between gap-4">
          <p className="font-mono text-xs text-text-muted">
            mock artifact - generated locally, no backend
          </p>
          <Tooltip>
            <TooltipTrigger
              render={
                <span
                  tabIndex={0}
                  className="inline-flex rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              }
            >
              <Button disabled className="pointer-events-none gap-2">
                <FileDownIcon className="size-4" aria-hidden />
                Export PDF
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export coming soon</TooltipContent>
          </Tooltip>
        </footer>
      </article>
    </main>
  );
}


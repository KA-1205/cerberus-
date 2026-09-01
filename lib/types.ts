/**
 * Cerberus — shared domain types.
 * Used across the dashboard (sessions, verdicts, evidence) — all data is mocked locally.
 */

/** Lifecycle state of a vetting session. */
export type SessionStatus = "queued" | "running" | "complete" | "stalled";

/** Final verdict for a candidate tool. */
export type Verdict = "approved" | "rejected" | "conditional";

/**
 * A single security finding produced during a session.
 *
 * Every finding is traceable to a specific payload attempt in a specific
 * versioned seed corpus (Phase 2 "Attack" pipeline: NeMo Guardrails
 * static-metadata-only first pass — name/description/docstrings — never
 * executes candidate code outside the sandbox).
 *
 * When a finding represents a structural escalation denial (identity.py
 * denying out-of-scope credential use before any credential is issued),
 * `category` is the literal string "escalation_attempt" — meaningful per
 * the spec, not just another label.
 */
export type Finding = {
  id: string;
  timestamp: string;
  category: string;
  result: "blocked" | "flagged" | "passed";
  pattern: "immediate" | "time-delayed";
  detail: string;
  /** Seed-corpus version that produced this finding (e.g. "corpus-v1"). */
  corpusVersion: string;
  /** Identifier of the payload attempt behind this finding (e.g. "pay_0007"). */
  payloadId: string;
  /** Kind of target the payload was aimed at (e.g. "tool_description", "docstring"). */
  targetType: string;
};

/** One entry in the mitmproxy egress log. Redaction applies to everything logged —
 *  not just suspicious traffic — so both the raw and redacted snippets are kept. */
export type EgressLogEntry = {
  id: string;
  timestamp: string;
  destination: string;
  method: string;
  blocked: boolean;
  /** Pre-redaction payload snippet, e.g. containing a live-looking secret. */
  rawPreview: string;
  /** Post-redaction snippet, e.g. secrets masked before anything is logged. */
  redactedPreview: string;
};

/**
 * Trust standing for a candidate after vetting — never a bare boolean.
 *
 * Phase 2 rule: a first-time submission NEVER carries a numeric delta.
 * status is "not_applicable" for every Phase 2 story. The "delta" status is
 * Phase 4 territory (multi-day cadence + version history to compare against);
 * the shape is kept flexible so a future delta can carry direction/label.
 */
export type TrustScore = {
  status: "not_applicable" | "delta";
  label: string;
  /** Only meaningful when status is "delta". */
  direction?: "up" | "down";
};

/** A third-party AI tool submitted for vetting. */
export type Candidate = {
  id: string;
  toolName: string;
  vendor: string;
  version: string;
  sourceUrl: string;
  declaredScopes: string[];
};

/** A full vetting session (sandbox run + evidence + verdict). */
export type Session = {
  id: string;
  candidate: Candidate;
  status: SessionStatus;
  checkpoint: number;
  totalCheckpoints: number;
  startedAt: string;
  /** Configurable watch-window length in hours (SES-01), defaulted low for Phase 2. */
  windowHours: number;
  /** Phase 2 is always exactly one checkpoint, at session end (literal constant,
   *  not a range). Only "phase4-preview" sessions may differ. */
  checkpointCount: number;
  /** Seconds between teardown request and verified teardown (DoD: under 30s). */
  teardownVerifiedWithinSeconds: number;
  /** Result of the HTTP(S)-only egress bypass test run at teardown. */
  bypassTestResult: {
    attempted: string;
    blocked: boolean;
    note: string;
  };
  /** Scoped token issued at sandbox provisioning. `scope` is [] until the
   *  candidate is loaded — no standing credential is ever granted beyond zero. */
  scopedToken: {
    header: Record<string, string>;
    payload: {
      scope: string[];
      iat: number;
      exp: number;
      session_id: string;
    };
  };
  /** Which phase's scope this session models: literal Phase 2, or an explicit
   *  Phase 4 preview (multi-checkpoint / trust-delta behaviour). */
  planPhase: "phase2" | "phase4-preview";
  findings: Finding[];
  egressLog: EgressLogEntry[];
  trustScore: TrustScore;
  verdict?: Verdict;
  verdictReason?: string;
  signatureValid?: boolean;
  signatureHash?: string;
};
/**
 * Cerberus — shared domain types.
 * Used across the dashboard (sessions, verdicts, evidence) — all data is mocked locally.
 */

/** Lifecycle state of a vetting session. */
export type SessionStatus = "queued" | "running" | "complete" | "stalled";

/** Final verdict for a candidate tool. */
export type Verdict = "approved" | "rejected" | "conditional";

/** A single security finding produced during a session. */
export type Finding = {
  id: string;
  timestamp: string;
  category: string;
  result: "blocked" | "flagged" | "passed";
  pattern: "immediate" | "time-delayed";
  detail: string;
};

/** One entry in the sandbox egress log. */
export type EgressLogEntry = {
  id: string;
  timestamp: string;
  destination: string;
  method: string;
  blocked: boolean;
};

/** Directional change in trust for a candidate after vetting. */
export type TrustDelta = {
  direction: "up" | "down" | "none";
  label: string;
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
  findings: Finding[];
  egressLog: EgressLogEntry[];
  trustDelta?: TrustDelta;
  verdict?: Verdict;
  verdictReason?: string;
  signatureValid?: boolean;
  signatureHash?: string;
};
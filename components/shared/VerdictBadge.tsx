import {
  OctagonXIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
} from "lucide-react";

import type { Verdict } from "@/lib/types";
import { cn } from "@/lib/utils";

type VerdictConfig = {
  label: string;
  icon: typeof ShieldCheckIcon;
  tone: string;
};

const verdictConfig: Record<Verdict, VerdictConfig> = {
  approved: {
    label: "Approved",
    icon: ShieldCheckIcon,
    tone: "border-verdict-approved/30 bg-verdict-approved/10 text-verdict-approved",
  },
  rejected: {
    label: "Rejected",
    icon: OctagonXIcon,
    tone: "border-verdict-rejected/30 bg-verdict-rejected/10 text-verdict-rejected",
  },
  conditional: {
    label: "Conditional",
    icon: ShieldAlertIcon,
    tone: "border-verdict-conditional/30 bg-verdict-conditional/10 text-verdict-conditional",
  },
};

/**
 * Color + distinct icon per verdict + text label. Never color alone.

 * "conditional" uses a shield-alert icon (vs. the triangle-alert used by the "stalled"
 * status( so the two orange-ish states stay visually distinct, not just by hue.)
 */
export function VerdictBadge({
  verdict,
  className,
}: {
  verdict: Verdict;
  className?: string;
}) {
  const { label, icon: Icon, tone } = verdictConfig[verdict];

  return (
    <span
      data-slot="verdict-badge"
      className={cn(
        "inline-flex h-6 w-fit shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium whitespace-nowrap",
        tone,
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      <span>{label}</span>
    </span>
  );
}
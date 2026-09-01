import {
  ActivityIcon,
  CircleCheckIcon,
  HourglassIcon,
  TriangleAlertIcon,
} from "lucide-react";

import type { SessionStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

type StatusConfig = {
  label: string;
  icon: typeof ActivityIcon;
  tone: string;
};

const statusConfig: Record<SessionStatus, StatusConfig> = {
  queued: {
    label: "Queued",
    icon: HourglassIcon,
    tone: "border-status-queued/30 bg-status-queued/10 text-status-queued",
  },
  running: {
    label: "Running",
    icon: ActivityIcon,
    tone: "border-status-running/30 bg-status-running/10 text-status-running",
  },
  complete: {
    label: "Complete",
    icon: CircleCheckIcon,
    tone: "border-status-complete/30 bg-status-complete/10 text-status-complete",
  },
  stalled: {
    label: "Stalled",
    icon: TriangleAlertIcon,
    tone: "border-status-stalled/30 bg-status-stalled/10 text-status-stalled",
  },
};

/**
 * Color + icon + text label. Never color alone.
 * "running" also carries a subtle pulsing dot.
 */
export function StatusBadge({
  status,
  className,
}: {
  status: SessionStatus;
  className?: string;
}) {
  const { label, icon: Icon, tone } = statusConfig[status];
  const isRunning = status === "running";

  return (
    <span
      data-slot="status-badge"
      className={cn(
        "inline-flex h-6 w-fit shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium whitespace-nowrap",
        tone,
        className,
      )}
    >
      {isRunning && (
        <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-current" />
      )}
      <Icon className="size-3.5" aria-hidden />
      <span>{label}</span>
    </span>
  );
}
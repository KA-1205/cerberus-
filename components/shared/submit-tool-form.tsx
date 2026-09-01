"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, PlusIcon, XIcon } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * SubmitToolForm - one step of the vetting pipeline.
 *
 * LOCAL STATE ONLY: no backend. On submit, after a short fake delay, the demo
 * routes to one of the three pre-scripted mock sessions. The routing is keyed
 * off the tool name so a presenter can steer the demo by what they type:
 *   - name contains "clean"          -> session-a (clean pass)
 *   - name contains "bad" or "evil"  -> session-b (caught immediately)
 *   - anything else                  -> session-c (time-delayed evasion showcase)
 */

const submitSchema = z.object({
  toolName: z.string().trim().min(1, "Tool name is required"),
  vendor: z.string().trim().min(1, "Vendor is required"),
  version: z.string().trim().min(1, "Version is required"),
  sourceUrl: z
    .string()
    .trim()
    .min(1, "Source URL is required")
    .refine(
      (value) => {
        try {
          const url = new URL(value);
          return url.protocol === "http:" || url.protocol === "https:";
        } catch {
          return false;
        }
      },
      "Enter a valid http(s) URL",
    ),
    declaredScopes: z.array(z.object({ value: z.string() })),
    windowHours: z.number().int().min(1),
});

type SubmitFormValues = z.infer<typeof submitSchema>;

function sessionForTool(toolName: string): string {
  const name = toolName.toLowerCase().trim();
  if (name.includes("clean")) return "session-a";
  if (name.includes("bad") || name.includes("evil")) return "session-b";
  return "session-c";
}

export function SubmitToolForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [sessionWindow, setSessionWindow] = useState(2);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SubmitFormValues>({
    resolver: zodResolver(submitSchema),
    defaultValues: {
      toolName: "",
      vendor: "",
      version: "",
      sourceUrl: "",
      declaredScopes: [],
      windowHours: 2,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "declaredScopes",
  });

  const onSubmit = handleSubmit((values) => {
    if (pending) return;
    setPending(true);

    // Fake pipeline kickoff - local state only, no backend call.
    const id = sessionForTool(values.toolName);
    window.setTimeout(() => {
      router.push(`/sessions/${id}`);
    }, 1000);
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tool-name">Tool name</Label>
        <Input
          id="tool-name"
          placeholder="e.g. crm-sync-agent"
          autoComplete="off"
          aria-invalid={Boolean(errors.toolName)}
          {...register("toolName")}
        />
        {errors.toolName && (
          <p className="text-xs font-medium text-destructive">{errors.toolName.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="vendor">Vendor</Label>
        <Input
          id="vendor"
          placeholder="e.g. Nimbus Labs"
          autoComplete="organization"
          aria-invalid={Boolean(errors.vendor)}
          {...register("vendor")}
        />
        {errors.vendor && (
          <p className="text-xs font-medium text-destructive">{errors.vendor.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="version">Version</Label>
        <Input
          id="version"
          placeholder="1.0.0"
          autoComplete="off"
          className="font-mono"
          aria-invalid={Boolean(errors.version)}
          {...register("version")}
        />
        {errors.version && (
          <p className="text-xs font-medium text-destructive">{errors.version.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="source-url">Source URL</Label>
        <Input
          id="source-url"
          type="url"
          placeholder="https://github.com/vendor/tool"
          autoComplete="off"
          className="font-mono"
          aria-invalid={Boolean(errors.sourceUrl)}
          {...register("sourceUrl")}
        />
        {errors.sourceUrl && (
          <p className="text-xs font-medium text-destructive">{errors.sourceUrl.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label>Declared scope / permissions</Label>
        <div className="flex flex-col gap-2">
          {fields.length === 0 && (
            <p className="text-sm text-text-muted">No scopes declared.</p>
          )}
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <Input
                placeholder="e.g. read:documents"
                autoComplete="off"
                className="font-mono"
                aria-label={`Declared scope ${index + 1}`}
                {...register(`declaredScopes.${index}.value`)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remove scope ${index + 1}`}
                onClick={() => remove(index)}
              >
                <XIcon className="size-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => append({ value: "" })}
        >
          <PlusIcon className="size-4" />
          Add scope
        </Button>
        <p className="text-xs text-text-muted">
          Leave empty if this tool needs no external access &mdash; any outbound call
          will then be blocked by default.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="font-mono text-xs uppercase tracking-widest text-text-muted">
          Session window (hours)
        </Label>
        <div
          role="radiogroup"
          aria-label="Session window in hours"
          className="flex items-center gap-2"
        >
          {[1, 2, 4].map((hours) => (
            <button
              key={hours}
              type="button"
              onClick={() => {
                setSessionWindow(hours);
                setValue("windowHours", hours, { shouldValidate: true });
              }}
              aria-checked={sessionWindow === hours}
              role="radio"
              className={cn(
                "font-mono text-sm font-medium",
                sessionWindow === hours
                  ? "border border-violet-400/40 bg-violet-500/10 px-3 py-1.5 text-violet-400"
                  : "border border-border px-3 py-1.5 text-text-muted hover:text-text-primary",
              )}
            >
              {hours} {hours === 1 ? "hour" : "hours"}
            </button>
          ))}
        </div>
        <p className="text-xs text-text-muted">
          Phase 2 uses a short fixed window for a fast demo. The full 1–30 day
          configurable window is a Phase 4 capability.
        </p>
      </div>

      <div className="mt-2 flex justify-end border-t border-border pt-6">
        <Button type="submit" disabled={pending}>
          {pending ? (
            <>
              <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
              Queuing vetting session...
            </>
          ) : (
            "Submit for vetting"
          )}
        </Button>
      </div>
    </form>
  );
}

import { SubmitToolForm } from "@/components/shared/submit-tool-form";

export default function SubmitPage() {
  return (
    <main className="mx-auto flex w-full max-w-[640px] flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-lg font-semibold tracking-tight text-text-primary">
          Submit a Tool
        </h1>
        <p className="text-sm text-text-muted">
          Request a sandbox vetting run for a third-party AI tool.
        </p>
      </header>

      <SubmitToolForm />
    </main>
  );
}
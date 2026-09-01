"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DatabaseIcon,
  ListIcon,
  LockIcon,
  LogOutIcon,
  UploadIcon,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/submit", label: "Submit a Tool", icon: UploadIcon },
  { href: "/sessions", label: "Sessions", icon: ListIcon },
  { href: "/registry", label: "Registry", icon: DatabaseIcon },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <div className="flex min-h-screen w-full bg-bg-base text-text-primary">
      <aside className="sticky top-0 flex h-screen w-16 shrink-0 flex-col border-r border-border bg-bg-surface lg:w-60">
        <Link
          href="/"
          aria-label="Cerberus home"
          className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-3 text-text-primary transition-colors hover:bg-muted/40 lg:px-4"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-bg-base text-status-complete">
            <LockIcon className="size-4" aria-hidden />
          </span>
          <span className="hidden truncate font-heading text-sm font-semibold tracking-tight lg:inline">
            Cerberus
          </span>
        </Link>

        <nav aria-label="Primary" className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Button
              key={href}
              variant="ghost"
              nativeButton={false}
              render={<Link href={href} aria-label={label} title={label} />}
              className={cn(
                "w-full justify-start gap-2.5 rounded-md px-3 text-sm font-medium",
                isActive(href)
                  ? "bg-muted text-text-primary"
                  : "text-text-muted hover:text-text-primary",
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              <span className="hidden truncate lg:inline">{label}</span>
            </Button>
          ))}
        </nav>

        <Separator />

        <div className="flex shrink-0 items-center gap-2.5 p-3 pt-4">
          <Avatar size="sm" className="shrink-0">
            <AvatarFallback className="text-xs">DU</AvatarFallback>
          </Avatar>
          <div className="hidden min-w-0 flex-1 lg:block">
            <p className="truncate text-sm font-medium text-text-primary">Demo User</p>
            <p className="truncate text-xs text-text-muted">gatekeeper@cerberus.local</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            nativeButton={false}
            render={<Link href="/signin" aria-label="Sign out" title="Sign out" />}
            className="ml-auto text-text-muted hover:text-text-primary"
          >
            <LogOutIcon className="size-4" aria-hidden />
          </Button>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
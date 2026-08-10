import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Dumbbell, Home, Library, ListChecks, LineChart, History, Apple, Pill, Settings as SettingsIcon, Target, Ruler, Zap, Cloud, CloudOff, RefreshCw, Check } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useCloudSync } from "@/lib/useCloudSync";

const primaryNav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/planner", label: "Planner", icon: ListChecks },
  { to: "/library", label: "Library", icon: Library },
  { to: "/history", label: "History", icon: History },
  { to: "/progress", label: "Progress", icon: LineChart },
];

const moreNav = [
  { to: "/nutrition", label: "Nutrition", icon: Apple },
  { to: "/creatine", label: "Creatine", icon: Zap },
  { to: "/supplements", label: "Supplements", icon: Pill },
  { to: "/measurements", label: "Measurements", icon: Ruler },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export function AppLayout({ children }: { children?: ReactNode }) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));
  const { status } = useCloudSync();

  return (
    <div className="min-h-dvh w-full flex text-foreground">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col gap-1 p-4 border-r border-border/60 sticky top-0 h-dvh glass">
        <Link to="/" className="flex items-center gap-2 px-2 py-3 mb-2">
          <div
            className="grid place-items-center h-10 w-10 rounded-xl"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
          >
            <Dumbbell className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-bold tracking-tight">Iron</div>
            <div className="text-xs text-muted-foreground -mt-0.5">Gym Tracker</div>
          </div>
        </Link>
        <NavGroup label="Train">
          {primaryNav.map((n) => (
            <NavItem key={n.to} to={n.to} label={n.label} icon={n.icon} active={isActive(n.to)} />
          ))}
        </NavGroup>
        <NavGroup label="Track">
          {moreNav.map((n) => (
            <NavItem key={n.to} to={n.to} label={n.label} icon={n.icon} active={isActive(n.to)} />
          ))}
        </NavGroup>
        <div className="mt-auto px-3 py-2">
          <SyncBadge status={status} />
        </div>
      </aside>

      <main className="flex-1 min-w-0 pb-24 lg:pb-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6">{children ?? <Outlet />}</div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border/60 glass">
        <div className="grid grid-cols-5">
          {primaryNav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium",
                isActive(n.to) ? "text-primary" : "text-muted-foreground",
              )}
            >
              <n.icon className="h-5 w-5" />
              {n.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

function NavGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mt-2">
      <div className="px-3 pb-1 pt-2 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

function NavItem({ to, label, icon: Icon, active }: { to: string; label: string; icon: React.ElementType; active: boolean }) {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
        active
          ? "bg-primary/15 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-white/5",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
function SyncBadge({ status }: { status: import("@/lib/useCloudSync").SyncStatus }) {
  const map = {
    idle: { icon: Cloud, text: "Local only", cls: "text-muted-foreground" },
    syncing: { icon: RefreshCw, text: "Syncing…", cls: "text-muted-foreground animate-pulse" },
    synced: { icon: Check, text: "Synced to cloud", cls: "text-primary" },
    offline: { icon: CloudOff, text: "Offline — saved locally", cls: "text-amber-400" },
    error: { icon: CloudOff, text: "Sync error", cls: "text-destructive" },
  } as const;
  const { icon: Icon, text, cls } = map[status];
  return (
    <div className={cn("flex items-center gap-2 text-[11px]", cls)}>
      <Icon className="h-3.5 w-3.5" />
      {text}
    </div>
  );
}

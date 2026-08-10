import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { GlassCard } from "@/components/GlassCard";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import { useAuth } from "@/lib/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { wipeCloudData } from "@/lib/sync.functions";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Iron" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { settings, setSettings, clearAll, history, importData } = useStore();
  const wipeCloud = useServerFn(wipeCloudData);
  const { user } = useAuth();
  const navigate = useNavigate();

  const signOut = async () => {
    await supabase.auth.signOut();
    toast("Signed out");
  };

  const exportCSV = () => {
    const rows = [
      ["Date", "Workout", "Duration (s)", "Volume (kg)", "Exercises", "PRs"],
      ...history.map((h) => [
        new Date(h.date).toISOString(),
        h.name,
        String(h.durationSec),
        String(h.totalVolume),
        String(h.exercises.length),
        h.prsAchieved.join(" | "),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `iron-history-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    const data = JSON.stringify(useStore.getState(), null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `iron-backup-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importData(JSON.parse(reader.result as string));
        toast.success("Data imported");
      } catch {
        toast.error("Invalid file");
      }
    };
    reader.readAsText(file);
  };

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <GlassCard className="mb-3">
        <div className="font-semibold mb-2">Account</div>
        {user ? (
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">
                {(user.user_metadata?.full_name as string) || user.email}
              </div>
              <div className="text-xs text-muted-foreground truncate">{user.email}</div>
            </div>
            <button onClick={signOut} className="px-3 py-2 rounded-md bg-secondary/60 text-sm">
              Sign out
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">Not signed in</div>
            <button
              onClick={() => navigate({ to: "/auth" })}
              className="px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm"
            >
              Sign in with Google
            </button>
          </div>
        )}
      </GlassCard>

      <GlassCard className="mb-3 space-y-3">
        <Row label="Units">
          <select value={settings.units} onChange={(e) => setSettings({ units: e.target.value as "metric" | "imperial" })} className="bg-secondary/60 rounded-md px-2 py-1 text-sm">
            <option value="metric">Metric (kg)</option>
            <option value="imperial">Imperial (lb)</option>
          </select>
        </Row>
        <Row label="Notifications">
          <input type="checkbox" checked={settings.notifications} onChange={(e) => setSettings({ notifications: e.target.checked })} className="accent-primary h-4 w-4" />
        </Row>
        <Row label="Creatine tracker">
          <input type="checkbox" checked={settings.creatineEnabled} onChange={(e) => setSettings({ creatineEnabled: e.target.checked })} className="accent-primary h-4 w-4" />
        </Row>
      </GlassCard>

      <GlassCard className="mb-3">
        <div className="font-semibold mb-2">Backup & restore</div>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportCSV} className="px-3 py-2 rounded-md bg-secondary/60 text-sm">Export CSV</button>
          <button onClick={exportJSON} className="px-3 py-2 rounded-md bg-secondary/60 text-sm">Export JSON</button>
          <label className="px-3 py-2 rounded-md bg-secondary/60 text-sm cursor-pointer">
            Import JSON
            <input type="file" accept="application/json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) importJSON(f); }} />
          </label>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="font-semibold mb-2 text-destructive">Danger zone</div>
        <button onClick={async () => {
          if (!confirm("Erase all data? This also clears your cloud backup.")) return;
          clearAll();
          try {
            if (user) await wipeCloud();
            toast("All data cleared");
          } catch {
            toast("Local data cleared (cloud wipe failed)");
          }
        }} className="px-3 py-2 rounded-md border border-destructive/40 text-destructive text-sm">Clear all data</button>
      </GlassCard>
    </AppLayout>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm">{label}</div>
      {children}
    </div>
  );
}
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { GlassCard } from "@/components/GlassCard";
import { useStore } from "@/lib/store";
import { format } from "date-fns";

export const Route = createFileRoute("/measurements")({
  head: () => ({ meta: [{ title: "Measurements — Iron" }] }),
  component: Meas,
});

function Meas() {
  const { measurements } = useStore();
  const latest = measurements[measurements.length - 1];
  const fields = ["weight", "bodyFat", "chest", "waist", "neck", "hips", "arms", "forearms", "thighs", "calves"] as const;

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Measurements</h1>
        <Link to="/progress" className="text-xs text-primary underline">Log new →</Link>
      </div>
      {latest ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {fields.map((f) => (
            <GlassCard key={f}>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground capitalize">{f}</div>
              <div className="text-2xl font-bold">{latest[f] ?? "—"}</div>
            </GlassCard>
          ))}
        </div>
      ) : <GlassCard>No measurements yet.</GlassCard>}

      <GlassCard>
        <div className="font-semibold mb-2">History</div>
        <div className="space-y-1 text-sm">
          {[...measurements].reverse().map((m, i) => (
            <div key={i} className="flex justify-between border-b border-border/40 py-1.5">
              <span>{format(new Date(m.date), "PPP")}</span>
              <span className="text-muted-foreground">{m.weight ?? "—"}kg · BF {m.bodyFat ?? "—"}%</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </AppLayout>
  );
}
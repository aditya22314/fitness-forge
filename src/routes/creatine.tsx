import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { GlassCard } from "@/components/GlassCard";
import { computeStreak, useStore } from "@/lib/store";
import { Check, Droplet, Info, Zap } from "lucide-react";
import { format, subDays } from "date-fns";

export const Route = createFileRoute("/creatine")({
  head: () => ({ meta: [{ title: "Creatine — Iron" }] }),
  component: Creatine,
});

const today = () => new Date().toISOString().slice(0, 10);

function Creatine() {
  const { settings, setSettings, creatineDates, toggleCreatine, goals } = useStore();
  const enabled = settings.creatineEnabled;
  const t = today();
  const takenToday = creatineDates.includes(t);
  const streak = computeStreak(creatineDates.map((d) => new Date(d).getTime()));
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = subDays(new Date(), 13 - i);
    const key = d.toISOString().slice(0, 10);
    return { key, label: format(d, "d"), taken: creatineDates.includes(key) };
  });

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Zap className="h-5 w-5 text-primary" /> Creatine</h1>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={enabled} onChange={(e) => setSettings({ creatineEnabled: e.target.checked })} className="accent-primary h-4 w-4" />
          Enabled
        </label>
      </div>

      {enabled ? (
        <>
          <GlassCard className="mb-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Today</div>
                <div className="text-lg font-semibold">Take 5g creatine</div>
                {!takenToday && <div className="text-xs text-accent mt-1">Reminder: not logged yet</div>}
              </div>
              <button
                onClick={() => toggleCreatine(t)}
                className={`h-14 w-14 rounded-full grid place-items-center transition ${takenToday ? "text-primary-foreground" : "bg-secondary/60"}`}
                style={takenToday ? { background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" } : {}}
              >
                <Check className="h-6 w-6" />
              </button>
            </div>
          </GlassCard>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <GlassCard>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Streak</div>
              <div className="text-3xl font-bold">{streak}<span className="text-sm text-muted-foreground ml-1">days</span></div>
            </GlassCard>
            <GlassCard>
              <div className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1"><Droplet className="h-3 w-3" /> Hydration</div>
              <div className="text-3xl font-bold">{goals.waterGoal}L</div>
              <div className="text-xs text-muted-foreground">Recommended daily</div>
            </GlassCard>
          </div>

          <GlassCard className="mb-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Last 14 days</div>
            <div className="grid grid-cols-7 gap-1.5">
              {last14.map((d) => (
                <button
                  key={d.key}
                  onClick={() => toggleCreatine(d.key)}
                  className={`aspect-square rounded-md grid place-items-center text-[10px] font-semibold ${d.taken ? "text-primary-foreground" : "bg-secondary/60 text-muted-foreground"}`}
                  style={d.taken ? { background: "var(--gradient-primary)" } : {}}
                >{d.label}</button>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center gap-2 mb-2 text-sm"><Info className="h-4 w-4 text-primary" /><span className="font-semibold">Tips</span></div>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
              <li>Take 3–5 g daily. Timing doesn't matter — consistency does.</li>
              <li>Drink 3–4 L of water throughout the day.</li>
              <li>No loading phase required.</li>
              <li>Safe for long-term use for healthy adults.</li>
            </ul>
          </GlassCard>
        </>
      ) : (
        <GlassCard className="text-center py-10 text-muted-foreground">Creatine tracking is off. Toggle above to enable.</GlassCard>
      )}
    </AppLayout>
  );
}
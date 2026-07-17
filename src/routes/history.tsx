import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { GlassCard } from "@/components/GlassCard";
import { useStore, fmtDuration } from "@/lib/store";
import { format, isAfter, subDays } from "date-fns";
import { useMemo, useState } from "react";
import { Trophy } from "lucide-react";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "History — Iron" }] }),
  component: History,
});

function History() {
  const { history } = useStore();
  const [filter, setFilter] = useState<"all" | "week" | "month">("all");
  const [muscle, setMuscle] = useState<string>("all");

  const muscles = Array.from(new Set(history.flatMap((h) => h.exercises.map((e) => e.muscle))));

  const filtered = useMemo(() => {
    const cutoff = filter === "week" ? subDays(new Date(), 7) : filter === "month" ? subDays(new Date(), 30) : null;
    return history.filter((h) => {
      const dateOk = cutoff ? isAfter(new Date(h.date), cutoff) : true;
      const muscleOk = muscle === "all" ? true : h.exercises.some((e) => e.muscle === muscle);
      return dateOk && muscleOk;
    });
  }, [history, filter, muscle]);

  const prs = useMemo(() => {
    const map = new Map<string, number>();
    history.forEach((h) =>
      h.exercises.forEach((e) =>
        e.sets.filter((s) => s.completed).forEach((s) => {
          map.set(e.name, Math.max(map.get(e.name) ?? 0, s.weight));
        }),
      ),
    );
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [history]);

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold mb-4">History</h1>
      <div className="flex flex-wrap gap-2 mb-4">
        {(["all", "week", "month"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs ${filter === f ? "bg-primary/20 text-primary" : "bg-secondary/60 text-muted-foreground"}`}>
            {f === "all" ? "All" : f === "week" ? "This week" : "This month"}
          </button>
        ))}
        <select value={muscle} onChange={(e) => setMuscle(e.target.value)} className="bg-secondary/60 rounded-full px-3 py-1.5 text-xs">
          <option value="all">All muscles</option>
          {muscles.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {prs.length > 0 && (
        <GlassCard className="mb-4">
          <div className="flex items-center gap-2 mb-2 text-sm">
            <Trophy className="h-4 w-4 text-accent" />
            <div className="font-semibold">Personal Records</div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
            {prs.slice(0, 6).map(([name, w]) => (
              <div key={name} className="rounded-lg bg-white/5 px-3 py-2">
                <div className="text-xs text-muted-foreground truncate">{name}</div>
                <div className="font-bold">{w} kg</div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {filtered.length === 0 ? (
        <GlassCard className="text-center text-muted-foreground py-10">No workouts yet. Start one from the dashboard.</GlassCard>
      ) : (
        <div className="space-y-3">
          {filtered.map((h) => (
            <GlassCard key={h.id}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{h.name}</div>
                  <div className="text-xs text-muted-foreground">{format(new Date(h.date), "PPP")} · {fmtDuration(h.durationSec)}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{h.totalVolume.toLocaleString()}<span className="text-xs text-muted-foreground ml-1">kg vol</span></div>
                  <div className="text-xs text-muted-foreground">{h.exercises.length} exercises · {h.calories} kcal</div>
                </div>
              </div>
              {h.prsAchieved.length > 0 && (
                <div className="mt-2 text-xs text-accent">🏆 PR: {h.prsAchieved.join(", ")}</div>
              )}
            </GlassCard>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
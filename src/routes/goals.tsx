import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { GlassCard } from "@/components/GlassCard";
import { useStore, type Goals } from "@/lib/store";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/goals")({
  head: () => ({ meta: [{ title: "Goals — Iron" }] }),
  component: GoalsPage,
});

function GoalsPage() {
  const { goals, setGoals } = useStore();
  const [g, setG] = useState<Goals>(goals);

  const patch = <K extends keyof Goals>(k: K, v: Goals[K]) => setG({ ...g, [k]: v });

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold mb-4">Goals</h1>
      <GlassCard className="space-y-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Focus</div>
          <div className="flex flex-wrap gap-2">
            {(["Muscle Gain", "Fat Loss", "Maintenance"] as const).map((v) => (
              <button key={v} onClick={() => patch("goalType", v)} className={`px-3 py-1.5 rounded-full text-xs ${g.goalType === v ? "bg-primary/20 text-primary" : "bg-secondary/60"}`}>{v}</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {([
            ["targetWeight", "Target weight (kg)"],
            ["targetBodyFat", "Target body fat (%)"],
            ["proteinGoal", "Protein (g/day)"],
            ["waterGoal", "Water (L/day)"],
            ["caloriesGoal", "Calories/day"],
            ["weeklyWorkouts", "Workouts/week"],
            ["stepGoal", "Steps/day"],
          ] as [keyof Goals, string][]).map(([k, label]) => (
            <label key={k} className="text-xs">
              <div className="text-muted-foreground">{label}</div>
              <input type="number" value={g[k] as number} onChange={(e) => patch(k, Number(e.target.value) as Goals[typeof k])} className="w-full bg-secondary/60 rounded-md px-2 py-1.5 outline-none" />
            </label>
          ))}
        </div>
        <button
          onClick={() => { setGoals(g); toast.success("Goals saved"); }}
          className="w-full py-2.5 rounded-lg font-semibold text-primary-foreground"
          style={{ background: "var(--gradient-primary)" }}
        >Save goals</button>
      </GlassCard>
    </AppLayout>
  );
}
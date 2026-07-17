import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { GlassCard, ProgressRing } from "@/components/GlassCard";
import { useStore } from "@/lib/store";
import { useState } from "react";
import { Droplet } from "lucide-react";

export const Route = createFileRoute("/nutrition")({
  head: () => ({ meta: [{ title: "Nutrition — Iron" }] }),
  component: Nutrition,
});

const today = () => new Date().toISOString().slice(0, 10);

function Nutrition() {
  const { nutrition, logNutrition, addWater, goals } = useStore();
  const d = today();
  const cur = nutrition.find((n) => n.date === d) ?? { date: d, protein: 0, carbs: 0, fat: 0, calories: 0, water: 0 };
  const [form, setForm] = useState({ protein: "", carbs: "", fat: "", calories: "" });

  const add = () => {
    const next = { ...cur };
    (["protein", "carbs", "fat", "calories"] as const).forEach((k) => {
      const v = Number(form[k]);
      if (!Number.isNaN(v)) next[k] = (cur[k] ?? 0) + v;
    });
    logNutrition(next);
    setForm({ protein: "", carbs: "", fat: "", calories: "" });
  };

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold mb-4">Nutrition</h1>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <GlassCard className="flex flex-col items-center">
          <ProgressRing value={cur.protein / goals.proteinGoal} label={`${Math.round(cur.protein)}`} sublabel="Protein g" size={100} />
          <div className="text-xs text-muted-foreground mt-1">/ {goals.proteinGoal}g</div>
        </GlassCard>
        <GlassCard className="flex flex-col items-center">
          <ProgressRing value={cur.calories / goals.caloriesGoal} label={`${Math.round(cur.calories)}`} sublabel="kcal" size={100} />
          <div className="text-xs text-muted-foreground mt-1">/ {goals.caloriesGoal}</div>
        </GlassCard>
        <GlassCard className="flex flex-col items-center">
          <ProgressRing value={cur.water / goals.waterGoal} label={`${cur.water.toFixed(1)}`} sublabel="Water L" size={100} />
          <div className="text-xs text-muted-foreground mt-1">/ {goals.waterGoal}L</div>
        </GlassCard>
      </div>

      <GlassCard className="mb-4">
        <div className="font-semibold mb-3">Add food</div>
        <div className="grid grid-cols-4 gap-2">
          {(["protein", "carbs", "fat", "calories"] as const).map((k) => (
            <label key={k} className="text-xs">
              <div className="capitalize text-muted-foreground">{k}</div>
              <input value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} type="number" className="w-full bg-secondary/60 rounded-md px-2 py-1.5 outline-none" />
            </label>
          ))}
        </div>
        <button onClick={add} className="mt-3 w-full py-2.5 rounded-lg font-semibold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>Add</button>
      </GlassCard>

      <GlassCard>
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold flex items-center gap-2"><Droplet className="h-4 w-4 text-primary" /> Water</div>
          <div className="text-sm text-muted-foreground">{cur.water.toFixed(2)} / {goals.waterGoal} L</div>
        </div>
        <div className="flex gap-2">
          {[0.25, 0.5, 1].map((v) => (
            <button key={v} onClick={() => addWater(v)} className="flex-1 py-2 rounded-lg bg-secondary/60 text-sm font-medium">+{v}L</button>
          ))}
          <button onClick={() => addWater(-0.25)} className="px-4 py-2 rounded-lg border border-border text-sm">−</button>
        </div>
      </GlassCard>
    </AppLayout>
  );
}
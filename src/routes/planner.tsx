import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { GlassCard } from "@/components/GlassCard";
import { useStore, type Split, type PlanExercise, type WorkoutPlan } from "@/lib/store";
import { EXERCISE_LIBRARY } from "@/lib/exercises";
import { useState } from "react";
import { Copy, Plus, Trash2, ArrowUp, ArrowDown, Star } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/planner")({
  head: () => ({ meta: [{ title: "Workout Planner — Iron" }] }),
  component: Planner,
});

const SPLITS: Split[] = ["Push", "Pull", "Legs", "Upper", "Lower", "Full Body", "Custom"];

function Planner() {
  const { plans, addPlan, updatePlan, deletePlan, duplicatePlan, todaysPlanId, setTodaysPlan } = useStore();
  const [selectedId, setSelectedId] = useState<string | null>(plans[0]?.id ?? null);
  const selected = plans.find((p) => p.id === selectedId);

  const create = () => {
    const p: WorkoutPlan = {
      id: `plan-${Date.now()}`,
      name: "New Workout",
      split: "Custom",
      muscleGroup: "",
      exercises: [],
      createdAt: Date.now(),
    };
    addPlan(p);
    setSelectedId(p.id);
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Workout Planner</h1>
        <button onClick={create} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
          <Plus className="h-4 w-4" /> New
        </button>
      </div>

      <div className="grid gap-3 lg:grid-cols-[280px_1fr]">
        <div className="flex flex-col gap-2">
          {plans.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className={`text-left glass rounded-xl p-3 border ${selectedId === p.id ? "border-primary/60" : "border-transparent"}`}
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold truncate">{p.name}</div>
                {todaysPlanId === p.id && <Star className="h-3 w-3 text-primary fill-primary" />}
              </div>
              <div className="text-xs text-muted-foreground">{p.split} · {p.exercises.length} ex</div>
            </button>
          ))}
        </div>

        {selected ? (
          <PlanEditor
            plan={selected}
            onChange={(patch) => updatePlan(selected.id, patch)}
            onDelete={() => { deletePlan(selected.id); setSelectedId(null); }}
            onDuplicate={() => { duplicatePlan(selected.id); toast.success("Workout duplicated"); }}
            isToday={todaysPlanId === selected.id}
            onSetToday={() => { setTodaysPlan(selected.id); toast.success("Set as today's workout"); }}
          />
        ) : (
          <GlassCard className="grid place-items-center text-muted-foreground min-h-[200px]">Select or create a workout</GlassCard>
        )}
      </div>
    </AppLayout>
  );
}

function PlanEditor({ plan, onChange, onDelete, onDuplicate, isToday, onSetToday }: {
  plan: WorkoutPlan;
  onChange: (patch: Partial<WorkoutPlan>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  isToday: boolean;
  onSetToday: () => void;
}) {
  const [picking, setPicking] = useState(false);
  const updateEx = (idx: number, patch: Partial<PlanExercise>) => {
    const next = [...plan.exercises];
    next[idx] = { ...next[idx], ...patch };
    onChange({ exercises: next });
  };
  const move = (idx: number, dir: -1 | 1) => {
    const next = [...plan.exercises];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    onChange({ exercises: next });
  };
  const removeEx = (idx: number) => {
    onChange({ exercises: plan.exercises.filter((_, i) => i !== idx) });
  };
  const addExercise = (libId: string) => {
    const ex = EXERCISE_LIBRARY.find((e) => e.id === libId)!;
    const pe: PlanExercise = {
      id: `${libId}-${Math.random().toString(36).slice(2, 8)}`,
      exerciseId: libId,
      name: ex.name,
      muscle: ex.primary,
      sets: Array.from({ length: 3 }, () => ({ reps: 10, weight: 20, completed: false })),
      targetReps: 10,
      targetWeight: 20,
      restSec: 90,
    };
    onChange({ exercises: [...plan.exercises, pe] });
    setPicking(false);
  };

  return (
    <GlassCard>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 items-start mb-4">
        <div className="min-w-0 space-y-2">
          <input
            value={plan.name}
            onChange={(e) => onChange({ name: e.target.value })}
            className="w-full bg-transparent text-xl font-bold outline-none border-b border-transparent focus:border-primary"
          />
          <div className="flex flex-wrap gap-2">
            <select value={plan.split} onChange={(e) => onChange({ split: e.target.value as Split })} className="bg-secondary/60 rounded-md px-2 py-1 text-xs">
              {SPLITS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <input
              placeholder="Muscle group"
              value={plan.muscleGroup}
              onChange={(e) => onChange({ muscleGroup: e.target.value })}
              className="bg-secondary/60 rounded-md px-2 py-1 text-xs outline-none"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1 shrink-0">
          <button onClick={onSetToday} className={`text-xs px-2 py-1 rounded-md ${isToday ? "bg-primary/20 text-primary" : "border border-border"}`}>
            {isToday ? "Today ★" : "Set today"}
          </button>
          <button onClick={onDuplicate} className="text-xs px-2 py-1 rounded-md border border-border flex items-center gap-1"><Copy className="h-3 w-3" />Duplicate</button>
          <button onClick={onDelete} className="text-xs px-2 py-1 rounded-md text-destructive border border-destructive/30 flex items-center gap-1"><Trash2 className="h-3 w-3" />Delete</button>
        </div>
      </div>

      <div className="space-y-3">
        {plan.exercises.map((ex, idx) => (
          <div key={ex.id} className="rounded-xl border border-border/60 p-3">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 items-center">
              <div className="min-w-0">
                <div className="font-semibold truncate">{ex.name}</div>
                <div className="text-xs text-muted-foreground">{ex.muscle}</div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => move(idx, -1)} className="p-1.5 rounded-md hover:bg-white/5"><ArrowUp className="h-3 w-3" /></button>
                <button onClick={() => move(idx, 1)} className="p-1.5 rounded-md hover:bg-white/5"><ArrowDown className="h-3 w-3" /></button>
                <button onClick={() => removeEx(idx)} className="p-1.5 rounded-md text-destructive hover:bg-destructive/10"><Trash2 className="h-3 w-3" /></button>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
              <Field label="Sets" value={ex.sets.length} onChange={(v) => {
                const n = Math.max(1, Math.min(10, Number(v) || 1));
                const nextSets = Array.from({ length: n }, (_, i) => ex.sets[i] ?? { reps: ex.targetReps, weight: ex.targetWeight, completed: false });
                updateEx(idx, { sets: nextSets });
              }} />
              <Field label="Reps" value={ex.targetReps} onChange={(v) => updateEx(idx, { targetReps: Number(v) || 0, sets: ex.sets.map(s => ({ ...s, reps: Number(v) || 0 })) })} />
              <Field label="Weight" value={ex.targetWeight} onChange={(v) => updateEx(idx, { targetWeight: Number(v) || 0, sets: ex.sets.map(s => ({ ...s, weight: Number(v) || 0 })) })} />
              <Field label="Rest s" value={ex.restSec} onChange={(v) => updateEx(idx, { restSec: Number(v) || 0 })} />
            </div>
            <input
              placeholder="Notes"
              value={ex.notes ?? ""}
              onChange={(e) => updateEx(idx, { notes: e.target.value })}
              className="mt-2 w-full bg-secondary/40 rounded-md px-2 py-1.5 text-xs outline-none"
            />
          </div>
        ))}

        {picking ? (
          <div className="rounded-xl border border-border/60 p-3 max-h-64 overflow-auto">
            <div className="text-xs mb-2 text-muted-foreground">Add exercise</div>
            <div className="grid gap-1">
              {EXERCISE_LIBRARY.map((e) => (
                <button key={e.id} onClick={() => addExercise(e.id)} className="text-left px-2 py-1.5 rounded-md hover:bg-white/5 text-sm flex items-center justify-between">
                  <span>{e.name}</span>
                  <span className="text-xs text-muted-foreground">{e.primary}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <button onClick={() => setPicking(true)} className="w-full py-2.5 rounded-xl border border-dashed border-border/60 text-sm text-muted-foreground hover:bg-white/5 flex items-center justify-center gap-2">
            <Plus className="h-4 w-4" /> Add exercise
          </button>
        )}
      </div>
    </GlassCard>
  );
}

function Field({ label, value, onChange }: { label: string; value: number; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <div className="text-[10px] uppercase text-muted-foreground">{label}</div>
      <input type="number" value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-secondary/60 rounded-md px-2 py-1.5 outline-none focus:ring-1 focus:ring-primary" />
    </label>
  );
}
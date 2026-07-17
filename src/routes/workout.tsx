import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { GlassCard, ProgressRing } from "@/components/GlassCard";
import { useStore, fmtDuration } from "@/lib/store";
import { useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Minus, Plus, SkipForward, Square, Timer, X } from "lucide-react";
import confetti from "canvas-confetti";
import { toast } from "sonner";

export const Route = createFileRoute("/workout")({
  head: () => ({ meta: [{ title: "Live Workout — Iron" }] }),
  component: Live,
});

function Live() {
  const { plans, live, todaysPlanId, startWorkout, updateLive, finishWorkout, cancelWorkout, history } = useStore();
  const navigate = useNavigate();
  const [now, setNow] = useState(Date.now());
  const [rest, setRest] = useState(0);

  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);
  useEffect(() => {
    if (rest <= 0) return;
    const t = window.setInterval(() => setRest((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(t);
  }, [rest]);

  const exercises = live?.exercises ?? [];
  const idx = live ? Math.min(live.exerciseIndex, Math.max(0, exercises.length - 1)) : 0;
  const ex = exercises[idx];
  const currentSetIdx = ex ? ex.sets.findIndex((s) => !s.completed) : -1;
  const currentSet = ex ? (currentSetIdx === -1 ? ex.sets.length - 1 : currentSetIdx) : 0;
  const set = ex?.sets[currentSet];

  const prev = useMemo(() => {
    if (!ex) return null;
    for (const h of history) {
      const found = h.exercises.find((e) => e.exerciseId === ex.exerciseId);
      if (found) {
        const last = [...found.sets].reverse().find((s) => s.completed);
        if (last) return last;
      }
    }
    return null;
  }, [history, ex]);

  if (!live || !ex || !set) {
    return (
      <AppLayout>
        <GlassCard>
          <h1 className="text-2xl font-bold mb-2">Start a workout</h1>
          <p className="text-sm text-muted-foreground mb-4">Pick a plan to begin.</p>
          <div className="grid gap-2">
            {plans.map((p) => (
              <button
                key={p.id}
                onClick={() => { startWorkout(p.id); toast.success(`Started ${p.name}`); }}
                className="text-left rounded-xl border border-border/60 p-3 hover:bg-white/5 flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.split} · {p.exercises.length} exercises</div>
                </div>
                {p.id === todaysPlanId && <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary">TODAY</span>}
              </button>
            ))}
          </div>
        </GlassCard>
      </AppLayout>
    );
  }

  const patchSet = (patch: Partial<typeof set>) => {
    const next = exercises.map((e, i) => {
      if (i !== idx) return e;
      const sets = e.sets.map((s, si) => (si === currentSet ? { ...s, ...patch } : s));
      return { ...e, sets };
    });
    updateLive({ exercises: next });
  };

  const completeSet = () => {
    patchSet({ completed: true });
    setRest(ex.restSec || 60);
    toast.success("Set complete");
  };

  const skipExercise = () => {
    updateLive({ exerciseIndex: Math.min(exercises.length - 1, idx + 1) });
    setRest(0);
  };

  const finish = () => {
    const entry = finishWorkout();
    if (entry?.prsAchieved.length) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      toast.success(`New PR: ${entry.prsAchieved.join(", ")} 🎉`);
    } else {
      toast.success("Workout saved");
    }
    navigate({ to: "/history" });
  };

  const elapsed = Math.round((now - live.startedAt) / 1000);
  const doneSets = exercises.reduce((a, e) => a + e.sets.filter((s) => s.completed).length, 0);
  const totalSets = exercises.reduce((a, e) => a + e.sets.length, 0);

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-4">
        <Link to="/" className="text-sm text-muted-foreground flex items-center gap-1"><X className="h-4 w-4" /> Exit</Link>
        <div className="text-sm flex items-center gap-2"><Timer className="h-4 w-4 text-primary" />{fmtDuration(elapsed)}</div>
        <button onClick={() => { cancelWorkout(); toast("Cancelled"); }} className="text-xs text-muted-foreground">Cancel</button>
      </div>

      <GlassCard className="mb-4">
        <div className="flex items-center gap-4">
          <ProgressRing value={totalSets ? doneSets / totalSets : 0} label={`${doneSets}/${totalSets}`} sublabel="Sets" size={100} />
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Exercise {idx + 1} / {exercises.length}</div>
            <div className="text-2xl font-bold truncate">{ex.name}</div>
            <div className="text-sm text-muted-foreground">Set {currentSet + 1} of {ex.sets.length}</div>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <GlassCard>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Previous</div>
          <div className="text-xl font-bold">{prev ? `${prev.weight}kg × ${prev.reps}` : "—"}</div>
        </GlassCard>
        <GlassCard>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Rest</div>
          <div className="text-xl font-bold">{rest > 0 ? `${rest}s` : "Ready"}</div>
        </GlassCard>
      </div>

      <GlassCard className="mb-3">
        <div className="grid grid-cols-2 gap-4">
          <Counter label="Reps" value={set.reps} onChange={(v) => patchSet({ reps: Math.max(0, v) })} />
          <Counter label="Weight (kg)" value={set.weight} step={2.5} onChange={(v) => patchSet({ weight: Math.max(0, v) })} />
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={completeSet} className="flex-1 py-3 rounded-xl font-semibold text-primary-foreground flex items-center justify-center gap-2" style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}>
            <Check className="h-4 w-4" /> Complete Set
          </button>
          <button onClick={skipExercise} className="px-4 rounded-xl border border-border flex items-center gap-1 text-sm"><SkipForward className="h-4 w-4" /></button>
        </div>
      </GlassCard>

      <div className="flex justify-between items-center mb-3">
        <button disabled={idx === 0} onClick={() => updateLive({ exerciseIndex: idx - 1 })} className="text-sm text-muted-foreground flex items-center gap-1 disabled:opacity-40">
          <ChevronLeft className="h-4 w-4" /> Prev
        </button>
        <button onClick={finish} className="px-4 py-2 rounded-lg bg-accent text-accent-foreground font-semibold text-sm flex items-center gap-2">
          <Square className="h-4 w-4" /> Finish
        </button>
        <button disabled={idx === exercises.length - 1} onClick={() => updateLive({ exerciseIndex: idx + 1 })} className="text-sm text-muted-foreground flex items-center gap-1 disabled:opacity-40">
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <GlassCard>
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">All sets</div>
        <div className="grid gap-1 text-sm">
          {ex.sets.map((s, i) => (
            <div key={i} className={`flex justify-between px-2 py-1.5 rounded-md ${s.completed ? "bg-primary/10 text-primary" : ""}`}>
              <span>Set {i + 1}</span>
              <span>{s.weight}kg × {s.reps} {s.completed && "✓"}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="mt-6">
        <Link to="/rep-counter" className="text-xs text-muted-foreground underline">Open free rep counter →</Link>
      </div>
    </AppLayout>
  );
}

function Counter({ label, value, step = 1, onChange }: { label: string; value: number; step?: number; onChange: (v: number) => void }) {
  return (
    <div className="text-center">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      <div className="flex items-center justify-center gap-2">
        <button onClick={() => onChange(value - step)} className="h-11 w-11 rounded-full bg-secondary/60 grid place-items-center active:scale-95 transition"><Minus className="h-4 w-4" /></button>
        <input value={value} type="number" onChange={(e) => onChange(Number(e.target.value) || 0)} className="w-20 text-3xl font-bold bg-transparent text-center outline-none" />
        <button onClick={() => onChange(value + step)} className="h-11 w-11 rounded-full bg-primary/20 text-primary grid place-items-center active:scale-95 transition"><Plus className="h-4 w-4" /></button>
      </div>
    </div>
  );
}
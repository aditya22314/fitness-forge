import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { GlassCard } from "@/components/GlassCard";
import { useState } from "react";
import { Minus, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/rep-counter")({
  head: () => ({ meta: [{ title: "Rep Counter — Iron" }] }),
  component: RepCounter,
});

function RepCounter() {
  const [reps, setReps] = useState(0);
  const [total, setTotal] = useState(0);
  const bump = (n: number) => {
    setReps((r) => Math.max(0, r + n));
    if (n > 0) {
      setTotal((t) => t + n);
      if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(20);
    }
  };

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold mb-4">Rep Counter</h1>
      <GlassCard className="p-8 text-center">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Current</div>
        <div key={reps} className="text-8xl font-black gradient-text tabular-nums animate-scale-in">{reps}</div>
        <div className="text-sm text-muted-foreground mt-2">Total today: {total}</div>

        <div className="mt-8 grid grid-cols-3 gap-3">
          <button onClick={() => bump(-1)} className="h-24 rounded-2xl bg-secondary/60 grid place-items-center active:scale-95 transition">
            <Minus className="h-8 w-8" />
          </button>
          <button onClick={() => bump(1)} className="h-24 rounded-2xl text-primary-foreground grid place-items-center active:scale-95 transition font-bold text-2xl" style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}>
            +1
          </button>
          <button onClick={() => setReps(0)} className="h-24 rounded-2xl bg-secondary/60 grid place-items-center active:scale-95 transition">
            <RotateCcw className="h-6 w-6" />
          </button>
        </div>
        <button onClick={() => bump(1)} className="mt-4 w-full py-6 rounded-2xl text-xl font-bold text-primary-foreground active:scale-[0.98] transition" style={{ background: "var(--gradient-primary)" }}>
          Tap Anywhere To Count
        </button>

        <div className="mt-6 text-xs text-muted-foreground">Voice counting & camera AI coming soon.</div>
      </GlassCard>
    </AppLayout>
  );
}
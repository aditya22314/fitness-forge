import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { GlassCard } from "@/components/GlassCard";
import { useStore } from "@/lib/store";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format } from "date-fns";
import { useState } from "react";

export const Route = createFileRoute("/progress")({
  head: () => ({ meta: [{ title: "Progress — Iron" }] }),
  component: Progress,
});

const METRICS = ["weight", "bodyFat", "chest", "waist", "arms", "thighs"] as const;
type Metric = (typeof METRICS)[number];

function Progress() {
  const { measurements, addMeasurement } = useStore();
  const [metric, setMetric] = useState<Metric>("weight");
  const [form, setForm] = useState<Record<string, string>>({});

  const data = measurements
    .filter((m) => m[metric] !== undefined)
    .map((m) => ({ date: format(new Date(m.date), "MMM d"), value: m[metric] as number }));

  const submit = () => {
    const entry: Record<string, number> = {};
    for (const k of Object.keys(form)) {
      const n = Number(form[k]);
      if (!Number.isNaN(n) && form[k] !== "") entry[k] = n;
    }
    if (!Object.keys(entry).length) return;
    addMeasurement({ date: Date.now(), ...entry });
    setForm({});
  };

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold mb-4">Progress</h1>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
        {METRICS.map((m) => (
          <button key={m} onClick={() => setMetric(m)} className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap capitalize ${metric === m ? "bg-primary/20 text-primary" : "bg-secondary/60 text-muted-foreground"}`}>
            {m}
          </button>
        ))}
      </div>
      <GlassCard className="mb-4">
        <div className="h-56">
          {data.length === 0 ? (
            <div className="h-full grid place-items-center text-muted-foreground text-sm">No data yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.78 0.19 155)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="oklch(0.78 0.19 155)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: "oklch(0.72 0.02 260)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "oklch(0.72 0.02 260)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "oklch(0.21 0.025 260)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="value" stroke="oklch(0.78 0.19 155)" fill="url(#areaGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </GlassCard>

      <GlassCard>
        <div className="font-semibold mb-3">Log measurement</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {["weight", "bodyFat", "chest", "waist", "neck", "hips", "arms", "forearms", "thighs", "calves"].map((k) => (
            <label key={k} className="text-xs">
              <div className="capitalize text-muted-foreground">{k}</div>
              <input value={form[k] ?? ""} onChange={(e) => setForm({ ...form, [k]: e.target.value })} type="number" className="w-full bg-secondary/60 rounded-md px-2 py-1.5 outline-none" />
            </label>
          ))}
        </div>
        <button onClick={submit} className="mt-3 w-full py-2.5 rounded-lg font-semibold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>Save</button>
      </GlassCard>
    </AppLayout>
  );
}
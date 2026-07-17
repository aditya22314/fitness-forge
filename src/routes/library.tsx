import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { GlassCard } from "@/components/GlassCard";
import { CATEGORIES, EXERCISE_LIBRARY, type ExerciseCategory } from "@/lib/exercises";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";

export const Route = createFileRoute("/library")({
  head: () => ({ meta: [{ title: "Exercise Library — Iron" }] }),
  component: Library,
});

function Library() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<ExerciseCategory | "All">("All");
  const [openId, setOpenId] = useState<string | null>(null);
  const filtered = useMemo(() => {
    const ql = q.toLowerCase();
    return EXERCISE_LIBRARY.filter(
      (e) =>
        (cat === "All" || e.primary === cat) &&
        (e.name.toLowerCase().includes(ql) || e.equipment.toLowerCase().includes(ql)),
    );
  }, [q, cat]);

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold mb-4">Exercise Library</h1>
      <div className="glass rounded-xl px-3 py-2 flex items-center gap-2 mb-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search exercises" className="bg-transparent outline-none w-full text-sm" />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
        {(["All", ...CATEGORIES] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap ${cat === c ? "bg-primary/20 text-primary" : "bg-secondary/60 text-muted-foreground"}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {filtered.map((e) => (
          <GlassCard key={e.id} className="p-3 cursor-pointer" onClick={() => setOpenId(openId === e.id ? null : e.id)}>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{e.name}</div>
                <div className="text-xs text-muted-foreground">{e.primary} · {e.equipment}</div>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{e.difficulty}</span>
            </div>
            {openId === e.id && (
              <div className="mt-3 space-y-1 text-sm">
                <div><span className="text-muted-foreground">Secondary:</span> {e.secondary.join(", ") || "—"}</div>
                <div className="text-muted-foreground">{e.instructions}</div>
              </div>
            )}
          </GlassCard>
        ))}
      </div>
    </AppLayout>
  );
}
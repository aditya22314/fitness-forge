import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { GlassCard } from "@/components/GlassCard";
import { useStore } from "@/lib/store";
import { useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/supplements")({
  head: () => ({ meta: [{ title: "Supplements — Iron" }] }),
  component: Supps,
});

const today = () => new Date().toISOString().slice(0, 10);

function Supps() {
  const { supplements, toggleSupplement, addSupplement, removeSupplement } = useStore();
  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const t = today();

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold mb-4">Supplements</h1>
      <div className="space-y-2 mb-4">
        {supplements.map((s) => {
          const taken = s.takenDates.includes(t);
          return (
            <GlassCard key={s.id} className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{s.name}</div>
                <div className="text-xs text-muted-foreground">{s.dose} · {s.takenDates.length} days logged</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleSupplement(s.id, t)}
                  className={`h-10 w-10 rounded-full grid place-items-center ${taken ? "text-primary-foreground" : "bg-secondary/60"}`}
                  style={taken ? { background: "var(--gradient-primary)" } : {}}
                >
                  <Check className="h-5 w-5" />
                </button>
                <button onClick={() => removeSupplement(s.id)} className="p-2 rounded-md text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
              </div>
            </GlassCard>
          );
        })}
      </div>
      <GlassCard>
        <div className="font-semibold mb-2">Add supplement</div>
        <div className="flex flex-wrap gap-2">
          <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="flex-1 min-w-0 bg-secondary/60 rounded-md px-3 py-2 text-sm outline-none" />
          <input placeholder="Dose" value={dose} onChange={(e) => setDose(e.target.value)} className="w-24 bg-secondary/60 rounded-md px-3 py-2 text-sm outline-none" />
          <button
            onClick={() => {
              if (!name.trim()) return;
              addSupplement({ id: `s-${Date.now()}`, name: name.trim(), dose: dose.trim() || "—", takenDates: [] });
              setName(""); setDose("");
            }}
            className="px-3 py-2 rounded-md text-primary-foreground text-sm font-semibold flex items-center gap-1"
            style={{ background: "var(--gradient-primary)" }}
          ><Plus className="h-4 w-4" />Add</button>
        </div>
      </GlassCard>
    </AppLayout>
  );
}
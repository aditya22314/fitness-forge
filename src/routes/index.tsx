import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { GlassCard, ProgressRing } from "@/components/GlassCard";
import { useStore, computeStreak, fmtDuration } from "@/lib/store";
import { Flame, Timer, Dumbbell, TrendingUp, Play, Trophy } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { useEffect } from "react";
import { useAuth } from "@/lib/useAuth";

export const Route = createFileRoute("/")({ component: Dashboard });

function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [loading, user, navigate]);

  const { plans, history, todaysPlanId, goals, measurements, live } = useStore();

  if (loading || !user) {
    return (
      <div className="min-h-dvh grid place-items-center">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  const todaysPlan = plans.find((p) => p.id === todaysPlanId) ?? plans[0];
  const today = new Date();
  const todaysHistory = history.filter((h) => isSameDay(new Date(h.date), today));
  const streak = computeStreak(history.map((h) => h.date));
  const totalDuration = todaysHistory.reduce((a, h) => a + h.durationSec, 0);
  const totalCalories = todaysHistory.reduce((a, h) => a + h.calories, 0);
  const currentWeight = measurements.length ? measurements[measurements.length - 1].weight : undefined;

  // weekly chart
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(weekStart, i);
    const dayVolume = history
      .filter((h) => isSameDay(new Date(h.date), d))
      .reduce((a, h) => a + h.totalVolume, 0);
    return { day: format(d, "EEE"), volume: dayVolume };
  });

  const doneSets = todaysHistory
    .flatMap((h) => h.exercises)
    .reduce((a, e) => a + e.sets.filter((s) => s.completed).length, 0);
  const targetSets = todaysPlan?.exercises.reduce((a, e) => a + e.sets.length, 0) ?? 0;
  const ringValue = targetSets ? doneSets / targetSets : 0;

  return (
    <AppLayout>
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{format(today, "EEEE, MMM d")}</div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Hey, ready to <span className="gradient-text">lift</span>?
          </h1>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
          <Flame className="h-4 w-4 text-accent" />
          <span className="font-semibold text-foreground">{streak}</span> day streak
        </div>
      </div>

      {/* Today */}
      <GlassCard className="relative overflow-hidden mb-4">
        <div
          className="absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl opacity-40"
          style={{ background: "var(--gradient-primary)" }}
        />
        <div className="relative flex items-center gap-5">
          <ProgressRing
            value={ringValue}
            label={`${Math.round(ringValue * 100)}%`}
            sublabel="Today"
          />
          <div className="min-w-0 flex-1">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Today's Workout</div>
            <div className="text-xl font-bold truncate">{todaysPlan?.name ?? "Rest Day"}</div>
            <div className="text-sm text-muted-foreground">{todaysPlan?.muscleGroup}</div>
            <div className="mt-3 flex gap-2">
              {todaysPlan && (
                <Link
                  to="/workout"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-primary-foreground"
                  style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
                >
                  <Play className="h-4 w-4" />
                  {live ? "Resume" : "Start Workout"}
                </Link>
              )}
              <Link
                to="/planner"
                className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium border border-border hover:bg-white/5"
              >
                Change
              </Link>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Stat grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard label="Duration" value={fmtDuration(totalDuration)} icon={Timer} />
        <StatCard label="Calories" value={`${totalCalories}`} icon={Flame} />
        <StatCard label="Exercises" value={`${todaysHistory.reduce((a, h) => a + h.exercises.length, 0)}`} icon={Dumbbell} />
        <StatCard label="Streak" value={`${streak}d`} icon={TrendingUp} />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <GlassCard>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">This Week</div>
              <div className="font-semibold">Volume (kg)</div>
            </div>
            <Trophy className="h-4 w-4 text-accent" />
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.78 0.19 155)" />
                    <stop offset="100%" stopColor="oklch(0.78 0.19 155 / 0.2)" />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "oklch(0.72 0.02 260)", fontSize: 11 }} />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: "oklch(1 0 0 / 0.04)" }}
                  contentStyle={{ background: "oklch(0.21 0.025 260)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 12 }}
                />
                <Bar dataKey="volume" fill="url(#barGrad)" radius={[8, 8, 2, 2]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Body & Goal</div>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <div>
              <div className="text-3xl font-bold">{currentWeight ?? "—"}<span className="text-base text-muted-foreground ml-1">kg</span></div>
              <div className="text-xs text-muted-foreground">Body weight</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{goals.targetWeight}<span className="text-base text-muted-foreground ml-1">kg</span></div>
              <div className="text-xs text-muted-foreground">Target</div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Current Goal</div>
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              {goals.goalType}
            </span>
          </div>
        </GlassCard>
      </div>
    </AppLayout>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="text-xl font-bold">{value}</div>
        </div>
        <Icon className="h-4 w-4 text-primary" />
      </div>
    </GlassCard>
  );
}

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { EXERCISE_LIBRARY } from "./exercises";

export type Split = "Push" | "Pull" | "Legs" | "Upper" | "Lower" | "Full Body" | "Custom";

export interface SetEntry {
  reps: number;
  weight: number;
  completed: boolean;
}

export interface PlanExercise {
  id: string; // unique per plan
  exerciseId: string; // library id or custom
  name: string;
  muscle: string;
  sets: SetEntry[];
  targetReps: number;
  targetWeight: number;
  restSec: number;
  notes?: string;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  split: Split;
  muscleGroup: string;
  exercises: PlanExercise[];
  createdAt: number;
}

export interface HistoryEntry {
  id: string;
  planId?: string;
  name: string;
  date: number;
  durationSec: number;
  totalVolume: number;
  exercises: PlanExercise[];
  prsAchieved: string[]; // exercise names
  calories: number;
}

export interface Measurement {
  date: number;
  weight?: number;
  bodyFat?: number;
  chest?: number;
  waist?: number;
  neck?: number;
  hips?: number;
  arms?: number;
  forearms?: number;
  thighs?: number;
  calves?: number;
}

export interface NutritionEntry {
  date: string; // YYYY-MM-DD
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  water: number; // L
}

export interface Supplement {
  id: string;
  name: string;
  dose: string;
  takenDates: string[]; // YYYY-MM-DD
}

export interface Goals {
  goalType: "Muscle Gain" | "Fat Loss" | "Maintenance";
  targetWeight: number;
  targetBodyFat: number;
  proteinGoal: number;
  waterGoal: number;
  caloriesGoal: number;
  weeklyWorkouts: number;
  stepGoal: number;
}

export interface Settings {
  units: "metric" | "imperial";
  notifications: boolean;
  creatineEnabled: boolean;
}

export interface LiveWorkout {
  planId: string;
  startedAt: number;
  exerciseIndex: number;
  exercises: PlanExercise[];
}

interface StoreState {
  plans: WorkoutPlan[];
  history: HistoryEntry[];
  measurements: Measurement[];
  nutrition: NutritionEntry[];
  supplements: Supplement[];
  creatineDates: string[];
  goals: Goals;
  settings: Settings;
  live: LiveWorkout | null;
  todaysPlanId: string | null;

  // actions
  addPlan: (p: WorkoutPlan) => void;
  updatePlan: (id: string, patch: Partial<WorkoutPlan>) => void;
  deletePlan: (id: string) => void;
  duplicatePlan: (id: string) => void;
  setTodaysPlan: (id: string | null) => void;

  startWorkout: (planId: string) => void;
  updateLive: (patch: Partial<LiveWorkout>) => void;
  finishWorkout: () => HistoryEntry | null;
  cancelWorkout: () => void;

  addMeasurement: (m: Measurement) => void;
  logNutrition: (e: NutritionEntry) => void;
  addWater: (liters: number) => void;

  addSupplement: (s: Supplement) => void;
  toggleSupplement: (id: string, date: string) => void;
  removeSupplement: (id: string) => void;

  toggleCreatine: (date: string) => void;

  setGoals: (g: Partial<Goals>) => void;
  setSettings: (s: Partial<Settings>) => void;

  clearAll: () => void;
  importData: (data: unknown) => void;
}

const today = () => new Date().toISOString().slice(0, 10);

const defaultGoals: Goals = {
  goalType: "Muscle Gain",
  targetWeight: 80,
  targetBodyFat: 15,
  proteinGoal: 160,
  waterGoal: 3.5,
  caloriesGoal: 2800,
  weeklyWorkouts: 5,
  stepGoal: 8000,
};

const defaultSettings: Settings = {
  units: "metric",
  notifications: false,
  creatineEnabled: true,
};

function seedPlans(): WorkoutPlan[] {
  const findEx = (id: string) => EXERCISE_LIBRARY.find((e) => e.id === id)!;
  const mkPE = (id: string, sets: number, reps: number, weight: number, rest = 90): PlanExercise => {
    const ex = findEx(id);
    return {
      id: `${id}-${Math.random().toString(36).slice(2, 8)}`,
      exerciseId: id,
      name: ex.name,
      muscle: ex.primary,
      sets: Array.from({ length: sets }, () => ({ reps, weight, completed: false })),
      targetReps: reps,
      targetWeight: weight,
      restSec: rest,
    };
  };
  return [
    {
      id: "plan-push",
      name: "Push Day",
      split: "Push",
      muscleGroup: "Chest / Shoulders / Triceps",
      createdAt: Date.now(),
      exercises: [
        mkPE("bench-press", 4, 8, 80),
        mkPE("incline-db-press", 3, 10, 28),
        mkPE("ohp", 3, 8, 45),
        mkPE("lat-raise", 3, 12, 10),
        mkPE("tricep-pushdown", 3, 12, 25),
      ],
    },
    {
      id: "plan-pull",
      name: "Pull Day",
      split: "Pull",
      muscleGroup: "Back / Biceps",
      createdAt: Date.now(),
      exercises: [
        mkPE("deadlift", 3, 5, 120, 180),
        mkPE("pull-up", 4, 8, 0),
        mkPE("barbell-row", 3, 8, 70),
        mkPE("barbell-curl", 3, 10, 30),
      ],
    },
    {
      id: "plan-legs",
      name: "Leg Day",
      split: "Legs",
      muscleGroup: "Quads / Hamstrings / Glutes",
      createdAt: Date.now(),
      exercises: [
        mkPE("squat", 4, 6, 100, 150),
        mkPE("rdl", 3, 10, 80),
        mkPE("leg-press", 3, 12, 160),
        mkPE("lunge", 3, 12, 18),
      ],
    },
  ];
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      plans: seedPlans(),
      history: [],
      measurements: [{ date: Date.now(), weight: 78, bodyFat: 18, chest: 100, waist: 82, arms: 36, thighs: 58 }],
      nutrition: [],
      supplements: [
        { id: "whey", name: "Whey Protein", dose: "30g", takenDates: [] },
        { id: "multi", name: "Multivitamin", dose: "1 tab", takenDates: [] },
        { id: "vitd", name: "Vitamin D", dose: "2000 IU", takenDates: [] },
      ],
      creatineDates: [],
      goals: defaultGoals,
      settings: defaultSettings,
      live: null,
      todaysPlanId: "plan-push",

      addPlan: (p) => set({ plans: [...get().plans, p] }),
      updatePlan: (id, patch) =>
        set({ plans: get().plans.map((p) => (p.id === id ? { ...p, ...patch } : p)) }),
      deletePlan: (id) => set({ plans: get().plans.filter((p) => p.id !== id) }),
      duplicatePlan: (id) => {
        const p = get().plans.find((x) => x.id === id);
        if (!p) return;
        const copy: WorkoutPlan = {
          ...p,
          id: `plan-${Math.random().toString(36).slice(2, 9)}`,
          name: p.name + " (Copy)",
          createdAt: Date.now(),
          exercises: p.exercises.map((e) => ({
            ...e,
            id: `${e.exerciseId}-${Math.random().toString(36).slice(2, 8)}`,
            sets: e.sets.map((s) => ({ ...s, completed: false })),
          })),
        };
        set({ plans: [...get().plans, copy] });
      },
      setTodaysPlan: (id) => set({ todaysPlanId: id }),

      startWorkout: (planId) => {
        const plan = get().plans.find((p) => p.id === planId);
        if (!plan) return;
        set({
          live: {
            planId,
            startedAt: Date.now(),
            exerciseIndex: 0,
            exercises: plan.exercises.map((e) => ({
              ...e,
              sets: e.sets.map((s) => ({ ...s, completed: false })),
            })),
          },
        });
      },
      updateLive: (patch) => {
        const cur = get().live;
        if (!cur) return;
        set({ live: { ...cur, ...patch } });
      },
      finishWorkout: () => {
        const live = get().live;
        if (!live) return null;
        const durationSec = Math.round((Date.now() - live.startedAt) / 1000);
        let totalVolume = 0;
        const prs: string[] = [];
        for (const ex of live.exercises) {
          for (const s of ex.sets) if (s.completed) totalVolume += s.reps * s.weight;
          const maxWeight = Math.max(0, ...ex.sets.filter((s) => s.completed).map((s) => s.weight));
          const prevMax = Math.max(
            0,
            ...get()
              .history.flatMap((h) => h.exercises)
              .filter((e) => e.exerciseId === ex.exerciseId)
              .flatMap((e) => e.sets.map((s) => s.weight)),
          );
          if (maxWeight > prevMax && maxWeight > 0) prs.push(ex.name);
        }
        const entry: HistoryEntry = {
          id: `h-${Date.now()}`,
          planId: live.planId,
          name: get().plans.find((p) => p.id === live.planId)?.name ?? "Workout",
          date: Date.now(),
          durationSec,
          totalVolume,
          exercises: live.exercises,
          prsAchieved: prs,
          calories: Math.round((durationSec / 60) * 7.5),
        };
        set({ history: [entry, ...get().history], live: null });
        return entry;
      },
      cancelWorkout: () => set({ live: null }),

      addMeasurement: (m) => set({ measurements: [...get().measurements, m] }),
      logNutrition: (e) => {
        const rest = get().nutrition.filter((n) => n.date !== e.date);
        set({ nutrition: [...rest, e] });
      },
      addWater: (liters) => {
        const d = today();
        const cur = get().nutrition.find((n) => n.date === d);
        const base: NutritionEntry = cur ?? { date: d, protein: 0, carbs: 0, fat: 0, calories: 0, water: 0 };
        get().logNutrition({ ...base, water: Math.max(0, base.water + liters) });
      },

      addSupplement: (s) => set({ supplements: [...get().supplements, s] }),
      toggleSupplement: (id, date) => {
        set({
          supplements: get().supplements.map((s) => {
            if (s.id !== id) return s;
            const has = s.takenDates.includes(date);
            return { ...s, takenDates: has ? s.takenDates.filter((d) => d !== date) : [...s.takenDates, date] };
          }),
        });
      },
      removeSupplement: (id) => set({ supplements: get().supplements.filter((s) => s.id !== id) }),

      toggleCreatine: (date) => {
        const has = get().creatineDates.includes(date);
        set({
          creatineDates: has
            ? get().creatineDates.filter((d) => d !== date)
            : [...get().creatineDates, date],
        });
      },

      setGoals: (g) => set({ goals: { ...get().goals, ...g } }),
      setSettings: (s) => set({ settings: { ...get().settings, ...s } }),

      clearAll: () =>
        set({
          plans: seedPlans(),
          history: [],
          measurements: [],
          nutrition: [],
          supplements: [],
          creatineDates: [],
          goals: defaultGoals,
          settings: defaultSettings,
          live: null,
          todaysPlanId: null,
        }),
      importData: (data) => {
        if (typeof data !== "object" || !data) return;
        set({ ...(data as Partial<StoreState>) } as StoreState);
      },
    }),
    { name: "gym-tracker-v1" },
  ),
);

// ---- helpers ----
export function computeStreak(dates: number[]): number {
  if (!dates.length) return 0;
  const days = new Set(dates.map((d) => new Date(d).toISOString().slice(0, 10)));
  let streak = 0;
  const cur = new Date();
  for (;;) {
    const key = cur.toISOString().slice(0, 10);
    if (days.has(key)) {
      streak++;
      cur.setDate(cur.getDate() - 1);
    } else {
      // allow today to be missed
      if (streak === 0) {
        cur.setDate(cur.getDate() - 1);
        const key2 = cur.toISOString().slice(0, 10);
        if (days.has(key2)) {
          streak++;
          cur.setDate(cur.getDate() - 1);
          continue;
        }
      }
      break;
    }
  }
  return streak;
}

export function fmtDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
export type ExerciseCategory =
  | "Chest"
  | "Back"
  | "Legs"
  | "Shoulders"
  | "Biceps"
  | "Triceps"
  | "Core"
  | "Cardio";

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export interface LibraryExercise {
  id: string;
  name: string;
  primary: ExerciseCategory;
  secondary: string[];
  equipment: string;
  difficulty: Difficulty;
  instructions: string;
}

export const EXERCISE_LIBRARY: LibraryExercise[] = [
  { id: "bench-press", name: "Barbell Bench Press", primary: "Chest", secondary: ["Triceps", "Shoulders"], equipment: "Barbell", difficulty: "Intermediate", instructions: "Lie on a flat bench, grip bar slightly wider than shoulders, lower to mid-chest, press up." },
  { id: "incline-db-press", name: "Incline Dumbbell Press", primary: "Chest", secondary: ["Shoulders", "Triceps"], equipment: "Dumbbells", difficulty: "Intermediate", instructions: "On an incline bench, press dumbbells from shoulder height to full extension." },
  { id: "push-up", name: "Push-Up", primary: "Chest", secondary: ["Triceps", "Core"], equipment: "Bodyweight", difficulty: "Beginner", instructions: "Body straight, lower chest to floor, press back up." },
  { id: "cable-fly", name: "Cable Fly", primary: "Chest", secondary: [], equipment: "Cable", difficulty: "Intermediate", instructions: "Arms slightly bent, bring cables together in front of chest." },

  { id: "deadlift", name: "Deadlift", primary: "Back", secondary: ["Legs", "Core"], equipment: "Barbell", difficulty: "Advanced", instructions: "Hinge at hips, keep back neutral, drive through floor." },
  { id: "pull-up", name: "Pull-Up", primary: "Back", secondary: ["Biceps"], equipment: "Bodyweight", difficulty: "Intermediate", instructions: "Hang from bar, pull chin above bar." },
  { id: "barbell-row", name: "Barbell Row", primary: "Back", secondary: ["Biceps"], equipment: "Barbell", difficulty: "Intermediate", instructions: "Hinge forward, pull bar to lower ribs." },
  { id: "lat-pulldown", name: "Lat Pulldown", primary: "Back", secondary: ["Biceps"], equipment: "Cable", difficulty: "Beginner", instructions: "Pull bar to upper chest, squeeze lats." },

  { id: "squat", name: "Back Squat", primary: "Legs", secondary: ["Core"], equipment: "Barbell", difficulty: "Advanced", instructions: "Bar on upper back, squat to parallel, drive up." },
  { id: "front-squat", name: "Front Squat", primary: "Legs", secondary: ["Core"], equipment: "Barbell", difficulty: "Advanced", instructions: "Bar on front delts, elbows high, squat deep." },
  { id: "leg-press", name: "Leg Press", primary: "Legs", secondary: [], equipment: "Machine", difficulty: "Beginner", instructions: "Press platform away, controlled negative." },
  { id: "rdl", name: "Romanian Deadlift", primary: "Legs", secondary: ["Back"], equipment: "Barbell", difficulty: "Intermediate", instructions: "Hinge hips back, slight knee bend, feel hamstring stretch." },
  { id: "lunge", name: "Walking Lunge", primary: "Legs", secondary: ["Core"], equipment: "Dumbbells", difficulty: "Beginner", instructions: "Step forward, drop back knee toward floor." },

  { id: "ohp", name: "Overhead Press", primary: "Shoulders", secondary: ["Triceps"], equipment: "Barbell", difficulty: "Intermediate", instructions: "Press bar overhead from shoulders, tight core." },
  { id: "lat-raise", name: "Lateral Raise", primary: "Shoulders", secondary: [], equipment: "Dumbbells", difficulty: "Beginner", instructions: "Raise dumbbells to shoulder height, slight bend." },
  { id: "rear-delt-fly", name: "Rear Delt Fly", primary: "Shoulders", secondary: ["Back"], equipment: "Dumbbells", difficulty: "Beginner", instructions: "Hinge forward, raise arms out to sides." },

  { id: "barbell-curl", name: "Barbell Curl", primary: "Biceps", secondary: [], equipment: "Barbell", difficulty: "Beginner", instructions: "Curl bar to shoulders, elbows fixed." },
  { id: "hammer-curl", name: "Hammer Curl", primary: "Biceps", secondary: [], equipment: "Dumbbells", difficulty: "Beginner", instructions: "Neutral grip, curl up." },
  { id: "preacher-curl", name: "Preacher Curl", primary: "Biceps", secondary: [], equipment: "EZ Bar", difficulty: "Intermediate", instructions: "Arms on pad, curl to full contraction." },

  { id: "tricep-pushdown", name: "Tricep Pushdown", primary: "Triceps", secondary: [], equipment: "Cable", difficulty: "Beginner", instructions: "Elbows tucked, extend arms fully." },
  { id: "skullcrusher", name: "Skullcrusher", primary: "Triceps", secondary: [], equipment: "EZ Bar", difficulty: "Intermediate", instructions: "Lower bar to forehead, extend up." },
  { id: "dips", name: "Dips", primary: "Triceps", secondary: ["Chest"], equipment: "Bodyweight", difficulty: "Intermediate", instructions: "Lower until shoulders below elbows, press up." },

  { id: "plank", name: "Plank", primary: "Core", secondary: [], equipment: "Bodyweight", difficulty: "Beginner", instructions: "Hold rigid body position on forearms." },
  { id: "hanging-leg-raise", name: "Hanging Leg Raise", primary: "Core", secondary: [], equipment: "Bodyweight", difficulty: "Advanced", instructions: "Hang, raise legs to parallel or higher." },
  { id: "cable-crunch", name: "Cable Crunch", primary: "Core", secondary: [], equipment: "Cable", difficulty: "Beginner", instructions: "Kneel, crunch elbows toward knees." },

  { id: "run", name: "Running", primary: "Cardio", secondary: [], equipment: "None", difficulty: "Beginner", instructions: "Steady pace, control breathing." },
  { id: "row-machine", name: "Rowing Machine", primary: "Cardio", secondary: ["Back", "Legs"], equipment: "Machine", difficulty: "Beginner", instructions: "Drive legs, then pull handle to sternum." },
  { id: "jump-rope", name: "Jump Rope", primary: "Cardio", secondary: ["Calves"], equipment: "Rope", difficulty: "Beginner", instructions: "Light bounce, wrists rotate the rope." },
];

export const CATEGORIES: ExerciseCategory[] = [
  "Chest", "Back", "Legs", "Shoulders", "Biceps", "Triceps", "Core", "Cardio",
];
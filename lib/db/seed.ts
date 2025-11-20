import type { SQLiteDatabase } from "expo-sqlite";

import { generateId } from "../utils/id";

type BaseExercise = {
  name: string;
  category: string;
  equipment: string;
  muscleGroup: string;
};

const baseExercises: BaseExercise[] = [
  {
    name: "Barbell Bench Press",
    category: "Push",
    equipment: "Barbell",
    muscleGroup: "Chest",
  },
  {
    name: "Incline Dumbbell Press",
    category: "Push",
    equipment: "Dumbbells",
    muscleGroup: "Chest",
  },
  {
    name: "Pull-Up",
    category: "Pull",
    equipment: "Bodyweight",
    muscleGroup: "Back",
  },
  {
    name: "Seated Cable Row",
    category: "Pull",
    equipment: "Cable",
    muscleGroup: "Back",
  },
  {
    name: "Back Squat",
    category: "Legs",
    equipment: "Barbell",
    muscleGroup: "Quadriceps",
  },
  {
    name: "Romanian Deadlift",
    category: "Legs",
    equipment: "Barbell",
    muscleGroup: "Hamstrings",
  },
  {
    name: "Dumbbell Shoulder Press",
    category: "Push",
    equipment: "Dumbbells",
    muscleGroup: "Shoulders",
  },
  {
    name: "Cable Lateral Raise",
    category: "Push",
    equipment: "Cable",
    muscleGroup: "Shoulders",
  },
  {
    name: "Hammer Curl",
    category: "Pull",
    equipment: "Dumbbells",
    muscleGroup: "Biceps",
  },
  {
    name: "Rope Triceps Pushdown",
    category: "Push",
    equipment: "Cable",
    muscleGroup: "Triceps",
  },
  {
    name: "Deadlift",
    category: "Pull",
    equipment: "Barbell",
    muscleGroup: "Back",
  },
  {
    name: "Lat Pulldown",
    category: "Pull",
    equipment: "Machine",
    muscleGroup: "Back",
  },
  {
    name: "Face Pull",
    category: "Pull",
    equipment: "Cable",
    muscleGroup: "Rear Delts",
  },
  {
    name: "Single-Arm Dumbbell Row",
    category: "Pull",
    equipment: "Dumbbells",
    muscleGroup: "Back",
  },
  {
    name: "Hip Thrust",
    category: "Legs",
    equipment: "Barbell",
    muscleGroup: "Glutes",
  },
  {
    name: "Leg Press",
    category: "Legs",
    equipment: "Machine",
    muscleGroup: "Quadriceps",
  },
  {
    name: "Lunge",
    category: "Legs",
    equipment: "Dumbbells",
    muscleGroup: "Quadriceps",
  },
  {
    name: "Calf Raise",
    category: "Legs",
    equipment: "Machine",
    muscleGroup: "Calves",
  },
  {
    name: "Plank",
    category: "Core",
    equipment: "Bodyweight",
    muscleGroup: "Abs",
  },
  {
    name: "Hanging Knee Raise",
    category: "Core",
    equipment: "Bodyweight",
    muscleGroup: "Abs",
  },
  {
    name: "Russian Twist",
    category: "Core",
    equipment: "Dumbbell",
    muscleGroup: "Obliques",
  },
  {
    name: "Farmer's Walk",
    category: "Grip",
    equipment: "Dumbbells",
    muscleGroup: "Forearms",
  },
  {
    name: "Push-Up",
    category: "Push",
    equipment: "Bodyweight",
    muscleGroup: "Chest",
  },
];

export const runSeeds = async (db: SQLiteDatabase) => {
  const countRow = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM exercises;"
  );
  const currentCount = Number(countRow?.count ?? 0);

  if (currentCount > 0) {
    return;
  }

  await db.execAsync("BEGIN");
  try {
    for (const exercise of baseExercises) {
      await db.runAsync(
        `INSERT INTO exercises (id, name, category, equipment, muscleGroup, isCustom)
         VALUES (?, ?, ?, ?, ?, 0);`,
        generateId(),
        exercise.name,
        exercise.category,
        exercise.equipment,
        exercise.muscleGroup
      );
    }

    await db.execAsync("COMMIT");
  } catch (error) {
    await db.execAsync("ROLLBACK");
    throw error;
  }
};

// Helper for development: clear and reseed the exercises table.
export const resetExerciseSeeds = async (db: SQLiteDatabase) => {
  await db.execAsync("DELETE FROM exercises;");
  await runSeeds(db);
};

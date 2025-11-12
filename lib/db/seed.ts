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

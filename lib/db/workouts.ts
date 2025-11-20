import type { SQLiteDatabase } from "expo-sqlite";

import { getDatabase } from "./database";
import { generateId } from "../utils/id";
import type { WorkoutSet } from "@/store/workoutStore";

type PersistableState = {
  workoutId: string | null;
  startedAt: number | null;
  setsByExercise: Record<string, WorkoutSet[]>;
};

export const saveWorkoutFromState = async (
  state: PersistableState,
  { userId = "local-user", type = "strength", notes = null }: { userId?: string; type?: string; notes?: string | null } = {}
) => {
  if (!state.startedAt) {
    throw new Error("Aucune séance démarrée");
  }

  const db = await getDatabase();
  const workoutId = state.workoutId ?? generateId();
  const endedAt = Date.now();

  await db.execAsync("BEGIN");
  try {
    await insertWorkout(db, {
      id: workoutId,
      userId,
      type,
      startedAt: state.startedAt,
      endedAt,
      notes,
    });

    let exerciseOrder = 0;
    for (const [exerciseId, sets] of Object.entries(state.setsByExercise)) {
      if (!sets?.length) continue;
      const workoutExerciseId = generateId();

      await insertWorkoutExercise(db, {
        id: workoutExerciseId,
        workoutId,
        exerciseId,
        orderIndex: exerciseOrder++,
      });

      let setIndex = 0;
      for (const set of sets) {
        await insertSet(db, {
          id: generateId(),
          workoutExerciseId,
          setIndex: set.setIndex ?? setIndex,
          weight: set.weight ?? null,
          reps: set.reps ?? null,
          rpe: set.rpe ?? null,
          restSeconds: set.restSeconds ?? null,
          notes: set.notes ?? null,
        });
        setIndex += 1;
      }
    }

    await db.execAsync("COMMIT");
    return { workoutId, endedAt };
  } catch (error) {
    await db.execAsync("ROLLBACK");
    throw error;
  }
};

const insertWorkout = async (
  db: SQLiteDatabase,
  params: {
    id: string;
    userId: string;
    type: string;
    startedAt: number;
    endedAt: number;
    notes: string | null;
  }
) => {
  await db.runAsync(
    `INSERT OR REPLACE INTO workouts (id, userId, type, startedAt, endedAt, notes)
     VALUES (?, ?, ?, ?, ?, ?);`,
    params.id,
    params.userId,
    params.type,
    params.startedAt,
    params.endedAt,
    params.notes
  );
};

const insertWorkoutExercise = async (
  db: SQLiteDatabase,
  params: {
    id: string;
    workoutId: string;
    exerciseId: string;
    orderIndex: number;
  }
) => {
  await db.runAsync(
    `INSERT INTO workout_exercises (id, workoutId, exerciseId, orderIndex)
     VALUES (?, ?, ?, ?);`,
    params.id,
    params.workoutId,
    params.exerciseId,
    params.orderIndex
  );
};

const insertSet = async (
  db: SQLiteDatabase,
  params: {
    id: string;
    workoutExerciseId: string;
    setIndex: number;
    weight: number | null;
    reps: number | null;
    rpe: number | null;
    restSeconds: number | null;
    notes: string | null;
  }
) => {
  await db.runAsync(
    `INSERT INTO sets (id, workoutExerciseId, setIndex, weight, reps, rpe, restSeconds, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    params.id,
    params.workoutExerciseId,
    params.setIndex,
    params.weight,
    params.reps,
    params.rpe,
    params.restSeconds,
    params.notes
  );
};

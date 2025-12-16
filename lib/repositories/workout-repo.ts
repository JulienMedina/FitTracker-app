import { getDatabase } from "../db/database";
import { generateId } from "../utils/id";

export type WorkoutRecord = {
  id: string;
  userId: string;
  type: string | null;
  startedAt: number;
  endedAt: number | null;
  notes: string | null;
};

export type CreateWorkoutInput = {
  userId: string;
  type?: string | null;
  startedAt?: number;
  notes?: string | null;
};

export type CompleteWorkoutInput = {
  workoutId: string;
  endedAt?: number;
  notes?: string | null;
};

export type WorkoutExerciseRecord = {
  id: string;
  workoutId: string;
  exerciseId: string;
  orderIndex: number;
};

const mapWorkoutRow = (row: any): WorkoutRecord => ({
  id: row.id,
  userId: row.userId,
  type: row.type ?? null,
  startedAt: Number(row.startedAt),
  endedAt: row.endedAt !== null ? Number(row.endedAt) : null,
  notes: row.notes ?? null,
});

const mapWorkoutExerciseRow = (row: any): WorkoutExerciseRecord => ({
  id: row.id,
  workoutId: row.workoutId,
  exerciseId: row.exerciseId,
  orderIndex: Number(row.orderIndex),
});

const findById = async (id: string): Promise<WorkoutRecord | null> => {
  const db = await getDatabase();
  const row = await db.getFirstAsync("SELECT * FROM workouts WHERE id = ?;", id);
  return row ? mapWorkoutRow(row) : null;
};

const createWorkout = async (
  input: CreateWorkoutInput
): Promise<WorkoutRecord> => {
  const db = await getDatabase();
  const id = generateId();
  const startedAt = input.startedAt ?? Date.now();
  await db.runAsync(
    `INSERT INTO workouts (id, userId, type, startedAt, notes)
     VALUES (?, ?, ?, ?, ?);`,
    id,
    input.userId,
    input.type ?? null,
    startedAt,
    input.notes ?? null
  );
  const fresh = await findById(id);
  if (!fresh) {
    throw new Error("Failed to fetch workout after creation");
  }
  return fresh;
};

const completeWorkout = async (
  input: CompleteWorkoutInput
): Promise<WorkoutRecord | null> => {
  const db = await getDatabase();
  const endedAt = input.endedAt ?? Date.now();
  await db.runAsync(
    `UPDATE workouts
     SET endedAt = ?, notes = COALESCE(?, notes)
     WHERE id = ?;`,
    endedAt,
    input.notes ?? null,
    input.workoutId
  );
  return findById(input.workoutId);
};

const listRecent = async (limit = 10): Promise<WorkoutRecord[]> => {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    `SELECT * FROM workouts
     ORDER BY startedAt DESC
     LIMIT ?;`,
    limit
  );
  return rows.map(mapWorkoutRow);
};

const addExerciseToWorkout = async (
  workoutId: string,
  exerciseId: string,
  orderIndex?: number
): Promise<WorkoutExerciseRecord> => {
  const db = await getDatabase();
  const id = generateId();
  let nextOrder = orderIndex;
  if (typeof nextOrder === "undefined") {
    const row = await db.getFirstAsync<{ maxIndex: number | null }>(
      "SELECT MAX(orderIndex) as maxIndex FROM workout_exercises WHERE workoutId = ?;",
      workoutId
    );
    const maxIndex =
      row && row.maxIndex !== null && row.maxIndex !== undefined
        ? Number(row.maxIndex)
        : -1;
    nextOrder = maxIndex + 1;
  }

  await db.runAsync(
    `INSERT INTO workout_exercises (id, workoutId, exerciseId, orderIndex)
     VALUES (?, ?, ?, ?);`,
    id,
    workoutId,
    exerciseId,
    nextOrder
  );

  return {
    id,
    workoutId,
    exerciseId,
    orderIndex: nextOrder,
  };
};

const listWorkoutExercises = async (
  workoutId: string
): Promise<WorkoutExerciseRecord[]> => {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    `SELECT * FROM workout_exercises
     WHERE workoutId = ?
     ORDER BY orderIndex ASC;`,
    workoutId
  );
  return rows.map(mapWorkoutExerciseRow);
};

export const workoutRepo = {
  findById,
  create: createWorkout,
  complete: completeWorkout,
  listRecent,
  addExerciseToWorkout,
  listWorkoutExercises,
};

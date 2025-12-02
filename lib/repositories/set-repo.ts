import { getDatabase } from "../db/database";
import { generateId } from "../utils/id";

export type WorkoutSetRecord = {
  id: string;
  workoutExerciseId: string;
  setIndex: number;
  weight: number | null;
  reps: number | null;
  rpe: number | null;
  restSeconds: number | null;
  notes: string | null;
};

export type CreateWorkoutSetInput = {
  workoutExerciseId: string;
  setIndex?: number;
  weight?: number | null;
  reps?: number | null;
  rpe?: number | null;
  restSeconds?: number | null;
  notes?: string | null;
};

export type UpdateWorkoutSetInput = Partial<
  Omit<CreateWorkoutSetInput, "workoutExerciseId">
>;

const mapRow = (row: any): WorkoutSetRecord => ({
  id: row.id,
  workoutExerciseId: row.workoutExerciseId,
  setIndex: Number(row.setIndex),
  weight: row.weight !== null ? Number(row.weight) : null,
  reps: row.reps !== null ? Number(row.reps) : null,
  rpe: row.rpe !== null ? Number(row.rpe) : null,
  restSeconds: row.restSeconds !== null ? Number(row.restSeconds) : null,
  notes: row.notes ?? null,
});

const listForWorkoutExercise = async (
  workoutExerciseId: string
): Promise<WorkoutSetRecord[]> => {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    `SELECT * FROM sets
     WHERE workoutExerciseId = ?
     ORDER BY setIndex ASC;`,
    workoutExerciseId
  );
  return rows.map(mapRow);
};

const createSet = async (
  input: CreateWorkoutSetInput
): Promise<WorkoutSetRecord> => {
  const db = await getDatabase();
  const id = generateId();
  let nextIndex = input.setIndex;
  if (typeof nextIndex === "undefined") {
    const row = await db.getFirstAsync<{ maxIndex: number | null }>(
      `SELECT MAX(setIndex) as maxIndex
       FROM sets
       WHERE workoutExerciseId = ?;`,
      input.workoutExerciseId
    );
    const maxIndex =
      row && row.maxIndex !== null && row.maxIndex !== undefined
        ? Number(row.maxIndex)
        : -1;
    nextIndex = maxIndex + 1;
  }

  await db.runAsync(
    `INSERT INTO sets (
       id,
       workoutExerciseId,
       setIndex,
       weight,
       reps,
       rpe,
       restSeconds,
       notes
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    id,
    input.workoutExerciseId,
    nextIndex,
    input.weight ?? null,
    input.reps ?? null,
    input.rpe ?? null,
    input.restSeconds ?? null,
    input.notes ?? null
  );

  const fresh = await db.getFirstAsync("SELECT * FROM sets WHERE id = ?;", id);
  if (!fresh) {
    throw new Error("Failed to fetch set after creation");
  }
  return mapRow(fresh);
};

const updateSet = async (
  id: string,
  patch: UpdateWorkoutSetInput
): Promise<WorkoutSetRecord | null> => {
  const db = await getDatabase();
  const current = await db.getFirstAsync("SELECT * FROM sets WHERE id = ?;", id);
  if (!current) return null;

  const next = {
    ...current,
    ...patch,
  };

  await db.runAsync(
    `UPDATE sets
     SET setIndex = ?, weight = ?, reps = ?, rpe = ?, restSeconds = ?, notes = ?
     WHERE id = ?;`,
    next.setIndex,
    next.weight ?? null,
    next.reps ?? null,
    next.rpe ?? null,
    next.restSeconds ?? null,
    next.notes ?? null,
    id
  );

  const fresh = await db.getFirstAsync("SELECT * FROM sets WHERE id = ?;", id);
  return fresh ? mapRow(fresh) : null;
};

const removeSet = async (id: string) => {
  const db = await getDatabase();
  await db.runAsync("DELETE FROM sets WHERE id = ?;", id);
};

const removeAllForWorkoutExercise = async (workoutExerciseId: string) => {
  const db = await getDatabase();
  await db.runAsync(
    "DELETE FROM sets WHERE workoutExerciseId = ?;",
    workoutExerciseId
  );
};

export const setRepo = {
  listForWorkoutExercise,
  create: createSet,
  update: updateSet,
  remove: removeSet,
  removeAllForWorkoutExercise,
};

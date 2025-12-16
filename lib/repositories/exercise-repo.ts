import { getDatabase } from "../db/database";
import { generateId } from "../utils/id";

export type ExerciseRecord = {
  id: string;
  name: string;
  category: string | null;
  equipment: string | null;
  muscleGroup: string | null;
  isCustom: boolean;
  createdAt: number;
};

export type CreateExerciseInput = {
  id?: string;
  name: string;
  category?: string | null;
  equipment?: string | null;
  muscleGroup?: string | null;
  isCustom?: boolean;
};

export type UpdateExerciseInput = Partial<
  Omit<CreateExerciseInput, "id" | "name">
> & {
  name?: string;
};

const mapRow = (row: any): ExerciseRecord => ({
  id: row.id,
  name: row.name,
  category: row.category ?? null,
  equipment: row.equipment ?? null,
  muscleGroup: row.muscleGroup ?? null,
  isCustom: Number(row.isCustom) === 1,
  createdAt: Number(row.createdAt),
});

const listAll = async (): Promise<ExerciseRecord[]> => {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    "SELECT * FROM exercises ORDER BY name COLLATE NOCASE;"
  );
  return rows.map(mapRow);
};

const findById = async (id: string): Promise<ExerciseRecord | null> => {
  const db = await getDatabase();
  const row = await db.getFirstAsync("SELECT * FROM exercises WHERE id = ?;", id);
  return row ? mapRow(row) : null;
};

const createExercise = async (
  input: CreateExerciseInput
): Promise<ExerciseRecord> => {
  const db = await getDatabase();
  const id = input.id ?? generateId();
  await db.runAsync(
    `INSERT INTO exercises (id, name, category, equipment, muscleGroup, isCustom)
     VALUES (?, ?, ?, ?, ?, ?);`,
    id,
    input.name,
    input.category ?? null,
    input.equipment ?? null,
    input.muscleGroup ?? null,
    input.isCustom ? 1 : 0
  );

  const fresh = await findById(id);
  if (!fresh) {
    throw new Error("Failed to fetch exercise after creation");
  }
  return fresh;
};

const updateExercise = async (
  id: string,
  patch: UpdateExerciseInput
): Promise<ExerciseRecord | null> => {
  const db = await getDatabase();
  const current = await findById(id);
  if (!current) throw new Error("Exercise not found");

  const next = { ...current, ...patch };

  await db.runAsync(
    `UPDATE exercises
     SET name = ?, category = ?, equipment = ?, muscleGroup = ?, isCustom = ?
     WHERE id = ?;`,
    next.name,
    next.category,
    next.equipment,
    next.muscleGroup,
    next.isCustom ? 1 : 0,
    id
  );
  return findById(id);
};

const remove = async (id: string) => {
  const db = await getDatabase();
  await db.runAsync("DELETE FROM exercises WHERE id = ?;", id);
};

export const exerciseRepo = {
  listAll,
  findById,
  create: createExercise,
  update: updateExercise,
  remove,
};

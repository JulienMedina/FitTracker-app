import type { SQLiteDatabase } from "expo-sqlite";

import { getDatabase } from "./database";
import { generateId } from "../utils/id";

export type Exercise = {
  id: string;
  name: string;
  category: string | null;
  equipment: string | null;
  muscleGroup: string | null;
  isCustom: number;
};

export const getAllExercises = async (): Promise<Exercise[]> => {
  const db = await getDatabase();
  return db.getAllAsync<Exercise>(
    `SELECT id, name, category, equipment, muscleGroup, isCustom
     FROM exercises
     ORDER BY name COLLATE NOCASE;`
  );
};

export const searchExercises = async (query: string): Promise<Exercise[]> => {
  const db = await getDatabase();

  if (!query.trim()) {
    return getAllExercises();
  }

  const like = `%${query.trim()}%`;
  return db.getAllAsync<Exercise>(
    `SELECT id, name, category, equipment, muscleGroup, isCustom
     FROM exercises
     WHERE name LIKE ? OR muscleGroup LIKE ? OR category LIKE ?
     ORDER BY name COLLATE NOCASE;`,
    like,
    like,
    like
  );
};

export const getExerciseById = async (
  db: SQLiteDatabase,
  id: string
): Promise<Exercise | null> => {
  const row = await db.getFirstAsync<Exercise>(
    `SELECT id, name, category, equipment, muscleGroup, isCustom
     FROM exercises WHERE id = ? LIMIT 1;`,
    id
  );
  return row ?? null;
};

export const createExercise = async (
  input: Pick<Exercise, "name"> &
    Partial<Pick<Exercise, "category" | "equipment" | "muscleGroup">>
): Promise<Exercise> => {
  const db = await getDatabase();
  const id = generateId();
  const name = input.name.trim();
  if (!name) {
    throw new Error("Le nom de l'exercice est requis");
  }

  await db.runAsync(
    `INSERT INTO exercises (id, name, category, equipment, muscleGroup, isCustom)
     VALUES (?, ?, ?, ?, ?, 1);`,
    id,
    name,
    input.category?.trim() ?? null,
    input.equipment?.trim() ?? null,
    input.muscleGroup?.trim() ?? null
  );

  return {
    id,
    name,
    category: input.category?.trim() ?? null,
    equipment: input.equipment?.trim() ?? null,
    muscleGroup: input.muscleGroup?.trim() ?? null,
    isCustom: 1,
  };
};

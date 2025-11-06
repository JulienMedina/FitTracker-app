import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";

let dbInstance: SQLiteDatabase | null = null;

export const getDatabase = async () => {
  if (dbInstance) return dbInstance;

  dbInstance = await openDatabaseAsync("fittracker.db");
  await dbInstance.execAsync("PRAGMA foreign_keys = ON;");
  return dbInstance;
};

import type { SQLiteDatabase } from "expo-sqlite/next";

type Migration = {
  version: number;
  statements: string[];
};

const migrations: Migration[] = [
  {
    version: 1,
    statements: [
      `CREATE TABLE IF NOT EXISTS exercises (
           id TEXT PRIMARY KEY,
           name TEXT NOT NULL,
           category TEXT,
           equipment TEXT,
           muscleGroup TEXT,
           isCustom INTEGER DEFAULT 0,
           createdAt INTEGER DEFAULT (strftime('%s','now'))
         );`,
      `CREATE TABLE IF NOT EXISTS workouts (
           id TEXT PRIMARY KEY,
           userId TEXT NOT NULL,
           type TEXT,
           startedAt INTEGER NOT NULL,
           endedAt INTEGER,
           notes TEXT
         );`,
      `CREATE TABLE IF NOT EXISTS workout_exercises (
           id TEXT PRIMARY KEY,
           workoutId TEXT NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
           exerciseId TEXT NOT NULL REFERENCES exercises(id),
           orderIndex INTEGER NOT NULL
         );`,
      `CREATE TABLE IF NOT EXISTS sets (
           id TEXT PRIMARY KEY,
           workoutExerciseId TEXT NOT NULL REFERENCES workout_exercises(id) ON DELETE CASCADE,
           setIndex INTEGER NOT NULL,
           weight REAL,
           reps INTEGER,
           rpe REAL,
           restSeconds INTEGER,
         notes TEXT
       );`,
    ],
  },
  // Ajoute les futures migrations (version 2, 3…) ici
];

const ensureMetaTable = async (db: SQLiteDatabase) => {
  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS meta (
       key TEXT PRIMARY KEY,
       value TEXT NOT NULL
     );`
  );

  await db.runAsync(
    "INSERT OR IGNORE INTO meta(key, value) VALUES (?, ?);",
    "schema_version",
    "0"
  );
};

export const runMigrations = async (db: SQLiteDatabase) => {
  await ensureMetaTable(db);
  await db.execAsync("BEGIN");
  try {
    const result = await db.getFirstAsync<{ value: string }>(
      "SELECT value FROM meta WHERE key = 'schema_version';"
    );
    let currentVersion = result ? Number(result.value) : 0;

    for (const migration of migrations) {
      if (migration.version > currentVersion) {
        for (const sql of migration.statements) {
          await db.execAsync(sql);
        }
        currentVersion = migration.version;
        await db.runAsync(
          "UPDATE meta SET value = ? WHERE key = 'schema_version';",
          currentVersion.toString()
        );
      }
    }

    await db.execAsync("COMMIT");
  } catch (error) {
    await db.execAsync("ROLLBACK");
    throw error;
  }
};

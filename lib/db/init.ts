import { useEffect, useState } from "react";
import { getDatabase } from "./database";
import { runMigrations } from "./migration";

export const initDatabase = async () => {
  const db = await getDatabase();
  await runMigrations(db);
  return db;
};

export const useDatabaseReady = () => {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    initDatabase()
      .then(() => setReady(true))
      .catch((err) => setError(err));
  }, []);

  return { ready, error };
};

import { useEffect, useMemo, useState } from "react";

import { fetchMockDashboard } from "@/lib/home/mockDashboard";
import type {
  HomeDashboardPayload,
  ProgressRange,
} from "@/lib/home/types";
import { useWorkoutStore } from "@/store/workoutStore";

export type HomeDashboardData = HomeDashboardPayload & {
  headerDateLabel: string;
};

export type CurrentWorkoutSummary = {
  id: string;
  exerciseCount: number;
  setCount: number;
  elapsedMinutes: number;
};

const formatHeaderDate = (date: Date) => {
  const formatter = new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const label = formatter.format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
};

export const useHomeDashboard = () => {
  const [range, setRange] = useState<ProgressRange>("7d");
  const [payload, setPayload] = useState<HomeDashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Keep selectors simple to avoid returning a new object each render (which React treats as a new snapshot)
  const workoutId = useWorkoutStore((state) => state.workoutId);
  const startedAt = useWorkoutStore((state) => state.startedAt);
  const setsByExercise = useWorkoutStore((state) => state.setsByExercise);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchMockDashboard(range);
        if (isMounted) {
          setPayload(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [range, refreshKey]);

  const currentWorkout: CurrentWorkoutSummary | null = useMemo(() => {
    if (!workoutId || !startedAt) return null;
    const exerciseIds = Object.keys(setsByExercise);
    const setCount = exerciseIds.reduce(
      (total, id) => total + (setsByExercise[id]?.length ?? 0),
      0
    );

    return {
      id: workoutId,
      exerciseCount: exerciseIds.length,
      setCount,
      elapsedMinutes: Math.max(
        1,
        Math.floor((Date.now() - startedAt) / 60000)
      ),
    };
  }, [workoutId, startedAt, setsByExercise]);

  const dashboardData: HomeDashboardData | null = payload
    ? {
        ...payload,
        headerDateLabel: formatHeaderDate(new Date()),
      }
    : null;

  return {
    range,
    setRange,
    refresh: () => setRefreshKey((prev) => prev + 1),
    loading,
    error,
    data: dashboardData,
    currentWorkout,
  };
};

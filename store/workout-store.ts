import AsyncStorage from "@react-native-async-storage/async-storage";
import { produce } from "immer";
import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  subscribeWithSelector,
} from "zustand/middleware";

const generateId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2);
};

export type WorkoutSet = {
  id: string;
  exerciseId: string;
  setIndex: number;
  weight?: number;
  reps?: number;
  restSeconds?: number;
  notes?: string;
};

export type WorkoutState = {
  workoutId: string | null;
  startedAt: number | null;
  activeExerciseId: string | null;
  restTimerEndsAt: number | null;
  setsByExercise: Record<string, WorkoutSet[]>;
};

export type WorkoutActions = {
  startWorkout: (workoutId?: string) => void;
  setActiveExercise: (exerciseId: string | null) => void;
  addExercise: (exerciseId: string) => void;
  addSet: (
    exerciseId: string,
    payload: Omit<WorkoutSet, "id" | "exerciseId" | "setIndex">
  ) => void;
  updateSet: (
    exerciseId: string,
    setId: string,
    patch: Partial<Omit<WorkoutSet, "id" | "exerciseId" | "setIndex">>
  ) => void;
  removeSet: (exerciseId: string, setId: string) => void;
  clearExercise: (exerciseId: string) => void;
  startRestTimer: (seconds: number) => void;
  clearRestTimer: () => void;
  clearWorkout: () => void;
};

const initialState: WorkoutState = {
  workoutId: null,
  startedAt: null,
  activeExerciseId: null,
  restTimerEndsAt: null,
  setsByExercise: {},
};

export const useWorkoutStore = create<WorkoutState & WorkoutActions>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        ...initialState,
        startWorkout: (workoutId) =>
          set(
            produce((state: WorkoutState & WorkoutActions) => {
              state.workoutId = workoutId ?? generateId();
              state.startedAt = Date.now();
              state.activeExerciseId = null;
              state.restTimerEndsAt = null;
              state.setsByExercise = {};
            })
          ),
        setActiveExercise: (exerciseId) => set({ activeExerciseId: exerciseId }),
        addExercise: (exerciseId) =>
          set(
            produce((state: WorkoutState & WorkoutActions) => {
              if (!state.setsByExercise[exerciseId]) {
                state.setsByExercise[exerciseId] = [];
              }
            })
          ),
        addSet: (exerciseId, payload) =>
          set(
            produce((state: WorkoutState & WorkoutActions) => {
              const sets = state.setsByExercise[exerciseId] ?? [];

              state.setsByExercise[exerciseId] = [
                ...sets,
                {
                  id: generateId(),
                  exerciseId,
                  setIndex: sets.length,
                  ...payload,
                },
              ];
            })
          ),
        updateSet: (exerciseId, setId, patch) =>
          set(
            produce((state: WorkoutState & WorkoutActions) => {
              const sets = state.setsByExercise[exerciseId];
              if (!sets) return;
              const target = sets.find((item) => item.id === setId);
              if (!target) return;

              Object.assign(target, patch);
            })
          ),
        removeSet: (exerciseId, setId) =>
          set(
            produce((state: WorkoutState & WorkoutActions) => {
              const sets = state.setsByExercise[exerciseId];
              if (!sets) return;

              state.setsByExercise[exerciseId] = sets
                .filter((item) => item.id !== setId)
                .map((item, index) => ({ ...item, setIndex: index }));
            })
          ),
        clearExercise: (exerciseId) =>
          set(
            produce((state: WorkoutState & WorkoutActions) => {
              delete state.setsByExercise[exerciseId];
              if (state.activeExerciseId === exerciseId) {
                state.activeExerciseId = null;
              }
            })
          ),
        startRestTimer: (seconds) =>
          set({
            restTimerEndsAt: Date.now() + seconds * 1000,
          }),
        clearRestTimer: () => set({ restTimerEndsAt: null }),
        clearWorkout: () => set({ ...initialState }),
      }),
      {
        name: "fittracker-workout",
        storage: createJSONStorage(() => AsyncStorage),
        partialize: (state) => ({
          workoutId: state.workoutId,
          startedAt: state.startedAt,
          activeExerciseId: state.activeExerciseId,
          restTimerEndsAt: state.restTimerEndsAt,
          setsByExercise: state.setsByExercise,
        }),
      }
    )
  )
);

export const selectSetsForExercise = (exerciseId: string) =>
  useWorkoutStore((state) => state.setsByExercise[exerciseId] ?? []);

export const selectRestTimerRemaining = () =>
  useWorkoutStore((state) => {
    if (!state.restTimerEndsAt) return 0;
    const remaining = state.restTimerEndsAt - Date.now();
    return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
  });

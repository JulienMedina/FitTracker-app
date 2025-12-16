import { useEffect, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { getAllExercises, searchExercises, type Exercise } from "@/lib/db/exercises";
import { saveWorkoutFromState } from "@/lib/db/workouts";
import { useWorkoutStore } from "@/store/workout-store";

const defaultSet = { weight: 40, reps: 10, rpe: 7.5 } as const;

export default function WorkoutScreen() {
  const startWorkout = useWorkoutStore((state) => state.startWorkout);
  const addExercise = useWorkoutStore((state) => state.addExercise);
  const addSet = useWorkoutStore((state) => state.addSet);
  const updateSet = useWorkoutStore((state) => state.updateSet);
  const removeSet = useWorkoutStore((state) => state.removeSet);
  const setsByExercise = useWorkoutStore((state) => state.setsByExercise);
  const clearWorkout = useWorkoutStore((state) => state.clearWorkout);
  const workoutId = useWorkoutStore((state) => state.workoutId);
  const startedAt = useWorkoutStore((state) => state.startedAt);

  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [query, setQuery] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [openExercises, setOpenExercises] = useState<Record<string, boolean>>({});

  const isActive = Boolean(workoutId && startedAt);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const items = query.trim() ? await searchExercises(query) : await getAllExercises();
        setExercises(items);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [query]);

  const exerciseIds = useMemo(() => Object.keys(setsByExercise), [setsByExercise]);

  const handleAddExercise = (exercise: Exercise) => {
    if (!isActive) {
      startWorkout();
    }

    addExercise(exercise.id);
    addSet(exercise.id, defaultSet);
    setShowPicker(false);
    setOpenExercises((prev) => ({ ...prev, [exercise.id]: true }));
  };

  const adjustSetValue = (
    exerciseId: string,
    setId: string,
    field: "weight" | "reps" | "rpe",
    delta: number
  ) => {
    const sets = setsByExercise[exerciseId] ?? [];
    const target = sets.find((item) => item.id === setId);
    if (!target) return;

    const decimalsMap = { weight: 1, reps: 0, rpe: 1 } as const;
    const next = (target[field] ?? 0) + delta;
    const clamped =
      field === "rpe" ? Math.min(Math.max(next, 0), 10) : Math.max(next, 0);

    const rounded = Number(clamped.toFixed(decimalsMap[field]));
    updateSet(exerciseId, setId, { [field]: rounded });
  };

  const setSetValueFromInput = (
    exerciseId: string,
    setId: string,
    field: "weight" | "reps" | "rpe",
    raw: string
  ) => {
    const parsed = field === "reps" ? parseInt(raw, 10) : parseFloat(raw);
    if (!Number.isFinite(parsed)) return;

    const decimalsMap = { weight: 1, reps: 0, rpe: 1 } as const;
    const clamped =
      field === "rpe" ? Math.min(Math.max(parsed, 0), 10) : Math.max(parsed, 0);
    const rounded = Number(clamped.toFixed(decimalsMap[field]));
    updateSet(exerciseId, setId, { [field]: rounded });
  };

  const handleRemoveSet = (exerciseId: string, setId: string) => {
    removeSet(exerciseId, setId);
  };

  const toggleExercise = (exerciseId: string) => {
    setOpenExercises((prev) => ({
      ...prev,
      [exerciseId]: !prev[exerciseId],
    }));
  };

  const handleFinish = async () => {
    if (!startedAt || exerciseIds.length === 0) {
      Alert.alert("Séance incomplète", "Ajoute au moins un exercice avant de terminer.");
      return;
    }

    try {
      setSaving(true);
      await saveWorkoutFromState({
        workoutId,
        startedAt,
        setsByExercise,
      });
      clearWorkout();
      Alert.alert("Séance enregistrée", "Retrouve-la dans l'historique bientôt.");
    } catch (err) {
      Alert.alert("Erreur", (err as Error).message ?? "Impossible d'enregistrer la séance");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-[#050814]" contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-2xl font-semibold text-white">Séance</Text>
        <Pressable
          className={`flex-row items-center gap-2 rounded-2xl px-4 py-2 ${
            isActive ? "bg-[#172137]" : "bg-[#39FF88]"
          }`}
          onPress={() => {
            if (!isActive) {
              startWorkout();
            }
          }}
          disabled={isActive}
        >
          <Ionicons name="play" size={18} color={isActive ? "#9FB3C8" : "#050814"} />
          <Text
            className={`text-sm font-semibold ${
              isActive ? "text-[#9FB3C8]" : "text-[#050814]"
            }`}
          >
            {isActive ? "En cours" : "Démarrer"}
          </Text>
        </Pressable>
      </View>

      <Pressable
        className="mb-4 flex-row items-center justify-center gap-2 rounded-2xl border border-[#172137] bg-[#0B1020] px-4 py-3"
        onPress={handleFinish}
        disabled={saving}
      >
        <Ionicons name="stop-circle" size={18} color={saving ? "#9FB3C8" : "#FF6B6B"} />
        <Text className="text-sm font-semibold text-[#E6F0FF]">
          {saving ? "Enregistrement..." : "Terminer la séance"}
        </Text>
      </Pressable>

      <Pressable
        className="mb-3 flex-row items-center gap-2 rounded-2xl border border-[#172137] bg-[#0B1020] px-4 py-3"
        onPress={() => setShowPicker((prev) => !prev)}
      >
        <Ionicons name="add-circle-outline" size={20} color="#39FF88" />
        <Text className="text-base text-white">Ajouter un exercice</Text>
      </Pressable>

      {showPicker ? (
        <View className="mb-4 rounded-2xl border border-[#172137] bg-[#0B1020] p-3">
          <TextInput
            placeholder="Rechercher (bench, squat...)"
            placeholderTextColor="#9FB3C8"
            value={query}
            onChangeText={setQuery}
            className="mb-3 rounded-xl border border-[#172137] bg-[#0B0F1C] px-3 py-2 text-white"
          />
          {loading ? (
            <View className="items-center py-6">
              <ActivityIndicator color="#39FF88" />
            </View>
          ) : (
            exercises.map((exercise) => (
              <Pressable
                key={exercise.id}
                className="mb-2 flex-row items-center justify-between rounded-xl bg-[#0B1020] px-3 py-3"
                onPress={() => handleAddExercise(exercise)}
              >
                <View>
                  <Text className="text-white">{exercise.name}</Text>
                  <Text className="text-xs uppercase text-[#9FB3C8]">
                    {[exercise.category, exercise.muscleGroup].filter(Boolean).join(" · ")}
                  </Text>
                </View>
                <Ionicons name="add" size={18} color="#39FF88" />
              </Pressable>
            ))
          )}
        </View>
      ) : null}

      {exerciseIds.length === 0 ? (
        <View className="mt-8 items-center">
          <Text className="text-center text-base text-[#9FB3C8]">
            Ajoute un exercice pour démarrer une série.
          </Text>
        </View>
      ) : (
        exerciseIds.map((exerciseId) => {
          const sets = setsByExercise[exerciseId] ?? [];
          const exercise = exercises.find((item) => item.id === exerciseId);
          const isOpen = openExercises[exerciseId] ?? true;
          return (
            <View key={exerciseId} className="mb-4 rounded-2xl border border-[#172137] bg-[#0B1020] p-4">
              <Pressable
                onPress={() => toggleExercise(exerciseId)}
                className="flex-row items-center justify-between"
              >
                <View>
                  <Text className="text-lg font-semibold text-white">
                    {exercise?.name ?? "Exercice"}
                  </Text>
                  <Text className="text-xs uppercase text-[#9FB3C8]">
                    {sets.length} série{sets.length > 1 ? "s" : ""} •{' '}
                    {[exercise?.category, exercise?.muscleGroup].filter(Boolean).join(" · ")}
                  </Text>
                </View>
                <Ionicons
                  name={isOpen ? "chevron-up" : "chevron-down"}
                  size={18}
                  color="#9FB3C8"
                />
              </Pressable>

              {isOpen ? (
                <View className="mt-3 flex-row flex-wrap gap-2">
                  {sets.map((set, index) => (
                    <View
                      key={set.id}
                      className="w-full rounded-xl border border-[#172137] bg-[#0B0F1C] px-3 py-3"
                    >
                      <View className="mb-2 flex-row items-center justify-between">
                        <Text className="text-sm font-semibold text-white">Série {index + 1}</Text>
                        <Pressable
                          onPress={() => handleRemoveSet(exerciseId, set.id)}
                          hitSlop={10}
                        >
                          <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                        </Pressable>
                      </View>
                      <View className="flex-row flex-wrap gap-3">
                        <Stepper
                          label="Poids"
                          unit="kg"
                          value={set.weight ?? 0}
                          decimals={1}
                          onMinus={() => adjustSetValue(exerciseId, set.id, "weight", -1)}
                          onPlus={() => adjustSetValue(exerciseId, set.id, "weight", 1)}
                          onChangeValue={(text) => setSetValueFromInput(exerciseId, set.id, "weight", text)}
                        />
                        <Stepper
                          label="Reps"
                          value={set.reps ?? 0}
                          onMinus={() => adjustSetValue(exerciseId, set.id, "reps", -1)}
                          onPlus={() => adjustSetValue(exerciseId, set.id, "reps", 1)}
                          onChangeValue={(text) => setSetValueFromInput(exerciseId, set.id, "reps", text)}
                        />
                        <Stepper
                          label="RPE"
                          value={set.rpe ?? 0}
                          onMinus={() => adjustSetValue(exerciseId, set.id, "rpe", -0.5)}
                          onPlus={() => adjustSetValue(exerciseId, set.id, "rpe", 0.5)}
                          decimals={1}
                          onChangeValue={(text) => setSetValueFromInput(exerciseId, set.id, "rpe", text)}
                        />
                      </View>
                    </View>
                  ))}
                  <Pressable
                    className="h-[72px] w-[72px] items-center justify-center rounded-xl border border-dashed border-[#39FF88]/80"
                    onPress={() => addSet(exerciseId, defaultSet)}
                  >
                    <Ionicons name="add" size={20} color="#39FF88" />
                    <Text className="text-xs text-[#39FF88]">Série</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const Stepper = ({
  label,
  value,
  unit,
  onMinus,
  onPlus,
  onChangeValue,
  decimals = 0,
}: {
  label: string;
  value: number;
  unit?: string;
  onMinus: () => void;
  onPlus: () => void;
  onChangeValue: (text: string) => void;
  decimals?: number;
}) => {
  const [textValue, setTextValue] = useState(value.toFixed(decimals));

  useEffect(() => {
    setTextValue(value.toFixed(decimals));
  }, [value, decimals]);

  const commit = () => {
    onChangeValue(textValue);
  };

  return (
    <View className="flex-row items-center rounded-xl border border-[#172137] bg-[#0B1020] px-3 py-2">
      <Pressable
        className="h-8 w-8 items-center justify-center rounded-lg bg-[#0B0F1C] border border-[#172137]"
        onPress={onMinus}
        hitSlop={8}
      >
        <Ionicons name="remove" size={16} color="#E6F0FF" />
      </Pressable>
      <View className="mx-3 w-20">
        <Text className="text-xs uppercase text-[#9FB3C8]">{label}</Text>
        <TextInput
          className="text-lg font-semibold text-white"
          value={textValue}
          onChangeText={setTextValue}
          onBlur={commit}
          onSubmitEditing={commit}
          keyboardType="decimal-pad"
          placeholderTextColor="#9FB3C8"
        />
        {unit ? <Text className="text-xs text-[#9FB3C8]">{unit}</Text> : null}
      </View>
      <Pressable
        className="h-8 w-8 items-center justify-center rounded-lg bg-[#39FF88]/20 border border-[#39FF88]/60"
        onPress={onPlus}
        hitSlop={8}
      >
        <Ionicons name="add" size={16} color="#39FF88" />
      </Pressable>
    </View>
  );
};

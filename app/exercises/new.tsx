import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { useRouter } from "expo-router";

import { createExercise } from "@/lib/db/exercises";

export default function NewExerciseScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [equipment, setEquipment] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<
    | {
        type: "success" | "error";
        message: string;
      }
    | null
  >(null);

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 1800);
    return () => clearTimeout(timer);
  }, [feedback]);

  const handleSave = async () => {
    try {
      if (!name.trim()) {
        setFeedback({
          type: "error",
          message: "Ajoute un nom d'exercice",
        });
        return;
      }

      setSaving(true);
      await createExercise({
        name,
        category,
        equipment,
        muscleGroup,
      });

      setFeedback({
        type: "success",
        message: `${name.trim()} ajouté à ta base`,
      });

      setTimeout(() => {
        router.back();
      }, 700);
    } catch (err) {
      setFeedback({
        type: "error",
        message: (err as Error).message ?? "Impossible d'enregistrer",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-dark"
      contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
    >
      <Pressable
        className="mb-4 flex-row items-center gap-2"
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={20} color={Colors.accent} />
        <Text className="text-base text-light">Retour</Text>
      </Pressable>

      <Text className="text-2xl font-semibold text-accent mb-2">
        Ajouter un exercice
      </Text>
      <Text className="text-sm text-muted mb-4">
        Prochainement : sauvegarde dans la base locale et réutilisation dans tes séances.
      </Text>

      {feedback ? (
        <FeedbackBanner type={feedback.type} message={feedback.message} />
      ) : null}

      <Field
        label="Nom"
        placeholder="Ex: Bench Press"
        value={name}
        onChangeText={setName}
      />
      <Field
        label="Catégorie"
        placeholder="Push / Pull / Legs / Core"
        value={category}
        onChangeText={setCategory}
      />
      <Field
        label="Équipement"
        placeholder="Barre, haltères, machine..."
        value={equipment}
        onChangeText={setEquipment}
      />
      <Field
        label="Groupe musculaire"
        placeholder="Pectoraux, dos, quadriceps..."
        value={muscleGroup}
        onChangeText={setMuscleGroup}
      />

      <Pressable
        className="mt-6 h-12 items-center justify-center rounded-2xl bg-highlight"
        onPress={handleSave}
        disabled={saving}
      >
        <Text className="text-base font-semibold text-dark">
          {saving ? "Enregistrement..." : "Enregistrer"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const Field = ({
  label,
  placeholder,
  value,
  onChangeText,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
}) => (
  <View className="mb-4">
    <Text className="mb-2 text-sm font-semibold text-light">{label}</Text>
    <TextInput
      className="rounded-xl border border-border bg-dark px-3 py-2 text-light"
      placeholder={placeholder}
      placeholderTextColor="muted"
      value={value}
      onChangeText={onChangeText}
    />
  </View>
);

const FeedbackBanner = ({ type, message }: { type: "success" | "error"; message: string }) => (
  <View
    className={`mb-4 rounded-2xl border px-4 py-3 ${
      type === "success"
        ? "border-positive bg-positive/20"
        : "border-[#47241f] bg-[#1c0f0e]"
    }`}
  >
    <View className="flex-row items-center gap-2">
      <Ionicons
        name={type === "success" ? "checkmark-circle" : "alert-circle"}
        size={18}
        color={type === "success" ? Colors.highlight : Colors.error}
      />
      <Text className="text-sm font-semibold text-light">{message}</Text>
    </View>
  </View>
);

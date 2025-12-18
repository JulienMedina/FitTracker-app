import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import type { ReactNode } from "react";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { useHomeDashboard } from "@/hooks/use-home-dashboard";
import type { CurrentWorkoutSummary } from "@/hooks/use-home-dashboard";
import type {
  PersonalRecordCard,
  ProgressPoint,
  ProgressRange,
  QuickAction,
} from "@/lib/home/types";
import { useWorkoutStore } from "@/store/workout-store";

const rangeOptions: ProgressRange[] = ["7d", "14d", "28d"];

export default function HomeScreen() {
  const router = useRouter();
  const startWorkout = useWorkoutStore((state) => state.startWorkout);
  const startRestTimer = useWorkoutStore((state) => state.startRestTimer);

  const { data, loading, error, refresh, range, setRange, currentWorkout } =
    useHomeDashboard();

  const handlePrimaryWorkout = () => {
    startWorkout();
    router.push("/workout");
  };

  const handleSettings = () => {
    router.push("/settings");
  };

  const handleQuickAction = (action: QuickAction) => {
    if (action.id === "timer-60") {
      startRestTimer(60);
      Alert.alert("Timer", "Repos de 60s démarré");
      return;
    }

    router.push(action.route as never);
  };

  if (loading && !data) {
    return (
      <View className="flex-1 items-center justify-center bg-dark">
        <ActivityIndicator size="large" color="highlight" />
        <Text className="mt-4 text-base text-muted">
          Préparation du tableau de bord...
        </Text>
      </View>
    );
  }

  if (error && !data) {
    return (
      <View className="flex-1 items-center justify-center bg-dark px-8">
        <Text className="text-center text-lg font-semibold text-accent">
          Impossible de charger les données
        </Text>
        <Text className="mt-2 text-center text-sm text-muted">
          {error.message}
        </Text>
        <Pressable
          className="mt-6 rounded-2xl bg-highlight px-6 py-3"
          onPress={refresh}
        >
          <Text className="text-base font-semibold text-dark">
            Réessayer
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-dark"
      contentInsetAdjustmentBehavior="always"
      contentContainerStyle={{
        paddingBottom: 32,
      }}
    >
      <View className="px-5 pt-12 pb-6">
        <View className="flex-row items-start justify-between">
          <View>
            <Text className="text-3xl font-semibold text-accent">
              Athletica
            </Text>
            <Text className="mt-1 text-sm text-muted">
              {data?.headerDateLabel ?? ""}
            </Text>
          </View>
          <Pressable
            className="h-12 w-12 items-center justify-center rounded-2xl border border-border bg-dark"
            onPress={handleSettings}
          >
            <Ionicons name="settings-outline" size={22} color={Colors.accent} />
          </Pressable>
        </View>
      </View>

      {currentWorkout ? (
        <CurrentWorkoutCard
          summary={currentWorkout}
          onResume={() => router.push("/workout")}
        />
      ) : null}

      <PrimaryCTA onPress={handlePrimaryWorkout} />

      {!data?.lastWorkout && !currentWorkout ? (
        <EmptyHomeState onStart={handlePrimaryWorkout} />
      ) : null}

      {data?.lastWorkout ? (
        <Section
          title="Dernière séance"
          actionLabel="Voir le détail"
          onAction={() => router.push("/history")}
        >
          <Card>
            <Text className="text-sm uppercase text-highlight">
              {data.lastWorkout.dateLabel}
            </Text>
            <Text className="mt-2 text-2xl font-semibold text-accent">
              {formatDuration(data.lastWorkout.durationMinutes)} · {formatWeight(data.lastWorkout.volumeKg)}
            </Text>
            <Text className="mt-3 text-sm text-muted">Exercices clés</Text>
            <View className="mt-2 flex-row flex-wrap gap-2">
              {data.lastWorkout.topExercises.map((exercise) => (
                <View
                  key={exercise}
                  className="rounded-full bg-card px-3 py-1"
                >
                  <Text className="text-xs text-light">{exercise}</Text>
                </View>
              ))}
            </View>
          </Card>
        </Section>
      ) : null}

      {data ? (
        <Section
          title="Progression"
          actionLabel={`Période ${range.toUpperCase()}`}
        >
          <RangeSelector
            range={range}
            onSelect={setRange}
            options={rangeOptions}
          />
          <MiniBars points={data.progress.points} />
          <View className="mt-4 flex-row items-center justify-between">
            <Text className="text-base text-light">
              {formatWeight(data.progress.totalVolume)} cumulés
            </Text>
            <Text
              className={`text-sm font-semibold ${
                data.progress.changePercentage >= 0 ? "text-highlight" : "text-[#FF6B6B]"
              }`}
            >
              {data.progress.changePercentage >= 0 ? "+" : ""}
              {data.progress.changePercentage}%
            </Text>
          </View>
        </Section>
      ) : null}

      {data ? (
        <Section title="Records récents">
          <PRCarousel prs={data.prs} />
        </Section>
      ) : null}

      {data ? (
        <Section title="Quick actions">
          <QuickActionsGrid
            actions={data.quickActions}
            onPressAction={handleQuickAction}
          />
        </Section>
      ) : null}
    </ScrollView>
  );
}

const CurrentWorkoutCard = ({
  summary,
  onResume,
}: {
  summary: CurrentWorkoutSummary;
  onResume: () => void;
}) => (
  <View className="mx-5 mb-4 rounded-3xl border border-border bg-dark p-5">
    <Text className="text-sm uppercase text-highlight">Séance en cours</Text>
    <View className="mt-4 flex-row justify-between">
      <Stat label="Exercices" value={summary.exerciseCount.toString()} />
      <Stat label="Séries" value={summary.setCount.toString()} />
      <Stat label="Durée" value={`${summary.elapsedMinutes.toString()} min`} />
    </View>
    <Pressable
      className="mt-6 h-12 items-center justify-center rounded-2xl bg-highlight"
      onPress={onResume}
    >
      <Text className="text-base font-semibold text-dark">Reprendre</Text>
    </Pressable>
  </View>
);

const PrimaryCTA = ({ onPress }: { onPress: () => void }) => (
  <Pressable
    className="mx-5 mb-6 h-14 items-center justify-center rounded-3xl bg-highlight"
    onPress={onPress}
  >
    <Text className="text-lg font-semibold text-dark">
      Commencer une séance
    </Text>
  </Pressable>
);

const Section = ({
  title,
  actionLabel,
  onAction,
  children,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  children: ReactNode;
}) => (
  <View className="mb-6 px-5">
    <View className="mb-3 flex-row items-center justify-between">
      <Text className="text-lg font-semibold text-accent">{title}</Text>
      {actionLabel ? (
        <Pressable onPress={onAction}>
          <Text className="text-sm text-highlight">{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
    {children}
  </View>
);

const Card = ({ children }: { children: ReactNode }) => (
  <View className="rounded-3xl border border-border bg-dark p-5">
    {children}
  </View>
);

const Stat = ({ label, value }: { label: string; value: string }) => (
  <View>
    <Text className="text-xs text-muted">{label}</Text>
    <Text className="mt-1 text-xl font-semibold text-accent">{value}</Text>
  </View>
);

const RangeSelector = ({
  range,
  onSelect,
  options,
}: {
  range: ProgressRange;
  onSelect: (value: ProgressRange) => void;
  options: ProgressRange[];
}) => (
  <View className="mb-4 flex-row gap-2">
    {options.map((option) => {
      const isActive = option === range;
      return (
        <Pressable
          key={option}
          className={`flex-1 items-center rounded-2xl border px-3 py-2 ${
            isActive ? "border-transparent bg-highlight" : "border-border bg-dark"
          }`}
          onPress={() => onSelect(option)}
        >
          <Text
            className={`text-sm font-medium ${
              isActive ? "text-dark" : "text-light"
            }`}
          >
            {option.toUpperCase()}
          </Text>
        </Pressable>
      );
    })}
  </View>
);

const MiniBars = ({ points }: { points: ProgressPoint[] }) => {
  const maxValue = Math.max(...points.map((point) => point.value), 1);
  return (
    <View className="h-32 flex-row items-end gap-2">
      {points.map((point) => {
        const height = Math.max(12, (point.value / maxValue) * 110);
        return (
          <View key={point.label} className="flex-1 items-center">
            <View
              className="w-full rounded-2xl"
              style={{ height, backgroundColor: "#39FF88" }}
            />
            <Text className="mt-2 text-xs text-muted">{point.label}</Text>
          </View>
        );
      })}
    </View>
  );
};

const PRCarousel = ({ prs }: { prs: PersonalRecordCard[] }) => {
  if (prs.length === 0) {
    return (
      <Card>
        <Text className="text-center text-sm text-muted">
          Aucun record pour le moment.
        </Text>
      </Card>
    );
  }

  return (
    <FlatList
      data={prs}
      horizontal
      keyExtractor={(item) => item.id}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingRight: 20 }}
      renderItem={({ item }) => (
        <View className="mr-4 w-48 rounded-3xl border border-border bg-dark p-4">
          <Text className="text-xs text-muted">{item.dateLabel}</Text>
          <Text className="mt-2 text-lg font-semibold text-light">
            {item.exercise}
          </Text>
          <Text className="mt-4 text-3xl font-bold text-highlight">
            {item.bestValue}
            <Text className="text-base font-semibold text-muted">
              {" "}
              {item.unit}
            </Text>
          </Text>
        </View>
      )}
    />
  );
};

const QuickActionsGrid = ({
  actions,
  onPressAction,
}: {
  actions: QuickAction[];
  onPressAction: (action: QuickAction) => void;
}) => (
  <View className="flex-row flex-wrap justify-between gap-3">
    {actions.map((action) => (
      <Pressable
        key={action.id}
        className="w-[48%] rounded-3xl border border-border bg-dark p-4"
        onPress={() => onPressAction(action)}
      >
        <Ionicons name={action.icon as any} size={24} color={Colors.highlight} />
        <Text className="mt-3 text-base font-semibold text-accent">
          {action.label}
        </Text>
        <Text className="mt-1 text-sm text-muted">{action.subLabel}</Text>
      </Pressable>
    ))}
  </View>
);

const EmptyHomeState = ({ onStart }: { onStart: () => void }) => (
  <View className="mx-5 mb-6 rounded-3xl border border-dashed border-border bg-dark p-6">
    <Text className="text-xl font-semibold text-accent">
      Prêt à suivre tes entraînements ?
    </Text>
    <Text className="mt-2 text-sm text-muted">
      Crée un exercice ou démarre ta première séance pour remplir ton dashboard.
    </Text>
    <Pressable
      className="mt-4 h-12 items-center justify-center rounded-2xl bg-highlight"
      onPress={onStart}
    >
      <Text className="text-base font-semibold text-dark">
        Commencer une séance
      </Text>
    </Pressable>
  </View>
);

const formatWeight = (value: number) =>
  `${new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(value)} kg`;

const formatDuration = (minutes: number) => `${minutes} min`;

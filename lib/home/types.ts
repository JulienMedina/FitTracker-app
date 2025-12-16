export type ProgressRange = "7d" | "14d" | "28d";

export type ProgressPoint = {
  label: string;
  value: number;
};

export type ProgressSummary = {
  range: ProgressRange;
  points: ProgressPoint[];
  totalVolume: number;
  changePercentage: number;
};

export type LastWorkoutSummary = {
  id: string;
  dateLabel: string;
  durationMinutes: number;
  volumeKg: number;
  topExercises: string[];
};

export type PersonalRecordCard = {
  id: string;
  exercise: string;
  bestValue: number;
  unit: string;
  dateLabel: string;
};

export type QuickAction = {
  id: string;
  label: string;
  subLabel: string;
  icon: string;
  route: string;
};

export type HomeDashboardPayload = {
  lastWorkout: LastWorkoutSummary | null;
  progress: ProgressSummary;
  prs: PersonalRecordCard[];
  quickActions: QuickAction[];
};

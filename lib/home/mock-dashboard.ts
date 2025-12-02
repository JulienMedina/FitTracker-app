import type { HomeDashboardPayload, ProgressRange } from "./types";

const workoutHistory = [
  {
    id: "w10",
    dateISO: "2024-11-14T18:05:00Z",
    durationMinutes: 68,
    volumeKg: 14840,
    topExercises: ["Back Squat", "Bench Press", "Seated Row"],
  },
  {
    id: "w9",
    dateISO: "2024-11-12T07:25:00Z",
    durationMinutes: 54,
    volumeKg: 10410,
    topExercises: ["Deadlift", "Pull-Up", "Leg Curl"],
  },
  {
    id: "w8",
    dateISO: "2024-11-10T16:10:00Z",
    durationMinutes: 62,
    volumeKg: 13220,
    topExercises: ["Incline Press", "DB Row", "Walking Lunges"],
  },
  {
    id: "w7",
    dateISO: "2024-11-08T06:55:00Z",
    durationMinutes: 49,
    volumeKg: 9100,
    topExercises: ["Overhead Press", "Front Squat", "Lat Pulldown"],
  },
  {
    id: "w6",
    dateISO: "2024-11-06T19:15:00Z",
    durationMinutes: 72,
    volumeKg: 15080,
    topExercises: ["Back Squat", "Romanian Deadlift", "Hip Thrust"],
  },
  {
    id: "w5",
    dateISO: "2024-11-04T18:40:00Z",
    durationMinutes: 58,
    volumeKg: 11890,
    topExercises: ["Bench Press", "Row", "Face Pull"],
  },
  {
    id: "w4",
    dateISO: "2024-11-02T08:20:00Z",
    durationMinutes: 53,
    volumeKg: 10010,
    topExercises: ["Trap Bar Deadlift", "Pull-Up", "Split Squat"],
  },
  {
    id: "w3",
    dateISO: "2024-10-31T17:05:00Z",
    durationMinutes: 65,
    volumeKg: 13980,
    topExercises: ["Back Squat", "Bench Press", "Bent Over Row"],
  },
  {
    id: "w2",
    dateISO: "2024-10-29T06:35:00Z",
    durationMinutes: 47,
    volumeKg: 8620,
    topExercises: ["Shoulder Press", "Dip", "Leg Press"],
  },
  {
    id: "w1",
    dateISO: "2024-10-27T09:15:00Z",
    durationMinutes: 59,
    volumeKg: 12430,
    topExercises: ["Deadlift", "Pull-Down", "Lunge"],
  },
];

const progressByRange = {
  "7d": {
    points: [
      { label: "Jeu", value: 12400 },
      { label: "Ven", value: 9800 },
      { label: "Sam", value: 14250 },
      { label: "Dim", value: 11020 },
      { label: "Lun", value: 13640 },
      { label: "Mar", value: 10100 },
      { label: "Mer", value: 14840 },
    ],
    totalVolume: 86050,
    changePercentage: 12,
  },
  "14d": {
    points: [
      { label: "S1", value: 7200 },
      { label: "S2", value: 9600 },
      { label: "S3", value: 11800 },
      { label: "S4", value: 14200 },
      { label: "S5", value: 15100 },
      { label: "S6", value: 13200 },
      { label: "S7", value: 14840 },
    ],
    totalVolume: 81200,
    changePercentage: 17,
  },
  "28d": {
    points: [
      { label: "S1", value: 5400 },
      { label: "S2", value: 8900 },
      { label: "S3", value: 10300 },
      { label: "S4", value: 11100 },
      { label: "S5", value: 12750 },
      { label: "S6", value: 13200 },
      { label: "S7", value: 14020 },
      { label: "S8", value: 15210 },
    ],
    totalVolume: 89680,
    changePercentage: 22,
  },
};

const personalRecords = [
  {
    id: "pr1",
    exercise: "Back Squat",
    bestValue: 147.5,
    unit: "kg",
    dateISO: "2024-11-02T08:00:00Z",
  },
  {
    id: "pr2",
    exercise: "Bench Press",
    bestValue: 112.5,
    unit: "kg",
    dateISO: "2024-10-26T17:00:00Z",
  },
  {
    id: "pr3",
    exercise: "Deadlift",
    bestValue: 185,
    unit: "kg",
    dateISO: "2024-10-20T09:00:00Z",
  },
  {
    id: "pr4",
    exercise: "Overhead Press",
    bestValue: 72.5,
    unit: "kg",
    dateISO: "2024-10-14T07:30:00Z",
  },
  {
    id: "pr5",
    exercise: "Weighted Pull-Up",
    bestValue: 45,
    unit: "kg",
    dateISO: "2024-10-10T18:45:00Z",
  },
  {
    id: "pr6",
    exercise: "Hip Thrust",
    bestValue: 180,
    unit: "kg",
    dateISO: "2024-10-05T15:20:00Z",
  },
];

const quickActions = [
  {
    id: "add-exercise",
    label: "Ajouter exercice",
    subLabel: "Créer un mouvement",
    icon: "add-circle-outline",
    route: "/exercises/new",
  },
  {
    id: "timer-60",
    label: "Timer 60s",
    subLabel: "Repos rapide",
    icon: "timer-outline",
    route: "/workout",
  },
  {
    id: "history",
    label: "Historique",
    subLabel: "Dernières séances",
    icon: "time-outline",
    route: "/history",
  },
  {
    id: "exercises",
    label: "Exercices",
    subLabel: "Parcourir la base",
    icon: "barbell-outline",
    route: "/exercises",
  },
];

const formatShortDate = (value: string) => {
  const formatter = new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const label = formatter.format(new Date(value));
  return label.charAt(0).toUpperCase() + label.slice(1);
};

export const fetchMockDashboard = async (
  range: ProgressRange
): Promise<HomeDashboardPayload> => {
  const lastWorkout = workoutHistory[0];
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        lastWorkout: lastWorkout
          ? {
              id: lastWorkout.id,
              dateLabel: formatShortDate(lastWorkout.dateISO),
              durationMinutes: lastWorkout.durationMinutes,
              volumeKg: lastWorkout.volumeKg,
              topExercises: lastWorkout.topExercises.slice(0, 3),
            }
          : null,
        progress: {
          range,
          ...progressByRange[range],
        },
        prs: personalRecords.map((record) => ({
          id: record.id,
          exercise: record.exercise,
          bestValue: record.bestValue,
          unit: record.unit,
          dateLabel: formatShortDate(record.dateISO),
        })),
        quickActions,
      });
    }, 250);
  });
};

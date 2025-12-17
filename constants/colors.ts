// Mapping des couleurs pour les composants qui nécessitent des valeurs hexadécimales directes
// (comme les icônes Ionicons qui ne supportent pas les classes Tailwind)
export const Colors = {
  dark: "#0A1020", // Fond principal
  card: "#10172A", // Cartes
  border: "#1E2A38", // Bordures
  light: "#E6F0FF", // Texte principal
  muted: "#9FB3C8", // Texte secondaire
  positive: "#34C759", // Vert doux (statistiques)
  highlight: "#39FF88", // Vert fluo (CTA uniquement)
  accent: "#007AFF", // Bleu Apple (titres)
  error: "#FF6B6B", // Couleur d'erreur/avertissement
};

export type ColorKey = keyof typeof Colors;
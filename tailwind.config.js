/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],

  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        dark: "#0A1020", // Fond principal
        card: "#10172A", // Cartes
        border: "#1E2A38", // Bordures
        light: "#E6F0FF", // Texte principal
        muted: "#9FB3C8", // Texte secondaire
        positive: "#34C759", // Vert doux (statistiques)
        highlight: "#39FF88", // Vert fluo (CTA uniquement)
        accent: "#007AFF", // Bleu Apple (titres)
      },
    },
  },
  plugins: [],
};

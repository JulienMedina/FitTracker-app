import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Text, View } from "react-native";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useDatabaseReady } from "@/lib/db/init";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { ready, error } = useDatabaseReady();

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-black/90 px-6">
        <Text className="mb-2 text-center text-lg font-semibold text-white">
          Impossible d'initialiser la base locale
        </Text>
        <Text className="text-center text-base text-white/70">{error.message}</Text>
      </View>
    );
  }

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="mt-4 text-base text-white/80">Préparation de l'app...</Text>
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

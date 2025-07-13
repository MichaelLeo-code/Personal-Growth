import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useAuth } from "@/my_hooks";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import React from "react";
import { ActivityIndicator, SafeAreaView } from "react-native";
import LoginPage from "./login";
import MainApp from "./main";

export default function RootLayout() {
  const { user, loading: authLoading } = useAuth();
  const colorScheme = useColorScheme();

  // Font loading
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Create custom theme based on color scheme
  const theme =
    colorScheme === "dark"
      ? {
          ...DarkTheme,
          colors: {
            ...DarkTheme.colors,
            background: Colors.dark.background,
          },
        }
      : {
          ...DefaultTheme,
          colors: {
            ...DefaultTheme.colors,
            background: Colors.light.background,
          },
        };

  if (!loaded || authLoading) {
    return (
      <ThemeProvider value={theme}>
        <SafeAreaView
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: Colors[colorScheme ?? "light"].background,
          }}
        >
          <ActivityIndicator
            size="large"
            color={
              Colors[colorScheme as keyof typeof Colors]?.accent ||
              Colors.light.accent
            }
          />
        </SafeAreaView>
      </ThemeProvider>
    );
  }

  if (!user) {
    return (
      <ThemeProvider value={theme}>
        <LoginPage />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={theme}>
      <MainApp />
    </ThemeProvider>
  );
}

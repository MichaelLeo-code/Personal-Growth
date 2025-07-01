import { useAuth } from "@/my_hooks";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import React from "react";
import { ActivityIndicator, SafeAreaView } from "react-native";
import LoginPage from "./login";
import MainApp from "./main";

export default function RootLayout() {
  const { user, loading: authLoading } = useAuth();

  // Font loading
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded || authLoading) {
    return (
      <ThemeProvider value={DarkTheme}>
        <SafeAreaView
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#000",
          }}
        >
          <ActivityIndicator size="large" color="#007AFF" />
        </SafeAreaView>
      </ThemeProvider>
    );
  }

  // Show login page if user is not authenticated
  if (!user) {
    return <LoginPage />;
  }

  // Show main app if user is authenticated
  return (
    <ThemeProvider value={DarkTheme}>
      <MainApp />
    </ThemeProvider>
  );
}

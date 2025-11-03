import { Colors } from "@/constants/Colors";
import { ConflictResolverProvider } from "@/containers";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useAuth } from "@/my_hooks";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { ActivityIndicator } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import MainApp from "./main";

export default function RootLayout() {
  const { loading: authLoading } = useAuth();
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
      <SafeAreaProvider>
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
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={theme}>
        <ConflictResolverProvider>
          <MainApp />
        </ConflictResolverProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

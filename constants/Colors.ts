/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    text: "#11181C",
    textSecondary: "#687076",
    textMuted: "#9BA1A6",
    background: "#fff",
    surface: "#f8f9fa",
    surfaceSecondary: "#e9ecef",
    tint: tintColorLight,
    accent: "#007AFF",
    success: "#4CAF50",
    warning: "#FF9500",
    error: "#FF3B30",
    border: "#e9ecef",
    borderSecondary: "#dee2e6",
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
    shadow: "#000",
  },
  dark: {
    text: "#ECEDEE",
    textSecondary: "#9BA1A6",
    textMuted: "#687076",
    background: "#000",
    surface: "#151718",
    surfaceSecondary: "#303133",
    tint: tintColorDark,
    accent: "#007AFF",
    success: "#4CAF50",
    warning: "#FF9500",
    error: "#FF3B30",
    border: "#6d6d6e",
    borderSecondary: "#444444",
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    shadow: "#fff",
  },
};

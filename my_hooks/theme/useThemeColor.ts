/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "./useColorScheme";

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? "light";
  const colorFromProps = props[theme as keyof typeof props];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme as keyof typeof Colors][colorName];
  }
}

export function useThemeColors() {
  const theme = useColorScheme() ?? "light";
  return Colors[theme as keyof typeof Colors];
}

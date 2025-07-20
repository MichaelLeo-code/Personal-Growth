/**
 * Shared styling constants and reusable styles for the app
 */

import { StyleSheet } from "react-native";

// Spacing system
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 40,
};

// Typography scale
export const Typography = {
  caption: {
    fontSize: 12,
    lineHeight: 16,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "600" as const,
  },
  titleLarge: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "bold" as const,
  },
  headline: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "bold" as const,
  },
  display: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "bold" as const,
  },
};

// Border radius system
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 999,
};

export const Stroke = {
  sm: 1,
  md: 1.5,
  lg: 3,
};

export const Shadows = {
  small: {
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  medium: {
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 7,
    elevation: 5,
  },
  large: {
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 7,
  },
};

export const CommonStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  column: {
    flexDirection: "column",
  },
  flex1: {
    flex: 1,
  },
  textCenter: {
    textAlign: "center",
  },
  // Button base styles
  buttonBase: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  buttonSmall: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    minHeight: 32,
  },
  buttonLarge: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    minHeight: 52,
  },
  // Input base styles
  inputBase: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: Typography.bodyLarge.fontSize,
    minHeight: 44,
  },
  // Card styles
  cardBase: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    ...Shadows.small,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    margin: Spacing.lg,
    maxWidth: 400,
    width: "90%",
    ...Shadows.large,
  },
});

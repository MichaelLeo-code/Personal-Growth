import { BorderRadius, Shadows, Spacing, Typography } from "@/constants";
import { useThemeColors } from "@/my_hooks";
import React from "react";
import {
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialCommunityIcons";

export type FloatingButtonProps = {
  onPress: (event: GestureResponderEvent) => void;
  style?: ViewStyle;
  size?: number;
  contentColor?: string;
  backgroundColor?: string;
  pressedColor?: string;
  iconName?: string;
  label?: string;
};

export const FloatingButton: React.FC<FloatingButtonProps> = ({
  onPress,
  style,
  size = 24,
  contentColor,
  backgroundColor,
  pressedColor,
  iconName,
  label,
}) => {
  const colors = useThemeColors();
  const isIcon = !!iconName && !label;

  // Use theme colors as defaults
  const defaultContentColor = contentColor || colors.background;
  const defaultBackgroundColor = backgroundColor || colors.accent;
  const defaultPressedColor = pressedColor || colors.tint;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.baseButton,
        {
          backgroundColor: pressed
            ? defaultPressedColor
            : defaultBackgroundColor,
          borderRadius: isIcon ? 28 : BorderRadius.md,
          paddingHorizontal: isIcon ? 0 : Spacing.lg,
          width: isIcon ? 56 : undefined,
          height: isIcon ? 56 : 42,
        },
        pressed && styles.pressedShadow,
        style,
      ]}
    >
      {label ? (
        <Text style={[styles.label, { color: defaultContentColor }]}>
          {label}
        </Text>
      ) : (
        <MaterialIcons
          name={iconName!}
          size={size}
          color={defaultContentColor}
        />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    ...Shadows.medium,
  },
  label: {
    ...Typography.caption,
    fontWeight: "500",
  },
  pressedShadow: {
    ...Shadows.small,
  },
});

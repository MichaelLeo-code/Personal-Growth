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
  contentColor = "#fff",
  backgroundColor = "#6200ee",
  pressedColor = "#3700b3",
  iconName,
  label,
}) => {
  const isIcon = !!iconName && !label;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.baseButton,
        {
          backgroundColor: pressed ? pressedColor : backgroundColor,
          borderRadius: isIcon ? 28 : 8,
          paddingHorizontal: isIcon ? 0 : 16,
          width: isIcon ? 56 : undefined,
          height: isIcon ? 56 : 42,
        },
        pressed && styles.pressedShadow,
        style,
      ]}
    >
      {label ? (
        <Text style={[styles.label, { color: contentColor }]}>{label}</Text>
      ) : (
        <MaterialIcons name={iconName!} size={size} color={contentColor} />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
  },
  pressedShadow: {
    elevation: 2,
  },
});

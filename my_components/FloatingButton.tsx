import React from "react";
import {
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";

type Props = {
  onPress: (event: GestureResponderEvent) => void;
  style?: ViewStyle;
  size?: number;
  color?: string;
  backgroundColor?: string;
  pressedColor?: string;
};

export const FloatingButton: React.FC<Props> = ({
  onPress,
  style,
  size = 24,
  color = "#fff",
  backgroundColor = "#6200ee",
  pressedColor = "#3700b3",
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: pressed ? pressedColor : backgroundColor },
        pressed && styles.pressedShadow,
        style,
      ]}
    >
      <Text style={{ fontSize: size, color, lineHeight: size }}>+</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
  pressedShadow: {
    elevation: 2,
  },
});

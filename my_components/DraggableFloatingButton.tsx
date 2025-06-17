import React from "react";
import {
  GestureResponderEvent,
  PanResponder,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialCommunityIcons";

type Props = {
  onPress: (event: GestureResponderEvent) => void;
  onLongPressStart?: (event: GestureResponderEvent) => void;
  onDrag?: (event: GestureResponderEvent) => void;
  onLongPressEnd?: (event: GestureResponderEvent) => void;
  style?: ViewStyle;
  size?: number;
  color?: string;
  backgroundColor?: string;
  iconName?: string;
  label?: string;
};

export const DraggableFloatingButton: React.FC<Props> = ({
  onPress,
  onLongPressStart,
  onDrag,
  onLongPressEnd,
  style,
  size = 24,
  color = "#fff",
  backgroundColor = "#6200ee",
  iconName,
  label,
}) => {
  const isIcon = !!iconName && !label;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,

    onPanResponderGrant: (evt) => {
      onLongPressStart?.(evt);
    },

    onPanResponderMove: (evt) => {
      onDrag?.(evt);
    },

    onPanResponderRelease: (evt) => {
      onLongPressEnd?.(evt);
    },

    onPanResponderTerminate: (evt) => {
      onLongPressEnd?.(evt);
    },
  });

  return (
    <View
      {...panResponder.panHandlers}
      style={[
        styles.baseButton,
        {
          backgroundColor: backgroundColor,
          borderRadius: isIcon ? 28 : 8,
          paddingHorizontal: isIcon ? 0 : 16,
          width: isIcon ? 56 : undefined,
          height: isIcon ? 56 : 42,
        },
        style,
      ]}
    >
      {label ? (
        <Text style={[styles.label, { color }]}>{label}</Text>
      ) : (
        <MaterialIcons name={iconName!} size={size} color={color} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
  },
});

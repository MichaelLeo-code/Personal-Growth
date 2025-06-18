import React from "react";
import { GestureResponderEvent, PanResponder, View } from "react-native";
import { FloatingButton, FloatingButtonProps } from "./FloatingButton";

type Props = FloatingButtonProps & {
  onLongPressStart?: (event: GestureResponderEvent) => void;
  onDrag?: (event: GestureResponderEvent) => void;
  onLongPressEnd?: (event: GestureResponderEvent) => void;
};

export const DraggableFloatingButton: React.FC<Props> = (props) => {
  const { onLongPressStart, onDrag, onLongPressEnd, ...rest } = props;
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
    <View {...panResponder.panHandlers}>
      <FloatingButton {...rest} />
    </View>
  );
};

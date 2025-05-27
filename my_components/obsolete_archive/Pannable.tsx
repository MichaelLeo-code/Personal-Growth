import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

export function Pannable({ children }: { children: React.ReactNode }) {
  const scale = useSharedValue(1);
  const baseScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const focalX = useSharedValue(width / 2);
  const focalY = useSharedValue(height / 2);
  const originX = useSharedValue(0);
  const originY = useSharedValue(0);

  const panGesture = Gesture.Pan().onChange((e) => {
    translateX.value += e.changeX;
    translateY.value += e.changeY;
  });

  const pinchGesture = Gesture.Pinch()
    .onStart((e) => {
      originX.value = e.focalX;
      originY.value = e.focalY;
    })
    .onUpdate((e) => {
      const newScale = baseScale.value * e.scale;
      const dx = e.focalX - originX.value;
      const dy = e.focalY - originY.value;

      focalX.value = e.focalX;
      focalY.value = e.focalY;

      translateX.value += dx - (e.scale - 1) * (e.focalX - width / 2);
      translateY.value += dy - (e.scale - 1) * (e.focalY - height / 2);

      scale.value = newScale;

      originX.value = e.focalX;
      originY.value = e.focalY;
    })
    .onEnd(() => {
      baseScale.value = scale.value;
    });

  const composed = Gesture.Simultaneous(panGesture, pinchGesture);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  return (
    <View style={styles.root}>
      <GestureDetector gesture={composed}>
        <View style={styles.mask}>
          <Animated.View style={[styles.zoomLayer, animatedStyle]}>
            <View style={styles.square} />
          </Animated.View>
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#eee",
  },
  mask: {
    flex: 1,
    overflow: "hidden",
  },
  zoomLayer: {
    width: width * 2,
    height: height * 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eee",
  },
  square: {
    width: 100,
    height: 100,
    backgroundColor: "red",
  },
});

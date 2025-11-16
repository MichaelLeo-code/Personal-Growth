import React from "react";
import { StyleSheet, View } from "react-native";

type FireAnimationProps = {
  cellX: number;
  cellY: number;
  cellSize: number;
  cellWidth: number;
  cellHeight: number;
};

export const FireAnimation: React.FC<FireAnimationProps> = ({
  cellX,
  cellY,
  cellSize,
  cellWidth,
  cellHeight,
}) => {
  return (
    <View
      style={[
        styles.container,
        {
          left: cellX * cellSize - 5,
          top: cellY * cellSize - 5,
          width: cellWidth + 10,
          height: cellHeight + 10
        },
      ]}
      pointerEvents="none"
    >
      {/* Orange outer border */}
      <View style={styles.orangeBorder} />
      
      {/* Yellow inner border */}
      <View style={styles.yellowBorder} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    pointerEvents: "none",
    zIndex: 1,
  },
  orangeBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 3,
    borderColor: "#FF6600",
    borderRadius: 2,
  },
  yellowBorder: {
    position: "absolute",
    top: 3,
    left: 3,
    right: 3,
    bottom: 3,
    borderWidth: 2,
    borderColor: "#FFFF00",
    borderRadius: 1,
  },
});

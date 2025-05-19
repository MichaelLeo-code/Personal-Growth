import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Cell = {
  text: string;
  x: number;
  y: number;
};

type GridProps = {
  cells: Cell[];
  cellSize?: number;
};

export const Grid: React.FC<GridProps> = ({ cells, cellSize = 50 }) => {
  return (
    <View style={styles.grid}>
      {cells.map((cell, index) => (
        <View
          key={index}
          style={[
            styles.cell,
            {
              left: cell.x * cellSize,
              top: cell.y * cellSize,
              width: cellSize,
              height: cellSize,
            },
          ]}
        >
          <Text style={styles.text}>{cell.text}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    position: "relative",
    width: "100%",
    height: "100%",
  },
  cell: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 16,
    color: "#fff",
  },
});

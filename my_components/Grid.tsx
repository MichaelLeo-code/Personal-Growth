// Grid.tsx
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Cell, gridStore } from "../store/GridStore";

type GridProps = {
  initialCells: Cell[];
  cellSize?: number;
};

export const Grid: React.FC<GridProps> = ({ initialCells, cellSize = 50 }) => {
  const [cells, setCells] = useState<Cell[]>([]);

  useEffect(() => {
    initialCells.forEach((cell) => gridStore.addCell(cell));
    setCells(gridStore.getCells());
    const unsubscribe = gridStore.subscribe(() => {
      setCells(gridStore.getCells());
    });
    return unsubscribe;
  }, [initialCells]);

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

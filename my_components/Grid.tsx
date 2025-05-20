import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Cell, gridStore } from "../store/GridStore";

type GridProps = {
  initialCells: Cell[];
  cellSize?: number;
};

export const Grid: React.FC<GridProps> = ({ initialCells, cellSize = 50 }) => {
  const [cells, setCells] = useState<Cell[]>([]);
  const [selected, setSelected] = useState<Cell | null>(null);

  useEffect(() => {
    initialCells.forEach((cell) => gridStore.addCell(cell));
    setCells(gridStore.getCells());
    setSelected(gridStore.getSelected());
    const unsubscribe = gridStore.subscribe(() => {
      setCells(gridStore.getCells());
      setSelected(gridStore.getSelected());
    });
    return unsubscribe;
  }, []);

  const handlePress = (cell: Cell) => {
    gridStore.selectCell(cell);
  };

  return (
    <View style={styles.grid}>
      {cells.map((cell, index) => {
        const isSelected = selected?.x === cell.x && selected?.y === cell.y;
        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.cell,
              {
                left: cell.x * cellSize,
                top: cell.y * cellSize,
                width: cellSize,
                height: cellSize,
                backgroundColor: isSelected ? "#555" : "#000",
              },
            ]}
            onPress={() => handlePress(cell)}
          >
            <Text style={styles.text}>{cell.text}</Text>
          </TouchableOpacity>
        );
      })}
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

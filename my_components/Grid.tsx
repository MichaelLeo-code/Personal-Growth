import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { usePopup } from "../my_hooks/usePopup";
import { gridStore } from "../store/GridStore";
import { Cell, CellType } from "../types/cells";
import { CellLines } from "./CellLines";
import { TaskPopup } from "./popup";

type GridProps = {
  cellSize?: number;
  cells: Cell[];
  selected?: Cell | null;
};

export const Grid: React.FC<GridProps> = ({
  cellSize = 50,
  cells,
  selected,
}) => {
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  const { showPopup, hidePopup, isVisible } = usePopup();

  const handlePress = (cell: Cell) => {
    gridStore.selectCell(cell);
  };

  const handleButtonPress = (cell: Cell) => {
    setSelectedCell(cell);
    showPopup(null);
  };

  return (
    <View style={styles.grid}>
      <CellLines cells={cells} cellSize={cellSize} />
      {cells.map((cell, index) => {
        const isSelected = selected?.x === cell.x && selected?.y === cell.y;
        const sizeMultiplier = cell.type === CellType.Headline ? 1 : 3;
        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.cell,
              {
                left: cell.x * cellSize,
                top: cell.y * cellSize,
                width: cellSize * sizeMultiplier,
                height: cellSize * sizeMultiplier,
                backgroundColor: isSelected ? "#555" : "#000",
              },
            ]}
            onPress={() => handlePress(cell)}
          >
            <View style={styles.cellContent}>
              <Text style={styles.text}>{cell.text}</Text>
              {cell.type === CellType.Tasklist && (
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleButtonPress(cell)}
                >
                  <Text style={styles.buttonText}>Action</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
      {selectedCell?.type === CellType.Tasklist && (
        <TaskPopup
          cell={selectedCell}
          hidePopup={hidePopup}
          isVisible={isVisible}
        />
      )}
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
  cellContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 4,
  },
  button: {
    backgroundColor: "#444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 12,
  },
});

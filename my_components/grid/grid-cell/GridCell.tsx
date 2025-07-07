import React, { useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { totalCompletedCost, totalCost } from "../../../service/taskService";
import { Cell, CellType } from "../../../types/cells";
import { ProgressBar } from "./ProgressBar";

type GridCellProps = {
  cell: Cell;
  cellSize: number;
  isSelected: boolean;
  isDimmed?: boolean;
  onPress: (cell: Cell) => void;
  onDoublePress: (cell: Cell) => void;
  onLongPress: (cell: Cell) => void;
};

const TaskPreview: React.FC<{ text: string; completed: boolean }> = ({
  text,
  completed,
}) => (
  <View style={styles.taskPreview}>
    <View style={[styles.checkbox, completed && styles.checkboxCompleted]}>
      {completed && <Text style={styles.checkmark}>✓</Text>}
    </View>
    <Text style={styles.taskText} numberOfLines={1}>
      {text}
    </Text>
  </View>
);

export const GridCell: React.FC<GridCellProps> = ({
  cell,
  cellSize,
  isSelected,
  isDimmed = false,
  onPress,
  onDoublePress,
  onLongPress,
}) => {
  const sizeMultiplier = cell.type === CellType.Headline ? 1 : 3;
  const total = totalCost(cell.id);
  const completed = totalCompletedCost(cell.id);
  const lastTap = useRef<number>(0);

  const handlePress = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;

    if (now - lastTap.current < DOUBLE_PRESS_DELAY) {
      onDoublePress(cell);
    } else {
      onPress(cell);
    }

    lastTap.current = now;
  };

  return (
    <TouchableOpacity
      style={[
        styles.cell,
        {
          left: cell.x * cellSize,
          top: cell.y * cellSize,
          width: cellSize * sizeMultiplier,
          height: cellSize * sizeMultiplier,
          backgroundColor: isSelected ? "#555" : "#000",
          opacity: isDimmed ? 0.2 : 1,
        },
      ]}
      onPress={handlePress}
      onLongPress={() => onLongPress(cell)}
    >
      <View style={styles.cellContent}>
        <Text style={styles.text}>{cell.text}</Text>
        {cell.type === CellType.Tasklist && cell.tasks && (
          <View style={styles.tasksContainer}>
            {cell.tasks.slice(0, 3).map((task) => (
              <TaskPreview
                key={task.id}
                text={task.text}
                completed={task.completed}
              />
            ))}
            {cell.tasks.length > 3 && (
              <Text style={styles.moreTasks}>
                +{cell.tasks.length - 3} more
              </Text>
            )}
          </View>
        )}
        <ProgressBar completed={completed} total={total} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
    width: "100%",
    padding: 8,
  },
  text: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 4,
  },
  tasksContainer: {
    width: "100%",
    marginTop: 4,
  },
  taskPreview: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: "#fff",
    marginRight: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxCompleted: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  checkmark: {
    color: "#fff",
    fontSize: 12,
  },
  taskText: {
    color: "#fff",
    fontSize: 12,
    flex: 1,
  },
  moreTasks: {
    color: "#888",
    fontSize: 10,
    marginTop: 2,
    textAlign: "center",
  },
});

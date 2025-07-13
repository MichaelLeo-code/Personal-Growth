import React, { useRef } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { completeTask } from "../../../service/taskService";
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

const TaskPreview: React.FC<{
  text: string;
  completed: boolean;
  taskId: number;
  cellId: number;
  onCheckboxPress: (taskId: number, cellId: number, completed: boolean) => void;
}> = ({ text, completed, taskId, cellId, onCheckboxPress }) => (
  <View style={styles.taskPreview}>
    <Pressable
      style={[styles.checkbox, completed && styles.checkboxCompleted]}
      onPress={() => onCheckboxPress(taskId, cellId, !completed)}
    >
      {completed && <Text style={styles.checkmark}>✓</Text>}
    </Pressable>
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

  const handleCheckboxPress = (
    taskId: number,
    cellId: number,
    completed: boolean
  ) => {
    completeTask(taskId, cellId, completed);
  };

  return (
    <View
      style={{
        position: "absolute",
        left: cell.x * cellSize,
        top: cell.y * cellSize,
      }}
    >
      <TouchableOpacity
        style={[
          styles.cell,
          {
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
          <Text
            style={[
              styles.text,
              cell.type === CellType.Headline && styles.headlineText,
            ]}
          >
            {cell.text}
          </Text>
          {cell.type === CellType.Tasklist && cell.tasks && (
            <View style={styles.tasksContainer}>
              {cell.tasks.slice(0, 3).map((task) => (
                <TaskPreview
                  key={task.id}
                  text={task.text}
                  completed={task.completed}
                  taskId={task.id}
                  cellId={cell.id}
                  onCheckboxPress={handleCheckboxPress}
                />
              ))}
              {cell.tasks.length > 3 && (
                <Text style={styles.moreTasks}>
                  +{cell.tasks.length - 3} more
                </Text>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
      <View
        style={[
          styles.progressBarContainer,
          { width: cellSize * sizeMultiplier },
        ]}
      >
        <ProgressBar
          cellId={cell.id}
          textPosition={cell.type === CellType.Headline ? "bottom" : "right"}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cell: {
    position: "relative",
    borderWidth: 1,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  progressBarContainer: {
    marginTop: 4,
    paddingHorizontal: 4,
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
    textAlign: "center",
  },
  headlineText: {
    fontSize: 12,
    marginBottom: 2,
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

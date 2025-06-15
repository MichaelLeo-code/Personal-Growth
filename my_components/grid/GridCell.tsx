import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { totalCompletedCost, totalCost } from "../../service/taskService";
import { Cell, CellType } from "../../types/cells";

type GridCellProps = {
  cell: Cell;
  cellSize: number;
  isSelected: boolean;
  onPress: (cell: Cell) => void;
  onButtonPress: (cell: Cell) => void;
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

const ProgressBar: React.FC<{ completed: number; total: number }> = ({
  completed,
  total,
}) => {
  const percentage = total === 0 ? 0 : (completed / total) * 100;
  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${percentage}%` }]} />
      </View>
      <Text style={styles.progressText}>
        {completed}/{total}
      </Text>
    </View>
  );
};

export const GridCell: React.FC<GridCellProps> = ({
  cell,
  cellSize,
  isSelected,
  onPress,
  onButtonPress,
}) => {
  const sizeMultiplier = cell.type === CellType.Headline ? 1 : 3;
  const total = totalCost(cell.id);
  const completed = totalCompletedCost(cell.id);

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
        },
      ]}
      onPress={() => onPress(cell)}
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
        {cell.type === CellType.Tasklist && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => onButtonPress(cell)}
          >
            <Text style={styles.buttonText}>Action</Text>
          </TouchableOpacity>
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
  progressContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#333",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
  },
  progressText: {
    color: "#888",
    fontSize: 10,
    minWidth: 40,
    textAlign: "right",
  },
});

import { BorderRadius, Spacing, Typography } from "@/constants";
import { useThemeColors } from "@/my_hooks";
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
}> = ({ text, completed, taskId, cellId, onCheckboxPress }) => {
  const colors = useThemeColors();

  return (
    <View style={styles.taskPreview}>
      <Pressable
        style={[
          styles.checkbox,
          { borderColor: colors.text },
          completed && {
            backgroundColor: colors.success,
            borderColor: colors.success,
          },
        ]}
        onPress={() => onCheckboxPress(taskId, cellId, !completed)}
      >
        {completed && (
          <Text style={[styles.checkmark, { color: colors.background }]}>
            ✓
          </Text>
        )}
      </Pressable>
      <Text style={[styles.taskText, { color: colors.text }]} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
};

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
  const colors = useThemeColors();

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
            width: cellSize * cell.size.x,
            height: cellSize * cell.size.y,
            backgroundColor: isSelected
              ? colors.surfaceSecondary
              : colors.surface,
            borderColor: colors.border,
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
              { color: colors.text },
              cell.type === CellType.Headline && styles.headlineText,
            ]}
          >
            {cell.text}
          </Text>
          {cell.type === CellType.Tasklist && cell.tasks && (
            <View style={styles.tasksContainer}>
              {cell.tasks.map((task) => (
                <TaskPreview
                  key={task.id}
                  text={task.text}
                  completed={task.completed}
                  taskId={task.id}
                  cellId={cell.id}
                  onCheckboxPress={handleCheckboxPress}
                />
              ))}
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
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BorderRadius.sm,
    shadowColor: "#fff",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  progressBarContainer: {
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  cellContent: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: Spacing.sm,
  },
  text: {
    ...Typography.bodyLarge,
    marginBottom: Spacing.xs,
    textAlign: "center",
  },
  headlineText: {
    ...Typography.caption,
    marginBottom: Spacing.xs / 2,
  },
  tasksContainer: {
    width: "100%",
    marginTop: Spacing.xs,
  },
  taskPreview: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs / 2,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    marginRight: Spacing.xs,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BorderRadius.sm,
  },
  checkmark: {
    ...Typography.caption,
  },
  taskText: {
    ...Typography.caption,
    flex: 1,
  },
});

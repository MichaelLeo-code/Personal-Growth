import {
  BorderRadius,
  Shadows,
  Spacing,
  Stroke,
  Typography,
} from "@/constants";
import { useThemeColors } from "@/my_hooks";
import React, { useRef } from "react";
import {
  Platform,
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
  onLongPress: (cell: Cell) => (event: any) => void;
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
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPressing = useRef(false);
  const currentMouseEvent = useRef<any>(null);
  const colors = useThemeColors();

  const handlePress = () => {
    if (isLongPressing.current) {
      isLongPressing.current = false;
      return;
    }

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

  // Web-specific mouse handlers for better long press support
  const handleMouseDown = (event: any) => {
    console.log('📱 Mouse down', { clientX: event.clientX, clientY: event.clientY });
    currentMouseEvent.current = event;
    if (Platform.OS === 'web') {
      isLongPressing.current = false;
      longPressTimer.current = setTimeout(() => {
        console.log('📱 Long press triggered', { 
          clientX: currentMouseEvent.current?.clientX, 
          clientY: currentMouseEvent.current?.clientY 
        });
        isLongPressing.current = true;
        onLongPress(cell)(currentMouseEvent.current);
      }, 500); // 500ms for long press
    }
  };

  const handleMouseUp = () => {
    if (Platform.OS === 'web' && longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleMouseLeave = () => {
    if (Platform.OS === 'web' && longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
      isLongPressing.current = false;
    }
  };

  const handleLongPress = () => {
    // For mobile, use the TouchableOpacity's onLongPress
    // We need to create a synthetic event with approximate coordinates
    const syntheticEvent = {
      nativeEvent: {
        pageX: 0, // These will be overridden by the Grid's startCoordinates
        pageY: 0,
      },
    };
    onLongPress(cell)(syntheticEvent);
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
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: colors.shadow,
            opacity: isDimmed ? 0.5 : 1,
          },
          isSelected && {
            backgroundColor: colors.surfaceSecondary,
            ...Shadows.medium,
          },
        ]}
        onPress={handlePress}
        onLongPress={handleLongPress}
        onPressIn={handleMouseDown}
        onPressOut={handleMouseUp}
        // @ts-ignore - Web-specific event handlers
        onMouseDown={Platform.OS === 'web' ? handleMouseDown : undefined}
        onMouseUp={Platform.OS === 'web' ? handleMouseUp : undefined}
        onMouseLeave={Platform.OS === 'web' ? handleMouseLeave : undefined}
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
    borderWidth: Stroke.md,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BorderRadius.sm,
    ...Shadows.small,
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

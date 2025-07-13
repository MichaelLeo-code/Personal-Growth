import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Task } from "../../types";
import { useThemeColors } from "@/my_hooks";
import { Spacing, Typography, BorderRadius, CommonStyles } from "@/constants";

type TaskLineProps = {
  parentId: number;
  onTaskChange?: (task: Task) => void;
  onTaskDelete?: (taskId: number) => void;
  task?: Task;
};

export const TaskLine: React.FC<TaskLineProps> = ({
  parentId,
  onTaskChange,
  onTaskDelete,
  task: initialTask,
}) => {
  const [task, setTask] = useState<Task>(() => ({
    id: initialTask?.id ?? 0,
    text: initialTask?.text ?? "",
    completed: initialTask?.completed ?? false,
    cost: initialTask?.cost ?? 10,
  }));

  const [costText, setCostText] = useState<string>(() =>
    (initialTask?.cost ?? 10).toString()
  );

  const colors = useThemeColors();

  useEffect(() => {
    if (initialTask) {
      setTask(initialTask);
      setCostText(initialTask.cost.toString());
    }
  }, [initialTask]);

  const updateTask = (updates: Partial<Task>) => {
    const newTask = { ...task, ...updates };
    setTask(newTask);
    onTaskChange?.(newTask);
  };

  const handleCostChange = (value: string) => {
    setCostText(value);

    if (value === "") {
      return;
    }

    const cost = parseInt(value);
    if (!isNaN(cost) && cost >= 0) {
      updateTask({ cost });
    }
  };

  const onCostEditEnd = () => {
    if (costText === "" || isNaN(parseInt(costText))) {
      // Reset to current task cost if empty or invalid
      setCostText(task.cost.toString());
    } else {
      const cost = parseInt(costText);
      if (cost >= 0) {
        updateTask({ cost });
      } else {
        setCostText(task.cost.toString());
      }
    }
  };

  return (
    <View style={styles.taskLine}>
      <Pressable
        style={[
          styles.checkbox, 
          { borderColor: colors.border },
          task.completed && { backgroundColor: colors.surfaceSecondary }
        ]}
        onPress={() => updateTask({ completed: !task.completed })}
      />
      <TextInput
        style={[styles.textInput, { 
          borderColor: colors.border,
          backgroundColor: colors.surface,
          color: colors.text 
        }]}
        value={task.text}
        onChangeText={(text) => updateTask({ text })}
        placeholder="Enter task description"
        placeholderTextColor={colors.textMuted}
      />
      <TextInput
        style={[styles.numberInput, { 
          borderColor: colors.border,
          backgroundColor: colors.surface,
          color: colors.text 
        }]}
        value={costText}
        onChangeText={handleCostChange}
        onBlur={onCostEditEnd}
        placeholder="Cost"
        placeholderTextColor={colors.textMuted}
        keyboardType="numeric"
      />
      <Pressable
        style={[styles.deleteButton, { backgroundColor: colors.surfaceSecondary }]}
        onPress={() => onTaskDelete?.(task.id)}
      >
        <Text style={[styles.deleteButtonText, { color: colors.text }]}>×</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  taskLine: {
    ...CommonStyles.row,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: BorderRadius.sm,
    backgroundColor: "transparent",
  },
  textInput: {
    ...CommonStyles.inputBase,
    flex: 1,
    height: 40,
  },
  numberInput: {
    ...CommonStyles.inputBase,
    width: 80,
    height: 40,
  },
  deleteButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  deleteButtonText: {
    ...Typography.bodyLarge,
    lineHeight: 18,
    textAlign: "center",
  },
});

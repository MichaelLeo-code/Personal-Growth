import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Task } from "../../types";

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
        style={[styles.checkbox, task.completed && styles.checkboxChecked]}
        onPress={() => updateTask({ completed: !task.completed })}
      />
      <TextInput
        style={styles.textInput}
        value={task.text}
        onChangeText={(text) => updateTask({ text })}
        placeholder="Enter task description"
        placeholderTextColor="#666"
      />
      <TextInput
        style={styles.numberInput}
        value={costText}
        onChangeText={handleCostChange}
        onBlur={onCostEditEnd}
        placeholder="Cost"
        placeholderTextColor="#666"
        keyboardType="numeric"
      />
      <Pressable
        style={styles.deleteButton}
        onPress={() => onTaskDelete?.(task.id)}
      >
        <Text style={styles.deleteButtonText}>×</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  taskLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#666",
    borderRadius: 4,
    backgroundColor: "transparent",
  },
  checkboxChecked: {
    backgroundColor: "#444",
  },
  textInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 4,
    paddingHorizontal: 12,
    color: "#fff",
    backgroundColor: "#333",
  },
  numberInput: {
    width: 80,
    height: 40,
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 4,
    paddingHorizontal: 12,
    color: "#fff",
    backgroundColor: "#333",
  },
  deleteButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#444",
    borderRadius: 12,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 18,
    lineHeight: 18,
    textAlign: "center",
  },
});

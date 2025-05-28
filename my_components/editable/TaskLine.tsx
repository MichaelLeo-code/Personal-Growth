import { addTask } from "@/store/TaskStore";
import { Task } from "@/types/task";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type TaskLineProps = {
  parentId: number;
  task?: Task;
};

export const TaskLine: React.FC<TaskLineProps> = ({ parentId, task }) => {
  const [taskText, setTaskText] = useState(task?.text || "");
  const [isCompleted, setIsCompleted] = useState(task?.completed || false);
  const [cost, setCost] = useState(task?.cost?.toString() || "");

  const handleTextChange = (text: string) => {
    setTaskText(text);
    if (task) {
      // Update existing task
      addTask({ ...task, text }, parentId);
    }
  };

  const handleCompletedChange = (completed: boolean) => {
    setIsCompleted(completed);
    if (task) {
      // Update existing task
      addTask({ ...task, completed }, parentId);
    }
  };

  const handleCostChange = (newCost: string) => {
    setCost(newCost);
    if (task) {
      // Update existing task
      const costNumber = parseFloat(newCost) || 0;
      addTask({ ...task, cost: costNumber }, parentId);
    }
  };

  const handleDelete = () => {
    if (task) {
      // TODO: Implement delete task functionality
      console.log("Delete task:", task.id);
    }
  };

  const handleCreate = () => {
    if (!task && taskText) {
      const costNumber = parseFloat(cost) || 0;
      addTask(
        { text: taskText, completed: isCompleted, cost: costNumber },
        parentId
      );
      // Reset form
      setTaskText("");
      setIsCompleted(false);
      setCost("");
    }
  };

  return (
    <View style={styles.taskLine}>
      <Pressable
        style={[styles.checkbox, isCompleted && styles.checkboxChecked]}
        onPress={() => handleCompletedChange(!isCompleted)}
      />
      <TextInput
        style={styles.textInput}
        value={taskText}
        onChangeText={handleTextChange}
        placeholder="Enter task description"
        placeholderTextColor="#666"
        onSubmitEditing={handleCreate}
      />
      <TextInput
        style={styles.numberInput}
        value={cost}
        onChangeText={handleCostChange}
        placeholder="Cost"
        placeholderTextColor="#666"
        keyboardType="numeric"
      />
      {task && (
        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>×</Text>
        </Pressable>
      )}
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

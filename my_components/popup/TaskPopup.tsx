import { addTask, updateTask } from "@/store/TaskStore";
import { Task } from "@/types";
import { TaskListCell } from "@/types/cells";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { TaskLine } from "../editable/TaskLine";
import { Popup, PopupProps } from "./Popup";

type TaskPopupProps = Omit<PopupProps, "children"> & {
  cell: TaskListCell;
};

export const TaskPopup: React.FC<TaskPopupProps> = ({
  cell,
  isVisible,
  hidePopup,
}) => {
  const [tasks, setTasks] = useState<Task[]>(cell.tasks || []);

  const handleTaskChange = (task: Task) => {
    setTasks((prev) => {
      const index = prev.findIndex((t) => t.id === task.id);
      if (index === -1) {
        throw new Error("should not try update the task that does not exist");
      }
      const newTasks = [...prev];
      newTasks[index] = task;
      return newTasks;
    });
  };

  const handleSave = () => {
    tasks.forEach((task) => {
      updateTask(task.id, cell.id, task);
    });
    hidePopup();
  };

  const addNew = () => {
    const newTask = addTask({ text: "", completed: false, cost: 10 }, cell.id);
    if (newTask) {
      setTasks((prev) => {
        return [...prev, newTask];
      });
    }
  };

  return (
    <Popup
      isVisible={isVisible}
      hidePopup={hidePopup}
      title={cell.text}
      showCloseButton={false}
    >
      <View>
        {tasks.map((task) => (
          <TaskLine
            key={task.id}
            parentId={cell.id}
            task={task}
            onTaskChange={handleTaskChange}
          />
        ))}
        <Pressable style={styles.button} onPress={addNew}>
          <Text style={styles.buttonText}>+</Text>
        </Pressable>
        <View style={styles.buttonContainer}>
          <Pressable style={styles.button} onPress={hidePopup}>
            <Text style={styles.buttonText}>Cancel</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>Save</Text>
          </Pressable>
        </View>
      </View>
    </Popup>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  button: {
    backgroundColor: "#444",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
});

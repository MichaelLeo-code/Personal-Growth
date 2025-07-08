import { cellService } from "@/service";
import { addTask, updateTask } from "@/service/taskService";
import { Task } from "@/types";
import { TaskListCell } from "@/types/cells";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { TaskLine } from "../task/TaskLine";
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

  useEffect(() => {
    setTasks(cell.tasks || []);
  }, [cell]);

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

  const handleClose = () => {
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
      hidePopup={handleClose}
      title={cell.text}
      onTitleChange={(newTitle) => cellService.renameCell(cell.id, newTitle)}
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
      </View>
    </Popup>
  );
};

const styles = StyleSheet.create({
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

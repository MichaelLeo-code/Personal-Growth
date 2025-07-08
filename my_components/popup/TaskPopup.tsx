import { useThemeColor } from "@/hooks/useThemeColor";
import { cellService } from "@/service";
import {
  addTask,
  checkAndResetDailyTasks,
  deleteTask,
  updateTask,
} from "@/service/taskService";
import { Task } from "@/types";
import { TaskListCell } from "@/types/cells";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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
  const [modifiedTaskIds, setModifiedTaskIds] = useState<Set<number>>(
    new Set()
  );
  const [isDaily, setIsDaily] = useState<boolean>(cell.daily || false);

  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");

  const showTooltip = () => {
    Alert.alert(
      "Daily Tasks",
      "When enabled, all tasks in this list will be automatically reset to 'not completed' at midnight each day. This is perfect for daily routines, habits, or recurring tasks.",
      [{ text: "OK" }]
    );
  };

  useEffect(() => {
    const cellTasks = cell.tasks || [];
    setTasks(cellTasks);
    setModifiedTaskIds(new Set());
    setIsDaily(cell.daily || false);

    checkAndResetDailyTasks();
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

    setModifiedTaskIds((prev) => new Set(prev).add(task.id));
  };

  const handleTaskDelete = (taskId: number) => {
    const success = deleteTask(taskId, cell.id);
    if (success) {
      setTasks((prev) => prev.filter((task) => task.id !== taskId));

      setModifiedTaskIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };

  const handleClose = () => {
    tasks.forEach((task) => {
      if (modifiedTaskIds.has(task.id)) {
        updateTask(task.id, cell.id, task);
      }
    });

    if (isDaily !== (cell.daily || false)) {
      cellService.updateCellProperties(cell.id, {
        daily: isDaily,
        lastResetDate: isDaily ? new Date().toDateString() : undefined,
      });
    }

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
            onTaskDelete={handleTaskDelete}
          />
        ))}
        <Pressable style={styles.button} onPress={addNew}>
          <Text style={styles.buttonText}>+</Text>
        </Pressable>

        <View style={styles.toggleContainer}>
          <Text style={[styles.toggleLabel, { color: textColor }]}>Daily</Text>
          <View style={styles.switchContainer}>
            <Switch
              value={isDaily}
              onValueChange={setIsDaily}
              trackColor={{ false: "#767577", true: tintColor }}
              thumbColor={isDaily ? "#fff" : "#f4f3f4"}
              ios_backgroundColor="#767577"
            />
            <TouchableOpacity
              style={[styles.tooltipButton, { borderColor: tintColor }]}
              onPress={showTooltip}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={[styles.tooltipText, { color: tintColor }]}>?</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    paddingHorizontal: 4,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  tooltipButton: {
    marginLeft: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tooltipText: {
    fontSize: 14,
    fontWeight: "bold",
  },
});

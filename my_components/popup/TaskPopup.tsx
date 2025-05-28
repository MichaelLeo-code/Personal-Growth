import { TaskListCell } from "@/types/cells";
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
  if (!cell || cell.type !== "tasklist") {
    return null;
  }

  return (
    <Popup
      isVisible={isVisible}
      hidePopup={hidePopup}
      title={cell.text}
      showCloseButton={false}
    >
      <View>
        {cell.tasks?.map((task) => (
          <TaskLine key={task.id} parentId={cell.id} task={task} />
        ))}
        <TaskLine parentId={cell.id} />
        <View style={styles.buttonContainer}>
          <Pressable style={styles.button} onPress={hidePopup}>
            <Text style={styles.buttonText}>Close</Text>
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

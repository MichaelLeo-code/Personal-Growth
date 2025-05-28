import { Cell } from "@/types/cells";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { Popup, PopupProps } from "./";

type TaskPopupProps = Omit<PopupProps, "children"> & {
  cell: Cell | null;
};

export const TaskPopup: React.FC<TaskPopupProps> = ({
  cell,
  isVisible,
  hidePopup,
}) => {
  const handleTestLog = () => {
    console.log("Test log from popup for cell:", cell);
  };

  return (
    <Popup
      isVisible={isVisible}
      hidePopup={hidePopup}
      title="Cell Details"
      cell={cell}
    >
      <Text style={styles.modalText}>Cell Text: {cell?.text}</Text>
      <TouchableOpacity style={styles.testButton} onPress={handleTestLog}>
        <Text style={styles.testButtonText}>Test Log</Text>
      </TouchableOpacity>
    </Popup>
  );
};

const styles = StyleSheet.create({
  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },
  testButton: {
    backgroundColor: "#444",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  testButtonText: {
    color: "#fff",
    fontSize: 14,
  },
});

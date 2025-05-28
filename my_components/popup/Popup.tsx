import { Cell } from "@/types/cells";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type PopupProps = {
  isVisible: boolean;
  hidePopup: () => void;
  cell: Cell | null;
  title?: string;
  children: React.ReactNode;
};

export const Popup: React.FC<PopupProps> = ({ isVisible, hidePopup, cell }) => {
  const handleTestLog = () => {
    console.log("Test log from popup for cell:", cell);
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={hidePopup}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Cell Details</Text>
            <TouchableOpacity onPress={hidePopup} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            <Text style={styles.modalText}>Cell Text: {cell?.text}</Text>
            <TouchableOpacity style={styles.testButton} onPress={handleTestLog}>
              <Text style={styles.testButtonText}>Test Log</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    width: "80%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    color: "#666",
  },
  modalBody: {
    alignItems: "center",
  },
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

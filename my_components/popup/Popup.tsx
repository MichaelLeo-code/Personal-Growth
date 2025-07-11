import { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export type PopupProps = {
  isVisible: boolean;
  hidePopup: () => void;
  title?: string;
  children?: React.ReactNode;
  onTitleChange?: (newTitle: string) => void;
};

export const Popup: React.FC<PopupProps> = ({
  isVisible,
  hidePopup,
  title,
  children,
  onTitleChange,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title || "");

  const handleTitlePress = () => {
    setEditedTitle(title || "");
    setIsEditingTitle(true);
  };

  const handleTitleSubmit = () => {
    if (onTitleChange) {
      onTitleChange(editedTitle);
    }
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setEditedTitle(title || "");
    setIsEditingTitle(false);
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={hidePopup}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={hidePopup}
      >
        <TouchableOpacity
          style={styles.modalContent}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHeader}>
            {isEditingTitle ? (
              <View style={styles.titleEditContainer}>
                <TextInput
                  style={styles.titleInput}
                  value={editedTitle}
                  onChangeText={setEditedTitle}
                  onSubmitEditing={handleTitleSubmit}
                  onBlur={handleTitleCancel}
                  autoFocus={true}
                  selectTextOnFocus={true}
                />
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleTitlePress}
                style={styles.titleContainer}
              >
                <Text style={styles.modalTitle}>{title}</Text>
              </TouchableOpacity>
            )}
          </View>
          {children}
        </TouchableOpacity>
      </TouchableOpacity>
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
  titleContainer: {
    flex: 1,
    marginRight: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  titleEditContainer: {
    flex: 1,
    marginRight: 10,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 2,
  },
  modalBody: {
    alignItems: "center",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },
});

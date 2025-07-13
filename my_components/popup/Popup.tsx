import { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useThemeColors } from "@/my_hooks";
import { Spacing, Typography, BorderRadius, CommonStyles } from "@/constants";

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
  const colors = useThemeColors();

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
          style={[styles.modalContent, { backgroundColor: colors.surface }]}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHeader}>
            {isEditingTitle ? (
              <View style={styles.titleEditContainer}>
                <TextInput
                  style={[styles.titleInput, { 
                    color: colors.text,
                    borderBottomColor: colors.border 
                  }]}
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
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {title}
                </Text>
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
    ...CommonStyles.modalOverlay,
  },
  modalContent: {
    ...CommonStyles.modalContainer,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  titleContainer: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  modalTitle: {
    ...Typography.titleLarge,
  },
  titleEditContainer: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  titleInput: {
    ...Typography.titleLarge,
    borderBottomWidth: 1,
    paddingBottom: Spacing.xs / 2,
  },
  modalBody: {
    alignItems: "center",
  },
  modalText: {
    ...Typography.bodyLarge,
    marginBottom: Spacing.xl,
  },
});

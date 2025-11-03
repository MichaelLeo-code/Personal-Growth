import { BorderRadius, CommonStyles, Spacing, Typography } from "@/constants";
import { useThemeColors } from "@/my_hooks";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface WebConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const WebConfirmDialog: React.FC<WebConfirmDialogProps> = ({
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  const colors = useThemeColors();

  return (
    <View style={styles.overlay}>
      <View style={[styles.dialog, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
        <View style={styles.buttonContainer}>
          <Pressable
            style={[styles.button, { backgroundColor: colors.tint }]}
            onPress={onCancel}
          >
            <Text style={[styles.buttonText, { color: colors.background }]}>
              Cancel
            </Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.confirmButton, { backgroundColor: colors.error }]}
            onPress={onConfirm}
          >
            <Text style={[styles.buttonText, { color: colors.background }]}>
              OK
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...CommonStyles.modalOverlay,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  dialog: {
    ...CommonStyles.modalContainer,
  },
  title: {
    ...Typography.titleLarge,
    marginBottom: Spacing.md,
  },
  message: {
    ...Typography.bodyLarge,
    marginBottom: Spacing.xl,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.md,
  },
  button: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    minWidth: 80,
    alignItems: "center",
  },
  confirmButton: {
    marginLeft: Spacing.sm,
  },
  buttonText: {
    ...Typography.body,
    fontWeight: "600",
  },
});

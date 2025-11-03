import { BorderRadius, CommonStyles, Spacing, Typography } from "@/constants";
import { useThemeColors } from "@/my_hooks";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export interface DialogButton {
  label: string;
  subtext?: string;
  onPress: () => void | Promise<void>;
  variant?: "default" | "primary" | "danger";
  disabled?: boolean;
}

export interface DialogContent {
  title: string;
  message: string;
  warning?: string;
  details?: React.ReactNode;
}

interface ConfirmDialogProps {
  content: DialogContent;
  buttons: DialogButton[];
  onDismiss?: () => void;
  showLoading?: boolean;
  loadingText?: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  content,
  buttons,
  onDismiss,
  showLoading = false,
  loadingText,
}) => {
  const colors = useThemeColors();
  const [processingButton, setProcessingButton] = React.useState<number | null>(null);

  const handleButtonPress = async (button: DialogButton, index: number) => {
    if (button.disabled || processingButton !== null) return;

    setProcessingButton(index);
    try {
      await button.onPress();
      onDismiss?.();
    } catch (error) {
      console.error("Dialog button action failed:", error);
    } finally {
      setProcessingButton(null);
    }
  };

  const getButtonStyle = (variant?: string) => {
    switch (variant) {
      case "primary":
        return { backgroundColor: colors.error };
      case "danger":
        return { backgroundColor: colors.error };
      case "default":
      default:
        return { backgroundColor: colors.tint };
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={[styles.dialog, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          {content.title}
        </Text>
        
        <Text style={[styles.message, { color: colors.text }]}>
          {content.message}
        </Text>

        {content.details && (
          <View style={styles.detailsContainer}>
            {content.details}
          </View>
        )}

        {content.warning && (
          <Text style={[styles.warning, { color: colors.error }]}>
            {content.warning}
          </Text>
        )}

        <View style={styles.buttonContainer}>
          {buttons.map((button, index) => (
            <Pressable
              key={index}
              style={[
                styles.button,
                getButtonStyle(button.variant),
                (button.disabled || processingButton !== null) && styles.disabledButton,
                button.subtext && styles.buttonWithSubtext,
              ]}
              onPress={() => handleButtonPress(button, index)}
              disabled={button.disabled || processingButton !== null}
            >
              <Text style={[styles.buttonText, { color: colors.background }]}>
                {button.label}
              </Text>
              {button.subtext && (
                <Text style={[styles.buttonSubtext, { color: colors.background }]}>
                  {button.subtext}
                </Text>
              )}
            </Pressable>
          ))}
        </View>

        {(showLoading || processingButton !== null) && (
          <Text style={[styles.loadingText, { color: colors.text }]}>
            {loadingText || "Processing..."}
          </Text>
        )}
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
    maxWidth: 500,
    padding: Spacing.xl,
  },
  title: {
    ...Typography.titleLarge,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  message: {
    ...Typography.bodyLarge,
    marginBottom: Spacing.lg,
    textAlign: "center",
    lineHeight: 24,
  },
  detailsContainer: {
    marginBottom: Spacing.lg,
  },
  warning: {
    ...Typography.caption,
    marginBottom: Spacing.xl,
    textAlign: "center",
    fontWeight: "600",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    minWidth: 80,
  },
  buttonWithSubtext: {
    paddingVertical: Spacing.lg,
    minHeight: 70,
    justifyContent: "center",
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    ...Typography.body,
    fontWeight: "700",
  },
  buttonSubtext: {
    ...Typography.caption,
    fontSize: 11,
    opacity: 0.9,
    marginTop: Spacing.xs,
  },
  loadingText: {
    ...Typography.caption,
    textAlign: "center",
    marginTop: Spacing.md,
    fontStyle: "italic",
  },
});

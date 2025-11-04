import { BorderRadius, Spacing, Typography } from "@/constants";
import { useThemeColors } from "@/my_hooks";
import { ConflictResolutionChoice } from "@/storage/hybridGridStorage3";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ConfirmDialog, DialogButton, DialogContent } from "../shared";

interface ConflictResolutionDialogProps {
  localCellsCount: number;
  remoteCellsCount: number;
  conflictMessage: string;
  onResolve: (choice: ConflictResolutionChoice) => Promise<void>;
  onDismiss?: () => void;
}

export const ConflictResolutionDialog: React.FC<ConflictResolutionDialogProps> = ({
  localCellsCount,
  remoteCellsCount,
  conflictMessage,
  onResolve,
  onDismiss,
}) => {
  const colors = useThemeColors();

  const content: DialogContent = {
    title: "Sync Conflict Detected",
    message: conflictMessage,
    warning: "Warning: The data you don't choose will be overwritten.",
    details: (
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.text }]}>
            Local cells:
          </Text>
          <Text style={[styles.infoValue, { color: colors.tint }]}>
            {localCellsCount}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.text }]}>
            Remote cells:
          </Text>
          <Text style={[styles.infoValue, { color: colors.tint }]}>
            {remoteCellsCount}
          </Text>
        </View>
      </View>
    ),
  };

  const buttons: DialogButton[] = [
    {
      label: "Keep Remote",
      subtext: "(Download from cloud)",
      onPress: () => onResolve(ConflictResolutionChoice.KeepRemote),
      variant: "default",
    },
    {
      label: "Keep Local",
      subtext: "(Upload to cloud)",
      onPress: () => onResolve(ConflictResolutionChoice.KeepLocal),
      variant: "primary",
    },
  ];

  return (
    <ConfirmDialog
      content={content}
      buttons={buttons}
      onDismiss={onDismiss}
      loadingText="Resolving conflict..."
    />
  );
};

const styles = StyleSheet.create({
  infoContainer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
  },
  infoLabel: {
    ...Typography.body,
    fontWeight: "500",
  },
  infoValue: {
    ...Typography.body,
    fontWeight: "700",
  },
});


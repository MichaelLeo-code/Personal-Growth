import { CommonStyles, Spacing, Typography } from "@/constants";
import { useSyncStatus, useThemeColors } from "@/my_hooks";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export const SyncStatusIndicator: React.FC = () => {
  const { syncStatus, isSyncing } = useSyncStatus();
  const colors = useThemeColors();

  const formatLastSyncTime = (date: Date | null) => {
    if (!date) return "Never";
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const getSyncStatusColor = () => {
    if (syncStatus.hasUnsavedLocalChanges) return colors.error;
    if (isSyncing) return colors.warning;
    return colors.success;
  };

  const getSyncStatusText = () => {
    if (isSyncing) return "Syncing...";
    if (syncStatus.hasUnsavedLocalChanges) return "Unsaved changes";
    return "Up to date";
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusIndicator}>
        <Text style={[styles.statusText, { color: getSyncStatusColor() }]}>
          {getSyncStatusText()}
        </Text>
        {syncStatus.lastSyncTime && (
          <Text style={[styles.lastSyncText, { color: colors.textMuted }]}>
            Last sync: {formatLastSyncTime(syncStatus.lastSyncTime)}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...CommonStyles.row,
  },
  statusIndicator: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs / 2,
  },
  statusText: {
    ...Typography.caption,
    fontWeight: "600",
  },
  lastSyncText: {
    ...Typography.caption,
    fontSize: 10,
    opacity: 0.8,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm / 2,
    borderRadius: 12,
  },
  saveButtonText: {
    color: "#FFFFFF",
    ...Typography.caption,
    fontWeight: "600",
  },
});

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSyncStatus } from "../../my_hooks/useSyncStatus";

export const SyncStatusIndicator: React.FC = () => {
  const { syncStatus, isOnline, isSyncing } = useSyncStatus();

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
    if (syncStatus.hasUnsavedLocalChanges) return "#a81000"; // Red
    if (isSyncing) return "#FFD93D"; // Yellow
    return "#4b50e3"; // Green
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
          <Text style={styles.lastSyncText}>
            Last sync: {formatLastSyncTime(syncStatus.lastSyncTime)}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIndicator: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  lastSyncText: {
    color: "#666",
    fontSize: 10,
    opacity: 0.8,
  },
  saveButton: {
    backgroundColor: "#4ECDC4",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
});

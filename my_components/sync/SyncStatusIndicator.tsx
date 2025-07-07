import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
    if (syncStatus.hasUnsavedLocalChanges) return "#FF6B6B"; // Red
    if (isSyncing) return "#FFD93D"; // Yellow
    return "#4ECDC4"; // Green
  };

  const getSyncStatusText = () => {
    if (isSyncing) return "Syncing...";
    if (syncStatus.hasUnsavedLocalChanges) return "Unsaved changes";
    return "Up to date";
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.statusIndicator,
          { backgroundColor: getSyncStatusColor() },
        ]}
        disabled={isSyncing}
      >
        <Text style={styles.statusText}>{getSyncStatusText()}</Text>
        {syncStatus.lastSyncTime && (
          <Text style={styles.lastSyncText}>
            Last sync: {formatLastSyncTime(syncStatus.lastSyncTime)}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  lastSyncText: {
    color: "#FFFFFF",
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

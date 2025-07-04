import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSyncStatus } from "../../my_hooks/useSyncStatus";

export const SyncStatusIndicator: React.FC = () => {
  const { syncStatus, isOnline, isSyncing, forceSyncToRemote, forceSaveLocal } =
    useSyncStatus();

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
    if (isSyncing) return "#FFA500"; // Orange
    if (syncStatus.hasUnsavedLocalChanges) return "#FF6B6B"; // Red
    if (syncStatus.hasPendingChanges) return "#FFD93D"; // Yellow
    return "#4ECDC4"; // Green
  };

  const getSyncStatusText = () => {
    if (isSyncing) return "Syncing...";
    if (syncStatus.hasUnsavedLocalChanges) return "Unsaved changes";
    if (syncStatus.hasPendingChanges) return "Pending sync";
    return "Up to date";
  };

  const handleSyncPress = () => {
    if (isSyncing) return;

    if (!isOnline) {
      Alert.alert(
        "Offline",
        "You're currently offline. Changes will sync when you're back online.",
        [{ text: "OK" }]
      );
      return;
    }

    if (syncStatus.hasUnsavedLocalChanges || syncStatus.hasPendingChanges) {
      Alert.alert(
        "Force Sync",
        "This will sync your local changes to the cloud. Continue?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Sync", onPress: forceSyncToRemote },
        ]
      );
    } else {
      Alert.alert("Already Synced", "Your data is already up to date!", [
        { text: "OK" },
      ]);
    }
  };

  const handleSavePress = () => {
    if (syncStatus.hasUnsavedLocalChanges) {
      forceSaveLocal();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.statusIndicator,
          { backgroundColor: getSyncStatusColor() },
        ]}
        onPress={handleSyncPress}
        disabled={isSyncing}
      >
        <Text style={styles.statusText}>{getSyncStatusText()}</Text>
        {syncStatus.lastSyncTime && (
          <Text style={styles.lastSyncText}>
            Last sync: {formatLastSyncTime(syncStatus.lastSyncTime)}
          </Text>
        )}
      </TouchableOpacity>

      {syncStatus.hasUnsavedLocalChanges && (
        <TouchableOpacity style={styles.saveButton} onPress={handleSavePress}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      )}
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

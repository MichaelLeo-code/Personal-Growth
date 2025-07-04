import { useEffect, useState } from "react";
import { cellService } from "../service/cellService";

interface SyncStatus {
  lastSyncTime: Date | null;
  hasPendingChanges: boolean;
  hasUnsavedLocalChanges: boolean;
  lastModifiedTime?: Date;
}

export const useSyncStatus = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSyncTime: null,
    hasPendingChanges: false,
    hasUnsavedLocalChanges: false,
  });
  const [isOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const updateSyncStatus = () => {
    const status = cellService.getSyncStatus();
    setSyncStatus((prevStatus) => ({
      ...prevStatus,
      ...status,
    }));
  };

  const forceSyncToRemote = async () => {
    setIsSyncing(true);
    try {
      await cellService.forceSyncToRemote();
      updateSyncStatus();
    } catch (error) {
      console.error("Failed to sync to remote:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const forceSaveLocal = async () => {
    try {
      await cellService.forceSave();
      updateSyncStatus();
    } catch (error) {
      console.error("Failed to save locally:", error);
    }
  };

  useEffect(() => {
    // Update sync status periodically
    const interval = setInterval(updateSyncStatus, 5000); // Every 5 seconds

    // Initial update
    updateSyncStatus();

    return () => clearInterval(interval);
  }, []);

  return {
    syncStatus,
    isOnline,
    isSyncing,
    forceSyncToRemote,
    forceSaveLocal,
    updateSyncStatus,
  };
};

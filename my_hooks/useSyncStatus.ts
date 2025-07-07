import { useEffect, useState } from "react";
import { storageService } from "../service/storageService";

interface SyncStatus {
  lastSyncTime: Date | null;
  hasUnsavedLocalChanges: boolean;
  lastModifiedTime?: Date;
}

export const useSyncStatus = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSyncTime: null,
    hasUnsavedLocalChanges: false,
  });
  const [isOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const updateSyncStatus = () => {
    const status = storageService.getSyncStatus();
    setSyncStatus((prevStatus) => ({
      ...prevStatus,
      ...status,
    }));
  };

  useEffect(() => {
    const interval = setInterval(updateSyncStatus, 2000);

    updateSyncStatus();

    return () => clearInterval(interval);
  }, []);

  return {
    syncStatus,
    isOnline,
    isSyncing,
    updateSyncStatus,
  };
};

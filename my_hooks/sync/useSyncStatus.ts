import { storageService } from "@/service";
import { useEffect, useState } from "react";

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
    const hasUnsavedLocalChanges =
      !status.lastSyncTime || status.lastModifiedTime > status.lastSyncTime;

    setSyncStatus((prevStatus) => ({
      ...prevStatus,
      ...status,
      hasUnsavedLocalChanges,
    }));

    setIsSyncing(storageService.isSyncing());
  };

  useEffect(() => {
    const syncingInterval = setInterval(() => {
      setIsSyncing(storageService.isSyncing());
    }, 500);

    const statusInterval = setInterval(updateSyncStatus, 2000);

    updateSyncStatus();

    const unsubscribe = storageService.onAuthChange(() => {
      updateSyncStatus();
    });

    return () => {
      clearInterval(syncingInterval);
      clearInterval(statusInterval);
      unsubscribe();
    };
  }, []);

  return {
    syncStatus,
    isOnline,
    isSyncing,
    updateSyncStatus,
  };
};

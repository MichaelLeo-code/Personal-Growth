import { User } from "firebase/auth";
import { Cell } from "../types/cells";
import { FirestoreGridStorage } from "./firestoreGridStorage";
import { gridStorage } from "./gridStorage";
import { localGridStorage } from "./localGridStorage";

interface SyncMetadata {
  lastSyncTime: Date | null;
  pendingChanges: boolean;
  lastModifiedTime: Date;
}

export class HybridGridStorage implements gridStorage {
  private localStorage: localGridStorage;
  private remoteStorage: FirestoreGridStorage | null;
  private syncMetadata: SyncMetadata;
  private readonly syncMetadataKey: string;
  private syncTimer: any = null;
  private readonly SYNC_INTERVAL = 30000; // 30 seconds
  private readonly FORCE_SYNC_THRESHOLD = 300000; // 5 minutes
  private readonly STORAGE_KEY: string = "cells";

  constructor(user: User | null, storageKey?: string) {
    this.localStorage = new localGridStorage(storageKey ?? this.STORAGE_KEY);
    this.remoteStorage = user
      ? new FirestoreGridStorage(user, storageKey ?? this.STORAGE_KEY)
      : null;
    this.syncMetadataKey = `${storageKey}_sync_metadata`;
    this.syncMetadata = {
      lastSyncTime: null,
      pendingChanges: false,
      lastModifiedTime: new Date(),
    };

    this.loadSyncMetadata();
    this.startPeriodicSync();
  }

  setUser(user: User | null): void {
    if (user) {
      if (this.remoteStorage) {
        this.remoteStorage.setUser(user);
      } else {
        this.remoteStorage = new FirestoreGridStorage(user, this.STORAGE_KEY);
      }
    } else {
      this.remoteStorage = null;
    }

    this.syncMetadata = {
      lastSyncTime: null,
      pendingChanges: false,
      lastModifiedTime: new Date(),
    };
    this.saveSyncMetadata();
  }

  async isOnline(): Promise<boolean> {
    // For React Native, we'll implement a simple network check
    // In a real app, you'd install @react-native-community/netinfo
    // For now, we'll assume online unless explicitly offline
    return true; // Assume online for now - can be enhanced later
  }

  getLastSyncTime(): Date | null {
    return this.syncMetadata.lastSyncTime;
  }

  private async loadSyncMetadata(): Promise<void> {
    // For now, we'll store metadata in memory
    // In a real implementation, you'd load from AsyncStorage with a different key
  }

  private async saveSyncMetadata(): Promise<void> {
    // In a real implementation, you'd save this to AsyncStorage with a different key
    // For now, we'll keep it in memory
  }

  async saveCells(cells: Cell[]): Promise<void> {
    try {
      // Always save locally first
      await this.localStorage.saveCells(cells);

      // Mark that we have pending changes
      this.syncMetadata.pendingChanges = true;
      this.syncMetadata.lastModifiedTime = new Date();
      await this.saveSyncMetadata();

      // Try to sync immediately if online, but don't block if it fails
      this.tryImmediateSync(cells);
    } catch (error) {
      console.error("Failed to save cells locally:", error);
      throw error;
    }
  }

  async loadCells(): Promise<Cell[]> {
    try {
      // Always load from local storage first
      const localCells = await this.localStorage.loadCells();

      // Try to sync from remote in background if we haven't synced recently
      this.tryBackgroundSync();

      return localCells;
    } catch (error) {
      console.error("Failed to load cells from local storage:", error);
      throw error;
    }
  }

  /**
   * Try to sync immediately but don't block the UI
   */
  private tryImmediateSync(cells: Cell[]): void {
    // Don't await this - let it run in background
    this.syncToRemote(cells).catch((error) => {
      console.log("Background sync failed, will retry later:", error.message);
    });
  }

  /**
   * Try to sync from remote in background
   */
  private tryBackgroundSync(): void {
    const timeSinceLastSync = this.syncMetadata.lastSyncTime
      ? Date.now() - this.syncMetadata.lastSyncTime.getTime()
      : Infinity;

    // Only sync if it's been a while since last sync
    if (timeSinceLastSync > this.FORCE_SYNC_THRESHOLD) {
      this.syncFromRemote().catch((error) => {
        console.log("Background sync from remote failed:", error.message);
      });
    }
  }

  /**
   * Force sync to remote storage
   */
  async forceSyncToRemote(): Promise<void> {
    if (!this.remoteStorage) {
      throw new Error("Cannot force sync: user not authenticated");
    }

    const cells = await this.localStorage.loadCells();
    await this.syncToRemote(cells);
  }

  /**
   * Sync current local data to remote storage
   */
  private async syncToRemote(cells: Cell[]): Promise<void> {
    // Simply skip if no remote storage available - not an error!
    if (!this.remoteStorage) {
      console.log("Skipping remote sync: user not authenticated");
      return;
    }

    if (!(await this.isOnline())) {
      throw new Error("Cannot sync to remote: device is offline");
    }

    try {
      await this.remoteStorage.saveCells(cells);

      // Update sync metadata
      this.syncMetadata.lastSyncTime = new Date();
      this.syncMetadata.pendingChanges = false;
      await this.saveSyncMetadata();

      console.log("Successfully synced to remote storage");
    } catch (error) {
      console.error("Failed to sync to remote storage:", error);
      throw error;
    }
  }

  /**
   * Sync from remote storage and merge with local data
   */
  async syncFromRemote(): Promise<Cell[]> {
    // Return local data if no remote storage - perfectly normal
    if (!this.remoteStorage) {
      console.log("No remote storage available, returning local data");
      return this.localStorage.loadCells();
    }

    if (!(await this.isOnline())) {
      console.log("Device offline, returning local data");
      return this.localStorage.loadCells();
    }

    try {
      const remoteCells = await this.remoteStorage.loadCells();
      const localCells = await this.localStorage.loadCells();

      // Simple merge strategy: remote wins if we haven't modified locally recently
      const mergedCells = this.mergeCells(localCells, remoteCells);

      // Save merged data locally
      await this.localStorage.saveCells(mergedCells);

      // Update sync metadata
      this.syncMetadata.lastSyncTime = new Date();
      this.syncMetadata.pendingChanges = false;
      await this.saveSyncMetadata();

      console.log("Successfully synced from remote storage");
      return mergedCells;
    } catch (error) {
      console.error(
        "Failed to sync from remote storage, using local data:",
        error
      );
      return this.localStorage.loadCells();
    }
  }

  /**
   * Simple merge strategy - in a production app you might want more sophisticated conflict resolution
   */
  private mergeCells(localCells: Cell[], remoteCells: Cell[]): Cell[] {
    // If we have pending local changes, prefer local data
    if (this.syncMetadata.pendingChanges) {
      console.log("Using local cells due to pending changes");
      return localCells;
    }

    // Check if remote data is newer
    const localModTime = this.syncMetadata.lastModifiedTime.getTime();
    const remoteModTime = this.syncMetadata.lastSyncTime?.getTime() || 0;

    if (remoteModTime > localModTime) {
      console.log("Using remote cells (newer)");
      return remoteCells;
    }

    console.log("Using local cells (same or newer)");
    return localCells;
  }

  /**
   * Start periodic sync timer
   */
  private startPeriodicSync(): void {
    this.syncTimer = setInterval(async () => {
      // Only sync if we have remote storage, pending changes, and are online
      if (
        this.remoteStorage &&
        this.syncMetadata.pendingChanges &&
        (await this.isOnline())
      ) {
        try {
          const cells = await this.localStorage.loadCells();
          await this.syncToRemote(cells);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          console.log("Periodic sync failed:", errorMessage);
        }
      }
    }, this.SYNC_INTERVAL);
  }

  /**
   * Stop periodic sync timer
   */
  stopPeriodicSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  /**
   * Check if remote storage is available
   */
  hasRemoteStorage(): boolean {
    return this.remoteStorage !== null;
  }

  /**
   * Get sync status information
   */
  getSyncStatus(): {
    lastSyncTime: Date | null;
    hasPendingChanges: boolean;
    lastModifiedTime: Date;
    hasRemoteStorage: boolean;
  } {
    return {
      lastSyncTime: this.syncMetadata.lastSyncTime,
      hasPendingChanges: this.syncMetadata.pendingChanges,
      lastModifiedTime: this.syncMetadata.lastModifiedTime,
      hasRemoteStorage: this.hasRemoteStorage(),
    };
  }
}

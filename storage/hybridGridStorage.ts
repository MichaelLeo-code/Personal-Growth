import { User } from "firebase/auth";
import { AppState, AppStateStatus } from "react-native";
import { Cell } from "../types/cells";
import { FirestoreGridStorage } from "./firestoreGridStorage";
import { gridStorage } from "./gridStorageRenamed";
import { localGridStorage } from "./localGridStorageRenamed";

export class HybridGridStorage implements gridStorage {
  private localStorage: localGridStorage;
  private remoteStorage: FirestoreGridStorage | null;
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private readonly SYNC_INTERVAL_MS = 30 * 1000; // 30 seconds
  private appStateSubscription: any = null;
  private readonly STORAGE_KEY: string = "cells";

  private syncStatus: { lastSyncTime: Date | null; lastModifiedTime: Date };
  private _isSyncing: boolean = false;

  constructor(user: User | null, storageKey?: string) {
    this.localStorage = new localGridStorage(storageKey ?? this.STORAGE_KEY);
    this.remoteStorage = user
      ? new FirestoreGridStorage(user, storageKey ?? this.STORAGE_KEY)
      : null;

    this.setupAppStateListener();
    this.startPeriodicSync();

    this.syncStatus = {
      lastSyncTime: null,
      lastModifiedTime: new Date(),
    };
  }

  private setupAppStateListener(): void {
    this.appStateSubscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (nextAppState === "background" || nextAppState === "inactive")
          this.syncToFirestore();
      }
    );
  }

  private startPeriodicSync(): void {
    this.syncInterval = setInterval(() => {
      // Only sync if there are unsaved changes
      if (
        !this.syncStatus.lastSyncTime ||
        this.syncStatus.lastModifiedTime > this.syncStatus.lastSyncTime
      ) {
        this.syncToFirestore();
      }
    }, this.SYNC_INTERVAL_MS);
  }

  private stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  private async syncToFirestore(): Promise<void> {
    if (!this.remoteStorage || this._isSyncing) return;

    this._isSyncing = true;
    try {
      const localCells = await this.localStorage.loadCells();
      await this.remoteStorage.saveCells(localCells);
      this.syncStatus.lastSyncTime = new Date();
      console.log("Successfully synced to Firestore");
    } catch (error) {
      console.error("Failed to sync to Firestore:", error);
    } finally {
      this._isSyncing = false;
    }
  }

  setUser(user: User | null): void {
    // Sync current data before changing user
    if (this.remoteStorage && !this._isSyncing) {
      this.syncToFirestore();
    }

    if (user) {
      if (this.remoteStorage) {
        this.remoteStorage.setUser(user);
      } else {
        this.remoteStorage = new FirestoreGridStorage(user, this.STORAGE_KEY);
      }
      // Reset sync status when user changes - we'll need to sync again
      this.syncStatus.lastSyncTime = null;
    } else {
      this.remoteStorage = null;
      // No remote storage means no sync capability
      this.syncStatus.lastSyncTime = null;
    }
  }

  async saveCells(cells: Cell[]): Promise<void> {
    try {
      await this.localStorage.saveCells(cells);
      this.syncStatus.lastModifiedTime = new Date();
    } catch (error) {
      console.error("Failed to save cells to local storage:", error);
      throw error;
    }
  }

  async loadCells(): Promise<Cell[]> {
    try {
      const localCells = await this.localStorage.loadCells();

      const remoteCells = (await this.remoteStorage?.loadCells()) ?? [];

      if (localCells.length === 0 && remoteCells.length === 0) {
        return [];
      }

      const getLatestTimestamp = (cells: Cell[]) => {
        if (cells.length === 0) return 0;
        return Math.max(
          ...cells.map((cell) => new Date(cell.updatedAt || 0).getTime())
        );
      };

      const localLatestTimestamp = getLatestTimestamp(localCells);
      const remoteLatestTimestamp = getLatestTimestamp(remoteCells);

      if (remoteLatestTimestamp > localLatestTimestamp) {
        await this.localStorage.saveCells(remoteCells);
        this.syncStatus.lastModifiedTime = new Date();
        this.syncStatus.lastSyncTime = new Date();
        return remoteCells;
      } else {
        return localCells;
      }
    } catch (error) {
      console.error("Failed to load cells:", error);
      throw error;
    }
  }

  getSyncStatus(): { lastSyncTime: Date | null; lastModifiedTime: Date } {
    return {
      lastSyncTime: this.syncStatus.lastSyncTime,
      lastModifiedTime: this.syncStatus.lastModifiedTime,
    };
  }

  isSyncing(): boolean {
    return this._isSyncing;
  }

  destroy(): void {
    this.stopPeriodicSync();
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
  }
}

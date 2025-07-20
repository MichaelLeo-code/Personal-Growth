import { User } from "firebase/auth";
import { AppState, AppStateStatus } from "react-native";
import { Cell } from "../types/cells";
import { FirestoreGridStorage } from "./firestoreGridStorage";
import { gridStorage } from "./gridStorage";
import { localGridStorage } from "./localGridStorage";

export class HybridGridStorage implements gridStorage {
  private localStorage: localGridStorage;
  private remoteStorage: FirestoreGridStorage | null;
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private readonly SYNC_INTERVAL_MS = 30 * 1000; // 30 seconds
  private hasUnsavedLocalChanges: boolean = false;
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
    if (this.hasUnsavedLocalChanges) {
      this.hasUnsavedLocalChanges = false;
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
  }

  async setUser(user: User | null): Promise<void> {
    if (this.remoteStorage && !this._isSyncing) {
      await this.syncToFirestore();
    }

    if (user) {
      if (this.remoteStorage) {
        this.remoteStorage.setUser(user);
      } else {
        this.remoteStorage = new FirestoreGridStorage(user, this.STORAGE_KEY);
      }

      try {
        await this.loadLatestData();
      } catch (error) {
        console.error("Failed to compare timestamps on user change:", error);
        this.syncStatus.lastSyncTime = null;
      }
    } else {
      this.remoteStorage = null;
      this.syncStatus.lastSyncTime = null;
    }
  }

  async saveCells(cells: Cell[]): Promise<void> {
    try {
      await this.localStorage.saveCells(cells);
      this.syncStatus.lastModifiedTime = new Date();
      this.hasUnsavedLocalChanges = true;
    } catch (error) {
      console.error("Failed to save cells to local storage:", error);
      throw error;
    }
  }

  async loadCells(): Promise<Cell[]> {
    try {
      return await this.loadLatestData();
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

  async cleanLocalStorage(): Promise<void> {
    console.log("Cleaning local storage...");
    await this.localStorage.deleteAll();
  }
  private getLatestTimestamp(cells: Cell[]): number {
    if (cells.length === 0) return 0;
    return Math.max(
      ...cells.map((cell) => new Date(cell.updatedAt || 0).getTime())
    );
  }

  private async loadLatestData(): Promise<Cell[]> {
    if (!this.remoteStorage) {
      return await this.localStorage.loadCells();
    }

    const localCells = await this.localStorage.loadCells();
    const remoteCells = await this.remoteStorage.loadCells();

    if (localCells.length === 0 && remoteCells.length === 0) {
      return [];
    }

    const localLatestTimestamp = this.getLatestTimestamp(localCells);
    const remoteLatestTimestamp = this.getLatestTimestamp(remoteCells);

    console.log(
      `Local latest timestamp: ${localLatestTimestamp}, Remote latest timestamp: ${remoteLatestTimestamp}`
    );
    if (remoteLatestTimestamp > localLatestTimestamp) {
      console.log("Remote data is newer, updating local storage.");
      console.log(localCells.length, "local cells");
      await this.localStorage.saveCells(remoteCells);
      this.syncStatus.lastModifiedTime = new Date();
      this.syncStatus.lastSyncTime = new Date();
      console.log("help im stuck");
      return remoteCells;
    } else {
      return localCells;
    }
  }
}

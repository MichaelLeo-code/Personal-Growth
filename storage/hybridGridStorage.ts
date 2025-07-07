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

  constructor(user: User | null, storageKey?: string) {
    this.localStorage = new localGridStorage(storageKey ?? this.STORAGE_KEY);
    this.remoteStorage = user
      ? new FirestoreGridStorage(user, storageKey ?? this.STORAGE_KEY)
      : null;

    this.setupAppStateListener();
    this.startPeriodicSync();
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
      this.syncToFirestore();
    }, this.SYNC_INTERVAL_MS);
  }

  private stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  private async syncToFirestore(): Promise<void> {
    try {
      const localCells = await this.localStorage.loadCells();
      await this.remoteStorage?.saveCells(localCells);
    } catch (error) {
      console.error("Failed to sync to Firestore:", error);
    }
  }

  setUser(user: User | null): void {
    this.syncToFirestore();

    if (user) {
      if (this.remoteStorage) {
        this.remoteStorage.setUser(user);
      } else {
        this.remoteStorage = new FirestoreGridStorage(user, this.STORAGE_KEY);
      }
    } else {
      this.remoteStorage = null;
    }
  }

  async saveCells(cells: Cell[]): Promise<void> {
    try {
      await this.localStorage.saveCells(cells);
    } catch (error) {
      console.error("Failed to save cells to local storage:", error);
      throw error;
    }
  }

  async loadCells(): Promise<Cell[]> {
    try {
      const [localCells, remoteCells] = await Promise.allSettled([
        this.localStorage.loadCells(),
        this.remoteStorage?.loadCells() ?? Promise.resolve([])
      ]);

      const local = localCells.status === 'fulfilled' ? localCells.value : [];
      const remote = remoteCells.status === 'fulfilled' ? remoteCells.value : [];

      // If no cells exist anywhere, return empty array
      if (local.length === 0 && remote.length === 0) {
        return [];
      }

      // If only one source has data, use that
      if (local.length === 0) {
        await this.localStorage.saveCells(remote); // Cache remote data locally
        return remote;
      }
      if (remote.length === 0) {
        return local;
      }

      // Both sources have data - compare timestamps to find the latest data
      const getLatestTimestamp = (cells: Cell[]) => {
        if (cells.length === 0) return 0;
        return Math.max(...cells.map(cell => 
          new Date(cell.updatedAt || 0).getTime()
        ));
      };

      const localLatestTimestamp = getLatestTimestamp(local);
      const remoteLatestTimestamp = getLatestTimestamp(remote);

      if (remoteLatestTimestamp > localLatestTimestamp) {
        // Remote has newer data, update local cache
        await this.localStorage.saveCells(remote);
        return remote;
      } else {
        // Local is newer or same, use local
        return local;
      }
    } catch (error) {
      console.error("Failed to load cells:", error);
      throw error;
    }
  }
}

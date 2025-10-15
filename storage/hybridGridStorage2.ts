import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "firebase/auth";
import { AppState, AppStateStatus } from "react-native";
import { Cell } from "../types/cells";
import { FirestoreGridStorage } from "./firestoreGridStorage";
import { gridStorage } from "./gridStorage";
import { localGridStorage } from "./localGridStorage";

// Metadata for sync tracking
interface SyncMetadata {
  lastSyncedChecksum: string | null;
  lastModifiedTime: Date;
  hasUnsyncedChanges: boolean;
}

// User choice for conflict resolution
export enum ConflictResolution {
  KeepLocal = "keep_local",
  KeepRemote = "keep_remote",
}

// Conflict resolution callback type
export type ConflictResolutionCallback = (
  localCells: Cell[],
  remoteCells: Cell[]
) => Promise<ConflictResolution>;

export class HybridGridStorage2 implements gridStorage {
  private localStorage: localGridStorage;
  private remoteStorage: FirestoreGridStorage | null;
  private readonly STORAGE_KEY: string = "cells";
  private readonly METADATA_STORAGE_KEY: string;
  private appStateSubscription: any = null;

  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private readonly SYNC_INTERVAL_MS = 30 * 1000; // 30 seconds
  private _isSyncing: boolean = false;

  private conflictResolutionCallback: ConflictResolutionCallback | null = null;

  constructor(user: User | null, storageKey?: string) {
    this.STORAGE_KEY = storageKey ?? "cells";
    this.METADATA_STORAGE_KEY = `${this.STORAGE_KEY}_sync_metadata`;

    this.localStorage = new localGridStorage(this.STORAGE_KEY);
    this.remoteStorage = user
      ? new FirestoreGridStorage(user, this.STORAGE_KEY)
      : null;

    this.setupAppStateListener();
  }

  setConflictResolutionCallback(callback: ConflictResolutionCallback): void {
    this.conflictResolutionCallback = callback;
  }

  private setupAppStateListener(): void {
    this.appStateSubscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (nextAppState === "background" || nextAppState === "inactive") {
          this.pushToRemote();
        }
      }
    );
  }

  private calculateChecksum(cells: Cell[]): string {
    // Sort cells by ID to ensure consistent checksum
    const sortedCells = [...cells].sort((a, b) => a.id - b.id);
    const cellsString = JSON.stringify(sortedCells);

    // Use a simple hash for React Native compatibility
    let hash = 0;
    for (let i = 0; i < cellsString.length; i++) {
      const char = cellsString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  private async getSyncMetadata(): Promise<SyncMetadata> {
    try {
      const data = await AsyncStorage.getItem(this.METADATA_STORAGE_KEY);
      if (!data) {
        return {
          lastSyncedChecksum: null,
          lastModifiedTime: new Date(),
          hasUnsyncedChanges: false,
        };
      }
      const parsed = JSON.parse(data);
      return {
        ...parsed,
        lastModifiedTime: new Date(parsed.lastModifiedTime),
      };
    } catch (error) {
      console.error("Failed to load sync metadata:", error);
      return {
        lastSyncedChecksum: null,
        lastModifiedTime: new Date(),
        hasUnsyncedChanges: false,
      };
    }
  }

  private async setSyncMetadata(metadata: SyncMetadata): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.METADATA_STORAGE_KEY,
        JSON.stringify(metadata)
      );
    } catch (error) {
      console.error("Failed to save sync metadata:", error);
    }
  }

  private async getRemoteChecksum(): Promise<string> {
    if (!this.remoteStorage) {
      throw new Error("No remote storage available");
    }

    const remoteCells = await this.remoteStorage.loadCells();
    return this.calculateChecksum(remoteCells);
  }

  private async handleFirstLoad(): Promise<Cell[]> {
    const metadata = await this.getSyncMetadata();
    const localCells = await this.localStorage.loadCells();

    if (!this.remoteStorage) {
      // Not logged in case
      return localCells;
    }

    try {
      const remoteChecksum = await this.getRemoteChecksum();
      // We don't need the local checksum for the current logic,
      // but keeping it for potential future use
      // const localChecksum = this.calculateChecksum(localCells);

      // Case: last synced checksum != remote checksum & no unsynced changes locally
      if (
        metadata.lastSyncedChecksum !== remoteChecksum &&
        !metadata.hasUnsyncedChanges
      ) {
        console.log("Changes detected on remote, pulling...");
        return await this.pullFromRemote();
      }

      // Case: last synced checksum != remote checksum & unsynced changes locally (CONFLICT)
      if (
        metadata.lastSyncedChecksum !== remoteChecksum &&
        metadata.hasUnsyncedChanges
      ) {
        console.log("Conflict detected: both local and remote have changes");
        return await this.resolveConflict(localCells);
      }

      // Case: last synced checksum = remote checksum & unsynced changes locally
      if (
        metadata.lastSyncedChecksum === remoteChecksum &&
        metadata.hasUnsyncedChanges
      ) {
        console.log("Only local changes detected, pushing to remote...");
        await this.pushToRemote();
        return localCells;
      }

      // Case: everything is in sync
      console.log("Everything is in sync");
      return localCells;
    } catch (error) {
      console.error("Error during first load sync check:", error);
      return localCells;
    }
  }

  private async handleLoginSync(localCells: Cell[]): Promise<Cell[]> {
    if (!this.remoteStorage) {
      return localCells;
    }

    const metadata = await this.getSyncMetadata();

    try {
      const remoteCells = await this.remoteStorage.loadCells();
      const hasLocalChanges =
        metadata.hasUnsyncedChanges || localCells.length > 0;
      const hasRemoteData = remoteCells.length > 0;

      // Case: no local changes, can safely pull
      if (!hasLocalChanges) {
        console.log("No local changes, safely pulling from remote");
        if (hasRemoteData) {
          await this.localStorage.saveCells(remoteCells);
          await this.updateSyncMetadata(remoteCells, false);
        }
        return remoteCells;
      }

      // Case: has local changes
      if (hasRemoteData) {
        // Potential conflict
        console.log("Potential conflict: both local and remote have data");
        return await this.resolveConflict(localCells);
      } else {
        // Remote is empty (brand new account), safe to push
        console.log("Remote is empty, safely pushing local data");
        await this.pushToRemote();
        return localCells;
      }
    } catch (error) {
      console.error("Error during login sync:", error);
      return localCells;
    }
  }

  private async resolveConflict(localCells: Cell[]): Promise<Cell[]> {
    if (!this.remoteStorage) {
      throw new Error("No remote storage for conflict resolution");
    }

    const remoteCells = await this.remoteStorage.loadCells();

    if (!this.conflictResolutionCallback) {
      console.warn("No conflict resolution callback set, defaulting to local");
      return localCells;
    }

    try {
      const resolution = await this.conflictResolutionCallback(
        localCells,
        remoteCells
      );

      if (resolution === ConflictResolution.KeepLocal) {
        console.log("User chose to keep local version");
        await this.pushToRemote();
        return localCells;
      } else {
        console.log("User chose to keep remote version");
        return await this.pullFromRemote();
      }
    } catch (error) {
      console.error("Error in conflict resolution:", error);
      return localCells; // Default to local in case of error
    }
  }

  private async pullFromRemote(): Promise<Cell[]> {
    if (!this.remoteStorage) {
      throw new Error("No remote storage available");
    }

    const remoteCells = await this.remoteStorage.loadCells();
    await this.localStorage.saveCells(remoteCells);
    await this.updateSyncMetadata(remoteCells, false);

    console.log("Successfully pulled from remote");
    return remoteCells;
  }

  private async pushToRemote(): Promise<void> {
    if (!this.remoteStorage || this._isSyncing) {
      return;
    }

    this._isSyncing = true;
    try {
      const localCells = await this.localStorage.loadCells();
      await this.remoteStorage.saveCells(localCells);
      await this.updateSyncMetadata(localCells, false);
      console.log("Successfully pushed to remote");
    } catch (error) {
      console.error("Failed to push to remote:", error);
      throw error;
    } finally {
      this._isSyncing = false;
    }
  }

  private async updateSyncMetadata(
    cells: Cell[],
    hasUnsyncedChanges: boolean
  ): Promise<void> {
    const checksum = this.calculateChecksum(cells);
    const metadata: SyncMetadata = {
      lastSyncedChecksum: checksum,
      lastModifiedTime: new Date(),
      hasUnsyncedChanges,
    };
    await this.setSyncMetadata(metadata);
  }

  // Public interface methods

  async setUser(user: User | null): Promise<void> {
    const localCells = await this.localStorage.loadCells();

    if (user) {
      if (this.remoteStorage) {
        this.remoteStorage.setUser(user);
      } else {
        this.remoteStorage = new FirestoreGridStorage(user, this.STORAGE_KEY);
      }

      // Handle the login sync scenario
      try {
        await this.handleLoginSync(localCells);
      } catch (error) {
        console.error("Failed to sync after login:", error);
      }
    } else {
      this.remoteStorage = null;
      // Reset sync metadata when logging out
      await this.setSyncMetadata({
        lastSyncedChecksum: null,
        lastModifiedTime: new Date(),
        hasUnsyncedChanges: false,
      });
    }
  }

  async saveCells(cells: Cell[]): Promise<void> {
    try {
      await this.localStorage.saveCells(cells);

      // Update metadata to indicate unsynced changes
      const metadata = await this.getSyncMetadata();
      metadata.hasUnsyncedChanges = true;
      metadata.lastModifiedTime = new Date();
      await this.setSyncMetadata(metadata);

      // Immediately push to remote (screw simultaneous edits approach)
      if (this.remoteStorage) {
        setTimeout(() => this.pushToRemote(), 0); // Push asynchronously
      }
    } catch (error) {
      console.error("Failed to save cells:", error);
      throw error;
    }
  }

  async loadCells(): Promise<Cell[]> {
    try {
      return await this.handleFirstLoad();
    } catch (error) {
      console.error("Failed to load cells:", error);
      // Fallback to local storage
      return await this.localStorage.loadCells();
    }
  }

  // Additional utility methods

  async getSyncStatus(): Promise<{
    lastSyncedChecksum: string | null;
    lastModifiedTime: Date;
    hasUnsyncedChanges: boolean;
    isSyncing: boolean;
  }> {
    const metadata = await this.getSyncMetadata();
    return {
      ...metadata,
      isSyncing: this._isSyncing,
    };
  }

  isSyncing(): boolean {
    return this._isSyncing;
  }

  async forceSync(): Promise<void> {
    if (this.remoteStorage) {
      await this.pushToRemote();
    }
  }

  async cleanLocalStorage(): Promise<void> {
    console.log("Cleaning local storage...");
    await this.localStorage.deleteAll();
    await AsyncStorage.removeItem(this.METADATA_STORAGE_KEY);
  }

  destroy(): void {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
  }
}

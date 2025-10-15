import { User } from "firebase/auth";
import { AppState, AppStateStatus } from "react-native";
import { Cell } from "../types/cells";
import { FirestoreGridStorage } from "./firestoreGridStorage";
import { gridStorage } from "./gridStorage";
import { localGridStorage } from "./localGridStorage";

export enum ConflictResolutionChoice {
  KeepLocal = "local",
  KeepRemote = "remote",
}

export enum SyncState {
  Synced = "synced",
  LocalChanges = "local_changes",
  RemoteChanges = "remote_changes",
  Conflict = "conflict",
  FirstLoad = "first_load",
  PullingRemote = "pulling_remote",
}

export interface SyncStatus {
  state: SyncState;
  lastSyncTime: Date | null;
  lastModifiedTime: Date;
  localVersionTag: string | null;
  remoteVersionTag: string | null;
  hasUnsavedLocalChanges: boolean;
}

export interface ConflictResolutionPrompt {
  onResolve: (choice: ConflictResolutionChoice) => Promise<void>;
  localCellsCount: number;
  remoteCellsCount: number;
  conflictMessage: string;
}

export class HybridGridStorage3 implements gridStorage {
  private localStorage: localGridStorage;
  private remoteStorage: FirestoreGridStorage | null;

  private readonly STORAGE_KEY: string = "cells";
  private readonly VERSION_TAG_KEY: string = "version_tag";
  private readonly LOCAL_SYNCED_VERSION_KEY: string = "local_synced_version";

  private syncStatus: SyncStatus;
  private appStateSubscription: any = null;
  private _isSyncing: boolean = false; // can be taken from syncstatus?
  private isFirstLoad: boolean = true; // can be taken from syncstatus?

  private conflictPromptHandler:
    | ((prompt: ConflictResolutionPrompt) => void)
    | null = null;

  constructor(user: User | null, storageKey?: string) {
    const key = storageKey ?? this.STORAGE_KEY;
    this.localStorage = new localGridStorage(key);
    this.remoteStorage = user ? new FirestoreGridStorage(user, key) : null;

    this.syncStatus = {
      state: SyncState.FirstLoad,
      lastSyncTime: null,
      lastModifiedTime: new Date(),
      localVersionTag: null,
      remoteVersionTag: null,
      hasUnsavedLocalChanges: false,
    };

    this.setupAppStateListener();
    this.initializeVersionTags();
  }

  /**
   * Set the conflict prompt handler that will be called when user interaction is needed
   */
  setConflictPromptHandler(
    handler: (prompt: ConflictResolutionPrompt) => void
  ): void {
    this.conflictPromptHandler = handler;
  }

  private setupAppStateListener(): void {
    this.appStateSubscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (nextAppState === "background" || nextAppState === "inactive") {
          // Aggressive approach: just push changes without checking
          this.aggressivePushToRemote();
        }
      }
    );
  }

  private async initializeVersionTags(): Promise<void> {
    try {
      // Load local version tags from storage
      const localVersionTag = await this.localStorage.getItem(this.VERSION_TAG_KEY);
      const localSyncedVersionTag = await this.localStorage.getItem(this.LOCAL_SYNCED_VERSION_KEY);

      this.syncStatus.localVersionTag = localVersionTag;
      console.log(
        `Initialized with local version: ${localVersionTag}, synced version: ${localSyncedVersionTag}`
      );
    } catch (error) {
      console.error("Failed to initialize version tags:", error);
    }
  }

  private generateVersionTag(): string {
    return `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async setLocalVersionTag(tag: string): Promise<void> {
    await this.localStorage.setItem(this.VERSION_TAG_KEY, tag);
    this.syncStatus.localVersionTag = tag;
  }


  private async setLocalSyncedVersionTag(tag: string): Promise<void> {
    await this.localStorage.setItem(this.LOCAL_SYNCED_VERSION_KEY, tag);
  }

  private async getRemoteVersionTag(): Promise<string | null> {
    if (!this.remoteStorage) return null;

    try {
      // We'll store version tag as a special cell or metadata in Firestore
      const versionTagCell =
        (await this.remoteStorage.getVersionTag?.()) || null;
      return versionTagCell;
    } catch {
      return null;
    }
  }

  private async setRemoteVersionTag(tag: string): Promise<void> {
    if (!this.remoteStorage) return;

    try {
      await this.remoteStorage.setVersionTag?.(tag);
      this.syncStatus.remoteVersionTag = tag;
    } catch (error) {
      console.error("Failed to set remote version tag:", error);
    }
  }

  async setUser(user: User | null): Promise<void> {
    if (user) {
      if (this.remoteStorage) {
        this.remoteStorage.setUser(user);
      } else {
        this.remoteStorage = new FirestoreGridStorage(user, this.STORAGE_KEY);
      }

      // Handle first load scenarios when user logs in
      await this.handleFirstLoadWithUser();
    } else {
      this.remoteStorage = null;
      this.syncStatus.remoteVersionTag = null;
    }
  }

  private async handleFirstLoadWithUser(): Promise<void> {
    if (!this.isFirstLoad || !this.remoteStorage) return;

    this.isFirstLoad = false;

    const localSyncedVersionTag = await this.localStorage.getItem(this.LOCAL_SYNCED_VERSION_KEY);
    const remoteVersionTag = await this.getRemoteVersionTag();
    const hasUnsavedLocalChanges = await this.hasLocalChanges();

    console.log(`First load analysis:
      Local synced version: ${localSyncedVersionTag}
      Remote version: ${remoteVersionTag}
      Has local changes: ${hasUnsavedLocalChanges}
    `);

    if (!localSyncedVersionTag && !remoteVersionTag) {
      // Both are brand new
      this.syncStatus.state = SyncState.Synced;
      return;
    }

    if (!localSyncedVersionTag && remoteVersionTag && !hasUnsavedLocalChanges) {
      // First time on device, not logged in before, no local changes
      console.log("First time login with no local changes - pulling remote");
      this.syncStatus.state = SyncState.PullingRemote;
      await this.pullFromRemote();
      return;
    }

    if (!localSyncedVersionTag && remoteVersionTag && hasUnsavedLocalChanges) {
      // First time on device but has local changes - potential conflict
      console.log("First time login with local changes - checking conflict");
      await this.handleFirstTimeLoginConflict();
      return;
    }

    if (localSyncedVersionTag !== remoteVersionTag && !hasUnsavedLocalChanges) {
      // Remote has changes, no local changes - pull
      console.log("Remote changes detected, no local changes - pulling");
      this.syncStatus.state = SyncState.PullingRemote;
      await this.pullFromRemote();
      return;
    }

    if (localSyncedVersionTag !== remoteVersionTag && hasUnsavedLocalChanges) {
      // Conflict situation
      console.log("Conflict detected - both local and remote changes");
      this.syncStatus.state = SyncState.Conflict;
      await this.handleConflict();
      return;
    }

    if (localSyncedVersionTag === remoteVersionTag && hasUnsavedLocalChanges) {
      // Only local changes - push
      console.log("Only local changes - pushing to remote");
      this.syncStatus.state = SyncState.LocalChanges;
      await this.aggressivePushToRemote();
      return;
    }

    // Everything is in sync
    this.syncStatus.state = SyncState.Synced;
  }

  private async handleFirstTimeLoginConflict(): Promise<void> {
    const remoteCells = (await this.remoteStorage?.loadCells()) || [];

    if (remoteCells.length === 0) {
      // Remote is empty (brand new account) - safe to push
      console.log("Remote is empty, pushing local changes");
      await this.aggressivePushToRemote();
    } else {
      // Remote has data - actual conflict
      console.log("Remote has data, showing conflict prompt");
      await this.promptForConflictResolution("first_time_login");
    }
  }

  private async handleConflict(): Promise<void> {
    await this.promptForConflictResolution("version_conflict");
  }

  private async promptForConflictResolution(
    conflictType: string
  ): Promise<void> {
    if (!this.conflictPromptHandler) {
      console.warn("No conflict prompt handler set, defaulting to keep local");
      await this.resolveConflict(ConflictResolutionChoice.KeepLocal);
      return;
    }

    const localCells = await this.localStorage.loadCells();
    const remoteCells = (await this.remoteStorage?.loadCells()) || [];

    const conflictPrompt: ConflictResolutionPrompt = {
      onResolve: (choice: ConflictResolutionChoice) =>
        this.resolveConflict(choice),
      localCellsCount: localCells.length,
      remoteCellsCount: remoteCells.length,
      conflictMessage:
        conflictType === "first_time_login"
          ? "You have local changes, but remote data exists. Choose which to keep."
          : "Both local and remote data have been modified. Choose which to keep.",
    };

    this.conflictPromptHandler(conflictPrompt);
  }

  private async resolveConflict(
    choice: ConflictResolutionChoice
  ): Promise<void> {
    if (choice === ConflictResolutionChoice.KeepLocal) {
      await this.aggressivePushToRemote();
    } else {
      await this.pullFromRemote();
    }

    this.syncStatus.state = SyncState.Synced;
  }

  private async pullFromRemote(): Promise<void> {
    if (!this.remoteStorage) return;

    try {
      this._isSyncing = true;
      const remoteCells = await this.remoteStorage.loadCells();
      const remoteVersionTag = await this.getRemoteVersionTag();

      await this.localStorage.saveCells(remoteCells);

      if (remoteVersionTag) {
        await this.setLocalVersionTag(remoteVersionTag);
        await this.setLocalSyncedVersionTag(remoteVersionTag);
      }

      this.syncStatus.lastSyncTime = new Date();
      this.syncStatus.hasUnsavedLocalChanges = false;
      this.syncStatus.state = SyncState.Synced;

      console.log("Successfully pulled from remote");
    } catch (error) {
      console.error("Failed to pull from remote:", error);
      throw error;
    } finally {
      this._isSyncing = false;
    }
  }

  /**
   * Aggressive approach: Push local changes to remote without checking for conflicts
   * This implements the "screw you" approach for simultaneous edits
   */
  private async aggressivePushToRemote(): Promise<void> {
    if (!this.remoteStorage || this._isSyncing) return;

    try {
      this._isSyncing = true;
      const localCells = await this.localStorage.loadCells();
      const newVersionTag = this.generateVersionTag();

      // Just push everything, don't check remote state
      await this.remoteStorage.saveCells(localCells);
      await this.setRemoteVersionTag(newVersionTag);
      await this.setLocalVersionTag(newVersionTag);
      await this.setLocalSyncedVersionTag(newVersionTag);

      this.syncStatus.lastSyncTime = new Date();
      this.syncStatus.hasUnsavedLocalChanges = false;
      this.syncStatus.state = SyncState.Synced;

      console.log("Aggressively pushed to remote with version:", newVersionTag);
    } catch (error) {
      console.error("Failed to push to remote:", error);
    } finally {
      this._isSyncing = false;
    }
  }

  private async hasLocalChanges(): Promise<boolean> {
    const localVersionTag = await this.localStorage.getItem(this.VERSION_TAG_KEY);
    const localSyncedVersionTag = await this.localStorage.getItem(this.LOCAL_SYNCED_VERSION_KEY);
    return localVersionTag !== localSyncedVersionTag;
  }

  async saveCells(cells: Cell[]): Promise<void> {
    try {
      await this.localStorage.saveCells(cells);

      const newVersionTag = this.generateVersionTag();
      await this.setLocalVersionTag(newVersionTag);

      this.syncStatus.lastModifiedTime = new Date();
      this.syncStatus.hasUnsavedLocalChanges = true;
      this.syncStatus.state = SyncState.LocalChanges;

      // Aggressive approach: immediately push to remote
      await this.aggressivePushToRemote();
    } catch (error) {
      console.error("Failed to save cells:", error);
      throw error;
    }
  }

  async loadCells(): Promise<Cell[]> {
    try {
      if (this.isFirstLoad && this.remoteStorage) {
        await this.handleFirstLoadWithUser();
      }

      return await this.localStorage.loadCells();
    } catch (error) {
      console.error("Failed to load cells:", error);
      throw error;
    }
  }

  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  isSyncing(): boolean {
    return this._isSyncing;
  }

  destroy(): void {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
  }

  async cleanLocalStorage(): Promise<void> {
    console.log("Cleaning local storage...");
    await this.localStorage.deleteAll();
    await this.localStorage.removeItem(this.VERSION_TAG_KEY);
    await this.localStorage.removeItem(this.LOCAL_SYNCED_VERSION_KEY);

    this.syncStatus.localVersionTag = null;
    this.syncStatus.hasUnsavedLocalChanges = false;
  }
}

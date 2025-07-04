import { Cell } from "../types/cells";
import { gridStorage } from "./gridStorageRenamed";
import { HybridGridStorage } from "./hybridGridStorage";

/**
 * A storage wrapper that adds debouncing functionality to any gridStorage implementation.
 * This separates the debouncing concern from the actual storage logic.
 */
export class DebouncedStorage implements gridStorage {
  private storage: gridStorage;
  private saveTimeout: any = null;
  private readonly SAVE_DEBOUNCE_TIME = 1000; // 1 second
  private hasUnsavedChanges = false;
  private pendingCells: Cell[] = [];

  constructor(storage: gridStorage) {
    this.storage = storage;

    // Auto-save on page visibility changes (user switching apps, etc.)
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
          this.forceSave();
        }
      });
    }
  }

  async loadCells(): Promise<Cell[]> {
    return this.storage.loadCells();
  }

  async saveCells(cells: Cell[]): Promise<void> {
    this.pendingCells = cells;
    this.debouncedSave();
  }

  setUser(user: any): void {
    if (
      this.storage &&
      "setUser" in this.storage &&
      typeof this.storage.setUser === "function"
    ) {
      this.storage.setUser(user);
    }
  }

  private debouncedSave(): void {
    // Mark that we have unsaved changes
    this.hasUnsavedChanges = true;

    // Clear existing timeout
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    // Set new timeout
    this.saveTimeout = setTimeout(() => {
      this.performSave();
    }, this.SAVE_DEBOUNCE_TIME);
  }

  private async performSave(): Promise<void> {
    if (!this.hasUnsavedChanges) return;

    try {
      await this.storage.saveCells(this.pendingCells);
      this.hasUnsavedChanges = false;
      console.log("Debounced save completed");
    } catch (error) {
      console.error("Failed to save to storage:", error);
      // Retry after a delay
      setTimeout(() => this.debouncedSave(), 5000);
    }
  }

  /**
   * Force immediate save (used when app goes to background, etc.)
   */
  async forceSave(): Promise<void> {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }

    if (this.hasUnsavedChanges) {
      await this.performSave();
    }
  }

  /**
   * Force sync to remote if using hybrid storage
   */
  async forceSyncToRemote(): Promise<void> {
    if (this.storage instanceof HybridGridStorage) {
      await this.forceSave(); // Ensure local is up to date first
      await this.storage.forceSyncToRemote();
    }
  }

  /**
   * Get sync status if using hybrid storage
   */
  getSyncStatus() {
    if (this.storage instanceof HybridGridStorage) {
      return {
        ...this.storage.getSyncStatus(),
        hasUnsavedLocalChanges: this.hasUnsavedChanges,
      };
    }
    return {
      hasUnsavedLocalChanges: this.hasUnsavedChanges,
    };
  }

  /**
   * Cleanup method - call when app is closing
   */
  async cleanup(): Promise<void> {
    if (this.storage instanceof HybridGridStorage) {
      this.storage.stopPeriodicSync();
    }
    await this.forceSave();
  }
}

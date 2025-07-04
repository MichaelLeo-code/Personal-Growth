import { FIREBASE_AUTH } from "@/firebase";
import { User, onAuthStateChanged } from "firebase/auth";
import { DebouncedStorage } from "../storage/debouncedStorage";
import { HybridGridStorage } from "../storage/hybridGridStorage";

/**
 * Service dedicated to managing storage and sync operations.
 * Handles authentication changes and provides a single storage instance
 * that can be shared across the application.
 */
class StorageService {
  private storage: DebouncedStorage;

  constructor() {
    const hybridStorage = new HybridGridStorage(FIREBASE_AUTH.currentUser);
    this.storage = new DebouncedStorage(hybridStorage);

    // Set up auth state listener to update storage when user changes
    onAuthStateChanged(FIREBASE_AUTH, (user) => {
      console.log("Auth state changed:", user?.uid || "null");
      this.setUser(user);
    });
  }

  /**
   * Get the storage instance
   */
  getStorage(): DebouncedStorage {
    return this.storage;
  }

  /**
   * Update user for the storage layer
   */
  setUser(user: User | null): void {
    this.storage.setUser(user);
  }

  /**
   * Force sync to remote storage
   */
  async forceSyncToRemote(): Promise<void> {
    await this.storage.forceSyncToRemote();
  }

  /**
   * Get current sync status
   */
  getSyncStatus() {
    return this.storage.getSyncStatus();
  }

  /**
   * Force save to local storage
   */
  async forceSave(): Promise<void> {
    await this.storage.forceSave();
  }

  /**
   * Cleanup method - call when app is closing
   */
  async cleanup(): Promise<void> {
    await this.storage.cleanup();
  }
}

export const storageService = new StorageService();

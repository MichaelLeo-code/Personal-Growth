import { FIREBASE_AUTH } from "@/firebase";
import { HybridGridStorage, ConflictResolutionPrompt } from "@/storage";
import { onAuthStateChanged } from "firebase/auth";

/**
 * Service dedicated to managing storage and sync operations.
 * Handles authentication changes and provides a single storage instance
 * that can be shared across the application.
 */
class StorageService {
  private storage: HybridGridStorage;
  private authChangeCallbacks: (() => void)[] = [];

  constructor() {
    console.log("StorageService: constructor() called");
    this.storage = new HybridGridStorage(FIREBASE_AUTH.currentUser);

    onAuthStateChanged(FIREBASE_AUTH, (user) => {
      console.log("StorageService: Auth state changed:", user?.uid || "null");
      this.storage.setUser(user);

      this.authChangeCallbacks.forEach((callback) => callback());
    });
    console.log("StorageService: constructor() completed");
  }

  getStorage(): HybridGridStorage {
    console.log("StorageService: getStorage() called");
    return this.storage;
  }

  getSyncStatus(): {
    lastSyncTime: Date | null;
    lastModifiedTime: Date;
  } {
    console.log("StorageService: getSyncStatus() called");
    const status = this.storage.getSyncStatus();
    console.log("StorageService: getSyncStatus() returning:", status);
    return status;
  }

  isSyncing(): boolean {
    console.log("StorageService: isSyncing() called");
    const syncing = this.storage.isSyncing();
    console.log("StorageService: isSyncing() returning:", syncing);
    return syncing;
  }

  async forcePushToRemote(): Promise<void> {
    console.log("StorageService: forcePushToRemote() called");
    await this.storage.forcePushToRemote();
    console.log("StorageService: forcePushToRemote() completed");
  }

  async forceFetchFromRemote(): Promise<void> {
    console.log("StorageService: forceFetchFromRemote() called");
    await this.storage.forceFetchFromRemote();
    console.log("StorageService: forceFetchFromRemote() completed");
  }

  onAuthChange(callback: () => void): () => void {
    console.log("StorageService: onAuthChange() called - registering callback");
    this.authChangeCallbacks.push(callback);
    return () => {
      console.log("StorageService: onAuthChange() - unregistering callback");
      this.authChangeCallbacks = this.authChangeCallbacks.filter(
        (cb) => cb !== callback
      );
    };
  }

  /**
   * Set the handler for conflict resolution prompts
   */
  setConflictPromptHandler(
    handler: (prompt: ConflictResolutionPrompt) => void
  ): void {
    this.storage.setConflictPromptHandler(handler);
  }
}

export const storageService = new StorageService();

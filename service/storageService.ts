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
  private authChangeCallbacks: (() => void)[] = [];

  constructor() {
    const hybridStorage = new HybridGridStorage(FIREBASE_AUTH.currentUser);
    this.storage = new DebouncedStorage(hybridStorage);

    onAuthStateChanged(FIREBASE_AUTH, (user) => {
      console.log("StorageService: Auth state changed:", user?.uid || "null");
      this.setUser(user);

      this.authChangeCallbacks.forEach((callback) => callback());
    });
  }

  getStorage(): DebouncedStorage {
    return this.storage;
  }

  setUser(user: User | null): void {
    this.storage.setUser(user);
  }

  async forceSyncToRemote(): Promise<void> {
    await this.storage.forceSyncToRemote();
  }

  getSyncStatus() {
    return this.storage.getSyncStatus();
  }

  async forceSave(): Promise<void> {
    await this.storage.forceSave();
  }

  async cleanup(): Promise<void> {
    await this.storage.cleanup();
  }

  onAuthChange(callback: () => void): () => void {
    this.authChangeCallbacks.push(callback);
    return () => {
      this.authChangeCallbacks = this.authChangeCallbacks.filter(
        (cb) => cb !== callback
      );
    };
  }
}

export const storageService = new StorageService();

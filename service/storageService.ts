import { FIREBASE_AUTH } from "@/firebase";
import { HybridGridStorage } from "@/storage";
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
    this.storage = new HybridGridStorage(FIREBASE_AUTH.currentUser);

    onAuthStateChanged(FIREBASE_AUTH, (user) => {
      console.log("StorageService: Auth state changed:", user?.uid || "null");
      this.storage.setUser(user);

      this.authChangeCallbacks.forEach((callback) => callback());
    });
  }

  getStorage(): HybridGridStorage {
    return this.storage;
  }

  getSyncStatus(): {
    lastSyncTime: Date | null;
    lastModifiedTime: Date;
  } {
    return this.storage.getSyncStatus();
  }

  isSyncing(): boolean {
    return this.storage.isSyncing();
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

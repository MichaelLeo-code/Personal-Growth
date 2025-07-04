import { FIREBASE_AUTH } from "../firebase";
import { HybridGridStorage } from "../storage";
import { DebouncedCellService } from "./debouncedCellService";

// Create the hybrid storage instance
const hybridStorage = new HybridGridStorage(FIREBASE_AUTH.currentUser);

// Update user when auth state changes
FIREBASE_AUTH.onAuthStateChanged((user) => {
  hybridStorage.setUser(user);
});

export const cellService = new DebouncedCellService(hybridStorage);

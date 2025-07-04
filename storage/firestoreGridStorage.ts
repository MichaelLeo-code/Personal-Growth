import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from "firebase/firestore";
import { User } from "firebase/auth";
import { FIREBASE_DB } from "../firebase";
import { Cell } from "../types/cells";
import { gridStorage } from "./gridStorage";

export class FirestoreGridStorage implements gridStorage {
  private readonly collectionName: string;
  private user: User | null;

  constructor(user: User | null, collectionName: string = "grid_cells") {
    this.collectionName = collectionName;
    this.user = user;
  }

  /**
   * Update the current user for this storage instance
   */
  setUser(user: User | null): void {
    this.user = user;
  }

  /**
   * Get the user-specific collection reference
   */
  private getUserCollection() {
    if (!this.user) {
      throw new Error("User must be authenticated to access Firestore storage");
    }
    return collection(FIREBASE_DB, "users", this.user.uid, this.collectionName);
  }

  async saveCells(cells: Cell[]): Promise<void> {
    if (!this.user) {
      throw new Error("User must be authenticated to save cells");
    }

    try {
      const userCollection = this.getUserCollection();
      
      // Get existing documents to compare
      const existingDocs = await getDocs(userCollection);
      const newCellIds = new Set(cells.map(cell => cell.id.toString()));

      // Find cells to delete (exist in Firestore but not in new cells array)
      const cellsToDelete = existingDocs.docs.filter(doc => !newCellIds.has(doc.id));
      
      // Find cells to update or create
      const cellsToSave = cells.filter(cell => {
        const cellId = cell.id.toString();
        const existingDoc = existingDocs.docs.find(doc => doc.id === cellId);
        
        if (!existingDoc) {
          // New cell - needs to be saved
          return true;
        }
        
        // Compare existing data with new data (excluding updatedAt field)
        const existingData = existingDoc.data();
        const { updatedAt, ...existingCellData } = existingData;
        
        // Simple deep comparison - you might want to use a library like lodash for more complex comparisons
        return JSON.stringify(existingCellData) !== JSON.stringify(cell);
      });

      // Execute deletions
      const deletePromises = cellsToDelete.map(docToDelete => deleteDoc(docToDelete.ref));
      
      // Execute updates/creates
      const savePromises = cellsToSave.map(cell => {
        const docRef = doc(userCollection, cell.id.toString());
        return setDoc(docRef, {
          ...cell,
          updatedAt: new Date().toISOString()
        });
      });

      // Run all operations
      await Promise.all([...deletePromises, ...savePromises]);
      
      console.log(`Firestore sync: ${cellsToDelete.length} deleted, ${cellsToSave.length} updated/created`);
    } catch (error) {
      console.error("Failed to save cells to Firestore:", error);
      throw new Error("Failed to save cells to Firestore");
    }
  }

  async loadCells(): Promise<Cell[]> {
    if (!this.user) {
      throw new Error("User must be authenticated to load cells");
    }

    try {
      const userCollection = this.getUserCollection();
      const q = query(userCollection, orderBy("id"));
      const querySnapshot = await getDocs(q);
      
      const cells: Cell[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Remove the updatedAt field before returning the cell
        const { updatedAt, ...cellData } = data;
        cells.push(cellData as Cell);
      });

      return cells;
    } catch (error) {
      console.error("Failed to load cells from Firestore:", error);
      throw new Error("Failed to load cells from Firestore");
    }
  }

  /**
   * Clear all cells for the current user
   */
  async clearCells(): Promise<void> {
    if (!this.user) {
      throw new Error("User must be authenticated to clear cells");
    }

    try {
      const userCollection = this.getUserCollection();
      const querySnapshot = await getDocs(userCollection);
      
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error("Failed to clear cells from Firestore:", error);
      throw new Error("Failed to clear cells from Firestore");
    }
  }
}

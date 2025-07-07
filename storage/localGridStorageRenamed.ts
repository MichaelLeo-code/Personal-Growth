import AsyncStorage from "@react-native-async-storage/async-storage";
import { Cell } from "../types/cells";
import { gridStorage } from "./gridStorageRenamed";

export class localGridStorage implements gridStorage {
  private readonly storageKey: string;

  constructor(storageKey: string = "grid_cells") {
    this.storageKey = storageKey;
  }

  async saveCells(cells: Cell[]): Promise<void> {
    try {
      // Load existing cells to compare and update only changed ones
      const existingCells = await this.loadCells();
      const existingCellsMap = new Map(existingCells.map(cell => [cell.id, cell]));
      
      const now = new Date().toISOString();
      
      // Update timestamps only for cells that have actually changed
      const cellsWithUpdatedTimestamps = cells.map(cell => {
        const existingCell = existingCellsMap.get(cell.id);
        
        if (!existingCell) {
          // New cell - set both created and updated timestamps
          return {
            ...cell,
            createdAt: cell.createdAt || now,
            updatedAt: now
          };
        }
        
        // Check if cell content has changed (excluding timestamps)
        const { createdAt: existingCreated, updatedAt: existingUpdated, ...existingContent } = existingCell;
        const { createdAt: newCreated, updatedAt: newUpdated, ...newContent } = cell;
        
        const hasChanged = JSON.stringify(existingContent) !== JSON.stringify(newContent);
        
        if (hasChanged) {
          // Cell has changed - update timestamp
          return {
            ...cell,
            createdAt: existingCell.createdAt || cell.createdAt || now,
            updatedAt: now
          };
        } else {
          // Cell unchanged - keep existing timestamps
          return {
            ...cell,
            createdAt: existingCell.createdAt || cell.createdAt || now,
            updatedAt: existingCell.updatedAt || cell.updatedAt || now
          };
        }
      });

      const json = JSON.stringify(cellsWithUpdatedTimestamps);
      await AsyncStorage.setItem(this.storageKey, json);
    } catch (error) {
      console.error("Failed to save cells:", error);
      throw new Error("Failed to save cells to local storage");
    }
  }

  async loadCells(): Promise<Cell[]> {
    try {
      const data = await AsyncStorage.getItem(this.storageKey);
      if (!data) return [];
      return JSON.parse(data);
    } catch (error) {
      console.error("Failed to load cells:", error);
      throw new Error("Failed to load cells from local storage");
    }
  }
}

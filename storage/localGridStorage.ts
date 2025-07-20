import AsyncStorage from "@react-native-async-storage/async-storage";
import { Cell } from "../types/cells";
import { gridStorage } from "./gridStorage";

export class localGridStorage implements gridStorage {
  private readonly storageKey: string;

  constructor(storageKey: string = "grid_cells") {
    this.storageKey = storageKey;
  }

  async saveCells(cells: Cell[]): Promise<void> {
    try {
      const json = JSON.stringify(cells);
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

  async deleteAll(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error("Failed to delete all cells:", error);
      throw new Error("Failed to delete all cells from local storage");
    }
  }
}

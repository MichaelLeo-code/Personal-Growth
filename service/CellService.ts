import { FIREBASE_AUTH } from "@/firebase";
import { FirestoreGridStorage, gridStorage } from "../storage";
import { Cell, CellType } from "../types/cells";

import { User, onAuthStateChanged } from "firebase/auth";
import { coordinateService } from "./coordinateService";

const directions8 = [
  [2, 0],
  [2, 2],
  [2, -2],
  [-2, 0],
  [-2, 2],
  [-2, -2],
  [0, 2],
  [0, -2],
];

class CellService {
  private cellMap: Map<number, Cell> = new Map();
  private listeners: (() => void)[] = [];
  private selectedId: number | null = null;
  private nextId = 1;
  private storage: gridStorage;

  constructor(storage: gridStorage) {
    this.storage = storage;

    if (FIREBASE_AUTH.currentUser) {
      this.loadInitialData();
    }

    onAuthStateChanged(FIREBASE_AUTH, (user) => {
      console.log("Auth state changed:", user?.uid || "null");
      this.setUser(user);

      if (user && this.cellMap.size === 0) {
        this.loadInitialData();
      }
    });

  }

  setUser(user: User | null): void {
    if (this.storage instanceof FirestoreGridStorage)
      this.storage.setUser(user);
  }

  private async loadInitialData() {
    try {
      const cells = await this.storage.loadCells();
      cells.forEach((cell: Cell) => {
        this.cellMap.set(cell.id, cell);
        if (cell.id >= this.nextId) {
          this.nextId = cell.id + 1;
        }
        coordinateService.occupyArea(cell.x, cell.y, cell.size, cell.id);
      });
      this.notify();
    } catch (error) {
      console.error("Failed to load initial data:", error);
    }
  }

  private async saveToStorage() {
    try {
      await this.storage.saveCells(this.getCells());
    } catch (error) {
      console.error("Failed to save to storage:", error);
    }
  }

  getCells(): Cell[] {
    return Array.from(this.cellMap.values());
  }

  addCell(
    cell: Omit<Cell, "id" | "type" | "size"> & {
      type?: CellType;
      size?: { x: number; y: number };
    }
  ): Cell | undefined {
    if (coordinateService.isOccupied(cell.x, cell.y)) {
      console.warn(
        `Cell at (${cell.x}, ${cell.y}) is already occupied. Cannot add new cell.`
      );
      return undefined;
    }
    const id = this.nextId++;
    const cellType = cell.type || CellType.Headline;
    const cellSize =
      cell.size || cellType === CellType.Headline
        ? { x: 1, y: 1 }
        : { x: 3, y: 3 };
    const newCell: Cell = {
      ...cell,
      id,
      type: cellType,
      size: cellSize,
    };

    if (newCell.parent !== undefined) {
      const parentCell = this.cellMap.get(newCell.parent);
      if (parentCell) {
        parentCell.children = [...(parentCell.children || []), newCell.id];
      }
    }

    this.cellMap.set(newCell.id, newCell);
    coordinateService.occupyArea(
      newCell.x,
      newCell.y,
      newCell.size,
      newCell.id
    );
    this.notify();
    this.saveToStorage();

    return newCell;
  }

  getCellAt(x: number, y: number): Cell | undefined {
    return Array.from(this.cellMap.values()).find(
      (c) => c.x === x && c.y === y
    );
  }

  getCellById(id: number): Cell | undefined {
    return this.cellMap.get(id);
  }

  getNextFreeCellCoordinates(id: number): { x: number; y: number } | undefined {
    const cell = this.getCellById(id);
    if (!cell)
      throw new Error(
        "The cell that you are trying to search neighbours for does not exist"
      );
    for (const [dx, dy] of directions8) {
      const nx = cell.x + dx;
      const ny = cell.y + dy;
      if (!coordinateService.isOccupied(nx, ny)) {
        return { x: nx, y: ny };
      }
    }
    return undefined;
  }

  addNextFreeCell(nextToId: number, type?: CellType): Cell | undefined {
    const coordinates = this.getNextFreeCellCoordinates(nextToId);
    if (!coordinates) return undefined;
    const { x, y } = coordinates;
    return this.addCell({
      x,
      y,
      text: "newCell",
      parent: nextToId,
      type: type ? type : CellType.Headline,
    });
  }

  selectCell(cell: Cell): void {
    this.selectedId = cell.id;
    this.notify();
  }

  getSelected(): Cell | null {
    return this.selectedId !== null
      ? this.cellMap.get(this.selectedId) || null
      : null;
  }

  deleteCell(id: number): void {
    const cell = this.cellMap.get(id);
    if (!cell) return;

    if (cell.parent !== undefined) {
      const parentCell = this.cellMap.get(cell.parent);
      if (parentCell) {
        parentCell.children = parentCell.children?.filter(
          (childId) => childId !== id
        );
      }
    }

    this.cellMap.delete(id);
    coordinateService.deleteArea(cell.x, cell.y, cell.size);
    this.notify();
    this.saveToStorage();
  }

  deleteAll(): void {
    this.cellMap.clear();
    this.selectedId = null;
    coordinateService.clear();
    this.nextId = 1;
    this.addCell({ text: "Starting point", x: 0, y: 0 });
    this.notify();
    this.saveToStorage();
  }

  renameCell(id: number, newTitle: string): boolean {
    const cell = this.cellMap.get(id);
    if (!cell) return false;
    cell.text = newTitle;
    this.cellMap.set(id, cell);
    this.notify();
    this.saveToStorage();
    return true;
  }

  moveCell(id: number, newX: number, newY: number): boolean {
    const cell = this.cellMap.get(id);
    if (!cell) return false;

    const existingCellId = coordinateService.getCellIdAt(newX, newY);
    if (existingCellId !== undefined && existingCellId !== id) {
      console.warn(
        `Cannot move cell to (${newX}, ${newY}) - position is occupied by cell ${existingCellId}`
      );
      return false;
    }

    coordinateService.deleteArea(cell.x, cell.y, cell.size);

    cell.x = newX;
    cell.y = newY;

    coordinateService.occupyArea(cell.x, cell.y, cell.size, cell.id);

    this.cellMap.set(id, cell);
    this.notify();
    this.saveToStorage();
    return true;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach((listener) => listener());
  }
}
export const cellService = new CellService(
  new FirestoreGridStorage(FIREBASE_AUTH.currentUser)
);

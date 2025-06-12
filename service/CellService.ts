import { GridStorage } from "../storage/GridStorage";
import { Cell, CellType } from "../types/cells";

import { LocalGridStorage } from "../storage";

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

class GridStore {
  private cellMap: Map<number, Cell> = new Map();
  private listeners: (() => void)[] = [];
  private selectedId: number | null = null;
  private nextId = 1;
  private storage: GridStorage;

  constructor(storage: GridStorage) {
    this.storage = storage;
    this.loadInitialData();
  }

  private async loadInitialData() {
    try {
      const cells = await this.storage.loadCells();
      cells.forEach((cell: Cell) => {
        this.cellMap.set(cell.id, cell);
        if (cell.id >= this.nextId) {
          this.nextId = cell.id + 1;
        }
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
    cell: Omit<Cell, "id" | "type"> & { type?: CellType }
  ): Cell | undefined {
    if (this.getCellAt(cell.x, cell.y)) {
      console.warn(
        `Cell at (${cell.x}, ${cell.y}) already exists. Cannot add new cell.`
      );
      return undefined;
    }
    const id = this.nextId++;
    const newCell: Cell = { ...cell, id, type: cell.type || CellType.Headline };

    if (newCell.parent !== undefined) {
      const parentCell = this.cellMap.get(newCell.parent);
      if (parentCell) {
        parentCell.children = [...(parentCell.children || []), newCell.id];
      }
    }

    this.cellMap.set(newCell.id, newCell);
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
      if (!this.getCellAt(nx, ny)) {
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

    // Remove from parent's children
    if (cell.parent !== undefined) {
      const parentCell = this.cellMap.get(cell.parent);
      if (parentCell) {
        parentCell.children = parentCell.children?.filter(
          (childId) => childId !== id
        );
      }
    }

    this.cellMap.delete(id);
    this.notify();
    this.saveToStorage();
  }

  deleteAll(): void {
    this.cellMap.clear();
    this.selectedId = null;
    this.notify();
    this.saveToStorage();
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
export const gridStore = new GridStore(new LocalGridStorage());

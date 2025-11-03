import { FIREBASE_AUTH } from "@/firebase";
import { Cell, CellType } from "../types/cells";
import { storageService } from "./storageService";

import { calculateDynamicCellSize } from "@/utils";
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

  constructor() {
    if (FIREBASE_AUTH.currentUser) {
         console.log(
            "CellService: v1.0.3 Load initial data if user is already available"
         );
      this.loadInitialData();
    }

    storageService.onAuthChange(async () => {
      this.clear();

      console.log(`CellService: v1.0.3 Auth state changed in CellService. cellmap is size ${this.cellMap.size}, ${FIREBASE_AUTH.currentUser}`);
      if (FIREBASE_AUTH.currentUser) {

        this.loadInitialData();
      }
      if (!FIREBASE_AUTH.currentUser) {
        console.log("CellService: User logged out, clearing cell data.");
        this.deleteAll();
        await storageService.getStorage().cleanLocalStorage();
      }
    });
  }

  private async loadInitialData() {
    console.log("CellService: Loading initial data...");
    try {
      const cells = await storageService.getStorage().loadCells();
         console.log(`CellService: initially loaded ${cells.length} cells`);
      cells.forEach((cell: Cell) => {
        this.cellMap.set(cell.id, cell);
        if (cell.id >= this.nextId) {
          this.nextId = cell.id + 1;
        }
        coordinateService.occupyArea(cell.x, cell.y, cell.size, cell.id);
      });
      this.notify();
    } catch (error) {
      console.error("CellService: Failed to load initial data:", error);
    }
  }

  async reloadCells() {
    console.log("CellService: Reloading cells from storage...");
    this.clear();
    await this.loadInitialData();
  }

  async saveToStorage() {
    try {
      await storageService.getStorage().saveCells(this.getCells());
    } catch (error) {
         console.error("CellService: Failed to save to storage:", error);
    }
  }

  getCells(): Cell[] {
    return Array.from(this.cellMap.values());
  }

  addCell(
    cell: Omit<Cell, "id" | "type" | "size" | "updatedAt"> & {
      type?: CellType;
      size?: { x: number; y: number };
    }
  ): Cell | undefined {
    const cellType = cell.type || CellType.Headline;
    const cellSize =
      cell.size || calculateDynamicCellSize({ ...cell, type: cellType });

    if (coordinateService.isOccupiedArea(cell.x, cell.y, cellSize)) {
      console.warn(
        `CellService: Cell at (${cell.x}, ${cell.y}) is already occupied. Cannot add new cell.`
      );
      return undefined;
    }
    const id = this.nextId++;

    const newCell: Cell = {
      ...cell,
      id,
      type: cellType,
      size: cellSize,
      updatedAt: new Date().toISOString(),
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
    const cellId = coordinateService.getCellIdAt(x, y);
    return cellId !== undefined ? this.cellMap.get(cellId) : undefined;
  }

  getCellById(id: number): Cell | undefined {
    return this.cellMap.get(id);
  }

   getNextFreeCellCoordinates(
      id: number
   ): { x: number; y: number } | undefined {
    const cell = this.getCellById(id);
    if (!cell)
      throw new Error(
        "CellService: The cell that you are trying to search neighbours for does not exist"
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

  tempAddStart() {
    const newCell: Cell = {
      x: 0,
      y: 0,
      id: 1,
      type: CellType.Headline,
      size: { x: 1, y: 1 },
      text: "Me",
      children: [2],
      updatedAt: new Date().toISOString(),
    };
    this.cellMap.set(1, newCell);
    coordinateService.occupyArea(
      newCell.x,
      newCell.y,
      newCell.size,
      newCell.id
    );
    this.notify();
    this.saveToStorage();
  }

  addNextFreeCell(nextToId: number, type?: CellType): Cell | undefined {
    const coordinates = this.getNextFreeCellCoordinates(nextToId);
    if (!coordinates) return undefined;
    const { x, y } = coordinates;
    return this.addCell({
      x,
      y,
      text: "new cell",
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
    this.addCell({ text: "Me", x: 0, y: 0 });
    this.notify();
  }
  
  clear(): void {
    this.cellMap.clear();
    this.selectedId = null;
    coordinateService.clear();
    this.nextId = 1;
    this.notify();
  }

  renameCell(id: number, newTitle: string): boolean {
    const cell = this.cellMap.get(id);
    if (!cell) return false;
    cell.text = newTitle;
    cell.updatedAt = new Date().toISOString();
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
        `CellService: Cannot move cell to (${newX}, ${newY}) - position is occupied by cell ${existingCellId}`
      );
      return false;
    }

    coordinateService.deleteArea(cell.x, cell.y, cell.size);

    cell.x = newX;
    cell.y = newY;

    coordinateService.occupyArea(cell.x, cell.y, cell.size, cell.id);

    cell.updatedAt = new Date().toISOString();
    this.cellMap.set(id, cell);
    this.notify();
    this.saveToStorage();
    return true;
  }

  updateCellProperties(id: number, updates: Partial<Cell>): boolean {
    const cell = this.cellMap.get(id);
    if (!cell) return false;

    const updatedCell = { ...cell, ...updates };
    updatedCell.updatedAt = new Date().toISOString();
    this.cellMap.set(id, updatedCell);
    this.notify();
    this.saveToStorage();
    return true;
  }

  updateCellSize(id: number): boolean {
    const cell = this.cellMap.get(id);
    if (!cell) return false;

    const newSize = calculateDynamicCellSize(cell);

    if (cell.size.x === newSize.x && cell.size.y === newSize.y) {
      return true;
    }

    // TODO
    coordinateService.deleteArea(cell.x, cell.y, cell.size);
    if (coordinateService.isOccupiedArea(cell.x, cell.y, newSize)) {
      coordinateService.occupyArea(cell.x, cell.y, cell.size, cell.id);
      console.warn(
        `CellService: Cannot resize cell ${id} - new size would conflict with existing cells`
      );
      return false;
    }

    cell.size = newSize;
    cell.updatedAt = new Date().toISOString();
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

export const cellService = new CellService();

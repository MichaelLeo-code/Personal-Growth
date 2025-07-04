import { gridStorage, HybridGridStorage } from "../storage";
import { Cell, CellType } from "../types/cells";
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

class DebouncedCellService {
  private cellMap: Map<number, Cell> = new Map();
  private listeners: (() => void)[] = [];
  private selectedId: number | null = null;
  private nextId = 1;
  private storage: gridStorage;
  private saveTimeout: any = null;
  private readonly SAVE_DEBOUNCE_TIME = 1000; // 1 second
  private hasUnsavedChanges = false;

  constructor(storage: gridStorage) {
    this.storage = storage;
    this.loadInitialData();

    // Auto-save on page visibility changes (user switching apps, etc.)
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
          this.forceSave();
        }
      });
    }
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

  private debouncedSave() {
    // Mark that we have unsaved changes
    this.hasUnsavedChanges = true;

    // Clear existing timeout
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    // Set new timeout
    this.saveTimeout = setTimeout(() => {
      this.performSave();
    }, this.SAVE_DEBOUNCE_TIME);
  }

  private async performSave() {
    if (!this.hasUnsavedChanges) return;

    try {
      await this.storage.saveCells(this.getCells());
      this.hasUnsavedChanges = false;
      console.log("Debounced save completed");
    } catch (error) {
      console.error("Failed to save to storage:", error);
      // Retry after a delay
      setTimeout(() => this.debouncedSave(), 5000);
    }
  }

  /**
   * Force immediate save (used when app goes to background, etc.)
   */
  async forceSave(): Promise<void> {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }

    if (this.hasUnsavedChanges) {
      await this.performSave();
    }
  }

  /**
   * Force sync to remote if using hybrid storage
   */
  async forceSyncToRemote(): Promise<void> {
    if (this.storage instanceof HybridGridStorage) {
      await this.forceSave(); // Ensure local is up to date first
      await this.storage.forceSyncToRemote();
    }
  }

  /**
   * Get sync status if using hybrid storage
   */
  getSyncStatus() {
    if (this.storage instanceof HybridGridStorage) {
      return {
        ...this.storage.getSyncStatus(),
        hasUnsavedLocalChanges: this.hasUnsavedChanges,
      };
    }
    return {
      hasUnsavedLocalChanges: this.hasUnsavedChanges,
    };
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
    this.debouncedSave();

    return newCell;
  }

  getCellAt(x: number, y: number): Cell | undefined {
    const cellId = coordinateService.getCellIdAt(x, y);
    return cellId !== undefined ? this.cellMap.get(cellId) : undefined;
  }

  getCellById(id: number): Cell | undefined {
    return this.cellMap.get(id);
  }

  getNextFreeCellCoordinates(id: number): { x: number; y: number } | undefined {
    const cell = this.cellMap.get(id);
    if (!cell) return undefined;

    for (const [dx, dy] of directions8) {
      const x = cell.x + dx;
      const y = cell.y + dy;
      if (!coordinateService.isOccupied(x, y)) {
        return { x, y };
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
    this.debouncedSave();
  }

  deleteAll(): void {
    this.cellMap.clear();
    this.selectedId = null;
    coordinateService.clear();
    this.nextId = 1;
    this.addCell({ text: "Starting point", x: 0, y: 0 });
    this.notify();
    this.debouncedSave();
  }

  renameCell(id: number, newTitle: string): boolean {
    const cell = this.cellMap.get(id);
    if (!cell) return false;
    cell.text = newTitle;
    this.cellMap.set(id, cell);
    this.notify();
    this.debouncedSave();
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
    this.debouncedSave();
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

  /**
   * Cleanup method - call when app is closing
   */
  async cleanup(): Promise<void> {
    if (this.storage instanceof HybridGridStorage) {
      this.storage.stopPeriodicSync();
    }
    await this.forceSave();
  }
}

export { DebouncedCellService };

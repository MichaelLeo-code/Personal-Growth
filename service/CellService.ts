import { Cell, CellType } from "../types/cells";

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

  getCells(): Cell[] {
    return Array.from(this.cellMap.values());
  }

  private nextId = 1;

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

export const gridStore = new GridStore();

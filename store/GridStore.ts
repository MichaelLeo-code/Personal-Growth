export type Cell = {
  id: number;
  text: string;
  x: number;
  y: number;
  parent?: number;
  children?: number[];
};

class GridStore {
  private cellMap: Map<number, Cell> = new Map();
  private listeners: (() => void)[] = [];
  private selectedId: number | null = null;

  getCells(): Cell[] {
    return Array.from(this.cellMap.values());
  }

  addCell(cell: Cell): void {
    if (this.cellMap.has(cell.id)) return;

    if (cell.parent !== undefined) {
      const parentCell = this.cellMap.get(cell.parent);
      if (parentCell) {
        parentCell.children = [...(parentCell.children || []), cell.id];
      }
    }

    this.cellMap.set(cell.id, cell);
    this.notify();
  }

  getCellAt(x: number, y: number): Cell | undefined {
    return Array.from(this.cellMap.values()).find(
      (c) => c.x === x && c.y === y
    );
  }

  getCellById(id: number): Cell | undefined {
    return this.cellMap.get(id);
  }

  getNextAdjacentCell(x: number, y: number): Cell | undefined {
    const directions = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;
      if (!this.getCellAt(nx, ny)) {
        return { id: Date.now(), x: nx, y: ny, text: "" };
      }
    }
    return undefined;
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

  private notify() {
    this.listeners.forEach((listener) => listener());
  }
}

export const gridStore = new GridStore();

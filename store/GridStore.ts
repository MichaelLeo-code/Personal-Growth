export type Cell = {
  text: string;
  x: number;
  y: number;
};

class GridStore {
  private cells: Cell[] = [];
  private listeners: (() => void)[] = [];

  getCells(): Cell[] {
    return [...this.cells];
  }

  addCell(cell: Cell): void {
    const exists = this.cells.some((c) => c.x === cell.x && c.y === cell.y);
    if (!exists) {
      this.cells.push(cell);
      this.notify();
    }
  }

  getCellAt(x: number, y: number): Cell | undefined {
    return this.cells.find((c) => c.x === x && c.y === y);
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
        return { x: nx, y: ny, text: "" };
      }
    }
    return undefined;
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

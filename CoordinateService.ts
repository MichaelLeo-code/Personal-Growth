class CoordinateService {
  // Map<x, Map<y, cellId>>
  private coordMap: Map<number, Map<number, number>> = new Map();

  occupyOne(x: number, y: number, cellId: number): void {
    if (!this.coordMap.has(x)) {
      this.coordMap.set(x, new Map());
    }
    this.coordMap.get(x)!.set(y, cellId);
  }

  occupyArea(x1: number, x2: number, y1: number, y2: number, cellId: number): void {
    for (let x = x1; x <= x2; x++) {
      for (let y = y1; y <= y2; y++) {
        this.occupyOne(x, y, cellId);
      }
    }
  }

  deleteOne(x: number, y: number): void {
    const yMap = this.coordMap.get(x);
    if (yMap) {
      yMap.delete(y);
      if (yMap.size === 0) {
        this.coordMap.delete(x);
      }
    }
  }

  deleteArea(x1: number, x2: number, y1: number, y2: number): void {
    for (let x = x1; x <= x2; x++) {
      for (let y = y1; y <= y2; y++) {
        this.deleteOne(x, y);
      }
    }
  }

  getCellIdAt(x: number, y: number): number | undefined {
    return this.coordMap.get(x)?.get(y);
  }

  isOccupied(x: number, y: number): boolean {
    return this.coordMap.get(x)?.has(y) ?? false;
  }

  isOccupiedArea(x1: number, x2: number, y1: number, y2: number): boolean {
    for (let x = x1; x <= x2; x++) {
      for (let y = y1; y <= y2; y++) {
        if (!this.isOccupied(x, y)) {
          return false;
        }
      }
    }
    return true;
  }
}

export const coordinateService = new CoordinateService();
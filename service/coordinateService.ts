class CoordinateService {
  // Map<x, Map<y, cellId>>
  private coordinatesMap: Map<number, Map<number, number>> = new Map();

  occupyOne(x: number, y: number, cellId: number): void {
    if (!this.coordinatesMap.has(x)) {
      this.coordinatesMap.set(x, new Map());
    }
    this.coordinatesMap.get(x)!.set(y, cellId);
  }

  occupyArea(
    x: number,
    y: number,
    size: { x: number; y: number },
    cellId: number
  ): void {
    for (let i = x; i <= size.x; i++) {
      for (let j = y; j <= size.y; j++) {
        this.occupyOne(x, y, cellId);
      }
    }
  }

  deleteOne(x: number, y: number): void {
    const yMap = this.coordinatesMap.get(x);
    if (yMap) {
      yMap.delete(y);
      if (yMap.size === 0) {
        this.coordinatesMap.delete(x);
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
    return this.coordinatesMap.get(x)?.get(y);
  }

  isOccupied(x: number, y: number): boolean {
    return this.coordinatesMap.get(x)?.has(y) ?? false;
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

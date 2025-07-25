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
    for (let i = -1; i <= size.x; i++) {
      for (let j = -1; j <= size.y; j++) {
        this.occupyOne(x + i, y + j, cellId);
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

  deleteArea(x: number, y: number, size: { x: number; y: number }): void {
    for (let i = -1; i <= size.x; i++) {
      for (let j = -1; j <= size.y; j++) {
        this.deleteOne(x + i, y + j);
      }
    }
  }

  getCellIdAt(x: number, y: number): number | undefined {
    return this.coordinatesMap.get(x)?.get(y);
  }

  isOccupied(x: number, y: number): boolean {
    return this.coordinatesMap.get(x)?.has(y) ?? false;
  }

  toString(): string {
    let output = "";

    this.coordinatesMap.forEach((innerMap, x) => {
      innerMap.forEach((value, y) => {
        output += `(${x}, ${y}) => ${value}\n`;
      });
    });

    return output || "No occupied coordinates";
  }

  isOccupiedArea(
    x: number,
    y: number,
    size: { x: number; y: number }
  ): boolean {
    for (let i = 0; i < size.x; i++) {
      for (let j = 0; j < size.y; j++) {
        if (this.isOccupied(x + i, y + j)) {
          return true;
        }
      }
    }
    return false;
  }

  clear(): void {
    this.coordinatesMap.clear();
  }
}

export const coordinateService = new CoordinateService();

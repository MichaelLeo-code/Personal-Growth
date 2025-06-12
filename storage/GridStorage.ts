import { Cell } from "../types/cells";

export interface GridStorage {
  saveCells(cells: Cell[]): Promise<void>;
  loadCells(): Promise<Cell[]>;
}

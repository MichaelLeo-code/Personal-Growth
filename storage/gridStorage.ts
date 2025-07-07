import { Cell } from "../types/cells";

export interface gridStorage {
  saveCells(cells: Cell[]): Promise<void>;
  loadCells(): Promise<Cell[]>;
}

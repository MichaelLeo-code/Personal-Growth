import { Cell } from "../types/cells";

export interface gridStorage {
  saveCells(cells: Cell[]): Promise<void>;
  loadCells(): Promise<Cell[]>;
  // Optional methods for hybrid storage
  forceSyncToRemote?(): Promise<void>;
  syncFromRemote?(): Promise<Cell[]>;
  isOnline?(): Promise<boolean>;
  getLastSyncTime?(): Date | null;
}

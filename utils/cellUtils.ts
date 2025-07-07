import { Cell, CellType, HeadlineCell, TaskListCell } from "../types/cells";
import { Task } from "../types/task";

/**
 * Utility functions for working with cells and timestamps
 */

/**
 * Creates a new cell with proper timestamps
 */
export function createCell(
  id: number,
  type: CellType,
  text: string,
  x: number,
  y: number,
  size: { x: number; y: number },
  options?: {
    parent?: number;
    children?: number[];
    tasks?: Task[];
  }
): Cell {
  const now = new Date().toISOString();

  const baseCell = {
    id,
    text,
    x,
    y,
    parent: options?.parent,
    children: options?.children,
    size,
    createdAt: now,
    updatedAt: now,
  };

  if (type === CellType.Headline) {
    return {
      ...baseCell,
      type: CellType.Headline,
    } as HeadlineCell;
  } else {
    return {
      ...baseCell,
      type: CellType.Tasklist,
      tasks: options?.tasks || [],
    } as TaskListCell;
  }
}

/**
 * Updates a cell's content and timestamp
 */
export function updateCell(cell: Cell, updates: Partial<Cell>): Cell {
  const now = new Date().toISOString();

  return {
    ...cell,
    ...updates,
    updatedAt: now,
    // Don't overwrite createdAt
    createdAt: cell.createdAt,
  };
}

/**
 * Checks if two cells have the same content (excluding timestamps)
 */
export function cellsContentEqual(cell1: Cell, cell2: Cell): boolean {
  const { createdAt: c1, updatedAt: u1, ...content1 } = cell1;
  const { createdAt: c2, updatedAt: u2, ...content2 } = cell2;

  return JSON.stringify(content1) === JSON.stringify(content2);
}

/**
 * Gets the latest timestamp from an array of cells
 */
export function getLatestCellTimestamp(cells: Cell[]): Date {
  if (cells.length === 0) return new Date(0);

  const latestTimestamp = Math.max(
    ...cells.map((cell) => new Date(cell.updatedAt).getTime())
  );

  return new Date(latestTimestamp);
}

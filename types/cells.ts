import { Task } from "./task";

export interface BaseCell {
  id: number;
  text: string;
  x: number;
  y: number;
  parent?: number;
  children?: number[];
  size: {
    x: number;
    y: number;
  };
  updatedAt: string;
}

export interface MinuteEntry {
  minutes: number;
  timestamp: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
  };
}

export interface HeadlineCell extends BaseCell {
  type: CellType.Headline;
  minuteEntries?: MinuteEntry[];
}
export interface TaskListCell extends BaseCell {
  type: CellType.Tasklist;
  tasks?: Task[];
  daily?: boolean;
  lastResetDate?: string;
}

export enum CellType {
  Headline = "headline",
  Tasklist = "tasklist",
}

export type Cell = HeadlineCell | TaskListCell;

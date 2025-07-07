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
  createdAt: string;
  updatedAt: string;
}

export interface HeadlineCell extends BaseCell {
  type: CellType.Headline;
}
export interface TaskListCell extends BaseCell {
  type: CellType.Tasklist;
  tasks?: Task[];
}

export enum CellType {
  Headline = "headline",
  Tasklist = "tasklist",
}

export type Cell = HeadlineCell | TaskListCell;

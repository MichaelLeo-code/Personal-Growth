import { CellType } from "@/types/cells";
import { Task } from "../types/task";
import { gridStore } from "./GridStore";
let nextId = 0;

export function addTask(task: Omit<Task, "id">, parent: number): Task | null {
  const id = nextId++;
  const newTask: Task = { ...task, id };

  if (task.parent === undefined) {
    const parentCell = gridStore.getCellById(parent);
    if (parentCell && parentCell.type === CellType.Tasklist) {
      parentCell.tasks = [...(parentCell.tasks || []), newTask];
    }
  }

  gridStore.notify();

  if (task.parent === undefined) {
    const log = gridStore.getCellById(parent);
    console.log(log);
  }
  return newTask;
}


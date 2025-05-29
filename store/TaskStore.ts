import { CellType } from "@/types/cells";
import { Task } from "../types/task";
import { gridStore } from "./GridStore";
let nextId = 0;

export function addTask(task: Omit<Task, "id">, parentId: number): Task | null {
  const id = nextId++;
  const newTask: Task = { ...task, id };

  const parentCell = gridStore.getCellById(parentId);
  if (parentCell && parentCell.type === CellType.Tasklist) {
    parentCell.tasks = [...(parentCell.tasks || []), newTask];
  }

  gridStore.notify();

  return newTask;
}

export function deleteTask(taskId: number, parentId: number): boolean {
  const parentCell = gridStore.getCellById(parentId);
  if (!parentCell || parentCell.type !== CellType.Tasklist) {
    return false;
  }

  const taskIndex =
    parentCell.tasks?.findIndex((task) => task.id === taskId) ?? -1;
  if (taskIndex === -1) {
    return false;
  }

  parentCell.tasks = parentCell.tasks?.filter((task) => task.id !== taskId);
  gridStore.notify();
  return true;
}

export function updateTask(
  taskId: number,
  parentId: number,
  updates: Partial<Omit<Task, "id">>
): Task | null {
  const parentCell = gridStore.getCellById(parentId);
  if (!parentCell || parentCell.type !== CellType.Tasklist) {
    return null;
  }

  const taskIndex =
    parentCell.tasks?.findIndex((task) => task.id === taskId) ?? -1;
  if (taskIndex === -1) {
    return null;
  }

  const updatedTask = { ...parentCell.tasks![taskIndex], ...updates };
  parentCell.tasks![taskIndex] = updatedTask;
  gridStore.notify();
  return updatedTask;
}

export function completeTask(
  taskId: number,
  parentId: number,
  completed: boolean = true
): Task | null {
  return updateTask(taskId, parentId, { completed });
}

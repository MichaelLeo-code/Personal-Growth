import { CellType, TaskListCell } from "@/types/cells";
import { Task } from "../types/task";
import { gridStore } from "./CellService";
let nextId = 0;

function getTaskListCell(parentId: number): TaskListCell | null {
  const parentCell = gridStore.getCellById(parentId);
  if (!parentCell || parentCell.type !== CellType.Tasklist) {
    return null;
  }
  return parentCell as TaskListCell;
}

export function addTask(task: Omit<Task, "id">, parentId: number): Task | null {
  const id = nextId++;
  const newTask: Task = { ...task, id };

  const parentCell = getTaskListCell(parentId);
  if (!parentCell) {
    return null;
  }

  parentCell.tasks = [...(parentCell.tasks || []), newTask];
  gridStore.notify();
  return newTask;
}

export function deleteTask(taskId: number, parentId: number): boolean {
  const parentCell = getTaskListCell(parentId);
  if (!parentCell?.tasks) {
    return false;
  }

  const taskIndex = parentCell.tasks.findIndex((task) => task.id === taskId);
  if (taskIndex === -1) {
    return false;
  }

  parentCell.tasks = parentCell.tasks.filter((task) => task.id !== taskId);
  gridStore.notify();
  return true;
}

export function updateTask(
  taskId: number,
  parentId: number,
  updates: Partial<Omit<Task, "id">>
): Task | null {
  const parentCell = getTaskListCell(parentId);
  if (!parentCell?.tasks) {
    return null;
  }

  const taskIndex = parentCell.tasks.findIndex((task) => task.id === taskId);
  if (taskIndex === -1) {
    return null;
  }

  const updatedTask = { ...parentCell.tasks[taskIndex], ...updates };
  parentCell.tasks[taskIndex] = updatedTask;
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

export function totalCost(parentId: number): number {
  console.log("totalSum");
  const parentCell = gridStore.getCellById(parentId);
  if (!parentCell) {
    return 0;
  }

  if (parentCell.type === CellType.Tasklist) {
    if (!parentCell.tasks) return 0;
    return parentCell.tasks.reduce((sum, task) => sum + task.cost, 0);
  }

  if (parentCell.type === CellType.Headline) {
    return (parentCell.children || []).reduce((sum, childId) => {
      const childCell = gridStore.getCellById(childId);
      if (!childCell) return sum;

      if (childCell.type === CellType.Tasklist) {
        if (childCell.tasks) {
          sum += childCell.tasks.reduce(
            (taskSum, task) => taskSum + task.cost,
            0
          );
        }
      }
      // proceed adding the cost of children
      return sum + totalCost(childId);
    }, 0);
  }

  return -1;
}

export function totalCompletedCost(parentId: number): number {
  // console.log("totalCompletedSum");

  const parentCell = gridStore.getCellById(parentId);
  if (!parentCell) {
    return 0;
  }

  if (parentCell.type === CellType.Tasklist) {
    // for tasklist cells, only sum their own completed tasks
    const taskListCell = getTaskListCell(parentId);
    if (!taskListCell?.tasks) {
      return 0;
    }
    return taskListCell.tasks
      .filter((task) => task.completed)
      .reduce((sum, task) => sum + task.cost, 0);
  }

  return (parentCell.children || []).reduce((sum, childId) => {
    const childCell = gridStore.getCellById(childId);
    if (!childCell) return sum;

    if (childCell.type === CellType.Tasklist) {
      const taskListCell = getTaskListCell(childId);
      if (taskListCell?.tasks) {
        sum += taskListCell.tasks
          .filter((task) => task.completed)
          .reduce((taskSum, task) => taskSum + task.cost, 0);
      }
    }
    // proceed adding the cost of children
    return sum + totalCompletedCost(childId);
  }, 0);
}

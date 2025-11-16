import { cellService } from "@/service";
import { Task } from "@/types";
import { CellType, TaskListCell } from "@/types/cells";

let nextId = 1; // Start from 1 to avoid conflicts with default/initial values

function getTaskListCell(cellId: number): TaskListCell | null {
  const cell = cellService.getCellById(cellId);
  if (!cell || cell.type !== CellType.Tasklist) {
    return null;
  }
  return cell as TaskListCell;
}

function initializeNextId(): void {
  let maxId = 0;
  const allCells = cellService.getCells();

  allCells.forEach((cell) => {
    if (cell.type === CellType.Tasklist && cell.tasks) {
      cell.tasks.forEach((task) => {
        if (task.id > maxId) {
          maxId = task.id;
        }
      });
    }
  });

  nextId = maxId + 1;
}

function getNextTaskId(): number {
  initializeNextId();
  return nextId++;
}

export function addTask(task: Omit<Task, "id">, cellId: number): Task | null {
  const id = getNextTaskId();
  const newTask: Task = { ...task, id };

  const cell = getTaskListCell(cellId);
  if (!cell) {
    return null;
  }

  cell.tasks = [...(cell.tasks || []), newTask];

  cellService.updateCellSize(cellId);
  cellService.saveToStorage();
  cellService.notify();
  return newTask;
}

export function deleteTask(taskId: number, cellId: number): boolean {
  const cell = getTaskListCell(cellId);
  if (!cell?.tasks) {
    return false;
  }

  const taskIndex = cell.tasks.findIndex((task) => task.id === taskId);
  if (taskIndex === -1) {
    return false;
  }

  cell.tasks = cell.tasks.filter((task) => task.id !== taskId);

  cellService.updateCellSize(cellId);
  cellService.saveToStorage();
  cellService.notify();
  return true;
}

export function updateTask(
  taskId: number,
  cellId: number,
  updates: Partial<Omit<Task, "id">>
): Task | null {
  const cell = getTaskListCell(cellId);
  if (!cell?.tasks) {
    return null;
  }

  const taskIndex = cell.tasks.findIndex((task) => task.id === taskId);
  if (taskIndex === -1) {
    return null;
  }

  const updatedTask = { ...cell.tasks[taskIndex], ...updates };
  cell.tasks[taskIndex] = updatedTask;
  cellService.saveToStorage();
  cellService.notify();
  return updatedTask;
}

export function completeTask(
  taskId: number,
  cellId: number,
  completed: boolean = true
): Task | null {
  return updateTask(taskId, cellId, { completed });
}

export function totalCost(cellId: number): number {
  // console.log("totalSum");
  const cell = cellService.getCellById(cellId);
  if (!cell) {
    return 0;
  }

  const countYourself = (): number => {
    if (cell.type === CellType.Tasklist) {
      if (!cell.tasks) return 0;
      return cell.tasks.reduce((sum, task) => sum + task.cost, 0);
    }
    return 0;
  };

  const countChildren = (): number => {
    return (cell.children || []).reduce((sum, childId) => {
      const childCell = cellService.getCellById(childId);
      if (!childCell) return sum;

      // proceed adding the cost of children
      return sum + totalCost(childId);
    }, 0);
  };

  return countYourself() + countChildren();
}

export function totalCompletedCost(cellId: number): number {
  // console.log("totalCompletedSum");

  const cell = cellService.getCellById(cellId);
  if (!cell) {
    return 0;
  }

  const countYourself = (): number => {
    if (cell.type === CellType.Tasklist) {
      // for tasklist cells, only sum their own completed tasks
      const taskListCell = getTaskListCell(cellId);
      if (!taskListCell?.tasks) {
        return 0;
      }
      return taskListCell.tasks
        .filter((task) => task.completed)
        .reduce((sum, task) => sum + task.cost, 0);
    }
    return 0;
  };

  const countChildren = (): number => {
    return (cell.children || []).reduce((sum, childId) => {
      const childCell = cellService.getCellById(childId);
      if (!childCell) return sum;

      // proceed adding the cost of children
      return sum + totalCompletedCost(childId);
    }, 0);
  };

  return countYourself() + countChildren();
}

export function resetDailyTasks(cellId: number): boolean {
  const cell = getTaskListCell(cellId);
  if (!cell?.tasks || !cell.daily) {
    return false;
  }

  const today = new Date().toDateString();

  if (cell.lastResetDate === today) {
    return false;
  }

  const taskUpdates = cell.tasks.map((task) => ({
    ...task,
    completed: false,
  }));

  cellService.updateCellProperties(cellId, {
    lastResetDate: today,
    tasks: taskUpdates,
  });

  return true;
}

export function checkAndResetDailyTasks(): void {
  const allCells = cellService.getCells();

  allCells.forEach((cell) => {
    if (cell.type === CellType.Tasklist && cell.daily) {
      resetDailyTasks(cell.id);
    }
  });
}

import { Cell, CellType } from "@/types";

export const calculateDynamicCellSize = (
  cell: Partial<Cell>
): { x: number; y: number } => {
  if (cell.type === CellType.Tasklist && "tasks" in cell && cell.tasks) {
    const taskCount = cell.tasks.length;

    if (taskCount > 3) {
      console.log("Task count more than 3, increasing size");
      const additionalTasks = taskCount - 3;
      const additionalHeight = Math.ceil(additionalTasks / 2);
      return { x: 3, y: 3 + additionalHeight };
    }

    return { x: 3, y: 3 };
  }

  return cell.type === CellType.Headline ? { x: 1, y: 1 } : { x: 3, y: 3 };
};

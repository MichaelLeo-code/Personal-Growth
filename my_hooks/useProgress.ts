import { cellService } from "@/service";
import { totalCost, totalCompletedCost } from "@/service/taskService";
import { Cell } from "@/types";
import { useEffect, useState } from "react";

export const useCellData = (cellId: number) => {
  const [cell, setCell] = useState<Cell | null>(null);

  useEffect(() => {
    const updateCell = () => {
      const cellData = cellService.getCellById(cellId);
      setCell(cellData || null);
    };

    updateCell();

    const unsubscribe = cellService.subscribe(updateCell);
    return unsubscribe;
  }, [cellId]);

  const getCostProgress = () => {
    if (!cell) {
      return { completed: 0, total: 0 };
    }

    const total = totalCost(cellId);
    const completed = totalCompletedCost(cellId);

    return { completed, total };
  };

  return {
    cell,
    taskProgress: getCostProgress(),
  };
};

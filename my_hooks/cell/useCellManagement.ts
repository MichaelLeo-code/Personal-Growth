import { cellService } from "@/service";
import { Cell, CellType } from "@/types";
import { useEffect, useState } from "react";

export const useCellManagement = () => {
  const [selected, setSelected] = useState<Cell | null>(null);
  const [cells, setCells] = useState<Cell[]>([]);

  const addCell = (type: CellType) => {
    const selectedCellId = cellService.getSelected()?.id;
    if (!selectedCellId) return;
    const cell = cellService.addNextFreeCell(selectedCellId, type);

    if (cell) {
      cellService.selectCell(cell);
    }
  };

  const deleteSelectedCell = () => {
    if (selected) {
      cellService.deleteCell(selected.id);
      setSelected(null);
    }
  };

  const deleteAllCells = () => {
    cellService.deleteAll();
  };

  useEffect(() => {
    // initialCellData.forEach((cell) => cellService.addCell(cell));
    setCells(cellService.getCells());
    setSelected(cellService.getSelected());

    const unsubscribe = cellService.subscribe(() => {
      setCells(cellService.getCells());
      setSelected(cellService.getSelected());
    });
    return unsubscribe;
  }, []);

  return {
    cells,
    selected,
    addCell,
    deleteSelectedCell,
    deleteAllCells,
  };
};

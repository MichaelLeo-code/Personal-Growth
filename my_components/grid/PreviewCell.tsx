import { coordinateService } from "@/service";
import { Cell, CellType } from "@/types";

export const getPreviewCellData = (
  previewCell:
    | {
        x: number;
        y: number;
        type: CellType;
      }
    | undefined
): Cell | undefined => {
  return previewCell
    ? {
        id: -1,
        x: previewCell.x,
        y: previewCell.y,
        text: "Preview",
        type: previewCell.type,
        size:
          previewCell.type === CellType.Headline
            ? { x: 1, y: 1 }
            : { x: 3, y: 3 },
      }
    : undefined;
};

export const isPreviewPositionValid = (previewCellData: Cell) => {
  return !coordinateService.isOccupied(previewCellData.x, previewCellData.y);
};

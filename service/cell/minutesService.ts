import { cellService } from "@/service";
import { CellType, HeadlineCell } from "@/types";

function getHeadlineCell(cellId: number): HeadlineCell | null {
  const cell = cellService.getCellById(cellId);
  if (!cell || cell.type !== CellType.Headline) {
    return null;
  }
  return cell as HeadlineCell;
}

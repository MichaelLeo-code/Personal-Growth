import { coordinateService } from "@/service";
import { Cell, CellType } from "@/types";
import { StyleSheet, View } from "react-native";

export type PreviewCellType = {
  x: number;
  y: number;
  type: CellType;
};

const getPreviewCellData = (
  previewCell: PreviewCellType | null
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

const isPreviewPositionValid = (previewCellData: Cell) => {
  return !coordinateService.isOccupied(previewCellData.x, previewCellData.y);
};
type Props = {
  previewCell: { x: number; y: number; type: CellType } | null;
  cellSize: number;
};

export const PreviewCell: React.FC<Props> = ({ previewCell, cellSize }) => {
  const previewCellData = getPreviewCellData(previewCell);

  return (
    previewCellData && (
      <View
        style={[
          styles.previewCell,
          !isPreviewPositionValid(previewCellData) && styles.previewCellInvalid,
          {
            left: previewCellData.x * cellSize,
            top: previewCellData.y * cellSize,
            width: cellSize * previewCellData.size.x,
            height: cellSize * previewCellData.size.y,
          },
        ]}
      />
    )
  );
};

const styles = StyleSheet.create({
  previewCell: {
    position: "absolute",
    borderWidth: 2,
    borderColor: "#4b50e3",
    backgroundColor: "rgba(75, 80, 227, 0.3)",
    borderStyle: "dashed",
  },
  previewCellInvalid: {
    borderColor: "#ff4444",
    backgroundColor: "rgba(255, 68, 68, 0.3)",
  },
});

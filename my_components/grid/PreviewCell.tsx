import { cellService, coordinateService } from "@/service";
import { Cell, CellType } from "@/types";
import {
  calculateSvgDimensions,
  createLineBetweenCells,
  LineData,
} from "@/utils";
import { StyleSheet, View } from "react-native";
import Svg, { Line } from "react-native-svg";

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
        updatedAt: new Date().toISOString(),
      }
    : undefined;
};

const isPreviewPositionValid = (previewCellData: Cell) => {
  return !coordinateService.isOccupiedArea(
    previewCellData.x,
    previewCellData.y,
    previewCellData.size
  );
};
type Props = {
  previewCell: { x: number; y: number; type: CellType } | null;
  cellSize: number;
  selected?: Cell | null;
  isMoving?: boolean;
};

export const PreviewCell: React.FC<Props> = ({
  previewCell,
  cellSize,
  selected,
  isMoving = false,
}) => {
  const previewCellData = getPreviewCellData(previewCell);

  const sourceCell =
    isMoving && selected?.parent
      ? cellService.getCellById(selected.parent)
      : selected;

  const parentLine: LineData | null =
    sourceCell && previewCellData
      ? createLineBetweenCells(sourceCell, previewCellData, cellSize)
      : null;

  const childrenLines: LineData[] =
    isMoving && selected?.children && previewCellData
      ? selected.children
          .map((childId) => {
            const childCell = cellService.getCellById(childId);
            return childCell
              ? createLineBetweenCells(previewCellData, childCell, cellSize)
              : null;
          })
          .filter((line): line is LineData => line !== null)
      : [];

  const allLines: LineData[] = [parentLine, ...childrenLines].filter(
    (line): line is LineData => line !== null
  );

  // dimensions of the SVG container
  const { svgDimensions, adjustedLines } = calculateSvgDimensions(allLines);

  return (
    <>
      {previewCellData && (
        <View
          style={[
            styles.previewCell,
            !isPreviewPositionValid(previewCellData) &&
              styles.previewCellInvalid,
            {
              left: previewCellData.x * cellSize,
              top: previewCellData.y * cellSize,
              width: cellSize * previewCellData.size.x,
              height: cellSize * previewCellData.size.y,
            },
          ]}
        />
      )}
      {adjustedLines.length > 0 && (
        <Svg
          style={[
            StyleSheet.absoluteFill,
            {
              left: svgDimensions.left,
              top: svgDimensions.top,
              width: svgDimensions.width,
              height: svgDimensions.height,
            },
          ]}
          width={svgDimensions.width}
          height={svgDimensions.height}
        >
          {adjustedLines.map((line, index) => (
            <Line
              key={index}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="#4b50e3"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          ))}
        </Svg>
      )}
    </>
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

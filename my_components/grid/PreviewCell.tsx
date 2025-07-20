import { cellSize as size } from "@/constants";
import { useThemeColors } from "@/my_hooks";
import { cellService, coordinateService } from "@/service";
import { Cell, CellType } from "@/types";
import {
  calculateSvgDimensions,
  createLineBetweenCells,
  LineData,
} from "@/utils";
import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Line } from "react-native-svg";

export type PreviewCellType = {
  x: number;
  y: number;
  type: CellType;
};

const getPreviewCellData = (
  previewCell: PreviewCellType | null,
  selected?: Cell | null,
  isMoving?: boolean
): Cell | undefined => {
  if (!previewCell) return undefined;

  const calculatePreviewSize = (type: CellType) => {
    if (selected && isMoving) {
      return selected.size;
    }
    return type === CellType.Headline ? { x: 1, y: 1 } : { x: 3, y: 3 };
  };

  return {
    id: -1,
    x: previewCell.x,
    y: previewCell.y,
    text: "Preview",
    type: previewCell.type,
    size: calculatePreviewSize(previewCell.type),
    updatedAt: new Date().toISOString(),
  };
};

const isPreviewPositionValid = (previewCellData: Cell) => {
  return !coordinateService.isOccupiedArea(
    previewCellData.x,
    previewCellData.y,
    previewCellData.size
  );
};
type Props = {
  previewCell: PreviewCellType | null;
  selected?: Cell | null;
  isMoving?: boolean;
};

export const PreviewCell: React.FC<Props> = ({
  previewCell,
  selected,
  isMoving = false,
}) => {
  const colors = useThemeColors();
  const previewCellData = getPreviewCellData(previewCell, selected, isMoving);

  const sourceCell =
    isMoving && selected?.parent
      ? cellService.getCellById(selected.parent)
      : selected;

  const parentLine: LineData | null =
    sourceCell && previewCellData
      ? createLineBetweenCells(sourceCell, previewCellData)
      : null;

  const childrenLines: LineData[] =
    isMoving && selected?.children && previewCellData
      ? selected.children
          .map((childId) => {
            const childCell = cellService.getCellById(childId);
            return childCell
              ? createLineBetweenCells(previewCellData, childCell)
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
            { borderColor: colors.tint, backgroundColor: `${colors.tint}4D` },
            !isPreviewPositionValid(previewCellData) && [
              styles.previewCellInvalid,
              { borderColor: colors.error, backgroundColor: `${colors.error}4D` }
            ],
            {
              left: previewCellData.x * size,
              top: previewCellData.y * size,
              width: size * previewCellData.size.x,
              height: size * previewCellData.size.y,
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
              stroke={colors.tint}
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
    borderStyle: "dashed",
  },
  previewCellInvalid: {
    // Colors are set dynamically via inline styles
  },
});

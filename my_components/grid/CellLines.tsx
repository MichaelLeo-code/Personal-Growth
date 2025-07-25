import { Stroke } from "@/constants";
import { useThemeColors } from "@/my_hooks";
import { cellService } from "@/service";
import { Cell } from "@/types/cells";
import {
  calculateSvgDimensionsWithCells,
  createLineBetweenCells,
  LineData,
} from "@/utils";
import React from "react";
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import Svg, { Line } from "react-native-svg";

type Props = {
  cells: Cell[];
  cellSize?: number;
};

export const CellLines: React.FC<Props> = ({ cells, cellSize = 50 }) => {
  const colors = useThemeColors();

  // Calculate the lines and SVG dimensions using shared utility
  const { svgDimensions, adjustedLines } = useMemo(() => {
    if (cells.length === 0) {
      return {
        svgDimensions: { left: 0, top: 0, width: 1000, height: 1000 },
        adjustedLines: [],
      };
    }

    // Create lines between parent and child cells
    const lineData: LineData[] = [];

    cells.forEach((cell) => {
      if (cell.parent) {
        const parentCell = cellService.getCellById(cell.parent);
        if (parentCell) {
          lineData.push(createLineBetweenCells(parentCell, cell));
        }
      }
    });

    // Use shared utility to calculate SVG dimensions with cell bounds and padding
    const padding = cellSize * 2;
    return calculateSvgDimensionsWithCells(lineData, cells, padding);
  }, [cells, cellSize]);

  return (
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
      {adjustedLines.map((line) => (
        <Line
          key={line.key}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke={colors.border}
          strokeWidth={Stroke.md}
        />
      ))}
    </Svg>
  );
};

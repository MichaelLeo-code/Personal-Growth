import { Cell } from "@/types/cells";
import { createLineBetweenCells, calculateSvgDimensionsWithCells, LineData } from "@/utils";
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import Svg, { Line } from "react-native-svg";
import { cellService } from "../../service";

type Props = {
  cells: Cell[];
  cellSize?: number;
};

export const CellLines: React.FC<Props> = ({ cells, cellSize = 50 }) => {
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
          lineData.push(createLineBetweenCells(parentCell, cell, cellSize));
        }
      }
    });

    // Use shared utility to calculate SVG dimensions with cell bounds and padding
    const padding = cellSize * 2;
    return calculateSvgDimensionsWithCells(lineData, cells, cellSize, padding);
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
          stroke="#fff"
          strokeWidth="1"
        />
      ))}
    </Svg>
  );
};

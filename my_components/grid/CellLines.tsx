import { Cell } from "@/types/cells";
import { createLineBetweenCells, LineData } from "@/utils";
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import Svg, { Line } from "react-native-svg";
import { cellService } from "../../service";

type Props = {
  cells: Cell[];
  cellSize?: number;
};

export const CellLines: React.FC<Props> = ({ cells, cellSize = 50 }) => {
  // Calculate the lines and SVG dimensions
  const { svgDimensions, lines } = useMemo(() => {
    if (cells.length === 0) {
      return {
        svgDimensions: { left: 0, top: 0, width: 1000, height: 1000 },
        lines: [],
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

    // Use shared utility to calculate SVG dimensions
    // For CellLines we want more padding, so we calculate bounds including cell positions
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    // Include cell bounds in calculation
    cells.forEach((cell) => {
      const cellMinX = cell.x * cellSize;
      const cellMaxX = (cell.x + cell.size.x) * cellSize;
      const cellMinY = cell.y * cellSize;
      const cellMaxY = (cell.y + cell.size.y) * cellSize;

      minX = Math.min(minX, cellMinX);
      maxX = Math.max(maxX, cellMaxX);
      minY = Math.min(minY, cellMinY);
      maxY = Math.max(maxY, cellMaxY);
    });

    // Add padding around the content
    const padding = cellSize * 2;
    const svgDimensions = {
      left: minX - padding,
      top: minY - padding,
      width: maxX - minX + padding * 2,
      height: maxY - minY + padding * 2,
    };

    // Adjust line coordinates relative to the SVG offset
    const adjustedLines = lineData.map((line, index) => ({
      x1: line.x1 - svgDimensions.left,
      y1: line.y1 - svgDimensions.top,
      x2: line.x2 - svgDimensions.left,
      y2: line.y2 - svgDimensions.top,
      key: `line-${index}`,
    }));

    return {
      svgDimensions,
      lines: adjustedLines,
    };
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
      {lines.map((line) => (
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

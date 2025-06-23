import { Cell } from "@/types/cells";
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import Svg, { Line } from "react-native-svg";
import { cellService } from "../../service";

type Props = {
  cells: Cell[];
  cellSize?: number;
};

export const CellLines: React.FC<Props> = ({ cells, cellSize = 50 }) => {
  // Calculate the bounds of all cells to determine SVG dimensions
  const { svgDimensions, lines } = useMemo(() => {
    if (cells.length === 0) {
      return {
        svgDimensions: { width: 1000, height: 1000, offsetX: 0, offsetY: 0 },
        lines: [],
      };
    }

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    const lineData: {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      key: string;
    }[] = [];

    // Process each cell and calculate line coordinates
    cells.forEach((cell, index) => {
      // Update bounds for this cell
      const cellMinX = cell.x * cellSize;
      const cellMaxX = (cell.x + cell.size.x) * cellSize;
      const cellMinY = cell.y * cellSize;
      const cellMaxY = (cell.y + cell.size.y) * cellSize;

      minX = Math.min(minX, cellMinX);
      maxX = Math.max(maxX, cellMaxX);
      minY = Math.min(minY, cellMinY);
      maxY = Math.max(maxY, cellMaxY);

      // Create line data if cell has a parent
      const parentCell = cell.parent
        ? cellService.getCellById(cell.parent)
        : null;
      if (parentCell) {
        const x1 = (parentCell.x + parentCell.size.x / 2) * cellSize;
        const y1 = (parentCell.y + parentCell.size.y / 2) * cellSize;
        const x2 = (cell.x + cell.size.x / 2) * cellSize;
        const y2 = (cell.y + cell.size.y / 2) * cellSize;

        // Update bounds for line endpoints
        minX = Math.min(minX, x1, x2);
        maxX = Math.max(maxX, x1, x2);
        minY = Math.min(minY, y1, y2);
        maxY = Math.max(maxY, y1, y2);

        lineData.push({
          x1,
          y1,
          x2,
          y2,
          key: `line-${index}`,
        });
      }
    });

    // Add padding around the content
    const padding = cellSize * 2;
    const offsetX = minX - padding;
    const offsetY = minY - padding;
    const width = maxX - minX + padding * 2;
    const height = maxY - minY + padding * 2;

    // Adjust line coordinates relative to the SVG offset
    const adjustedLines = lineData.map((line) => ({
      ...line,
      x1: line.x1 - offsetX,
      y1: line.y1 - offsetY,
      x2: line.x2 - offsetX,
      y2: line.y2 - offsetY,
    }));

    return {
      svgDimensions: { width, height, offsetX, offsetY },
      lines: adjustedLines,
    };
  }, [cells, cellSize]);

  return (
    <Svg
      style={[
        StyleSheet.absoluteFill,
        {
          left: svgDimensions.offsetX,
          top: svgDimensions.offsetY,
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

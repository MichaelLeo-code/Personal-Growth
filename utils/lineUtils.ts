export interface LineData {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface SvgDimensions {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Calculate SVG bounds and dimensions for a set of lines
 * @param lines Array of line coordinates
 * @param minDimension Minimum dimension for horizontal/vertical lines (default: 20)
 * @returns SVG dimensions and adjusted line coordinates
 */
export const calculateSvgDimensions = (
  lines: LineData[],
  minDimension: number = 20
): {
  svgDimensions: SvgDimensions;
  adjustedLines: LineData[];
} => {
  if (lines.length === 0) {
    return {
      svgDimensions: {
        left: 0,
        top: 0,
        width: minDimension,
        height: minDimension,
      },
      adjustedLines: [],
    };
  }

  // Calculate bounds from all lines
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  lines.forEach((line) => {
    minX = Math.min(minX, line.x1, line.x2);
    maxX = Math.max(maxX, line.x1, line.x2);
    minY = Math.min(minY, line.y1, line.y2);
    maxY = Math.max(maxY, line.y1, line.y2);
  });

  // Calculate dimensions with minimum size for horizontal/vertical lines
  const originalWidth = maxX - minX;
  const originalHeight = maxY - minY;

  const width = Math.max(originalWidth, minDimension);
  const height = Math.max(originalHeight, minDimension);

  const leftOffset = Math.max(0, (minDimension - originalWidth) / 2);
  const topOffset = Math.max(0, (minDimension - originalHeight) / 2);

  const svgDimensions: SvgDimensions = {
    left: minX - leftOffset,
    top: minY - topOffset,
    width,
    height,
  };

  // Adjust line coordinates relative to SVG bounds
  const adjustedLines: LineData[] = lines.map((line) => ({
    x1: line.x1 - svgDimensions.left,
    y1: line.y1 - svgDimensions.top,
    x2: line.x2 - svgDimensions.left,
    y2: line.y2 - svgDimensions.top,
  }));

  return { svgDimensions, adjustedLines };
};

/**
 * Calculate the center point of a cell
 * @param cell Cell with x, y, and size properties
 * @param cellSize Size of each grid cell in pixels
 * @returns Center coordinates in pixels
 */
export const getCellCenter = (
  cell: { x: number; y: number; size: { x: number; y: number } },
  cellSize: number
): { x: number; y: number } => ({
  x: (cell.x + cell.size.x / 2) * cellSize,
  y: (cell.y + cell.size.y / 2) * cellSize,
});

/**
 * Create a line between two cells
 * @param fromCell Source cell
 * @param toCell Target cell
 * @param cellSize Size of each grid cell in pixels
 * @returns Line data
 */
export const createLineBetweenCells = (
  fromCell: { x: number; y: number; size: { x: number; y: number } },
  toCell: { x: number; y: number; size: { x: number; y: number } },
  cellSize: number
): LineData => {
  const from = getCellCenter(fromCell, cellSize);
  const to = getCellCenter(toCell, cellSize);

  return {
    x1: from.x,
    y1: from.y,
    x2: to.x,
    y2: to.y,
  };
};

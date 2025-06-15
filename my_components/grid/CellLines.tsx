import { Cell } from "@/types/cells";
import { StyleSheet } from "react-native";
import Svg, { Line } from "react-native-svg";
import { cellService } from "../../service/cellService";

type Props = {
  cells: Cell[];
  cellSize?: number;
};

export const CellLines: React.FC<Props> = ({ cells, cellSize = 50 }) => {
  return (
    <Svg style={StyleSheet.absoluteFill}>
      {cells.map((cell, index) => {
        const parentCell = cell.parent
          ? cellService.getCellById(cell.parent)
          : null;
        if (!parentCell) return null;
        const x1 = (parentCell.x + 0.5) * cellSize;
        const y1 = (parentCell.y + 0.5) * cellSize;
        const x2 = (cell.x + 0.5) * cellSize;
        const y2 = (cell.y + 0.5) * cellSize;
        return (
          <Line
            key={`line-${index}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#fff"
            strokeWidth="1"
          />
        );
      })}
    </Svg>
  );
};

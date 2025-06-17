import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { usePopup } from "../../my_hooks/usePopup";
import { cellService } from "../../service/cellService";
import { Cell, CellType } from "../../types/cells";
import { TaskPopup } from "../popup";
import { CellLines } from "./CellLines";
import { GridCell } from "./GridCell";
import { getPreviewCellData, isPreviewPositionValid } from "./PreviewCell";

type GridProps = {
  cellSize?: number;
  cells: Cell[];
  selected?: Cell | null;
  previewCell?:
    | {
        x: number;
        y: number;
        type: CellType;
      }
    | undefined;
};

export const Grid: React.FC<GridProps> = ({
  cellSize = 50,
  cells,
  selected,
  previewCell,
}) => {
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  const { showPopup, hidePopup, isVisible } = usePopup();

  const handleCellPress = (cell: Cell) => {
    cellService.selectCell(cell);
  };

  const openPopup = (cell: Cell) => {
    setSelectedCell(cell);
    showPopup(null);
  };

  const previewCellData = getPreviewCellData(previewCell);

  return (
    <View style={styles.grid}>
      <CellLines cells={cells} cellSize={cellSize} />
      {cells.map((cell, index) => (
        <GridCell
          key={index}
          cell={cell}
          cellSize={cellSize}
          isSelected={selected?.x === cell.x && selected?.y === cell.y}
          onPress={handleCellPress}
          onButtonPress={openPopup}
        />
      ))}
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
      {selectedCell?.type === CellType.Tasklist && (
        <TaskPopup
          cell={selectedCell}
          hidePopup={hidePopup}
          isVisible={isVisible}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    position: "relative",
    width: "100%",
    height: "100%",
  },
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

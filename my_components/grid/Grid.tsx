import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { usePopup } from "../../my_hooks/usePopup";
import { cellService } from "../../service";
import { Cell, CellType } from "../../types/cells";
import { TaskPopup } from "../popup";
import { CellLines } from "./CellLines";
import { GridCell } from "./GridCell";
import { PreviewCell, PreviewCellType } from "./PreviewCell";

type GridProps = {
  cellSize?: number;
  cells: Cell[];
  selected?: Cell | null;
  previewCell: PreviewCellType | null;
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
      <PreviewCell previewCell={previewCell} cellSize={cellSize} />
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
});

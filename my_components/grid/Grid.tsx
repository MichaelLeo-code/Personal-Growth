import { cellSize } from "@/constants";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { cellService } from "../../service";
import { Cell } from "../../types/cells";
import { PopupSelector } from "../popup";
import { CellLines } from "./CellLines";
import { GridCell } from "./grid-cell/GridCell";
import { PreviewCell, PreviewCellType } from "./PreviewCell";

type GridProps = {
  cells: Cell[];
  selected?: Cell | null;
  previewCell: PreviewCellType | null;
};

export const Grid: React.FC<GridProps> = ({ cells, selected, previewCell }) => {
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const handleCellPress = (cell: Cell) => {
    cellService.selectCell(cell);
  };

  const openPopup = (cell: Cell) => {
    setSelectedCell(cell);
    setIsPopupVisible(true);
  };

  const hidePopup = () => {
    setIsPopupVisible(false);
    setSelectedCell(null);
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
      {selectedCell && (
        <PopupSelector
          cell={selectedCell}
          hidePopup={hidePopup}
          isVisible={isPopupVisible}
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

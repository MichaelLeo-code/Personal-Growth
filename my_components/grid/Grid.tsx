import { cellSize } from "@/constants";
import React, { useEffect, useState } from "react";
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

  // Clear selectedCell after popup animation completes
  useEffect(() => {
    if (!isPopupVisible && selectedCell) {
      // Give the Modal time to complete its fade animation (typically 300ms)
      const timer = setTimeout(() => {
        setSelectedCell(null);
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [isPopupVisible, selectedCell]);

  const handleCellPress = (cell: Cell) => {
    cellService.selectCell(cell);
  };

  const openPopup = (cell: Cell) => {
    // If a popup is already open for a different cell, close it first
    if (selectedCell && selectedCell.id !== cell.id) {
      setIsPopupVisible(false);
    }
    // Set the new popup
    setSelectedCell(cell);
    setIsPopupVisible(true);
  };

  const hidePopup = () => {
    setIsPopupVisible(false);
    // Don't immediately set selectedCell to null - let the Modal animation complete
    // The selectedCell will be cleared when a new popup opens or component unmounts
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
          onDoublePress={openPopup}
          onLongPress={() => console.log("test")}
        />
      ))}
      <PreviewCell previewCell={previewCell} cellSize={cellSize} />
      {selectedCell && (
        <PopupSelector
          key={selectedCell.id} // Add key to ensure proper re-rendering
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

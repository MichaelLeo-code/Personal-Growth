import { cellSize } from "@/constants";
import React, { useEffect, useState } from "react";
import { GestureResponderEvent, StyleSheet, View } from "react-native";
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
  isMoving?: boolean;
  onCellLongPress?: (cell: Cell) => (event: GestureResponderEvent) => void;
  onCellMove?: (event: GestureResponderEvent) => void;
  onCellMoveEnd?: (event: GestureResponderEvent) => void;
};

export const Grid: React.FC<GridProps> = ({
  cells,
  selected,
  previewCell,
  isMoving = false,
  onCellLongPress,
  onCellMove,
  onCellMoveEnd,
}) => {
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

  const handleCellLongPress = (cell: Cell) => {
    if (onCellLongPress) {
      // The onCellLongPress returns a function that expects an event
      // We need to create a wrapper that calls it
      const moveHandler = onCellLongPress(cell);

      // Create a fake event to start the move - this will be refined
      const fakeEvent = {
        nativeEvent: {
          pageX: 0,
          pageY: 0,
        },
      } as any;
      moveHandler(fakeEvent);
    } else {
      console.log("test");
    }
  };

  return (
    <View
      style={styles.grid}
      onTouchMove={onCellMove}
      onTouchEnd={onCellMoveEnd}
    >
      <CellLines cells={cells} cellSize={cellSize} />
      {cells.map((cell, index) => (
        <GridCell
          key={index}
          cell={cell}
          cellSize={cellSize}
          isSelected={selected?.x === cell.x && selected?.y === cell.y}
          isDimmed={isMoving && selected?.id === cell.id}
          onPress={handleCellPress}
          onDoublePress={openPopup}
          onLongPress={(cell) => handleCellLongPress(cell)}
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

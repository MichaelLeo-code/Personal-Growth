import { cellSize } from "@/constants";
import { usePopup } from "@/my_hooks";
import { cellService } from "@/service";
import { Cell } from "@/types";
import React, { useState } from "react";
import { GestureResponderEvent, StyleSheet, View } from "react-native";
import { PopupSelector } from "../popup";
import { CellLines } from "./CellLines";
import { GridCell } from "./grid-cell/GridCell";
import { PreviewCell, PreviewCellType } from "./PreviewCell";

type GridProps = {
  cells: Cell[];
  selected?: Cell | null;
  previewCell: PreviewCellType | null;
  isMoving?: boolean;
  onCellMoveStart?: (cell: Cell) => (event: GestureResponderEvent) => void;
  onCellMove?: (event: GestureResponderEvent) => void;
  onCellMoveEnd?: (event: GestureResponderEvent) => void;
};

export const Grid: React.FC<GridProps> = ({
  cells,
  selected,
  previewCell,
  isMoving = false,
  onCellMoveStart,
  onCellMove,
  onCellMoveEnd,
}) => {
  const {
    isVisible: isPopupVisible,
    popupInstance,
    showPopup,
    hidePopup,
  } = usePopup();
  const [startCoordinates, setStartCoordinates] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleCellLongPress = (cell: Cell) => {
    if (onCellMoveStart) {
      cellService.selectCell(cell);

      // onCellLongPress returns a function that expects an event
      const moveHandler = onCellMoveStart(cell);

      const eventWithCoordinates = {
        nativeEvent: {
          pageX: startCoordinates?.x || 0,
          pageY: startCoordinates?.y || 0,
        },
      } as GestureResponderEvent;
      moveHandler(eventWithCoordinates);
    } else {
      console.log("test");
    }
  };

  const handleTouchStart = (event: GestureResponderEvent) => {
    setStartCoordinates({
      x: event.nativeEvent.pageX,
      y: event.nativeEvent.pageY,
    });
  };

  return (
    <View
      style={styles.grid}
      onTouchStart={handleTouchStart}
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
          onPress={(cell) => cellService.selectCell(cell)}
          onDoublePress={(cell) => showPopup(cell)}
          onLongPress={(cell) => handleCellLongPress(cell)}
        />
      ))}
      <PreviewCell
        previewCell={previewCell}
        selected={selected}
        isMoving={isMoving}
      />
      {popupInstance && (
        <PopupSelector
          key={popupInstance.id} // Add key to ensure proper re-rendering
          cell={popupInstance}
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

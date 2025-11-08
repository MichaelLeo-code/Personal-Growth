import { cellSize } from "@/constants";
import { useGridInteractionState, useGridMouse, useGridTouch, usePopup } from "@/my_hooks";
import { cellService } from "@/service";
import { Cell } from "@/types";
import React, { useCallback, useState } from "react";
import { GestureResponderEvent, Platform, StyleSheet, View } from "react-native";
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
  onBackgroundPress?: () => void;
};

export const Grid: React.FC<GridProps> = ({
  cells,
  selected,
  previewCell,
  isMoving = false,
  onCellMoveStart,
  onCellMove,
  onCellMoveEnd,
  onBackgroundPress,
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

  // Shared state between touch and mouse interactions
  const { isDragging, cellWasPressed } = useGridInteractionState();

  const {
    handleTouchStart: onTouchStart,
    handleTouchMove,
    handleTouchEnd,
    markCellPressed,
    setDragging,
  } = useGridTouch({
    onCellMove,
    onCellMoveEnd,
    onBackgroundPress,
    isDragging,
    cellWasPressed,
  });

  useGridMouse({
    onCellMove,
    onCellMoveEnd,
    onBackgroundPress,
    isDragging,
    cellWasPressed,
  });

  const handleTouchStart = useCallback((event: GestureResponderEvent) => {
    const coords = onTouchStart(event);
    setStartCoordinates(coords);
  }, [onTouchStart]);

  const handleCellPress = useCallback((cell: Cell) => {
    markCellPressed();
    cellService.selectCell(cell);
  }, [markCellPressed]);

  const handleCellDoublePress = useCallback((cell: Cell) => {
    markCellPressed();
    showPopup(cell);
  }, [showPopup, markCellPressed]);

  const handleCellLongPress = (cell: Cell) => (event: any) => {
    markCellPressed();
    if (onCellMoveStart) {
      cellService.selectCell(cell);

      let pageX = startCoordinates?.x || 0;
      let pageY = startCoordinates?.y || 0;

      if (Platform.OS === 'web' && event) {
          pageX = event.nativeEvent.pageX;
          pageY = event.nativeEvent.pageY;
          console.log('🎯 Using event.nativeEvent.pageX/Y', { pageX, pageY });
        }
      
      const moveHandler = onCellMoveStart(cell);
      const eventWithCoordinates = {
        nativeEvent: {
          pageX,
          pageY,
        },
      } as GestureResponderEvent;
      moveHandler(eventWithCoordinates);
      setDragging(true);
    } else {
      console.error("useCellMove hook has failed you!");
    }
  };

  return (
    <View
      style={styles.grid}
      // @ts-ignore 
      className={Platform.OS === 'web' ? 'cell-grid-container' : undefined}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
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
          onDoublePress={handleCellDoublePress}
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

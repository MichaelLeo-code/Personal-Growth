import { cellSize } from "@/constants";
import { usePopup } from "@/my_hooks";
import { cellService } from "@/service";
import { Cell } from "@/types";
import React, { useCallback, useRef, useState } from "react";
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
  
  const isDragging = useRef(false);
  const cellWasPressed = useRef(false);
  const hasMoved = useRef(false);
  const mouseDownPos = useRef<{ x: number; y: number } | null>(null);

  const handleCellPress = useCallback((cell: Cell) => {
    cellWasPressed.current = true;
    cellService.selectCell(cell);
  }, []);

  const handleCellDoublePress = useCallback((cell: Cell) => {
    cellWasPressed.current = true;
    showPopup(cell);
  }, [showPopup]);

  const handleCellLongPress = (cell: Cell) => (event: any) => {
    cellWasPressed.current = true;
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
      isDragging.current = true;
    } else {
      console.error("useCellMove hook has failed you!");
    }
  };

  const handleTouchStart = useCallback((event: GestureResponderEvent) => {
    cellWasPressed.current = false;
    hasMoved.current = false;
    setStartCoordinates({
      x: event.nativeEvent.pageX,
      y: event.nativeEvent.pageY,
    });
  }, []);

  const handleTouchMove = useCallback((event: GestureResponderEvent) => {
    hasMoved.current = true;
    if (isDragging.current && onCellMove) {
      onCellMove(event);
    }
  }, [onCellMove]);

  const handleTouchEnd = useCallback((event: GestureResponderEvent) => {
    if (isDragging.current && onCellMoveEnd) {
      onCellMoveEnd(event);
      isDragging.current = false;
    } else if (!cellWasPressed.current && !hasMoved.current && onBackgroundPress) {
      onBackgroundPress();
    }
  }, [onCellMoveEnd, onBackgroundPress]);

  // Web-specific mouse event handlers
  const handleMouseMove = useCallback((event: any) => {
    if (Platform.OS === 'web' && isDragging.current && onCellMove) {
      const syntheticEvent = {
        nativeEvent: {
          pageX: event.clientX,
          pageY: event.clientY,
        },
      } as GestureResponderEvent;
      onCellMove(syntheticEvent);
    }
  }, [onCellMove]);

  const handleMouseUp = useCallback((event: any) => {
    if (Platform.OS === 'web' && isDragging.current && onCellMoveEnd) {
      const syntheticEvent = {
        nativeEvent: {
          pageX: event.clientX,
          pageY: event.clientY,
        },
      } as GestureResponderEvent;
      onCellMoveEnd(syntheticEvent);
      isDragging.current = false;
    }
  }, [onCellMoveEnd]);

  // Add global mouse event listeners for web
  React.useEffect(() => {
    if (Platform.OS === 'web') {
      const MOVE_THRESHOLD = 5; // pixels

      const handleContextMenu = (event: MouseEvent) => {
        if (isDragging.current) {
          event.preventDefault();
        }
      };

      const handleMouseDown = (event: MouseEvent) => {
        cellWasPressed.current = false;
        hasMoved.current = false;
        mouseDownPos.current = { x: event.clientX, y: event.clientY };
      };

      const handleMouseMoveGlobal = (event: MouseEvent) => {
        if (mouseDownPos.current) {
          const dx = Math.abs(event.clientX - mouseDownPos.current.x);
          const dy = Math.abs(event.clientY - mouseDownPos.current.y);
          if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) {
            hasMoved.current = true;
          }
        }
      };

      const handleClick = (event: MouseEvent) => {
        if (!cellWasPressed.current && !hasMoved.current && onBackgroundPress) {
          onBackgroundPress();
        }
        cellWasPressed.current = false;
        hasMoved.current = false;
        mouseDownPos.current = null;
      };

      document.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mousemove', handleMouseMoveGlobal);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('click', handleClick);
      document.addEventListener('contextmenu', handleContextMenu);
      
      return () => {
        document.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mousemove', handleMouseMoveGlobal);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('click', handleClick);
        document.removeEventListener('contextmenu', handleContextMenu);
      };
    }
  }, [handleMouseMove, handleMouseUp, onBackgroundPress]);

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

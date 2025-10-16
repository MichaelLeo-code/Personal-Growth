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
  
  const isDragging = useRef(false);

  const handleCellLongPress = (cell: Cell) => (event: any) => {
    console.log('🎯 handleCellLongPress called', { 
      hasEvent: !!event,
      eventType: event?.type,
      hasClientX: event?.clientX !== undefined,
      hasNativeEvent: !!event?.nativeEvent,
      clientX: event?.clientX,
      clientY: event?.clientY
    });
    
    if (onCellMoveStart) {
      cellService.selectCell(cell);

      // Get the actual coordinates from the event
      // For web, we need to handle both touch and mouse events
      let pageX = 0;
      let pageY = 0;

      if (Platform.OS === 'web' && event) {
        // On web, the event could be a native mouse event
        if (event.clientX !== undefined && event.clientY !== undefined) {
          // This is a native web mouse event
          pageX = event.clientX;
          pageY = event.clientY;
          console.log('🎯 Using event.clientX/Y', { pageX, pageY });
        } else if (event.nativeEvent?.clientX !== undefined) {
          // Sometimes it's wrapped in nativeEvent
          pageX = event.nativeEvent.clientX;
          pageY = event.nativeEvent.clientY;
          console.log('🎯 Using event.nativeEvent.clientX/Y', { pageX, pageY });
        } else if (event.nativeEvent?.pageX !== undefined) {
          pageX = event.nativeEvent.pageX;
          pageY = event.nativeEvent.pageY;
          console.log('🎯 Using event.nativeEvent.pageX/Y', { pageX, pageY });
        } else if (startCoordinates) {
          pageX = startCoordinates.x;
          pageY = startCoordinates.y;
          console.log('🎯 Using startCoordinates', { pageX, pageY });
        }
      } else {
        // On mobile, use stored coordinates
        pageX = startCoordinates?.x || 0;
        pageY = startCoordinates?.y || 0;
      }

      console.log('🎯 Final coordinates before calling moveHandler', { pageX, pageY });

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
      console.log("test");
    }
  };

  const handleTouchStart = useCallback((event: GestureResponderEvent) => {
    setStartCoordinates({
      x: event.nativeEvent.pageX,
      y: event.nativeEvent.pageY,
    });
  }, []);

  const handleTouchMove = useCallback((event: GestureResponderEvent) => {
    if (isDragging.current && onCellMove) {
      onCellMove(event);
    }
  }, [onCellMove]);

  const handleTouchEnd = useCallback((event: GestureResponderEvent) => {
    if (isDragging.current && onCellMoveEnd) {
      onCellMoveEnd(event);
      isDragging.current = false;
    }
  }, [onCellMoveEnd]);

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
      const handleGlobalMouseUp = (event: MouseEvent) => {
        console.log('🌐 Global mouseup fired', { isDragging: isDragging.current });
        if (isDragging.current && onCellMoveEnd) {
          const syntheticEvent = {
            nativeEvent: {
              pageX: event.clientX,
              pageY: event.clientY,
            },
          } as GestureResponderEvent;
          onCellMoveEnd(syntheticEvent);
          isDragging.current = false;
        }
      };

      const handleContextMenu = (event: MouseEvent) => {
        // Prevent right-click context menu during dragging
        if (isDragging.current) {
          event.preventDefault();
        }
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('contextmenu', handleContextMenu);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
        document.removeEventListener('contextmenu', handleContextMenu);
      };
    }
  }, [handleMouseMove, onCellMoveEnd]);

  return (
    <View
      style={styles.grid}
      // @ts-ignore - Web-specific attribute
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

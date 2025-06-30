import { PreviewCellType } from "@/my_components/grid/PreviewCell";
import { cellService, coordinateService } from "@/service";
import { Cell } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { Dimensions, GestureResponderEvent } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createScreenToGridCoordinates } from "./utils/coordinateUtils";

interface ZoomState {
  zoomLevel: number;
  offsetX: number;
  offsetY: number;
}

interface UseCellMoveProps {
  zoomState: ZoomState;
  cellSize: number;
}

export const useCellMove = ({ zoomState, cellSize }: UseCellMoveProps) => {
  const [previewCell, setPreviewCell] = useState<PreviewCellType | null>(null);
  const [movingCell, setMovingCell] = useState<Cell | null>(null);
  const [originalPosition, setOriginalPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const insets = useSafeAreaInsets();
  const { width, height } = Dimensions.get("window");
  const safeHeight = height - insets.top - insets.bottom;

  const screenToGridCoordinates = createScreenToGridCoordinates(
    width,
    safeHeight,
    insets.top,
    insets.bottom,
    zoomState,
    cellSize
  );

  // Utility function to restore cell to original position
  const restoreOriginalPosition = useCallback(
    (cell: Cell, position: { x: number; y: number }) => {
      coordinateService.occupyArea(position.x, position.y, cell.size, cell.id);
    },
    []
  );

  // Cleanup function to reset all move-related state
  const resetMoveState = useCallback(() => {
    if (movingCell && originalPosition) {
      restoreOriginalPosition(movingCell, originalPosition);
    }
    setMovingCell(null);
    setPreviewCell(null);
    setOriginalPosition(null);
  }, [movingCell, originalPosition, restoreOriginalPosition]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (movingCell && originalPosition) {
        restoreOriginalPosition(movingCell, originalPosition);
      }
    };
  }, [movingCell, originalPosition, restoreOriginalPosition]);

  // Cleanup if the moving cell gets deleted during move
  useEffect(() => {
    if (movingCell && !cellService.getCellById(movingCell.id)) {
      resetMoveState();
    }
  }, [movingCell, resetMoveState]);

  const handleMoveStart = (cell: Cell) => (event: GestureResponderEvent) => {
    setMovingCell(cell);
    setOriginalPosition({ x: cell.x, y: cell.y });

    // Temporarily free up the original coordinates
    coordinateService.deleteArea(cell.x, cell.y, cell.size);

    const { pageX, pageY } = event.nativeEvent;
    const { x, y } = screenToGridCoordinates(pageX, pageY);
    setPreviewCell({ x, y, type: cell.type });
  };

  const handleMove = (event: GestureResponderEvent) => {
    if (!movingCell) return;

    const { pageX, pageY } = event.nativeEvent;
    const { x, y } = screenToGridCoordinates(pageX, pageY);
    setPreviewCell({ x, y, type: movingCell.type });
  };

  const handleMoveEnd = (event: GestureResponderEvent) => {
    if (!movingCell || !originalPosition) {
      resetMoveState();
      return;
    }

    const { pageX, pageY } = event.nativeEvent;
    const { x, y } = screenToGridCoordinates(pageX, pageY);

    // Check if the new position is different from the original position
    if (x !== originalPosition.x || y !== originalPosition.y) {
      // Check if the new position is available
      if (!coordinateService.isOccupied(x, y)) {
        // Move the cell to the new position
        const success = cellService.moveCell(movingCell.id, x, y);
        if (success) {
          // Select the moved cell to keep it selected
          cellService.selectCell({ ...movingCell, x, y });
        } else {
          // If move failed, restore original coordinates
          restoreOriginalPosition(movingCell, originalPosition);
        }
      } else {
        // Position is occupied, restore original coordinates
        restoreOriginalPosition(movingCell, originalPosition);
      }
    } else {
      // Same position, restore original coordinates
      restoreOriginalPosition(movingCell, originalPosition);
    }

    // Reset state
    setMovingCell(null);
    setPreviewCell(null);
    setOriginalPosition(null);
  };

  return {
    previewCell,
    isMoving: !!movingCell,
    handleMoveStart,
    handleMove,
    handleMoveEnd,
  };
};

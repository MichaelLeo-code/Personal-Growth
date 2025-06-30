import { PreviewCellType } from "@/my_components/grid/PreviewCell";
import { cellService, coordinateService } from "@/service";
import { Cell } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { Dimensions, GestureResponderEvent } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const [isMoving, setIsMoving] = useState(false);
  const [movingCell, setMovingCell] = useState<Cell | null>(null);
  const [originalPosition, setOriginalPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const insets = useSafeAreaInsets();
  const { width, height } = Dimensions.get("window");
  const safeHeight = height - insets.top - insets.bottom;

  const screenToGridCoordinates = (screenX: number, screenY: number) => {
    const adjustedX = screenX - (width / 2) * (1 - zoomState.zoomLevel);
    const adjustedY =
      screenY -
      insets.top -
      insets.bottom -
      (safeHeight / 2) * (1 - zoomState.zoomLevel);

    const gridWorldX = adjustedX / zoomState.zoomLevel - zoomState.offsetX;
    const gridWorldY = adjustedY / zoomState.zoomLevel - zoomState.offsetY;
    const gridX = Math.round(gridWorldX / cellSize);
    const gridY = Math.round(gridWorldY / cellSize);
    return { x: gridX, y: gridY };
  };

  // Cleanup function to restore coordinates in case of unexpected state
  const cleanupMoveState = useCallback(() => {
    if (isMoving && movingCell && originalPosition) {
      coordinateService.occupyArea(
        originalPosition.x,
        originalPosition.y,
        movingCell.size,
        movingCell.id
      );
    }
    setIsMoving(false);
    setMovingCell(null);
    setPreviewCell(null);
    setOriginalPosition(null);
  }, [isMoving, movingCell, originalPosition]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isMoving && movingCell && originalPosition) {
        coordinateService.occupyArea(
          originalPosition.x,
          originalPosition.y,
          movingCell.size,
          movingCell.id
        );
      }
    };
  }, [isMoving, movingCell, originalPosition]);

  // Also cleanup if the moving cell somehow gets deleted or changes
  useEffect(() => {
    if (isMoving && movingCell) {
      const currentCell = cellService.getCellById(movingCell.id);
      if (!currentCell) {
        // Cell was deleted during move, cleanup
        cleanupMoveState();
      }
    }
  }, [isMoving, movingCell, cleanupMoveState]);

  const handleMoveStart = (cell: Cell) => (event: GestureResponderEvent) => {
    setIsMoving(true);
    setMovingCell(cell);
    setOriginalPosition({ x: cell.x, y: cell.y });

    // Temporarily free up the original coordinates
    coordinateService.deleteArea(cell.x, cell.y, cell.size);

    const { pageX, pageY } = event.nativeEvent;
    const { x, y } = screenToGridCoordinates(pageX, pageY);
    setPreviewCell({ x, y, type: cell.type });
  };

  const handleMove = (event: GestureResponderEvent) => {
    if (!isMoving || !movingCell) return;

    const { pageX, pageY } = event.nativeEvent;
    const { x, y } = screenToGridCoordinates(pageX, pageY);

    setPreviewCell({ x, y, type: movingCell.type });
  };

  const handleMoveEnd = (event: GestureResponderEvent) => {
    if (!isMoving || !movingCell || !originalPosition) {
      // Restore coordinates if we have the data
      if (movingCell && originalPosition) {
        coordinateService.occupyArea(
          originalPosition.x,
          originalPosition.y,
          movingCell.size,
          movingCell.id
        );
      }
      setIsMoving(false);
      setMovingCell(null);
      setPreviewCell(null);
      setOriginalPosition(null);
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
          // The moveCell function will handle occupying the new coordinates
          // Select the moved cell to keep it selected
          cellService.selectCell({ ...movingCell, x, y });
        } else {
          // If move failed, restore original coordinates
          coordinateService.occupyArea(
            originalPosition.x,
            originalPosition.y,
            movingCell.size,
            movingCell.id
          );
        }
      } else {
        // Position is occupied, restore original coordinates
        coordinateService.occupyArea(
          originalPosition.x,
          originalPosition.y,
          movingCell.size,
          movingCell.id
        );
      }
    } else {
      // Same position, restore original coordinates
      coordinateService.occupyArea(
        originalPosition.x,
        originalPosition.y,
        movingCell.size,
        movingCell.id
      );
    }

    setIsMoving(false);
    setMovingCell(null);
    setPreviewCell(null);
    setOriginalPosition(null);
  };

  return {
    previewCell,
    isMoving,
    movingCellId: movingCell?.id,
    handleMoveStart,
    handleMove,
    handleMoveEnd,
  };
};

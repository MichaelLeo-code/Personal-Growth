import { PreviewCellType } from "@/my_components/grid/PreviewCell";
import { cellService, coordinateService } from "@/service";
import { Cell } from "@/types";
import { useState } from "react";
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
  const [originalPosition, setOriginalPosition] = useState<{ x: number; y: number } | null>(null);

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

  const handleMoveStart = (cell: Cell) => (event: GestureResponderEvent) => {
    setIsMoving(true);
    setMovingCell(cell);
    setOriginalPosition({ x: cell.x, y: cell.y });

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
          // Select the moved cell to keep it selected
          cellService.selectCell({ ...movingCell, x, y });
        }
      }
    }

    setIsMoving(false);
    setMovingCell(null);
    setPreviewCell(null);
    setOriginalPosition(null);
  };

  return {
    previewCell,
    isMoving,
    handleMoveStart,
    handleMove,
    handleMoveEnd,
  };
};

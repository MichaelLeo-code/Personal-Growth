import { PreviewCellType } from "@/my_components/grid/PreviewCell";
import { cellService, coordinateService } from "@/service";
import { Cell } from "@/types";
import { useCallback, useState } from "react";
import { Dimensions, GestureResponderEvent, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  adjustForCellCenter,
  createScreenToGridCoordinates,
} from "../../utils/coordinateUtils";

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

  const screenToGridCoordinates = Platform.OS === 'web' 
    ? createScreenToGridCoordinates(
    width,
    safeHeight,
    0,
    0,
    zoomState,
    cellSize
  ) : createScreenToGridCoordinates(
    width,
    safeHeight,
    insets.top,
    insets.bottom,
    zoomState,
    cellSize
  );

  const cleanUp = useCallback(() => {
    setMovingCell(null);
    setPreviewCell(null);
    setOriginalPosition(null);
  }, []);

  const restoreOriginalPosition = useCallback(() => {
    if (movingCell && originalPosition) {
      const { x, y } = originalPosition;
      coordinateService.occupyArea(x, y, movingCell.size, movingCell.id);
    }
    cleanUp();
  }, [movingCell, originalPosition, cleanUp]);

  const handleMoveStart = (cell: Cell) => (event: GestureResponderEvent) => {
    setMovingCell(cell);
    setOriginalPosition({ x: cell.x, y: cell.y });

    coordinateService.deleteArea(cell.x, cell.y, cell.size);

    const { pageX, pageY } = event.nativeEvent;
    const { x, y } = screenToGridCoordinates(pageX, pageY);
    setPreviewCell({
      ...adjustForCellCenter(x, y, cell.size),
      type: cell.type,
    });
  };

  const handleMove = (event: GestureResponderEvent) => {
    if (!movingCell) return;

    const { pageX, pageY } = event.nativeEvent;
    const { x, y } = screenToGridCoordinates(pageX, pageY);
    setPreviewCell({
      ...adjustForCellCenter(x, y, movingCell.size),
      type: movingCell.type,
    });
  };

  const handleMoveEnd = (event: GestureResponderEvent) => {
    if (!movingCell || !originalPosition) {
      restoreOriginalPosition();
      return;
    }

    const { pageX, pageY } = event.nativeEvent;
    const { x: gridX, y: gridY } = screenToGridCoordinates(pageX, pageY);
    const { x, y } = adjustForCellCenter(gridX, gridY, movingCell.size);

    if (!coordinateService.isOccupiedArea(x, y, movingCell.size)) {
      const success = cellService.moveCell(movingCell.id, x, y);
      if (success) {
        cellService.selectCell({ ...movingCell, x, y });
      } else {
        // if move failed, restore original coordinates
        restoreOriginalPosition();
      }
    } else {
      // position is occupied, restore original coordinates
      restoreOriginalPosition();
    }

    cleanUp();
  };

  return {
    previewCell,
    isMoving: !!movingCell,
    handleMoveStart,
    handleMove,
    handleMoveEnd,
  };
};

import { PreviewCellType } from "@/my_components/grid/PreviewCell";
import { cellService, coordinateService } from "@/service";
import { Cell, CellType } from "@/types";
import { useState } from "react";
import { Dimensions, GestureResponderEvent } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createScreenToGridCoordinates } from "../utils/coordinateUtils";

interface ZoomState {
  zoomLevel: number;
  offsetX: number;
  offsetY: number;
}

interface UseDragAndDropProps {
  zoomState: ZoomState;
  selected: Cell | null;
  cellSize: number;
}

export const useDragAndDrop = ({
  zoomState,
  selected,
  cellSize,
}: UseDragAndDropProps) => {
  const [previewCell, setPreviewCell] = useState<PreviewCellType | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragCellType, setDragCellType] = useState<CellType>(CellType.Headline);

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

  const handleDragStart =
    (type: CellType) => (event: GestureResponderEvent) => {
      if (!selected) return;
      setIsDragging(true);
      setDragCellType(type);

      const { pageX, pageY } = event.nativeEvent;
      const { x, y } = screenToGridCoordinates(pageX, pageY);
      setPreviewCell({ x, y, type });
    };

  const handleDrag = (event: GestureResponderEvent) => {
    if (!isDragging) return;

    const { pageX, pageY } = event.nativeEvent;
    const { x, y } = screenToGridCoordinates(pageX, pageY);

    setPreviewCell({ x, y, type: dragCellType });
  };

  const handleDragEnd = (event: GestureResponderEvent) => {
    if (!isDragging || !previewCell || !selected) {
      setIsDragging(false);
      setPreviewCell(null);
      return;
    }

    const { pageX, pageY } = event.nativeEvent;
    const { x, y } = screenToGridCoordinates(pageX, pageY);

    if (!coordinateService.isOccupied(x, y)) {
      const newCell = cellService.addCell({
        x,
        y,
        text: "newCell",
        parent: selected.id,
        type: dragCellType,
      });

      if (newCell) {
        cellService.selectCell(newCell);
      }
    }

    setIsDragging(false);
    setPreviewCell(null);
  };

  return {
    previewCell,
    isDragging,
    handleDragStart,
    handleDrag,
    handleDragEnd,
  };
};

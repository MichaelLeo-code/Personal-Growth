interface ZoomState {
  zoomLevel: number;
  offsetX: number;
  offsetY: number;
}

/**
 * Creates a function to convert screen coordinates to grid coordinates
 * This utility is shared between useCellMove and useDragAndDrop hooks
 */
export const createScreenToGridCoordinates =
  (
    screenWidth: number,
    safeHeight: number,
    topInset: number,
    bottomInset: number,
    zoomState: ZoomState,
    cellSize: number
  ) =>
  (screenX: number, screenY: number) => {
    const adjustedX = screenX - (screenWidth / 2) * (1 - zoomState.zoomLevel);
    const adjustedY =
      screenY -
      topInset -
      bottomInset -
      (safeHeight / 2) * (1 - zoomState.zoomLevel);

    const gridWorldX = adjustedX / zoomState.zoomLevel - zoomState.offsetX;
    const gridWorldY = adjustedY / zoomState.zoomLevel - zoomState.offsetY;

    return {
      x: Math.round(gridWorldX / cellSize),
      y: Math.round(gridWorldY / cellSize),
    };
  };

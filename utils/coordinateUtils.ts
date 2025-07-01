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

/**
 * Creates a function to convert grid coordinates to screen coordinates
 * This is the reverse of screenToGridCoordinates
 */
export const createGridToScreenCoordinates =
  (
    screenWidth: number,
    safeHeight: number,
    topInset: number,
    bottomInset: number,
    zoomState: ZoomState,
    cellSize: number
  ) =>
  (gridX: number, gridY: number) => {
    // Convert grid coordinates to world coordinates
    const gridWorldX = gridX * cellSize;
    const gridWorldY = gridY * cellSize;

    // Apply zoom and offset transformations
    const adjustedX = (gridWorldX + zoomState.offsetX) * zoomState.zoomLevel;
    const adjustedY = (gridWorldY + zoomState.offsetY) * zoomState.zoomLevel;

    // Convert to screen coordinates
    const screenX = adjustedX + (screenWidth / 2) * (1 - zoomState.zoomLevel);
    const screenY =
      adjustedY +
      topInset +
      bottomInset +
      (safeHeight / 2) * (1 - zoomState.zoomLevel);

    return {
      pageX: screenX,
      pageY: screenY,
    };
  };

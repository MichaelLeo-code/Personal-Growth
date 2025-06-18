import { DraggableFloatingButton, FloatingButton, Grid } from "@/my_components";
import { PreviewCellType } from "@/my_components/grid/PreviewCell";
import { cellService, coordinateService } from "@/service";
import { Cell, CellType } from "@/types";
import { ReactNativeZoomableView } from "@openspacelabs/react-native-zoomable-view";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import React, { useEffect, useState } from "react";
import { Dimensions, GestureResponderEvent, SafeAreaView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const addCell = (type: CellType) => {
  const selectedCellId = cellService.getSelected()?.id;
  if (!selectedCellId) return;
  const cell = cellService.addNextFreeCell(selectedCellId, type);

  if (cell) {
    cellService.selectCell(cell);
  }
};

const cellData = [
  { text: "A", x: 0, y: 0, id: 1 },
  // { text: "B", x: 0, y: 3, id: 2, parent: 1 },
  // { text: "C", x: 1, y: 2, id: 3, parent: 1 },
  // { text: "D", x: 5, y: 1, id: 4, parent: 3 },
];

export default function RootLayout() {
  const [selected, setSelected] = useState<Cell | null>(null);
  const [cells, setCells] = useState<Cell[]>([]);
  const [previewCell, setPreviewCell] = useState<PreviewCellType | null>(null);
  const [previewCell2, setPreviewCell2] = useState<PreviewCellType | null>(
    null
  );
  const [isDragging, setIsDragging] = useState(false);
  const [dragCellType, setDragCellType] = useState<CellType>(CellType.Headline);

  // Store the current transformation state from the zoomable view
  const [zoomState, setZoomState] = useState({
    zoomLevel: 1,
    offsetX: 0,
    offsetY: 0,
  });

  const insets = useSafeAreaInsets();
  const cellSize = 50; // Default cell size from Grid component

  // Convert screen coordinates to grid coordinates accounting for zoom and pan
  const screenToGridCoordinates = (screenX: number, screenY: number) => {
    console.log("Drag start at:", { screenX, screenY }, zoomState.zoomLevel);

    // Account for safe area and UI elements
    const adjustedX = screenX;
    const adjustedY = screenY - insets.top - 60;

    // Apply inverse transformation to account for zoom and pan
    // The formula is: original_coordinate = (screen_coordinate - pan_offset) / zoom_level
    const gridWorldX = (adjustedX - zoomState.offsetX) / zoomState.zoomLevel;
    const gridWorldY = (adjustedY - zoomState.offsetY) / zoomState.zoomLevel;

    console.log("Grid world coords:", { gridWorldX, gridWorldY });

    // Convert to grid coordinates (snap to grid)
    const gridX = Math.round(gridWorldX / cellSize);
    const gridY = Math.round(gridWorldY / cellSize);

    return { x: gridX, y: gridY };
  };

  const screenToGridCoordinates2 = (screenX: number, screenY: number) => {
    // Account for safe area and UI elements
    const adjustedX = screenX - (195 - 195 * zoomState.zoomLevel);
    const adjustedY =
      screenY - insets.top - 60 - (381.5 - 381.5 * zoomState.zoomLevel);

    // Apply inverse transformation to account for zoom and pan
    // The formula is: original_coordinate = (screen_coordinate - pan_offset) / zoom_level
    const gridWorldX = adjustedX / zoomState.zoomLevel - zoomState.offsetX;
    const gridWorldY = adjustedY / zoomState.zoomLevel - zoomState.offsetY;
    const gridX = Math.round(gridWorldX / cellSize);
    const gridY = Math.round(gridWorldY / cellSize);
    console.log("CALCULATION:", adjustedX, "/", zoomState.zoomLevel * cellSize);
    return { x: gridX, y: gridY };
  };

  const handleDragStart =
    (type: CellType) => (event: GestureResponderEvent) => {
      if (!selected) return;
      setIsDragging(true);
      setDragCellType(type);

      const { pageX, pageY } = event.nativeEvent;
      const { x, y } = screenToGridCoordinates(pageX, pageY);
      const { x: x2, y: y2 } = screenToGridCoordinates2(pageX, pageY);
      setPreviewCell({ x, y, type });
      setPreviewCell2({ x: x2, y: y2, type });
    };

  const handleDrag = (event: GestureResponderEvent) => {
    if (!isDragging) return;

    const { pageX, pageY } = event.nativeEvent;
    const { x, y } = screenToGridCoordinates(pageX, pageY);
    const { x: x2, y: y2 } = screenToGridCoordinates2(pageX, pageY);

    // Always update preview position, regardless of occupancy
    // The preview will help users see where they're placing the cell
    setPreviewCell({ x, y, type: dragCellType });
    setPreviewCell2({ x: x2, y: y2, type: dragCellType });
    console.log("Dragging at:", { x, y }, "Preview:", { x2, y2 });
  };

  const handleDragEnd = (event: GestureResponderEvent) => {
    if (!isDragging || !previewCell || !selected) {
      setIsDragging(false);
      setPreviewCell(null);
      setPreviewCell2(null);
      return;
    }

    const { pageX, pageY } = event.nativeEvent;
    const { x, y } = screenToGridCoordinates(pageX, pageY);

    // Check if the position is valid and add the cell
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
    setPreviewCell2(null);
  };

  useEffect(() => {
    cellData.forEach((cell) => cellService.addCell(cell));
    setCells(cellService.getCells());
    setSelected(cellService.getSelected());
    const unsubscribe = cellService.subscribe(() => {
      setCells(cellService.getCells());
      setSelected(cellService.getSelected());
    });
    return unsubscribe;
  }, []);

  // const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  const { width, height } = Dimensions.get("window");
  const appiedHeight = height / 2 - insets.top - 60;

  return (
    <ThemeProvider value={DarkTheme}>
      <SafeAreaView style={{ flex: 1 }}>
        <ReactNativeZoomableView
          minZoom={0.1}
          doubleTapZoomToCenter={false}
          bindToBorders={false}
          //claude
          // panEnabled={false}к
          // disableMomentum={true}
          // movementSensibility={0}
          // staticPinPosition={{
          //   x: width / 2,
          //   y: height / 2 - 40.5,
          // }}
          movementSensibility={1.5}
          visualTouchFeedbackEnabled={true} // DEV
          onTransform={(transform) => {
            console.log("Transform values:", transform);
            setZoomState({
              zoomLevel: transform.zoomLevel,
              offsetX: transform.offsetX,
              offsetY: transform.offsetY,
            });
          }}
        >
          <Grid
            cells={cells}
            selected={selected}
            previewCell={previewCell}
            previewCell2={previewCell2}
          />
        </ReactNativeZoomableView>
        <FloatingButton
          onPress={() => {
            cellService.deleteAll();
          }}
          label="Delete all"
          backgroundColor="#a81000"
          style={{
            right: 20,
            top: insets.top + 5,
          }}
        />
        {selected && (
          <>
            <DraggableFloatingButton
              onPress={() => addCell(CellType.Tasklist)}
              onLongPressStart={handleDragStart(CellType.Tasklist)}
              onDrag={handleDrag}
              onLongPressEnd={handleDragEnd}
              iconName="text-box-plus-outline"
              backgroundColor="#4b50e3"
              style={{
                right: 20,
                bottom: insets.bottom + 141,
              }}
            />
            <DraggableFloatingButton
              onPress={() => addCell(CellType.Headline)}
              onLongPressStart={handleDragStart(CellType.Headline)}
              onDrag={handleDrag}
              onLongPressEnd={handleDragEnd}
              iconName="plus"
              style={{
                right: 20,
                bottom: insets.bottom + 73,
              }}
            />
            <FloatingButton
              onPress={() => {
                cellService.deleteCell(selected.id);
                setSelected(null);
              }}
              backgroundColor="#a81000"
              style={{
                right: 20,
                bottom: insets.bottom + 5,
              }}
              iconName="delete"
            />
          </>
        )}
      </SafeAreaView>
    </ThemeProvider>
  );
}

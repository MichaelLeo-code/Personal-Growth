import { DraggableFloatingButton, FloatingButton, Grid } from "@/my_components";
import { cellService } from "@/service/cellService";
import { coordinateService } from "@/service/coordinateService";
import { Cell, CellType } from "@/types/cells";
import { ReactNativeZoomableView } from "@openspacelabs/react-native-zoomable-view";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import React, { useEffect, useState } from "react";
import { GestureResponderEvent, SafeAreaView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const addCell = (type: CellType) => {
  const selectedCellId = cellService.getSelected()?.id;
  if (!selectedCellId) return;
  const cell = cellService.addNextFreeCell(selectedCellId, type);

  if (cell) {
    cellService.selectCell(cell);
  }
};

const deleteAll = () => {
  cellService.deleteAll();
  cellService.addCell({ text: "A", x: 0, y: 0 });
};

const cellData = [
  { text: "A", x: 0, y: 0, id: 1 },
  { text: "B", x: 0, y: 3, id: 2, parent: 1 },
  { text: "C", x: 1, y: 2, id: 3, parent: 1 },
  { text: "D", x: 5, y: 1, id: 4, parent: 3 },
];

export default function RootLayout() {
  const [selected, setSelected] = useState<Cell | null>(null);
  const [cells, setCells] = useState<Cell[]>([]);
  const [previewCell, setPreviewCell] = useState<{
    x: number;
    y: number;
    type: CellType;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragCellType, setDragCellType] = useState<CellType>(CellType.Headline);

  const insets = useSafeAreaInsets();
  const cellSize = 50; // Default cell size from Grid component

  // Convert screen coordinates to grid coordinates
  // This is a simplified version - in a real implementation you'd need to account
  // for the zoomable view's current zoom and pan state
  const screenToGridCoordinates = (screenX: number, screenY: number) => {
    // For now, we'll use a simple approach - in practice you'd need to get
    // the current transform from the zoomable view
    const adjustedX = screenX;
    const adjustedY = screenY - insets.top - 60; // Account for safe area and some UI elements

    // Convert to grid coordinates (snap to grid)
    const gridX = Math.round(adjustedX / cellSize);
    const gridY = Math.round(adjustedY / cellSize);

    return { x: gridX, y: gridY };
  };

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

    // Always update preview position, regardless of occupancy
    // The preview will help users see where they're placing the cell
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

  return (
    <ThemeProvider value={DarkTheme}>
      <SafeAreaView style={{ flex: 1 }}>
        <ReactNativeZoomableView
          minZoom={0.1}
          doubleTapZoomToCenter={false}
          bindToBorders={false}
          movementSensibility={1.5}
          visualTouchFeedbackEnabled={true} // DEV
        >
          <Grid cells={cells} selected={selected} previewCell={previewCell} />
        </ReactNativeZoomableView>
        <FloatingButton
          onPress={() => {
            deleteAll();
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

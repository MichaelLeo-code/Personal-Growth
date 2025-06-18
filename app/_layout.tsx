import { DraggableFloatingButton, FloatingButton, Grid } from "@/my_components";
import { useDragAndDrop } from "@/my_hooks";
import { cellService } from "@/service";
import { Cell, CellType } from "@/types";
import { ReactNativeZoomableView } from "@openspacelabs/react-native-zoomable-view";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native";
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
  { text: "B", x: 0, y: 3, id: 2, parent: 1 },
  { text: "C", x: 1, y: 2, id: 3, parent: 1 },
  { text: "D", x: 5, y: 1, id: 4, parent: 3 },
];

export default function RootLayout() {
  const [selected, setSelected] = useState<Cell | null>(null);
  const [cells, setCells] = useState<Cell[]>([]);

  // Store the current transformation state from the zoomable view
  const [zoomState, setZoomState] = useState({
    zoomLevel: 1,
    offsetX: 0,
    offsetY: 0,
  });

  const insets = useSafeAreaInsets();
  const cellSize = 50;

  const { previewCell, handleDragStart, handleDrag, handleDragEnd } =
    useDragAndDrop({
      zoomState,
      selected,
      cellSize,
    });

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
          movementSensibility={1.5}
          onTransform={(transform) => {
            setZoomState({
              zoomLevel: transform.zoomLevel,
              offsetX: transform.offsetX,
              offsetY: transform.offsetY,
            });
          }}
        >
          <Grid cells={cells} selected={selected} previewCell={previewCell} />
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

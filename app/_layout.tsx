import { cellSize } from "@/constants";
import { FloatingActionButtons, Grid } from "@/my_components";
import { useCellManagement, useDragAndDrop, useZoomState } from "@/my_hooks";
import { ReactNativeZoomableView } from "@openspacelabs/react-native-zoomable-view";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import React from "react";
import { SafeAreaView } from "react-native";

export default function RootLayout() {
  // Use the extracted hooks
  const { cells, selected, addCell, deleteSelectedCell, deleteAllCells } =
    useCellManagement();
  const { zoomState, handleTransform } = useZoomState();
  const { previewCell, handleDragStart, handleDrag, handleDragEnd } =
    useDragAndDrop({
      zoomState,
      selected,
      cellSize,
    });

  // Font loading
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
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
          onTransform={handleTransform}
        >
          <Grid cells={cells} selected={selected} previewCell={previewCell} />
        </ReactNativeZoomableView>

        <FloatingActionButtons
          selected={selected}
          onAddCell={addCell}
          onDeleteSelected={deleteSelectedCell}
          onDeleteAll={deleteAllCells}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
        />
      </SafeAreaView>
    </ThemeProvider>
  );
}

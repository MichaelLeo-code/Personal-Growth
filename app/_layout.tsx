import { cellSize } from "@/constants";
import { FloatingActionButtons } from "@/containers";
import { Grid } from "@/my_components";
import {
  useCellManagement,
  useCellMove,
  useDragAndDrop,
  useZoomState,
} from "@/my_hooks";
import { ReactNativeZoomableView } from "@openspacelabs/react-native-zoomable-view";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import React, { useState } from "react";
import { SafeAreaView } from "react-native";

export default function RootLayout() {
  const { cells, selected, addCell, deleteSelectedCell, deleteAllCells } =
    useCellManagement();
  const { zoomState, handleTransform } = useZoomState();
  const { previewCell, handleDragStart, handleDrag, handleDragEnd } =
    useDragAndDrop({
      zoomState,
      selected,
      cellSize,
    });
  const {
    previewCell: movePreviewCell,
    isMoving,
    handleMoveStart,
    handleMove,
    handleMoveEnd,
  } = useCellMove({
    zoomState,
    cellSize,
  });
  const [isEditMode, setIsEditMode] = useState(true);

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
          <Grid
            cells={cells}
            selected={selected}
            previewCell={previewCell || movePreviewCell}
            isMoving={isMoving}
            onCellMoveStart={handleMoveStart}
            onCellMove={handleMove}
            onCellMoveEnd={handleMoveEnd}
          />
        </ReactNativeZoomableView>

        {/* <FloatingButton
          onPress={() => setIsEditMode(!isEditMode)}
          iconName="note-edit-outline"
        /> */}

        {isEditMode && (
          <FloatingActionButtons
            selected={selected}
            onAddCell={addCell}
            onDeleteSelected={deleteSelectedCell}
            onDeleteAll={deleteAllCells}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
          />
        )}
      </SafeAreaView>
    </ThemeProvider>
  );
}

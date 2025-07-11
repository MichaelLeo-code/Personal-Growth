import { cellSize } from "@/constants";
import { FloatingActionButtons } from "@/containers";
import { useThemeColor } from "@/hooks/useThemeColor";
import { BottomProgressBar, Grid } from "@/my_components";
import {
  useCellManagement,
  useCellMove,
  useDragAndDrop,
  useZoomState,
} from "@/my_hooks";
import { checkAndResetDailyTasks } from "@/service/taskService";
import { ReactNativeZoomableView } from "@openspacelabs/react-native-zoomable-view";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native";

export default function MainApp() {
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
  const [isEditMode] = useState(true); // Edit mode toggle - can add setIsEditMode later if needed

  useEffect(() => {
    checkAndResetDailyTasks();
  }, []);

  const backgroundColor = useThemeColor({}, "background");
  const headerBackgroundColor = useThemeColor(
    { light: "#f8f9fa", dark: "#1a1a1a" },
    "background"
  );
  const borderColor = useThemeColor(
    { light: "#e9ecef", dark: "#333" },
    "background"
  );

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor }]}>
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

      <BottomProgressBar cellId={1} />
    </SafeAreaView>
  );
}

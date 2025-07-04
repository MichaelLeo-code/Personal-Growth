import { cellSize } from "@/constants";
import { FloatingActionButtons } from "@/containers";
import { Grid, LogoutButton, SyncStatusIndicator } from "@/my_components";
import {
  useCellManagement,
  useCellMove,
  useDragAndDrop,
  useZoomState,
} from "@/my_hooks";
import { ReactNativeZoomableView } from "@openspacelabs/react-native-zoomable-view";
import React, { useState } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";

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

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.header}>
        <SyncStatusIndicator />
        <LogoutButton />
      </View>
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

      <LogoutButton />

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
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
});

import { cellSize } from "@/constants";
import { FloatingActionButtons } from "@/containers";
import { BottomProgressBar, CellInfo, ConflictResolutionDialog, Grid } from "@/my_components";
import {
  useCellManagement,
  useCellMove,
  useDragAndDrop,
  useSyncConflictHandler,
  useThemeColor,
  useZoomState,
} from "@/my_hooks";
import { cellService, storageService } from "@/service";
import { checkAndResetDailyTasks } from "@/service/taskService";
import { ReactNativeZoomableView } from "@openspacelabs/react-native-zoomable-view";
import React, { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import { webCssConfig } from "./web-css-config";

export default function MainApp() {
  const { cells, selected, addCell, deleteSelectedCell, deleteAllCells } =
    useCellManagement();
  const { zoomState, handleTransform } = useZoomState();
  const { conflictPrompt, handleResolve, dismissDialog } = useSyncConflictHandler();
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

  const handleForcePush = async () => {
    try {
      await storageService.forcePushToRemote();
      console.log("Force push completed successfully");
    } catch (error) {
      console.error("Force push failed:", error);
    }
  };

  const handleForceFetch = async () => {
    try {
      await storageService.forceFetchFromRemote();
      console.log("Force fetch completed successfully");
      await cellService.reloadCells();
    } catch (error) {
      console.error("Force fetch failed:", error);
    }
  };

  
  const handleBackgroundPress = () => {
    cellService.deselectCell();
  };

  useEffect(() => {
    checkAndResetDailyTasks();
  }, []);

  const backgroundColor = useThemeColor({}, "background");

  // Web-specific CSS styles to prevent page zoom and text selection
  React.useEffect(() => {
    if (Platform.OS === "web") {
      const style = document.createElement("style");
      style.textContent = webCssConfig;
      document.head.appendChild(style);

      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);

  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor,
        },
      ]}
    >
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
          onBackgroundPress={handleBackgroundPress}
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
          onForcePush={handleForcePush}
          onForceFetch={handleForceFetch}
        />
      )}

      {selected && (
        <CellInfo cellId={selected.id} />
      )}
      <BottomProgressBar cellId={1} />

      {conflictPrompt && (
        <ConflictResolutionDialog
          localCellsCount={conflictPrompt.localCellsCount}
          remoteCellsCount={conflictPrompt.remoteCellsCount}
          conflictMessage={conflictPrompt.conflictMessage}
          onResolve={handleResolve}
          onDismiss={dismissDialog}
        />
      )}
    </View>
  );
}

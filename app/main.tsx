import { cellSize } from "@/constants";
import { FloatingActionButtons } from "@/containers";
import { BottomProgressBar, Grid } from "@/my_components";
import {
  useCellManagement,
  useCellMove,
  useDragAndDrop,
  useThemeColor,
  useZoomState,
} from "@/my_hooks";
import { checkAndResetDailyTasks } from "@/service/taskService";
import { ReactNativeZoomableView } from "@openspacelabs/react-native-zoomable-view";
import React, { useEffect, useState } from "react";
import { Platform, View } from "react-native";

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

  // Web-specific CSS styles to prevent page zoom and text selection
  React.useEffect(() => {
    if (Platform.OS === "web") {
      const style = document.createElement("style");
      style.textContent = `
        *, *::before, *::after {
          touch-action: none !important;
          user-select: none !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          -webkit-touch-callout: none !important;
          -webkit-tap-highlight-color: transparent !important;
          -webkit-text-size-adjust: none !important;
          -moz-text-size-adjust: none !important;
          -ms-text-size-adjust: none !important;
          text-size-adjust: none !important;
          pointer-events: auto !important;
        }
        
        body, html {
          user-select: none !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          overflow: hidden !important;
        }

        input, textarea {
          user-select: text !important;
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          -ms-user-select: text !important;
        }
      `;
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
    </View>
  );
}

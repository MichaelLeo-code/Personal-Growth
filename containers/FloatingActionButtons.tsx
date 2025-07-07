import {
  DraggableFloatingButton,
  FloatingButton,
  LogoutButton,
  SyncStatusIndicator,
} from "@/my_components";
import { Cell, CellType } from "@/types";
import React from "react";
import { GestureResponderEvent, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface FloatingActionButtonsProps {
  selected: Cell | null;
  onAddCell: (type: CellType) => void;
  onDeleteSelected: () => void;
  onDeleteAll: () => void;
  onDragStart: (type: CellType) => (event: GestureResponderEvent) => void;
  onDrag: (event: GestureResponderEvent) => void;
  onDragEnd: (event: GestureResponderEvent) => void;
}

export const FloatingActionButtons: React.FC<FloatingActionButtonsProps> = ({
  selected,
  onAddCell,
  onDeleteSelected,
  onDeleteAll,
  onDragStart,
  onDrag,
  onDragEnd,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <>
      <View
        style={{
          position: "absolute",
          left: 20,
          top: insets.top + 5,
          zIndex: 1000,
        }}
      >
        <SyncStatusIndicator />
      </View>
      <View
        style={{
          position: "absolute",
          right: 20,
          top: insets.top + 70,
          zIndex: 1000,
        }}
      >
        <LogoutButton />
      </View>
      <FloatingButton
        onPress={onDeleteAll}
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
            onPress={() => onAddCell(CellType.Tasklist)}
            onLongPressStart={onDragStart(CellType.Tasklist)}
            onDrag={onDrag}
            onLongPressEnd={onDragEnd}
            iconName="text-box-plus-outline"
            backgroundColor="#4b50e3"
            style={{
              right: 20,
              bottom: insets.bottom + 141,
            }}
          />
          <DraggableFloatingButton
            onPress={() => onAddCell(CellType.Headline)}
            onLongPressStart={onDragStart(CellType.Headline)}
            onDrag={onDrag}
            onLongPressEnd={onDragEnd}
            iconName="plus"
            style={{
              right: 20,
              bottom: insets.bottom + 73,
            }}
          />
          <FloatingButton
            onPress={onDeleteSelected}
            backgroundColor="#a81000"
            style={{
              right: 20,
              bottom: insets.bottom + 5,
            }}
            iconName="delete"
          />
        </>
      )}
    </>
  );
};

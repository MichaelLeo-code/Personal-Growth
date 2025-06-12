import { FloatingButton, Grid } from "@/my_components";
import { gridStore } from "@/service/CellService";
import { Cell, CellType } from "@/types/cells";
import { ReactNativeZoomableView } from "@openspacelabs/react-native-zoomable-view";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const addCell = (type: CellType) => {
  const selectedCellId = gridStore.getSelected()?.id;
  if (!selectedCellId) return;
  const cell = gridStore.addNextFreeCell(selectedCellId, type);

  if (cell) {
    gridStore.selectCell(cell);
  }
};

const deleteAll = () => {
  gridStore.deleteAll();
  gridStore.addCell({ text: "A", x: 0, y: 0 });
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

  const insets = useSafeAreaInsets();

  useEffect(() => {
    cellData.forEach((cell) => gridStore.addCell(cell));
    setCells(gridStore.getCells());
    setSelected(gridStore.getSelected());
    const unsubscribe = gridStore.subscribe(() => {
      setCells(gridStore.getCells());
      setSelected(gridStore.getSelected());
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
          <Grid cells={cells} selected={selected} />
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
            <FloatingButton
              onPress={() => addCell(CellType.Tasklist)}
              iconName="text-box-plus-outline"
              backgroundColor="#4b50e3"
              style={{
                right: 20,
                bottom: insets.bottom + 141,
              }}
            />
            <FloatingButton
              onPress={() => addCell(CellType.Headline)}
              iconName="plus"
              style={{
                right: 20,
                bottom: insets.bottom + 73,
              }}
            />
            <FloatingButton
              onPress={() => {
                gridStore.deleteCell(selected.id);
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

import { FloatingButton, Grid } from "@/my_components";
import { gridStore } from "@/service/CellService";
import { Cell, CellType } from "@/types/cells";
import { ReactNativeZoomableView } from "@openspacelabs/react-native-zoomable-view";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native";

let counter = 0;

const onAdd = () => {
  counter++;
  const selectedCellId = gridStore.getSelected()?.id;
  if (!selectedCellId) return;
  const type = counter % 2 === 0 ? CellType.Headline : CellType.Tasklist;
  const cell = gridStore.addNextFreeCell(selectedCellId, type);

  if (cell) {
    gridStore.selectCell(cell);
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
      <ReactNativeZoomableView
        minZoom={0.1}
        doubleTapZoomToCenter={false}
        bindToBorders={false}
        movementSensibility={1.5}
        visualTouchFeedbackEnabled={true} // DEV
      >
        <SafeAreaView>
          <Grid cells={cells} selected={selected} />
        </SafeAreaView>
      </ReactNativeZoomableView>
      {selected && (
        <>
          <FloatingButton
            onPress={() => onAdd()}
            style={{ bottom: 90 }} // Upper button
          />
          <FloatingButton
            onPress={() => {}}
            backgroundColor="#a81000"
            style={{ bottom: 20 }} // Lower button
            iconName="delete"
          />
        </>
      )}
    </ThemeProvider>
  );
}

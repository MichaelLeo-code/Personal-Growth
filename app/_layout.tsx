import { FloatingButton } from "@/my_components/FloatingButton";
import { Grid } from "@/my_components/Grid";
import { gridStore } from "@/store/GridStore";
import { ReactNativeZoomableView } from "@openspacelabs/react-native-zoomable-view";

import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import React from "react";
import { SafeAreaView } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

const onAdd = () => {
  const selectedCellId = gridStore.getSelected()?.id;
  if (!selectedCellId) return;
  const cell = gridStore.addNextFreeCell(selectedCellId);
  if (cell) {
    gridStore.selectCell(cell);
  }
};

export default function RootLayout() {
  const [selected, setSelected] = React.useState(() => gridStore.getSelected());
  React.useEffect(() => {
    const unsubscribe = gridStore.subscribe(() => {
      setSelected(gridStore.getSelected());
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  const cellData = [
    { text: "A", x: 0, y: 0, id: 1 },
    { text: "B", x: 0, y: 3, id: 2, parent: 1 },
    { text: "C", x: 1, y: 2, id: 3, parent: 1 },
    { text: "D", x: 5, y: 1, id: 4, parent: 3 },
  ];
  return (
    <ThemeProvider value={DarkTheme}>
      <GestureHandlerRootView>
        <ReactNativeZoomableView
          minZoom={0.1}
          doubleTapZoomToCenter={false}
          bindToBorders={false}
          movementSensibility={1.5}
          visualTouchFeedbackEnabled={true} // DEV
        >
          <SafeAreaView>
            <Grid initialCells={cellData} />
          </SafeAreaView>
        </ReactNativeZoomableView>
        {selected && <FloatingButton onPress={() => onAdd()} />}
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}

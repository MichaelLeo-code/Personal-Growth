import { FloatingButton } from "@/my_components/FloatingButton";
import { Grid } from "@/my_components/Grid";
import { gridStore } from "@/store/GridStore";
import { ReactNativeZoomableView } from "@openspacelabs/react-native-zoomable-view";

import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { SafeAreaView } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

export default function RootLayout() {
  // const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  const cellData = [
    { text: "A", x: 0, y: 0 },
    { text: "B", x: 0, y: 3 },
    { text: "C", x: 1, y: 2 },
    { text: "D", x: 5, y: 1 },
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
        <FloatingButton
          onPress={() => gridStore.addCell({ text: "test", y: 5, x: 5 })}
        />
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}

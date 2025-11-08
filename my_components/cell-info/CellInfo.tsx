import { Spacing, Typography } from "@/constants";
import { useCellData, useThemeColor } from "@/my_hooks";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export const CellInfo: React.FC<{ cellId: number }> = ({
  cellId,
}) => {
  const backgroundColor = useThemeColor({}, "surface");
  const borderColor = useThemeColor({}, "border");
  const textColor = useThemeColor({}, "text");

  const { cell } = useCellData(cellId);

  if (!cell) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.indicator, { backgroundColor, borderColor }]}>
        <Text style={[styles.text, { color: textColor }]} numberOfLines={1}>
          {cell.text || `Cell ${cellId}`}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 70,
    left: 0,
    right: 0,
    alignItems: "center",
    pointerEvents: "none", // Allow touches to pass through
  },
  indicator: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    maxWidth: "80%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  text: {
    ...Typography.body,
    fontWeight: "600",
    textAlign: "center",
  },
});

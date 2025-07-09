import { useThemeColor } from "@/hooks/useThemeColor";
import { useCellData } from "@/my_hooks";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export const BottomProgressBar: React.FC<{ cellId: number }> = ({ cellId }) => {
  const { cell, taskProgress } = useCellData(cellId);
  const backgroundColor = useThemeColor(
    { light: "#f8f9fa", dark: "#1a1a1a" },
    "background"
  );
  const borderColor = useThemeColor(
    { light: "#e9ecef", dark: "#333" },
    "background"
  );
  const textColor = useThemeColor({ light: "#333", dark: "#fff" }, "text");
  const progressColor = useThemeColor(
    { light: "#4CAF50", dark: "#4CAF50" },
    "tint"
  );
  const progressBgColor = useThemeColor(
    { light: "#e0e0e0", dark: "#333" },
    "background"
  );

  if (!cell) {
    return null;
  }

  const { completed, total } = taskProgress;
  const percentage = total === 0 ? 0 : (completed / total) * 100;

  return (
    <View style={[styles.container, { backgroundColor, borderColor }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
          {cell.text || `Cell ${cellId}`}
        </Text>
        <View style={styles.progressSection}>
          <View
            style={[styles.progressBar, { backgroundColor: progressBgColor }]}
          >
            <View
              style={[
                styles.progressFill,
                { width: `${percentage}%`, backgroundColor: progressColor },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: textColor }]}>
            {completed}/{total}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 60,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
    marginRight: 12,
  },
  progressSection: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 120,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginRight: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "500",
    minWidth: 35,
    textAlign: "right",
  },
});

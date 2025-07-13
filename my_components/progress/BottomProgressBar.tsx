import { useThemeColor, useCellData } from "@/my_hooks";
import { Spacing, Typography, CommonStyles } from "@/constants";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export const BottomProgressBar: React.FC<{ cellId: number }> = ({ cellId }) => {
  const { cell, taskProgress } = useCellData(cellId);
  const backgroundColor = useThemeColor({}, "backgroundSecondary");
  const borderColor = useThemeColor({}, "border");
  const textColor = useThemeColor({}, "text");
  const progressColor = useThemeColor({}, "success");
  const progressBgColor = useThemeColor({}, "backgroundTertiary");

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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 60,
  },
  content: {
    ...CommonStyles.rowBetween,
  },
  title: {
    ...Typography.body,
    fontWeight: "600",
    flex: 1,
    marginRight: Spacing.md,
  },
  progressSection: {
    ...CommonStyles.row,
    minWidth: 120,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginRight: Spacing.sm,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    ...Typography.caption,
    fontWeight: "500",
    minWidth: 35,
    textAlign: "right",
  },
});

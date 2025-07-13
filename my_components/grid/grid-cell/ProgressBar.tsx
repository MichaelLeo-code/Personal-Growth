import { totalCompletedCost, totalCost } from "@/service";
import { StyleSheet, Text, View } from "react-native";
import { useThemeColors } from "@/my_hooks";
import { Spacing } from "@/constants";

export const ProgressBar: React.FC<{
  cellId: number;
  textPosition?: "right" | "bottom";
}> = ({ cellId, textPosition = "right" }) => {
  const total = totalCost(cellId);
  const completed = totalCompletedCost(cellId);
  const percentage = total === 0 ? 0 : (completed / total) * 100;
  const isColumn = textPosition === "bottom";
  const colors = useThemeColors();

  return (
    <View
      style={[
        styles.progressContainer,
        isColumn && styles.progressContainerColumn,
      ]}
    >
      <View style={[
        styles.progressBar, 
        { backgroundColor: colors.backgroundTertiary },
        isColumn && styles.progressBarColumn
      ]}>
        <View style={[
          styles.progressFill, 
          { width: `${percentage}%`, backgroundColor: colors.success }
        ]} />
      </View>
      <Text
        style={[
          styles.progressText, 
          { color: colors.textMuted },
          isColumn && styles.progressTextBottom
        ]}
      >
        {completed}/{total}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  progressContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.sm / 2,
    gap: Spacing.sm / 2,
  },
  progressContainerColumn: {
    flexDirection: "column",
    gap: Spacing.xs - 1,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarColumn: {
    width: "100%",
  },
  progressFill: {
    height: "100%",
  },
  progressText: {
    fontSize: 8,
    minWidth: 30,
    textAlign: "right",
  },
  progressTextBottom: {
    textAlign: "center",
  },
});

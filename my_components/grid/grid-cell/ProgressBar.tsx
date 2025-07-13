import { totalCompletedCost, totalCost } from "@/service";
import { StyleSheet, Text, View } from "react-native";

export const ProgressBar: React.FC<{
  cellId: number;
  textPosition?: "right" | "bottom";
}> = ({ cellId, textPosition = "right" }) => {
  const total = totalCost(cellId);
  const completed = totalCompletedCost(cellId);
  const percentage = total === 0 ? 0 : (completed / total) * 100;
  const isColumn = textPosition === "bottom";

  return (
    <View
      style={[
        styles.progressContainer,
        isColumn && styles.progressContainerColumn,
      ]}
    >
      <View style={[styles.progressBar, isColumn && styles.progressBarColumn]}>
        <View style={[styles.progressFill, { width: `${percentage}%` }]} />
      </View>
      <Text
        style={[styles.progressText, isColumn && styles.progressTextBottom]}
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
    marginTop: 6,
    gap: 6,
  },
  progressContainerColumn: {
    flexDirection: "column",
    gap: 3,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#333",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarColumn: {
    width: "100%",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
  },
  progressText: {
    color: "#888",
    fontSize: 8,
    minWidth: 30,
    textAlign: "right",
  },
  progressTextBottom: {
    textAlign: "center",
  },
});

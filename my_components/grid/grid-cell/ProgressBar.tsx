import { StyleSheet, Text, View } from "react-native";
import { CellType } from "../../../types/cells";

export const ProgressBar: React.FC<{
  completed: number;
  total: number;
  cellType?: CellType;
  textPosition?: "right" | "bottom";
}> = ({
  completed,
  total,
  cellType = CellType.Tasklist,
  textPosition = "right",
}) => {
  const percentage = total === 0 ? 0 : (completed / total) * 100;
  const isHeadline = cellType === CellType.Headline;

  if (textPosition === "bottom") {
    return (
      <View
        style={[
          styles.progressContainerColumn,
          isHeadline && styles.progressContainerCompact,
        ]}
      >
        <View
          style={[
            styles.progressBarColumn,
            isHeadline && styles.progressBarCompact,
          ]}
        >
          <View style={[styles.progressFill, { width: `${percentage}%` }]} />
        </View>
        <Text
          style={[
            styles.progressTextBottom,
            isHeadline && styles.progressTextCompact,
          ]}
        >
          {completed}/{total}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.progressContainer,
        isHeadline && styles.progressContainerCompact,
      ]}
    >
      <View
        style={[styles.progressBar, isHeadline && styles.progressBarCompact]}
      >
        <View style={[styles.progressFill, { width: `${percentage}%` }]} />
      </View>
      <Text
        style={[styles.progressText, isHeadline && styles.progressTextCompact]}
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
    marginTop: 8,
    gap: 8,
  },
  progressContainerColumn: {
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    marginTop: 8,
    gap: 4,
  },
  progressContainerCompact: {
    marginTop: 4,
    gap: 4,
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
    height: 4,
    backgroundColor: "#333",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarCompact: {
    height: 3,
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
    color: "#888",
    fontSize: 8,
    textAlign: "center",
  },
  progressTextCompact: {
    fontSize: 6,
    minWidth: 20,
  },
});

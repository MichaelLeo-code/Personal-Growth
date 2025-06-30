import { StyleSheet, Text, View } from "react-native";

export const ProgressBar: React.FC<{ completed: number; total: number }> = ({
  completed,
  total,
}) => {
  const percentage = total === 0 ? 0 : (completed / total) * 100;
  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${percentage}%` }]} />
      </View>
      <Text style={styles.progressText}>
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
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#333",
    borderRadius: 2,
    overflow: "hidden",
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
});

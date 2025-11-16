import { BorderRadius, Spacing, Typography } from "@/constants";
import { useThemeColor } from "@/my_hooks";
import { cellService, minutesService } from "@/service";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

interface MinutesBarGraphProps {
  cellId: number;
  maxBars?: number;
}

interface BarData {
  dateKey: string;
  minutes: number;
  date: Date;
  displayDate: string;
  heightPercent: number;
}

export const MinutesBarGraph: React.FC<MinutesBarGraphProps> = ({
  cellId,
  maxBars = 30,
}) => {
  const backgroundColor = useThemeColor({}, "surface");
  const borderColor = useThemeColor({}, "border");
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "tint");

  const [barData, setBarData] = useState<BarData[]>([]);

  useEffect(() => {
    const calculateBarData = () => {
      const entriesByDate = minutesService.getEntriesByDate(cellId);
      
      const sortedEntries = Object.entries(entriesByDate)
        .map(([dateKey, minutes]) => {
          const [year, month, day] = dateKey.split("-").map(Number);
          return {
            dateKey,
            minutes,
            date: new Date(year, month - 1, day),
            displayDate: `${month}/${day}`,
          };
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(-maxBars); // Take only the last N bars

      // Find max minutes for scaling
      const maxMinutes = Math.max(...sortedEntries.map((e) => e.minutes), 1);

      const data = sortedEntries.map((entry) => ({
        ...entry,
        heightPercent: (entry.minutes / maxMinutes) * 100,
      }));

      setBarData(data);
    };

    calculateBarData();
    
    const unsubscribe = cellService.subscribe(() => {
      calculateBarData();
    });

    return () => {
      unsubscribe();
    };
  }, [cellId, maxBars]);

  if (barData.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor, borderColor }]}>
        <Text style={[styles.emptyText, { color: textColor }]}>
          No data available
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor, borderColor }]}>
      <Text style={[styles.title, { color: textColor }]}>
        Minutes per Day
      </Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
      >
        {barData.map((bar, index) => (
          <View key={bar.dateKey} style={styles.barContainer}>
            <View style={styles.barWrapper}>
              <Text style={[styles.minutesLabel, { color: textColor }]}>
                {bar.minutes}
              </Text>
              <View
                style={[
                  styles.bar,
                  {
                    height: `${bar.heightPercent}%`,
                    backgroundColor: primaryColor,
                  },
                ]}
              />
            </View>
            <Text style={[styles.dateLabel, { color: textColor }]}>
              {bar.displayDate}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const BAR_HEIGHT = 150;
const BAR_WIDTH = 40;

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.lg,
    marginVertical: Spacing.md,
  },
  title: {
    ...Typography.title,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  scrollContent: {
    paddingVertical: Spacing.sm,
    alignItems: "flex-end",
  },
  barContainer: {
    alignItems: "center",
    marginHorizontal: Spacing.xs,
  },
  barWrapper: {
    height: BAR_HEIGHT,
    width: BAR_WIDTH,
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  bar: {
    width: BAR_WIDTH,
    borderTopLeftRadius: BorderRadius.sm,
    borderTopRightRadius: BorderRadius.sm,
    minHeight: 2,
  },
  minutesLabel: {
    ...Typography.caption,
    fontSize: 10,
    marginBottom: Spacing.xs,
    fontWeight: "600",
  },
  dateLabel: {
    ...Typography.caption,
    fontSize: 10,
    textAlign: "center",
  },
  emptyText: {
    ...Typography.body,
    textAlign: "center",
    fontStyle: "italic",
  },
});

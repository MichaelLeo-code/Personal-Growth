import { Spacing, Typography } from "@/constants";
import { useThemeColor } from "@/my_hooks";
import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { FlatList, PanResponder, StyleSheet, Text, View } from "react-native";

const TIME_OPTIONS = [60, 45, 30, 20, 15, 10, 5];

interface TimerButtonProps {
  onTimeSelected?: (minutes: number) => void;
}

export const TimerButton: React.FC<TimerButtonProps> = ({ onTimeSelected }) => {
  const backgroundColor = useThemeColor({}, "surface");
  const borderColor = useThemeColor({}, "border");
  const textColor = useThemeColor({}, "text");

  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(5);
  const currentSelection = useRef<number | null>(null);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => {
        return true;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy < 0) {
          const dragDistance = Math.abs(gestureState.dy);
          
          if (dragDistance > 10) {
            setIsExpanded(true);
            const optionCount = TIME_OPTIONS.length;
            const step = 55;
            let index = Math.floor((dragDistance - 10) / step);
            if (index >= optionCount) index = optionCount - 1;
            const newSelection = TIME_OPTIONS[optionCount - 1 - index];
            currentSelection.current = newSelection;
            setSelectedOption(newSelection);
          }
        } else {
          currentSelection.current = null;
          setSelectedOption(null);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const selected = currentSelection.current;
        if (selected !== null && gestureState.dy < 0) {
          onTimeSelected?.(selected);
        }
        setIsExpanded(false);
        setSelectedOption(null);
        currentSelection.current = null;
      }
    })
  ).current;

  return (
    <View 
      style={styles.timeButtonContainer} 
      {...panResponder.panHandlers}
      // collapsable={false}
      // onPress={() => setIsExpanded(true)}
    >
      {isExpanded && (
        <View style={[styles.optionsContainer, { backgroundColor, borderColor }]}>
          <FlatList
            data={TIME_OPTIONS}
            keyExtractor={(item) => item.toString()}
            renderItem={({ item: minutes, index }) => {
              const isSelected = selectedOption === minutes;
              const isLast = index === TIME_OPTIONS.length - 1;
              return (
                <View
                  style={[
                    styles.timeOption,
                    isLast && styles.timeOptionLast,
                  ]}
                  // onPress={() => onTimeSelected?.(minutes)}
                >
                  {isSelected && (
                    <View style={[
                      styles.highlightRectangle,
                      { borderColor: textColor }
                    ]} />
                  )}
                  <Text style={[
                    styles.optionText,
                    { color: textColor },
                    isSelected && styles.selectedOptionText
                  ]}>
                    {minutes}
                  </Text>
                </View>
              );
            }}
            ListFooterComponent={
              <View style={[styles.divider, { backgroundColor: borderColor }]} />
            }
            scrollEnabled={false}
          />
        </View>
      )}
      <View 
        style={[
          styles.extendedButton,
          { backgroundColor, borderColor },
          isExpanded && styles.extendedButtonExpanded,
        ]}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="time-outline" size={24} color={textColor} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  timeButtonContainer: {
    position: "relative",
    alignItems: "center",
    width: 48,
    height: 48,
  },
  extendedButton: {
    position: "absolute",
    bottom: 0,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  extendedButtonExpanded: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderTopWidth: 0,
  },
  optionsContainer: {
    position: "absolute",
    bottom: 47,
    width: 48,
    alignItems: "center",
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  timeOption: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  timeOptionLast: {
    marginBottom: Spacing.xs,
  },
  highlightRectangle: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 2,
  },
  optionText: {
    ...Typography.body,
    fontWeight: "700",
    fontSize: 16,
  },
  selectedOptionText: {
    fontWeight: "900",
    fontSize: 20,
  },
  divider: {
    width: 32,
    height: 1,
    marginVertical: Spacing.xs,
  },
  iconContainer: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
});

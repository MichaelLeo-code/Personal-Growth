import { Spacing, Typography } from "@/constants";
import { useCellData, useThemeColor } from "@/my_hooks";
import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { PanResponder, StyleSheet, Text, View } from "react-native";

const TIME_OPTIONS = [5, 10, 15];

export const CellInfo: React.FC<{ cellId: number }> = ({
  cellId,
}) => {
  const backgroundColor = useThemeColor({}, "surface");
  const borderColor = useThemeColor({}, "border");
  const textColor = useThemeColor({}, "text");

  const { cell } = useCellData(cellId);
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const currentSelection = useRef<number | null>(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        console.log('onStartShouldSetPanResponder called');
        return true;
      },
      onStartShouldSetPanResponderCapture: () => {
        console.log('onStartShouldSetPanResponderCapture called');
        return true;
      },
      onMoveShouldSetPanResponder: () => {
        console.log('onMoveShouldSetPanResponder called');
        return true;
      },
      onMoveShouldSetPanResponderCapture: () => {
        console.log('onMoveShouldSetPanResponderCapture called');
        return true;
      },
      onPanResponderGrant: () => {
        console.log('Touch GRANTED on time button');
      },
      onPanResponderReject: () => {
        console.log('Touch REJECTED - another responder took it');
      },
      onPanResponderMove: (_, gestureState) => {
        console.log('onPanResponderMove called', { dy: gestureState.dy });
        if (gestureState.dy < 0) {
          // Only respond to upward drag
          const dragDistance = Math.abs(gestureState.dy);
          
          if (dragDistance > 10) {
            if (!isExpanded) {
              console.log('Expanding menu');
              setIsExpanded(true);
            }
            
            // Calculate which option is highlighted based on drag distance
            // Options are displayed top to bottom: 5, 10, 15
            // Closest drag (just opened) = 15, middle = 10, furthest = 5
            let newSelection: number | null = null;
            if (dragDistance < 75) {
              newSelection = TIME_OPTIONS[2]; // 15 (closest to button)
            } else if (dragDistance < 130) {
              newSelection = TIME_OPTIONS[1]; // 10 (middle)
            } else {
              newSelection = TIME_OPTIONS[0]; // 5 (top, furthest)
            }
            console.log('Selected option:', newSelection);
            currentSelection.current = newSelection;
            setSelectedOption(newSelection);
          }
        } else if (gestureState.dy > 10) {
          // Dragging down significantly, reset
          console.log('Dragging down, resetting');
          if (isExpanded) {
            setIsExpanded(false);
          }
          currentSelection.current = null;
          setSelectedOption(null);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const dragDistance = Math.abs(gestureState.dy);
        const selected = currentSelection.current;
        console.log('Release detected:', { selected, dragDistance, dy: gestureState.dy });
        if (selected !== null && dragDistance > 10 && gestureState.dy < 0) {
          console.log(`Selected ${selected} minutes for cell:`, cellId);
          // TODO: Implement time tracking functionality
        }
        setIsExpanded(false);
        setSelectedOption(null);
        currentSelection.current = null;
      },
      onPanResponderTerminate: () => {
        console.log('Touch terminated');
        setIsExpanded(false);
        setSelectedOption(null);
        currentSelection.current = null;
      },
      onShouldBlockNativeResponder: () => true,
    })
  ).current;

  if (!cell) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <View style={[styles.indicator, { backgroundColor, borderColor }]} pointerEvents="none">
          <Text style={[styles.text, { color: textColor }]} numberOfLines={1}>
            {cell.text || `Cell ${cellId}`}
          </Text>
        </View>
        <View 
          style={styles.timeButtonContainer} 
          {...panResponder.panHandlers}
          collapsable={false}
        >
          {isExpanded && (
            <View style={[styles.optionsContainer, { backgroundColor, borderColor }]}>
              {TIME_OPTIONS.map((minutes, index) => {
                const isSelected = selectedOption === minutes;
                const isLast = index === TIME_OPTIONS.length - 1;
                return (
                  <View
                    key={minutes}
                    style={[
                      styles.timeOption,
                      isLast && styles.timeOptionLast,
                    ]}
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
              })}
              <View style={[styles.divider, { backgroundColor: borderColor }]} />
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
    zIndex: 1000,
    elevation: 1000,
  },
  contentWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    zIndex: 1001,
    elevation: 1001,
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
  text: {
    ...Typography.body,
    fontWeight: "600",
    textAlign: "center",
  },
});

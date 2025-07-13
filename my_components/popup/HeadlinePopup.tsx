import { cellService } from "@/service";
import { HeadlineCell } from "@/types/cells";
import { useThemeColors } from "@/my_hooks";
import { Spacing, Typography, BorderRadius, CommonStyles } from "@/constants";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Popup, PopupProps } from "./Popup";

type HeadlinePopupProps = Omit<PopupProps, "children"> & {
  cell: HeadlineCell;
};

export const HeadlinePopup: React.FC<HeadlinePopupProps> = ({
  cell,
  isVisible,
  hidePopup,
}) => {
  const colors = useThemeColors();
  
  return (
    <Popup
      isVisible={isVisible}
      hidePopup={hidePopup}
      title={cell.text}
      onTitleChange={(newTitle) => cellService.renameCell(cell.id, newTitle)}
    >
      <View style={styles.buttonContainer}>
        <Pressable 
          style={[styles.button, { backgroundColor: colors.surfaceSecondary }]} 
          onPress={hidePopup}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
        </Pressable>
      </View>
    </Popup>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: Spacing.sm,
  },
  button: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  buttonText: {
    ...Typography.body,
    textAlign: "center",
  },
});

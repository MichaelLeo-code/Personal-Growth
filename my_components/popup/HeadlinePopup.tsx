import { HeadlineCell } from "@/types/cells";
import { StyleSheet } from "react-native";
import { Popup, PopupProps } from "./Popup";

type HeadlinePopupProps = Omit<PopupProps, "children"> & {
  cell: HeadlineCell;
};

export const HeadlinePopup: React.FC<HeadlinePopupProps> = ({
  cell,
  isVisible,
  hidePopup,
}) => {
  return (
    <Popup
      isVisible={isVisible}
      hidePopup={hidePopup}
      title={cell.text}
      showCloseButton={true}
    ></Popup>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  button: {
    backgroundColor: "#444",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
});

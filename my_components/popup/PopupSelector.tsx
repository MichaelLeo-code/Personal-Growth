import { Cell, CellType, HeadlineCell, TaskListCell } from "@/types/cells";
import { HeadlinePopup } from "./HeadlinePopup";
import { TaskPopup } from "./TaskPopup";

type PopupSelectorProps = {
  cell: Cell;
  isVisible: boolean;
  hidePopup: () => void;
};

export const PopupSelector: React.FC<PopupSelectorProps> = ({
  cell,
  isVisible,
  hidePopup,
}) => {
  switch (cell.type) {
    case CellType.Tasklist:
      return (
        <TaskPopup
          cell={cell as TaskListCell}
          isVisible={isVisible}
          hidePopup={hidePopup}
        />
      );
    case CellType.Headline:
      return (
        <HeadlinePopup
          cell={cell as HeadlineCell}
          isVisible={isVisible}
          hidePopup={hidePopup}
        />
      );
    default:
      return null;
  }
};

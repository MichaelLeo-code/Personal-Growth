import { useCallback, useRef } from "react";
import { GestureResponderEvent } from "react-native";

interface UseGridTouchProps {
  onCellMove?: (event: GestureResponderEvent) => void;
  onCellMoveEnd?: (event: GestureResponderEvent) => void;
  onBackgroundPress?: () => void;
  isDragging: React.MutableRefObject<boolean>;
  cellWasPressed: React.MutableRefObject<boolean>;
}

export const useGridTouch = ({
  onCellMove,
  onCellMoveEnd,
  onBackgroundPress,
  isDragging,
  cellWasPressed,
}: UseGridTouchProps) => {
  const hasMoved = useRef(false);

  const handleTouchStart = useCallback((event: GestureResponderEvent) => {
    cellWasPressed.current = false;
    hasMoved.current = false;
    return {
      x: event.nativeEvent.pageX,
      y: event.nativeEvent.pageY,
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTouchMove = useCallback((event: GestureResponderEvent) => {
    hasMoved.current = true;
    if (isDragging.current && onCellMove) {
      onCellMove(event);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onCellMove]);

  const handleTouchEnd = useCallback((event: GestureResponderEvent) => {
    if (isDragging.current && onCellMoveEnd) {
      onCellMoveEnd(event);
      isDragging.current = false;
    } else if (!cellWasPressed.current && !hasMoved.current && onBackgroundPress) {
      onBackgroundPress();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onCellMoveEnd, onBackgroundPress]);

  const markCellPressed = useCallback(() => {
    cellWasPressed.current = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setDragging = useCallback((value: boolean) => {
    isDragging.current = value;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    markCellPressed,
    setDragging,
  };
};

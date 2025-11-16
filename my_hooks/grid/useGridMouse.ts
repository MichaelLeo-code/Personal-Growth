import { useCallback, useEffect, useRef } from "react";
import { GestureResponderEvent, Platform } from "react-native";

interface UseGridMouseProps {
  onCellMove?: (event: GestureResponderEvent) => void;
  onCellMoveEnd?: (event: GestureResponderEvent) => void;
  onBackgroundPress?: () => void;
  isDragging: React.MutableRefObject<boolean>;
  cellWasPressed: React.MutableRefObject<boolean>;
}

export const useGridMouse = ({
  onCellMove,
  onCellMoveEnd,
  onBackgroundPress,
  isDragging,
  cellWasPressed,
}: UseGridMouseProps) => {
  const hasMoved = useRef(false);
  const mouseDownPos = useRef<{ x: number; y: number } | null>(null);

  const handleMouseMove = useCallback((event: any) => {
    if (Platform.OS === 'web' && isDragging.current && onCellMove) {
      const syntheticEvent = {
        nativeEvent: {
          pageX: event.clientX,
          pageY: event.clientY,
        },
      } as GestureResponderEvent;
      onCellMove(syntheticEvent);
    }
  }, [onCellMove, isDragging]);

  const handleMouseUp = useCallback((event: any) => {
    if (Platform.OS === 'web' && isDragging.current && onCellMoveEnd) {
      const syntheticEvent = {
        nativeEvent: {
          pageX: event.clientX,
          pageY: event.clientY,
        },
      } as GestureResponderEvent;
      onCellMoveEnd(syntheticEvent);
      isDragging.current = false;
    }
  }, [onCellMoveEnd, isDragging]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const MOVE_THRESHOLD = 5; // pixels

      const handleContextMenu = (event: MouseEvent) => {
        if (isDragging.current) {
          event.preventDefault();
        }
      };

      const handleMouseDown = (event: MouseEvent) => {
        cellWasPressed.current = false;
        hasMoved.current = false;
        mouseDownPos.current = { x: event.clientX, y: event.clientY };
      };

      const handleMouseMoveGlobal = (event: MouseEvent) => {
        if (mouseDownPos.current) {
          const dx = Math.abs(event.clientX - mouseDownPos.current.x);
          const dy = Math.abs(event.clientY - mouseDownPos.current.y);
          if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) {
            hasMoved.current = true;
          }
        }
      };

      const handleClick = (event: MouseEvent) => {
        if (!cellWasPressed.current && !hasMoved.current && onBackgroundPress) {
          onBackgroundPress();
        }
        cellWasPressed.current = false;
        hasMoved.current = false;
        mouseDownPos.current = null;
      };

      document.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mousemove', handleMouseMoveGlobal);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('click', handleClick);
      document.addEventListener('contextmenu', handleContextMenu);
      
      return () => {
        document.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mousemove', handleMouseMoveGlobal);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('click', handleClick);
        document.removeEventListener('contextmenu', handleContextMenu);
      };
    }
  }, [handleMouseMove, handleMouseUp, onBackgroundPress, isDragging, cellWasPressed]);

  return {
    handleMouseMove,
    handleMouseUp,
  };
};

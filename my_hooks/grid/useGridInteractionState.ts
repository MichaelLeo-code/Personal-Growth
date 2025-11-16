import { useRef } from "react";

export const useGridInteractionState = () => {
  const isDragging = useRef(false);
  const cellWasPressed = useRef(false);

  return {
    isDragging,
    cellWasPressed,
  };
};

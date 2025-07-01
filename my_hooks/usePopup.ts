import { useCallback, useEffect, useState } from "react";
import { Cell } from "../types/cells";

export const usePopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [popupInstance, setPopupInstance] = useState<Cell | null>(null);

  // Clear popupInstance after popup animation completes
  useEffect(() => {
    if (!isVisible) {
      const timer = setTimeout(() => {
        setPopupInstance(null);
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const showPopup = useCallback(
    (cell: Cell) => {
      // If a popup is already open for a different cell, close it first
      if (popupInstance && popupInstance.id !== cell.id) {
        setPopupInstance(null);
      }
      setIsVisible(true);
      setPopupInstance(cell);
    },
    [popupInstance]
  );

  const hidePopup = useCallback(() => {
    setIsVisible(false);
    // Don't immediately set popupInstance to null - let the Modal animation complete
    // The popupInstance will be cleared when a new popup opens or component unmounts
  }, []);

  return {
    isVisible,
    popupInstance,
    showPopup,
    hidePopup,
  };
};

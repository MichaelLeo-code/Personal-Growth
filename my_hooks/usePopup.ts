import { useCallback, useState } from "react";

export const usePopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [content, setContent] = useState<React.ReactNode | null>(null);

  const showPopup = useCallback((content: React.ReactNode) => {
    setContent(content);
    setIsVisible(true);
  }, []);

  const hidePopup = useCallback(() => {
    setIsVisible(false);
    setContent(null);
  }, []);

  return {
    isVisible,
    content,
    showPopup,
    hidePopup,
  };
};

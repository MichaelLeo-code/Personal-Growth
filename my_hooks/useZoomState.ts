import { useState } from "react";

interface ZoomState {
  zoomLevel: number;
  offsetX: number;
  offsetY: number;
}

export const useZoomState = () => {
  const [zoomState, setZoomState] = useState<ZoomState>({
    zoomLevel: 1,
    offsetX: 0,
    offsetY: 0,
  });

  const handleTransform = (transform: ZoomState) => {
    setZoomState({
      zoomLevel: transform.zoomLevel,
      offsetX: transform.offsetX,
      offsetY: transform.offsetY,
    });
  };

  return {
    zoomState,
    handleTransform,
  };
};

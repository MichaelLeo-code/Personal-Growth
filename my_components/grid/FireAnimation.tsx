import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";

type FireAnimationProps = {
  cellX: number;
  cellY: number;
  cellSize: number;
  cellWidth: number;
  cellHeight: number;
};

export const FireAnimation: React.FC<FireAnimationProps> = ({
  cellX,
  cellY,
  cellSize,
  cellWidth,
  cellHeight,
}) => {
  const [pathDataRed, setPathDataRed] = useState("");
  const [pathDataOrange, setPathDataOrange] = useState("");
  const [pathDataYellow, setPathDataYellow] = useState("");
  const animationFrameRef = useRef<number | null>(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const padding = 0; // Space between cell and fire border
    const segments = 90; // Number of points for smooth distortion
    const distortionAmount = 6; // Maximum distortion in pixels
    const speed = 0.05; // Animation speed (much faster!)

    const generatePath = (
      timeOffset: number,
      frequencyMultiplier: number,
      amplitudeMultiplier: number
    ) => {
      const time = timeRef.current + timeOffset;
      const points: { x: number; y: number }[] = [];

      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const progress = i / segments;

        let x: number, y: number;

        if (progress < 0.25) {
          // Top edge
          x = (progress / 0.25) * cellWidth;
          y = 0;
        } else if (progress < 0.5) {
          // Right edge
          x = cellWidth;
          y = ((progress - 0.25) / 0.25) * cellHeight;
        } else if (progress < 0.75) {
          // Bottom edge
          x = cellWidth - ((progress - 0.5) / 0.25) * cellWidth;
          y = cellHeight;
        } else {
          // Left edge
          x = 0;
          y = cellHeight - ((progress - 0.75) / 0.25) * cellHeight;
        }

        // Apply unique distortion patterns for each layer
        const distortion1 = Math.sin(time) * distortionAmount;
        const distortion2 =
          Math.sin(time * 1.5 * frequencyMultiplier + angle * 5) *
          (distortionAmount * 0.5) *
          amplitudeMultiplier;
        const distortion3 =
          Math.sin(time * 2.3 * frequencyMultiplier + angle * 2) *
          (distortionAmount * 0.3) *
          amplitudeMultiplier;
        const totalDistortion = distortion1 + distortion2 + distortion3;

        // Apply distortion outward from center
        const centerX = cellWidth / 2;
        const centerY = cellHeight / 2;
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const normalizedDx = dx / distance;
        const normalizedDy = dy / distance;

        x += y * (padding + totalDistortion / 100);
        y += x * (padding + totalDistortion / 100);

        points.push({ x, y });
      }

      // Create smooth bezier curve path
      let path = `M ${points[0].x} ${points[0].y}`;

      for (let i = 0; i < points.length - 1; i++) {
        const current = points[i];
        const next = points[(i + 1) % points.length];

        // Calculate control points for smooth curve
        const cp1x = current.x + (next.x - current.x) * 0.5;
        const cp1y = current.y + (next.y - current.y) * 0.5;

        path += ` Q ${next.x} ${next.y}, ${cp1x} ${cp1y}`;
      }

      path += " Z";
      return path;
    };

    const animate = () => {
      timeRef.current += speed;

      setPathDataRed(generatePath(0, 0.8, 1.2));

      setPathDataOrange(generatePath(2, 1.0, 1.0));

      setPathDataYellow(generatePath(4, 1.3, 0.8));

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [cellWidth, cellHeight]);

  return (
    <View
      style={[
        styles.container,
        {
          left: cellX * cellSize - 15,
          top: cellY * cellSize - 15,
          width: cellWidth + 40,
          height: cellHeight + 40,
        },
      ]}
      pointerEvents="box-none"
    >
      <Svg
        width={cellWidth + 30}
        height={cellHeight + 30}
        viewBox={`0 0 ${cellWidth + 30} ${cellHeight + 30}`}
        pointerEvents="box-none"
      >
        <Path
          d={pathDataRed}
          fill="none"
          stroke="#FF0000"
          strokeWidth="8"
          transform={`translate(15, 15)`}
        />
        <Path
          d={pathDataOrange}
          fill="none"
          stroke="#FF6600"
          strokeWidth="5"
          transform={`translate(15, 15)`}
        />
        <Path
          d={pathDataYellow}
          fill="none"
          stroke="#FFFF00"
          strokeWidth="2"
          transform={`translate(15, 15)`}
        />{" "}
        <Path
          d={pathDataOrange}
          fill="none"
          stroke="#FF6600"
          strokeWidth="5"
          transform={`translate(15, 15)`}
        />
        <Path
          d={pathDataYellow}
          fill="none"
          stroke="#FFFF00"
          strokeWidth="2"
          transform={`translate(15, 15)`}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    pointerEvents: "none",
    zIndex: 1,
  },
});

import { RGB } from "../types/common.types";

export const convertToInt = (colorHex: string): RGB => {
  if (colorHex[0] === "#") colorHex = colorHex.slice(1);
  const R = colorHex.substring(0, 2);
  const G = colorHex.substring(2, 4);
  const B = colorHex.substring(4, 6);

  return [parseInt(R, 16), parseInt(G, 16), parseInt(B, 16)];
};

export const getColorAtPos = (
  position: number,
  colorHexs: string[]
): string => {
  const colorStops = colorHexs.map((hex, index) => ({
    hex,
    stop: index / (colorHexs.length - 1),
  }));

  let stopIndex = 0;
  while (
    stopIndex < colorStops.length &&
    colorStops[stopIndex + 1].stop < position
  ) {
    stopIndex++;
  }

  const startStop = colorStops[stopIndex].stop;
  const endStop = colorStops[stopIndex + 1].stop;
  const relativePosition = (position - startStop) / (endStop - startStop);

  const startColor = convertToInt(colorHexs[stopIndex]);
  const endColor = convertToInt(colorHexs[stopIndex + 1]);
  const startMultiplier = 1 - relativePosition;
  const endMultiplier = relativePosition;
  const finalRGB = [];
  for (let i = 0; i <= 2; i++) {
    finalRGB.push(
      startColor[i] * startMultiplier + endColor[i] * endMultiplier
    );
  }

  return `rgb(${finalRGB.join(",")})`;
};

export const drawPixel = (
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  x: number,
  y: number,
  color: string
) => {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 1, 1);
};

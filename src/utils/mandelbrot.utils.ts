import { MandelbrotSet, Resolution } from "../types/common.types";
import { drawPixel, getColorAtPos } from "./canvas.utils";

const COLORS = ["#000000", "#eb2832", "#5454ff"];

const PRELOADED_COLORS = Array(100)
  .fill(0)
  .map((_, index) => getColorAtPos(index / (100 - 1), COLORS));

export const mandelbrot = (
  xComplex: number,
  yComplex: number,
  maxInterations = 100
): [number, boolean] => {
  let iterations = 0;
  let a = 0;
  let b = 0;
  let d = 0;
  while (d <= 2 && iterations < maxInterations) {
    const aa = Math.pow(a, 2) - Math.pow(b, 2);
    const bb = 2 * a * b;

    a = aa + xComplex;
    b = bb + yComplex;

    d = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
    iterations++;
  }
  return [iterations, d <= 2];
};

export const drawMandelbrot = (
  set: MandelbrotSet,
  { width, height }: Resolution
) => {
  const offscreenCanvas = new OffscreenCanvas(width, height);
  const context = offscreenCanvas.getContext("2d");
  if (!context) return offscreenCanvas;

  console.time("drawMandelbrot");
  const { real, imaginary } = set;

  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      const xComplex = real.start + (i / width) * (real.end - real.start);
      const yComplex =
        imaginary.start + (j / height) * (imaginary.end - imaginary.start);

      const [interations, isMandelbrotSet] = mandelbrot(xComplex, yComplex);

      drawPixel(
        context,
        i,
        j,
        PRELOADED_COLORS[isMandelbrotSet ? 0 : interations]
      );
    }
  }
  console.timeEnd("drawMandelbrot");
  return offscreenCanvas;
};

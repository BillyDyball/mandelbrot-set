// https://codepen.io/chengarda/pen/wRxoyB
import { useEffect, useRef } from "react";
import Rhino from "./assets/rhino.png";

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const REAL_SET = { start: -2.5, end: 1 };
const IMAGINARY_SET = { start: -1.2, end: 1.2 };
const MAX_ITERATION = 80;
const cameraOffset = { x: WIDTH / 2, y: HEIGHT / 2 };
let cameraZoom = 1;
const MAX_ZOOM = 5;
const MIN_ZOOM = 0.1;
const SCROLL_SENSITIVITY = 0.0005;
const COLORS = ["#000000", "#eb2832", "#5454ff"];

type RGB = [number, number, number];

const convertToInt = (colorHex: string): RGB => {
  if (colorHex[0] === "#") colorHex = colorHex.slice(1);
  const R = colorHex.substring(0, 2);
  const G = colorHex.substring(2, 4);
  const B = colorHex.substring(4, 6);

  return [parseInt(R, 16), parseInt(G, 16), parseInt(B, 16)];
};

const getColorAtPos = (position: number, colorHexs: string[]): string => {
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

const mandelbrot = (xComplex: number, yComplex: number): [number, boolean] => {
  let a = 0;
  let b = 0;
  let iterations = 0;
  let d = 0;
  while (d <= 2 && iterations < MAX_ITERATION) {
    const aa = Math.pow(a, 2) - Math.pow(b, 2);
    const bb = 2 * a * b;

    a = aa + xComplex;
    b = bb + yComplex;

    d = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
    iterations++;
  }
  return [iterations, d <= 2];
};

const drawPixel = (
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  x: number,
  y: number,
  color: string
) => {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 1, 1);
};

const drawMandelbrot = () => {
  const temp = new OffscreenCanvas(WIDTH, HEIGHT);
  const context = temp.getContext("2d");
  if (!context) return temp;
  console.time("drawMandelbrot");
  for (let i = 0; i < WIDTH; i++) {
    for (let j = 0; j < HEIGHT; j++) {
      const xComplex =
        REAL_SET.start + (i / WIDTH) * (REAL_SET.end - REAL_SET.start);
      const yComplex =
        IMAGINARY_SET.start +
        (j / HEIGHT) * (IMAGINARY_SET.end - IMAGINARY_SET.start);

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
  return temp;
};

const PRELOADED_COLORS = Array(MAX_ITERATION)
  .fill(0)
  .map((_, index) => getColorAtPos(index / (MAX_ITERATION - 1), COLORS));

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const image = useRef<OffscreenCanvas>();
  const isDragging = useRef(false);
  const isSetDrawn = useRef(false);
  const dragStart = { x: 0, y: 0 };
  let initialPinchDistance: null | number = null;
  let lastZoom = cameraZoom;

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.canvas.width = WIDTH;
    ctx.canvas.height = HEIGHT;

    ctx.translate(WIDTH / 2, HEIGHT / 2);
    ctx.scale(cameraZoom, cameraZoom);
    ctx.translate(-WIDTH / 2 + cameraOffset.x, -HEIGHT / 2 + cameraOffset.y);

    if (image.current /* && !isSetDrawn.current */) {
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      const img = new Image();
      img.src = Rhino;

      ctx.drawImage(image.current, -WIDTH / 2, -HEIGHT / 2);

      isSetDrawn.current = true;
    }

    requestAnimationFrame(() => draw(ctx));
  };

  // Gets the relevant location from a mouse or single touch event
  const getEventLocation = (
    e: MouseEvent | TouchEvent
  ): { x: number; y: number } => {
    if ("clientX" in e) {
      return { x: e.clientX, y: e.clientY };
    } else if (e.touches.length > 1) {
      return { x: e.touches[0]?.clientX, y: e.touches[0].clientY };
    }
    return { x: 0, y: 0 };
  };

  const onPointerDown = (e: MouseEvent | TouchEvent) => {
    isDragging.current = true;
    dragStart.x = getEventLocation(e).x / cameraZoom - cameraOffset.x;
    dragStart.y = getEventLocation(e).y / cameraZoom - cameraOffset.y;
  };

  const onPointerUp = () => {
    isDragging.current = false;
    initialPinchDistance = null;
    lastZoom = cameraZoom;
  };

  const onPointerMove = (e: MouseEvent | TouchEvent) => {
    if (isDragging.current) {
      cameraOffset.x = getEventLocation(e).x / cameraZoom - dragStart.x;
      cameraOffset.y = getEventLocation(e).y / cameraZoom - dragStart.y;
    }
  };

  const handleTouch = (
    e: TouchEvent,
    singleTouchHandler: (e: TouchEvent) => void
  ) => {
    if (e.touches.length == 1) {
      singleTouchHandler(e);
    } else if (e.type == "touchmove" && e.touches.length == 2) {
      isDragging.current = false;
      handlePinch(e);
    }
  };

  const handlePinch = (e: TouchEvent) => {
    e.preventDefault();

    const touch1 = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    const touch2 = { x: e.touches[1].clientX, y: e.touches[1].clientY };

    // This is distance squared, but no need for an expensive sqrt as it's only used in ratio
    const currentDistance =
      (touch1.x - touch2.x) ** 2 + (touch1.y - touch2.y) ** 2;

    if (initialPinchDistance == null) {
      initialPinchDistance = currentDistance;
    } else {
      adjustZoom(null, currentDistance / initialPinchDistance);
    }
  };

  const adjustZoom = (zoomAmount: number | null, zoomFactor?: number) => {
    if (!isDragging.current) {
      if (zoomAmount) {
        cameraZoom += zoomAmount;
      } else if (zoomFactor) {
        cameraZoom = zoomFactor * lastZoom;
      }

      cameraZoom = Math.min(cameraZoom, MAX_ZOOM);
      cameraZoom = Math.max(cameraZoom, MIN_ZOOM);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const start = onPointerDown;
      const end = onPointerUp;
      const move = onPointerMove;
      const zoom = (e: WheelEvent) => adjustZoom(e.deltaY * SCROLL_SENSITIVITY);
      const touchStart = (e: TouchEvent) => handleTouch(e, onPointerDown);
      const touchEnd = (e: TouchEvent) => handleTouch(e, onPointerUp);
      const touchMove = (e: TouchEvent) => handleTouch(e, onPointerMove);

      canvas.addEventListener("mousedown", start);
      canvas.addEventListener("mouseup", end);
      canvas.addEventListener("mousemove", move);
      canvas.addEventListener("touchstart", touchStart);
      canvas.addEventListener("touchend", touchEnd);
      canvas.addEventListener("touchmove", touchMove);
      canvas.addEventListener("wheel", zoom);

      const context = canvas.getContext("2d");
      if (context) {
        context.canvas.width = WIDTH;
        context.canvas.height = HEIGHT;
        image.current = drawMandelbrot();
        draw(context);
      }

      return () => {
        canvas.removeEventListener("mousedown", start);
        canvas.removeEventListener("mouseup", end);
        canvas.removeEventListener("mousemove", move);
        canvas.removeEventListener("touchstart", touchStart);
        canvas.removeEventListener("touchend", touchEnd);
        canvas.removeEventListener("touchmove", touchMove);
        canvas.removeEventListener("wheel", zoom);
      };
    }
  }, [canvasRef]);

  return (
    <>
      <canvas ref={canvasRef} />
      <div style={{ position: "absolute", bottom: 0, width: "100%" }}>
        <input
          type="range"
          min={-10}
          max={10}
          onBlur={(e) => console.log(e.target.value)}
        />
        <div
          style={{
            width: "100%",
            height: 24,
            background: `linear-gradient(to right, ${Array(100)
              .fill(0)
              .map((_, i) => getColorAtPos(i / 100, COLORS))
              .join(",")})`,
          }}
        ></div>
      </div>
    </>
  );
}

export default App;

// https://codepen.io/chengarda/pen/wRxoyB
import { useEffect, useRef } from "react";
import ControlDialog from "./components/ControlDialog";
import { Resolution } from "./types/common.types";
import { drawPixel, getColorAtPos } from "./utils/canvas.utils";
import { mandelbrot } from "./utils/mandelbrot.utils";

interface MandelbrotSet {
  real: {
    start: number;
    end: number;
  };
  imaginary: {
    start: number;
    end: number;
  };
}

let cameraZoom = 1;
const MAX_ZOOM = 5;
const MIN_ZOOM = 0.1;
const SCROLL_SENSITIVITY = 0.0005;
const COLORS = ["#000000", "#eb2832", "#5454ff"];

const drawMandelbrot = (set: MandelbrotSet, { width, height }: Resolution) => {
  const temp = new OffscreenCanvas(width, height);
  const context = temp.getContext("2d");
  console.log("draw");
  if (!context) return temp;
  console.time("drawMandelbrot");

  const { real, imaginary } = set;
  console.log(real, imaginary);

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
  return temp;
};

const PRELOADED_COLORS = Array(100)
  .fill(0)
  .map((_, index) => getColorAtPos(index / (100 - 1), COLORS));

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const image = useRef<OffscreenCanvas>();
  const isDragging = useRef(false);
  const isSetDrawn = useRef(false);
  const resolution = useRef<{ width: number; height: number }>({
    width: 1280,
    height: 1024,
  });
  const defaultMandelbrotSet = useRef<MandelbrotSet>({
    real: { start: -2.5, end: 1 },
    imaginary: { start: -1.2, end: 1.2 },
  });
  const mandelbrotSet = useRef<MandelbrotSet>(defaultMandelbrotSet.current);
  let initialPinchDistance: null | number = null;
  let lastZoom = cameraZoom;

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
    const { x, y } = getEventLocation(e);
    const relativeX = x / window.innerWidth;
    const relativeY = y / window.innerHeight;
    // console.log(getEventLocation(e), relativeX, relativeY);

    // Zoom in by 10%
    const zoomMultiplier = 0.1;

    const { real, imaginary } = mandelbrotSet.current;

    const realZoom = Math.abs(real.start - real.end) * zoomMultiplier;
    const imaginaryZoom =
      Math.abs(imaginary.start - imaginary.end) * zoomMultiplier;

    mandelbrotSet.current = {
      real: {
        start: real.start + realZoom * (1 - relativeX),
        end: real.end - realZoom * relativeX,
      },
      imaginary: {
        start: imaginary.start + imaginaryZoom * (1 - relativeY),
        end: imaginary.end - imaginaryZoom * relativeY,
      },
    };
    image.current = drawMandelbrot(mandelbrotSet.current, resolution.current);
  };

  const onPointerUp = () => {
    isDragging.current = false;
    initialPinchDistance = null;
    lastZoom = cameraZoom;
  };

  const onPointerMove = (e: MouseEvent | TouchEvent) => {
    if (isDragging.current) {
      // cameraOffset.x = getEventLocation(e).x / cameraZoom - dragStart.x;
      // cameraOffset.y = getEventLocation(e).y / cameraZoom - dragStart.y;
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

  const resetSet = () => {
    mandelbrotSet.current = defaultMandelbrotSet.current;
    image.current = drawMandelbrot(mandelbrotSet.current, resolution.current);
  };

  const download = async () => {
    const canvas = image.current;
    if (!canvas) return;

    // Convert offscreen canvas to blob url
    const blob = await canvas.convertToBlob();
    const canvasImage = URL.createObjectURL(blob);

    // This can be used to download any image from webpage to local disk
    const xhr = new XMLHttpRequest();
    xhr.responseType = "blob";
    xhr.onload = function () {
      const a = document.createElement("a");
      a.href = window.URL.createObjectURL(xhr.response);
      a.download = "mandelbrotset.png";
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      a.remove();
    };
    // This is to download the canvas Image
    xhr.open("GET", canvasImage);
    xhr.send();
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    ctx.canvas.width = screenWidth;
    ctx.canvas.height = screenHeight;

    if (image.current) {
      ctx.clearRect(0, 0, screenWidth, screenHeight);
      const { width, height } = resolution.current;
      ctx.scale(screenWidth / width, screenHeight / height);
      ctx.drawImage(image.current, 0, 0);
      isSetDrawn.current = true;
    }

    requestAnimationFrame(() => draw(ctx));
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
        image.current = drawMandelbrot(
          mandelbrotSet.current,
          resolution.current
        );
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
      <ControlDialog />
      <div style={{ position: "absolute", top: 0, color: "white" }}>
        {`${resolution.current.width}x${resolution.current.height}`}
        <button onClick={resetSet}>reset</button>
        <button onClick={download}>download</button>
      </div>
    </>
  );
}

export default App;

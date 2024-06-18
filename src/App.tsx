// https://codepen.io/chengarda/pen/wRxoyB
import { useEffect, useRef } from "react";
import ControlDialog from "./components/ControlDialog";
import { ComplexSet, MandelbrotSet } from "./types/common.types";
import { drawMandelbrot } from "./utils/mandelbrot.utils";

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

  // Gets the relevant location from a mouse or single touch event
  const getEventLocation = (
    e: MouseEvent | TouchEvent
  ): { x: number; y: number } => {
    if ("clientX" in e) {
      return { x: e.clientX, y: e.clientY };
    } else if (e.touches.length > 1) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: 0, y: 0 };
  };

  const zoomSet = (
    set: ComplexSet,
    // 0 - 1, 0 = start remains the same, 1 = end remains the same
    rotation: number = 0.5,
    zoomMultiplier: number = 0.1
  ) => {
    // normalize set to start at 0
    const offset = -set.start;
    const normalize = { start: 0, end: set.end + offset };
    const zoomAmount = normalize.end * zoomMultiplier;
    normalize.start += zoomAmount * rotation;
    normalize.end -= zoomAmount * (1 - rotation);

    return {
      start: normalize.start - offset,
      end: normalize.end - offset,
    };
  };

  const onPointerDown = (e: MouseEvent | TouchEvent) => {
    isDragging.current = true;
    const { x, y } = getEventLocation(e);
    const relativeX = x / window.innerWidth;
    const relativeY = y / window.innerHeight;

    // Zoom in by 10%
    const zoomMultiplier = 0.25;

    const { real, imaginary } = mandelbrotSet.current;

    mandelbrotSet.current = {
      real: zoomSet(real, relativeX, zoomMultiplier),
      imaginary: zoomSet(imaginary, relativeY, zoomMultiplier),
    };
    image.current = drawMandelbrot(mandelbrotSet.current, resolution.current);
  };

  const onPointerUp = () => {
    isDragging.current = false;
  };

  const handleTouch = (
    e: TouchEvent,
    singleTouchHandler: (e: TouchEvent) => void
  ) => {
    if (e.touches.length == 1) {
      singleTouchHandler(e);
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
      const touchStart = (e: TouchEvent) => handleTouch(e, onPointerDown);
      const touchEnd = (e: TouchEvent) => handleTouch(e, onPointerUp);

      canvas.addEventListener("mousedown", start);
      canvas.addEventListener("mouseup", end);
      canvas.addEventListener("touchstart", touchStart);
      canvas.addEventListener("touchend", touchEnd);

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
        canvas.removeEventListener("touchstart", touchStart);
        canvas.removeEventListener("touchend", touchEnd);
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

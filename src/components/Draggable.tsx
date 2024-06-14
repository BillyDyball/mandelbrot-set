import {
  ComponentPropsWithoutRef,
  createRef,
  useCallback,
  useEffect,
  useState,
} from "react";

interface DragPosition {
  x: number;
  y: number;
}

interface DraggableProps extends ComponentPropsWithoutRef<"div"> {
  initialPos?: DragPosition;
}

const Draggable = ({
  initialPos = { x: 0, y: 0 },
  ...props
}: DraggableProps) => {
  const [pos, setPos] = useState<DragPosition>(initialPos);
  const [dragging, setDragging] = useState<boolean>(false);
  const [rel, setRel] = useState<DragPosition>(initialPos);
  const ref = createRef<HTMLDivElement>();

  // calculate relative position of the mouse and set dragging=true
  const onMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    console.log(e.button, ref);
    // only left mouse button
    if (e.button !== 0 || !ref.current) return;
    setDragging(true);
    setRel({
      x: e.pageX - ref.current.offsetLeft,
      y: e.pageY - ref.current.offsetTop,
    });
    e.stopPropagation();
    e.preventDefault();
  };

  const onMouseUp = (e: MouseEvent) => {
    setDragging(false);
    e.stopPropagation();
    e.preventDefault();
  };

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragging) return;
      setPos({
        x: e.pageX - rel.x,
        y: e.pageY - rel.y,
      });
      e.stopPropagation();
      e.preventDefault();
    },
    [dragging, rel.x, rel.y]
  );

  // we could get away with not having this (and just having the listeners on
  // our div), but then the experience would be possibly be janky. If there's
  // anything w/ a higher z-index that gets in the way, then you're toast,
  // etc.
  useEffect(() => {
    if (dragging) {
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    } else {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }
  }, [dragging, onMouseMove]);

  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        left: pos.x + "px",
        top: pos.y + "px",
      }}
      ref={ref}
      {...props}
    />
  );
};

export default Draggable;

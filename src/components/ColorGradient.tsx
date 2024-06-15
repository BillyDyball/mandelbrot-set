import { useRef, useState } from "react";
import { ColorStop } from "../types/common.types";

interface ColorGradientProps {
  colors: ColorStop[];
}

function ColorGradient({ colors }: ColorGradientProps) {
  const [selected, setSelected] = useState<number>(0);

  const gradientRef = useRef<HTMLDivElement>(null);

  const getTranslate = (stop: number): number => {
    if (!gradientRef.current) return 0;
    return gradientRef.current.clientWidth * stop - stop * 32;
  };

  const handleColorAdd = () => {};

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={gradientRef}
        className="w-full h-3 rounded-xl relative cursor-copy"
        style={{
          background: `linear-gradient(to right, ${colors
            .map(({ hex, stop }) => `${hex} ${stop * 100}%`)
            .join(",")})`,
        }}
        onClick={handleColorAdd}
      >
        {colors.map(({ hex, stop }) => (
          <div
            className={`h-8 w-8 top-1/2 flex items-center justify-center absolute bg-gray-200 border hover:border-blue-400 cursor-pointer rounded-full`}
            style={{
              transform: `translate(${getTranslate(stop)}px, -50%)`,
            }}
          >
            <span
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: hex }}
            />
          </div>
        ))}
      </div>
      <div className="border border-gray-400 rounded-md overflow-hidden">
        <input type="text" />
        <input type="color" name="" id="" />
      </div>
    </div>
  );
}

export default ColorGradient;

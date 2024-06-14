import { ColorStop } from "../types/common.types";

interface ColorGradientProps {
  colors: ColorStop[];
}

function ColorGradient({ colors }: ColorGradientProps) {
  return (
    <div
      className="w-full h-8 rounded-xl relative"
      style={{
        background: `linear-gradient(to right, ${colors
          .map(({ hex, stop }) => `${hex} ${stop * 100}%`)
          .join(",")})`,
      }}
    >
      {colors.map(({ hex, stop }) => (
        <div
          className={`h-8 w-2 absolute bg-gray-500 border border-gray-200 hover:animate-pulse cursor-pointer`}
          style={{
            left: `${stop * 100}%`,
            transform: `translateX(-${stop * 100}%)`,
          }}
        >
          <div
            className="w-4 h-4 left-1/2 -translate-x-1/2 -top-6 absolute rounded-sm border border-gray-200"
            style={{ backgroundColor: hex }}
          />
        </div>
      ))}
    </div>
  );
}

export default ColorGradient;

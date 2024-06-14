import React, {
  Dispatch,
  SetStateAction,
  createContext,
  useState,
} from "react";
import { ColorStop, Resolution } from "../types/common.types";

interface ProviderCotnrolProps {
  children: React.ReactNode;
}

interface Controls {
  resolution: Resolution;
  zoom: number;
  colors: ColorStop[];
}

interface ContextControl {
  controls: Controls;
  setControls: Dispatch<SetStateAction<Controls>>;
}

const contextControlDefault: Controls = {
  resolution: { width: 1200, height: 1024 },
  zoom: 10,
  colors: [
    { hex: "#000000", stop: 0 },
    { hex: "#eb2832", stop: 0.5 },
    { hex: "#5454ff", stop: 1 },
  ],
};

export const ContextControl = createContext<ContextControl>({
  controls: contextControlDefault,
  setControls: () => {},
});

const ProviderControl = ({ children }: ProviderCotnrolProps) => {
  const [controls, setControls] = useState<Controls>(contextControlDefault);

  return (
    <ContextControl.Provider value={{ controls, setControls }}>
      {children}
    </ContextControl.Provider>
  );
};

export default ProviderControl;

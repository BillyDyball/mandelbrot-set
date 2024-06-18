export type RGB = [number, number, number];

export type Resolution = { width: number; height: number };

export interface ColorStop {
  hex: string;
  /** 0 - 1, 0.5 = 50% */
  stop: number;
}

export interface ComplexSet {
  start: number;
  end: number;
}

export interface MandelbrotSet {
  real: ComplexSet;
  imaginary: ComplexSet;
}

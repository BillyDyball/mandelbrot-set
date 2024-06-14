export const mandelbrot = (
  xComplex: number,
  yComplex: number
): [number, boolean] => {
  const maxInterations = 100;
  let a = 0;
  let b = 0;
  let iterations = 0;
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

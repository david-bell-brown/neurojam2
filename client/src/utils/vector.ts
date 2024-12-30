export const dreiVec = ({
  x = 0,
  y = 0,
  z = 0,
}: {
  x?: number;
  y?: number;
  z?: number;
}): [number, number, number] => {
  return [x, y, z];
};

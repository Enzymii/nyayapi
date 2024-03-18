import { MyDice } from './dice';

export const randomSample = <T>(arr: T[], m: number): T[] => {
  const n = arr.length;
  if (m >= n) {
    return arr;
  }
  for (let i = 0; i < m; ++i) {
    const j = MyDice(i, n - 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, m);
};

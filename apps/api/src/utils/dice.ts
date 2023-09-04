export const MyDice = (l: number, r: number): number => {
  return Math.floor(Math.random() * (r - l + 1)) + l;
};

export const MyDiceD = (r: number): number => {
  return MyDice(1, r);
};

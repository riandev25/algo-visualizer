export const getSquareColor = (row: number, col: number) => {
  if ((row + col) % 2 === 0) {
    return 'bg-amber-200';
  }

  return 'bg-amber-700';
};

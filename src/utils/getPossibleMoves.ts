import { GameState } from '../Game/Game';

export const getPossibleMoves = (row: number, col: number, G: GameState) => {
  if (G.emptyCells && G.emptyCells.length > 0) {
    for (const { row: cellRow, col: cellCol } of G.emptyCells) {
      if (row === cellRow && col === cellCol) {
        return 'selectedCell';
      }
    }
  }

  if (G.beginPossibleMoves && G.beginPossibleMoves.length > 0 && G.emptyCells === null) {
    for (const { row: cellRow, col: cellCol } of G.beginPossibleMoves) {
      if (row === cellRow && col === cellCol) {
        return 'shadow-xl shadow-yellow-100';
      }
    }
  }
};

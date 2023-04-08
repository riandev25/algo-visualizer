import { GameState } from '../Game/Game';

export const getPieceSelected = (row: number, col: number, G: GameState) => {
  if (
    G.selectedPiece !== null &&
    G.selectedPiece.row === row &&
    G.selectedPiece.col === col
  ) {
    const selectedPiece = 'shadow-xl shadow-yellow-100';
    return selectedPiece;
  }
};

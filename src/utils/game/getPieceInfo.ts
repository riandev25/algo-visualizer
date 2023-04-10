import { GameState } from '../../Game/Game';

type PieceInfo = {
  [key: string]: string;
  W: string;
  B: string;
  WK: string;
  BK: string;
};

export const getPieceInfo = (piece: string, row: number, col: number, G: GameState) => {
  const white = `${
    G.selectedPiece?.row === row && G.selectedPiece.col === col
      ? 'border-yellow-300'
      : 'border-red-900'
  } bg-red-600 border-2`;
  const black = `${
    G.selectedPiece?.row === row && G.selectedPiece.col === col
      ? 'border-yellow-300'
      : 'border-gray-900'
  } bg-gray-700 border-2`;
  const pieceInfo: PieceInfo = {
    W: white,
    B: black,
    WK: white,
    BK: black,
  };

  return pieceInfo[piece] || 'transparent';
};

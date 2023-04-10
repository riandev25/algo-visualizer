import { GameState } from '../../Game/Game';

export const promoteToKing = (G: GameState) => {
  // Check first row for white pieces to promote
  for (let i = 0; i < G.board[0].length; i++) {
    if (G.board[0][i] === 'W') {
      G.board[0][i] = 'WK';
    }
  }

  // Check last row for black pieces to promote
  for (let i = 0; i < G.board[7].length; i++) {
    if (G.board[7][i] === 'B') {
      G.board[7][i] = 'BK';
    }
  }

  return G.board;
};

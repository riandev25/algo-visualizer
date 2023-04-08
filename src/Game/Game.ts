// import { Game } from 'boardgame.io';
// import { INVALID_MOVE } from 'boardgame.io/core';

// export type TicTacToeState = {
//   cells: (string | null)[];
// };

// export const TicTacToe: Game<TicTacToeState> = {
//   name: 'TicTacToe',
//   setup: () => ({ cells: Array(9).fill(null) }),
//   turn: {
//     minMoves: 1,
//     maxMoves: 1,
//   },
//   moves: {
//     clickCell: ({ G, ctx }, id) => {
//       if (G.cells[id] !== null) {
//         return INVALID_MOVE;
//       }
//       G.cells[id] = ctx.currentPlayer;
//     },
//   },

//   endIf: ({ G, ctx }) => {
//     if (IsVictory(G.cells)) {
//       return { winner: ctx.currentPlayer };
//     }
//     if (IsDraw(G.cells)) {
//       return { draw: true };
//     }
//   },
//   ai: {
//     enumerate: (G) => {
//       const r = [];
//       for (let i = 0; i < 9; i++) {
//         if (G.cells[i] === null) {
//           r.push({ move: 'clickCell', args: [i] });
//         }
//       }
//       return r;
//     },
//   },
// };

// // Return true if `cells` is in a winning configuration.
// function IsVictory(cells: TicTacToeState['cells']) {
//   const positions = [
//     [0, 1, 2],
//     [3, 4, 5],
//     [6, 7, 8],
//     [0, 3, 6],
//     [1, 4, 7],
//     [2, 5, 8],
//     [0, 4, 8],
//     [2, 4, 6],
//   ];

//   return positions
//     .map((row) => {
//       const symbols = row.map((i) => cells[i]);
//       return symbols.every((i) => i !== null && i === symbols[0]);
//     })
//     .some((i) => i);
// }

// // Return true if all `cells` are occupied.
// function IsDraw(cells: TicTacToeState['cells']) {
//   return cells.filter((c) => c === null).length === 0;
// }

import { Game } from 'boardgame.io';
import { INVALID_MOVE } from 'boardgame.io/core';

export interface GameState {
  board: (string | null)[][];
  currentPlayer: number;
  selectedPiece: { row: number; col: number } | null;
  beginPossibleMoves:
    | {
        row: number;
        col: number;
      }[]
    | null;
  emptyCells:
    | {
        row: number;
        col: number;
      }[]
    | null;
  forcedMove: boolean;
}

// const isPathClear = (G: GameState, fromRow: number, fromCol: number) => {
//   const directions = [
//     [1, 1], // check diagonal down-right
//     [1, -1], // check diagonal down-left
//     [-1, 1], // check diagonal up-right
//     [-1, -1], // check diagonal up-left
//   ];

//   for (let i = 0; i < directions.length; i++) {
//     const [rowDirection, colDirection] = directions[i];
//     const row = fromRow + rowDirection;
//     const col = fromCol + colDirection;

//     if (
//       row >= 0 &&
//       row < G.board.length &&
//       col >= 0 &&
//       col < G.board[0].length &&
//       G.board[row][col] === null
//     ) {
//       // found an empty cell diagonally adjacent to the selected piece
//       return true;
//     }
//   }

//   // no empty cells found diagonally adjacent to the selected piece
//   return false;
// };

const isPathClear = (G: GameState, fromRow: number, fromCol: number) => {
  const directions = [
    [1, 1], // check diagonal down-right
    [1, -1], // check diagonal down-left
    [-1, 1], // check diagonal up-right
    [-1, -1], // check diagonal up-left
  ];

  const emptyDiagonalCells = [];

  for (let i = 0; i < directions.length; i++) {
    const [rowDirection, colDirection] = directions[i];
    const row = fromRow + rowDirection;
    const col = fromCol + colDirection;

    if (
      row >= 0 &&
      row < G.board.length &&
      col >= 0 &&
      col < G.board[0].length &&
      G.board[row][col] === null
    ) {
      // found an empty cell diagonally adjacent to the selected piece
      emptyDiagonalCells.push({ row, col });
    }
  }

  // return an array of empty diagonal cells, or an empty array if none were found
  return emptyDiagonalCells;
};

const getEmptyDiagonalCells = (G: GameState, currentPlayer: number) => {
  const piece = currentPlayer === 0 ? 'W' : 'B';
  const emptyDiagonalCells: { row: number; col: number }[] = [];
  G.board.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell === piece) {
        const directions = [
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1],
        ];
        directions.forEach(([rowDirection, colDirection]) => {
          const newRow = rowIndex + rowDirection;
          const newCol = colIndex + colDirection;
          if (
            newRow >= 0 &&
            newRow < G.board.length &&
            newCol >= 0 &&
            newCol < G.board[0].length &&
            G.board[newRow][newCol] === null
          ) {
            emptyDiagonalCells.push({ row: rowIndex, col: colIndex });
          }
        });
      }
    });
  });

  return emptyDiagonalCells;
};

export function isLegalMove(
  G: GameState,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
) {
  const piece = G.board[fromRow][fromCol];
  const opponent = G.currentPlayer === 0 ? 'B' : 'W';
  const isKing = (piece === 'W' && toRow === 0) || (piece === 'B' && toRow === 7);

  // Check if the move is a jump
  if (Math.abs(fromRow - toRow) === 2 && Math.abs(fromCol - toCol) === 2) {
    const jumpedRow = (fromRow + toRow) / 2;
    const jumpedCol = (fromCol + toCol) / 2;
    const jumpedPiece = G.board[jumpedRow][jumpedCol];
    return jumpedPiece === opponent && G.board[toRow][toCol] === null;
  }

  // Check if the move is a regular move
  if (Math.abs(fromRow - toRow) === 1 && Math.abs(fromCol - toCol) === 1) {
    return G.board[toRow][toCol] === null && (!isKing || toRow < fromRow);
  }

  return false;
}

export function getValidJumps(G: GameState, row: number, col: number) {
  const piece = G.board[row][col];
  const opponent = G.currentPlayer === 0 ? 'B' : 'W';
  const isKing = (piece === 'W' && row === 0) || (piece === 'B' && row === 7);
  const jumps = [];

  if (
    row >= 2 &&
    col >= 2 &&
    G.board[row - 1][col - 1] === opponent &&
    G.board[row - 2][col - 2] === null
  ) {
    jumps.push({ row: row - 2, col: col - 2 });
  }

  if (
    row >= 2 &&
    col <= 5 &&
    G.board[row - 1][col + 1] === opponent &&
    G.board[row - 2][col + 2] === null
  ) {
    jumps.push({ row: row - 2, col: col + 2 });
  }

  if (
    row <= 5 &&
    col >= 2 &&
    isKing &&
    G.board[row + 1][col - 1] === opponent &&
    G.board[row + 2][col - 2] === null
  ) {
    jumps.push({ row: row + 2, col: col - 2 });
  }

  if (
    row <= 5 &&
    col <= 5 &&
    isKing &&
    G.board[row + 1][col + 1] === opponent &&
    G.board[row + 2][col + 2] === null
  ) {
    jumps.push({ row: row + 2, col: col + 2 });
  }

  return jumps;
}

export const Dama: Game<GameState> = {
  name: 'Dama',
  setup: () => ({
    board: [
      [null, 'B', null, 'B', null, 'B', null, 'B'],
      ['B', null, 'B', null, 'B', null, 'B', null],
      [null, 'B', null, 'B', null, 'B', null, 'B'],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      ['W', null, 'W', null, 'W', null, 'W', null],
      [null, 'W', null, 'W', null, 'W', null, 'W'],
      ['W', null, 'W', null, 'W', null, 'W', null],
    ],
    currentPlayer: 0,
    selectedPiece: null,
    beginPossibleMoves: null,
    emptyCells: null,
    forcedMove: false,
    selected: null,
  }),
  turn: {
    minMoves: 2,
    onBegin: ({ G, ctx }) => {
      const beginPossibleMoves = getEmptyDiagonalCells(G, Number(ctx.currentPlayer));
      G.beginPossibleMoves = beginPossibleMoves;
    },
  },
  moves: {
    selectPiece: ({ G }, row, col) => {
      // Ensure that the selected piece belongs to the current player
      const piece = G.board[row][col];

      if (
        piece === null ||
        (piece === 'W' && G.currentPlayer !== 0) ||
        (piece === 'B' && G.currentPlayer !== 1)
      ) {
        return INVALID_MOVE;
      }

      // Check first if the direction of movement hasn't blocked
      const diagonalArray = isPathClear(G, row, col);
      const diagonalArrayCopy = [...diagonalArray];

      // Update the game state with the selected piece
      if (diagonalArrayCopy.length > 0) {
        G.selectedPiece = { row, col };
        G.emptyCells = diagonalArrayCopy;
      }
    },
    movePiece: ({ G }, row, col) => {
      // Ensure that a piece is selected and the move is legal
      if (
        G.selectedPiece === null ||
        !isLegalMove(G, G.selectedPiece.row, G.selectedPiece.col, row, col)
      ) {
        return G;
      }

      // Move the piece
      G.board[row][col] = G.board[G.selectedPiece.row][G.selectedPiece.col];
      G.board[G.selectedPiece.row][G.selectedPiece.col] = null;

      // Check for forced jumps
      const jumps = getValidJumps(G, row, col);
      if (jumps.length > 0) {
        G.forcedMove = true;
        G.selectedPiece = { row, col };
      } else {
        G.currentPlayer = (G.currentPlayer + 1) % 2;
        G.selectedPiece = null;
        G.forcedMove = false;
      }

      return G;
    },
  },
  endIf: ({ G, ctx }) => {
    // Check if one player has no pieces left
    let whitePieces = 0;
    let blackPieces = 0;
    for (let row = 0; row < G.board.length; row++) {
      for (let col = 0; col < G.board[row].length; col++) {
        const piece = G.board[row][col];
        if (piece === 'W') {
          whitePieces++;
        } else if (piece === 'B') {
          blackPieces++;
        }
      }
    }
    if (whitePieces === 0) {
      return { winner: 'B' };
    }

    if (blackPieces === 0) {
      return { winner: 'W' };
    }
  },
};

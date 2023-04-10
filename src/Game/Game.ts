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

import { promoteToKing } from '../utils/game/promoteToKing';

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

const isPathClear = (G: GameState, fromRow: number, fromCol: number) => {
  const emptyDiagonalCells: { row: number; col: number }[] = [];
  const opponent = G.currentPlayer === 0 ? 'B' : 'W';
  const player = G.currentPlayer; // assuming there are only 2 players

  // check forward diagonals based on the current player
  const forwardDirections =
    player === 0
      ? [
          [-1, 1],
          [-1, -1],
        ]
      : [
          [1, 1],
          [1, -1],
        ];

  forwardDirections.some(([rowDirection, colDirection]) => {
    const row = fromRow + rowDirection;
    const col = fromCol + colDirection;

    if (
      row >= 0 &&
      row < G.board.length &&
      col >= 0 &&
      col < G.board[0].length &&
      G.board[row][col] === opponent &&
      G.board[row + rowDirection][col + colDirection] === null
    ) {
      emptyDiagonalCells.push({ row: row + rowDirection, col: col + colDirection });
      return true;
    } else if (
      // G.forcedMove === false &&
      row >= 0 &&
      row < G.board.length &&
      col >= 0 &&
      col < G.board[0].length &&
      G.board[row][col] === null
    ) {
      // found an empty cell diagonally forward to the selected piece
      emptyDiagonalCells.push({ row, col });
      // return true; // stop iterating
    }
  });

  // return an array of empty diagonal cells, or an empty array if none were found
  return emptyDiagonalCells;
};

const getEmptyDiagonalCells = (G: GameState, currentPlayer: number) => {
  const piece = currentPlayer === 0 ? 'W' : 'B';
  const emptyDiagonalCells: { row: number; col: number }[] = [];

  G.board.some((row, rowIndex) => {
    return row.some((cell, colIndex) => {
      if (cell === piece) {
        // const directions = [
        //   [1, 1],
        //   [1, -1],
        //   [-1, 1],
        //   [-1, -1],
        // ];
        const forwardDirections =
          G.currentPlayer === 0
            ? [
                [-1, 1],
                [-1, -1],
              ]
            : [
                [1, 1],
                [1, -1],
              ];

        return forwardDirections.some(([rowDirection, colDirection]) => {
          const newRow = rowIndex + rowDirection;
          const newCol = colIndex + colDirection;
          const opponent = G.currentPlayer === 0 ? 'B' : 'W';

          if (
            newRow >= 0 &&
            newRow < G.board.length &&
            newCol >= 0 &&
            newCol < G.board[0].length &&
            G.board[newRow][newCol] === opponent && // Check if there's an opponent piece adjacent to the current player's piece
            G.board[newRow + rowDirection][newCol + colDirection] === null // Check if the current player's piece can jump over the adjacent opponent piece
          ) {
            emptyDiagonalCells.length = 0;

            emptyDiagonalCells.push({ row: rowIndex, col: colIndex });
            G.forcedMove = true;
            return true; // break out of directions.some() and end the loop
          } else if (
            newRow >= 0 &&
            newRow < G.board.length &&
            newCol >= 0 &&
            newCol < G.board[0].length &&
            G.board[newRow][newCol] === null
          ) {
            emptyDiagonalCells.push({ row: rowIndex, col: colIndex }); // There's no opponent piece adjacent to current player's piece and return all the possible moves
          }
          return false;
        });
      }
      return false;
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
  const isKing = piece === 'WK' || piece === 'BK';
  // const isKing = (piece === 'W' && toRow === 0) || (piece === 'B' && toRow === 7);

  // Check if the move is a jump
  if (Math.abs(fromRow - toRow) === 2 && Math.abs(fromCol - toCol) === 2) {
    const jumpedRow = (fromRow + toRow) / 2;
    const jumpedCol = (fromCol + toCol) / 2;
    const jumpedPiece = G.board[jumpedRow][jumpedCol];
    return jumpedPiece === opponent && G.board[toRow][toCol] === null;
  }

  // Check if the move is a regular move
  if (
    Math.abs(fromRow - toRow) === 1 &&
    Math.abs(fromCol - toCol) === 1
    // G.forcedMove === false
  ) {
    return G.board[toRow][toCol] === null && (!isKing || toRow < fromRow);
  }

  return false;
}

export function getValidJumps(G: GameState, row: number, col: number) {
  const piece = G.board[row][col];
  const opponent = G.currentPlayer === 0 ? 'B' : 'W';
  const isKing = (piece === 'W' && row === 0) || (piece === 'B' && row === 7);
  const jumps = [];

  // Check if the piece can jump to the upper-left
  if (
    row >= 2 && // Make sure the piece is not on the top row or second row
    col >= 2 && // Make sure the piece is not on the leftmost column or second column
    G.board[row - 1][col - 1] === opponent && // Check if there is an opponent piece to the upper-left
    G.board[row - 2][col - 2] === null // Check if the space to the upper-left is empty
  ) {
    // If all conditions are met, add the coordinates of the jump to the array of valid jumps
    jumps.push({ row: row - 2, col: col - 2 });
  }

  // Check if the piece can jump to the upper-right
  if (
    row >= 2 && // Make sure the piece is not on the top row or second row
    col <= 5 && // Make sure the piece is not on the rightmost column or second-to-right column
    G.board[row - 1][col + 1] === opponent && // Check if there is an opponent piece to the upper-right
    G.board[row - 2][col + 2] === null // Check if the space to the upper-right is empty
  ) {
    // If all conditions are met, add the coordinates of the jump to the array of valid jumps
    jumps.push({ row: row - 2, col: col + 2 });
  }

  // Check if the piece (which must be a king) can jump to the lower-left
  if (
    row <= 5 && // Make sure the piece is not on the second-to-bottom row or bottom row
    col >= 2 && // Make sure the piece is not on the leftmost column or second column
    isKing && // Make sure the piece is a king
    G.board[row + 1][col - 1] === opponent && // Check if there is an opponent piece to the lower-left
    G.board[row + 2][col - 2] === null // Check if the space to the lower-left is empty
  ) {
    // If all conditions are met, add the coordinates of the jump to the array of valid jumps
    jumps.push({ row: row + 2, col: col - 2 });
  }

  // Check if the piece (which must be a king) can jump to the lower-right
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

      // Check if there's a king piece
      const board = promoteToKing(G);
      G.board = board;
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
    // movePiece: ({ G, events }, row, col) => {
    //   // Ensure that a piece is selected and the move is legal

    //   if (
    //     G.selectedPiece === null ||
    //     !isLegalMove(G, G.selectedPiece.row, G.selectedPiece.col, row, col)
    //   ) {
    //     console.log('not');
    //     return G;
    //   }

    //   // Move the piece
    //   G.board[row][col] = G.board[G.selectedPiece.row][G.selectedPiece.col];
    //   if (G.forcedMove === true) {
    //     // Calculate the row and column indices of the in-between cell
    //     const inBetweenRow = Math.floor((G.selectedPiece.row + row) / 2);
    //     const inBetweenCol = Math.floor((G.selectedPiece.col + col) / 2);

    //     // Make the in-between cell null
    //     G.board[inBetweenRow][inBetweenCol] = null;
    //   }
    //   G.board[G.selectedPiece.row][G.selectedPiece.col] = null;

    //   // Check for forced jumps
    //   const jumps = getValidJumps(G, row, col);
    //   if (jumps.length > 0) {
    //     G.selectedPiece = { row, col };
    //   } else {
    //     G.currentPlayer = (G.currentPlayer + 1) % 2;
    //     G.selectedPiece = null;
    //     events.endTurn();
    //   }
    //   G.emptyCells = null;
    //   return G;
    // },
    movePiece: ({ G, events }, row, col) => {
      // Ensure that a piece is selected and the move is legal
      if (
        G.selectedPiece === null ||
        !isLegalMove(G, G.selectedPiece.row, G.selectedPiece.col, row, col)
      ) {
        console.log('not');
        return G;
      }

      // Move the piece
      G.board[row][col] = G.board[G.selectedPiece.row][G.selectedPiece.col];

      // Handle forced moves
      if (G.forcedMove) {
        // Calculate the row and column indices of the in-between cell
        const inBetweenRow = Math.floor((G.selectedPiece.row + row) / 2);
        const inBetweenCol = Math.floor((G.selectedPiece.col + col) / 2);

        // Make the in-between cell null
        G.board[inBetweenRow][inBetweenCol] = null;

        // Check for forced jumps
        const jumps = getValidJumps(G, row, col);
        if (jumps.length > 0) {
          G.selectedPiece = { row, col };
          G.emptyCells = null;
          return G;
        }
      }

      // Clear the selected piece's original position
      G.board[G.selectedPiece.row][G.selectedPiece.col] = null;

      // Check for jumps
      // const jumps = getValidJumps(G, row, col);
      // if (jumps.length > 0) {
      //   G.selectedPiece = { row, col };
      //   G.emptyCells = null;
      //   return G;
      // }

      // End the turn
      G.currentPlayer = (G.currentPlayer + 1) % 2;
      G.selectedPiece = null;
      G.emptyCells = null;
      G.forcedMove = false;
      events.endTurn();

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

// import './board.css';

// interface BoardProps {
//   G: any;
//   ctx: any;
//   moves: any;
//   isActive?: boolean;
//   isMultiplayer?: boolean;
// }

// function Board(props: BoardProps) {
//   const { G, ctx, moves, isActive } = props;

//   function onClick(event: React.MouseEvent<HTMLTableCellElement> | undefined): void {
//     if (event) {
//       const target = event.currentTarget;
//       if (isActive && isActiveFunc(Number(target.getAttribute('data-id')))) {
//         moves.clickCell(target.getAttribute('data-id'));
//       }
//     }
//   }

//   function isActiveFunc(id: number) {
//     if (!isActive) return false;
//     if (G.cells[id] !== null) return false;
//     return true;
//   }

//   const tbody = [];
//   for (let i = 0; i < 8; i++) {
//     const cells = [];
//     for (let j = 0; j < 8; j++) {
//       const id = 8 * i + j;
//       let coloredCell = '';
//       if (i % 2 === 0) {
//         coloredCell = id % 2 === 0 && j % 2 === 0 ? 'rgb(253 230 138)' : 'rgb(180 83 9)';
//       } else {
//         coloredCell = id % 2 === 0 && j % 2 === 0 ? 'rgb(180 83 9)' : 'rgb(253 230 138)';
//       }
//       cells.push(
//         // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
//         <td
//           data-id={id}
//           key={id}
//           className={`${isActiveFunc(id) ? 'active' : ''}`}
//           style={{ backgroundColor: coloredCell }}
//           onClick={onClick}
//         >
//           {G.cells[id]}
//         </td>,
//       );
//     }
//     tbody.push(<tr key={i}>{cells}</tr>);
//   }

//   let winner = null;
//   if (ctx.gameover) {
//     winner =
//       ctx.gameover.winner !== undefined ? (
//         <div id="winner">Winner: {ctx.gameover.winner}</div>
//       ) : (
//         <div id="winner">Draw!</div>
//       );
//   }

//   return (
//     <div>
//       <table id="board">
//         <tbody>{tbody}</tbody>
//       </table>
//       {winner}
//     </div>
//   );
// }

// export default Board;

// import './board.css';

import { faCrown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { BoardProps } from 'boardgame.io/react';

import { GameState } from '../Game/Game';
import { getPieceInfo } from '../utils/game/getPieceInfo';
import { getPieceSelected } from '../utils/game/getPieceSelected';
import { getPossibleMoves } from '../utils/game/getPossibleMoves';
import { getSquareColor } from '../utils/game/getSquareColor';

export const Board = (props: BoardProps<GameState>) => {
  const { G, moves, playerID, isActive } = props;

  const handleClick = (row: number, col: number) => {
    if (!isActive) {
      return;
    }
    if (
      (G.currentPlayer === 0 && G.board[row][col] !== 'W') ||
      (G.currentPlayer === 1 && G.board[row][col] !== 'B') ||
      G.board[row][col] === null
    ) {
      return;
    }
    if (G.board[row][col] === null || G.currentPlayer !== Number(playerID)) {
      return;
    }

    moves.selectPiece(row, col);
  };

  const onMovePiece = (row: number, col: number) => {
    if (!isActive) return;
    // if (
    //   (G.currentPlayer === 0 && G.board[row][col] !== 'W') ||
    //   (G.currentPlayer === 1 && G.board[row][col] !== 'B') ||
    //   G.board[row][col] === null
    // ) {
    //   return;
    // }
    // if (G.board[row][col] === null || G.currentPlayer !== Number(playerID)) {
    //   return;
    // }
    moves.movePiece(row, col);
  };

  return (
    <div className="flex flex-col border border-black">
      {G.board.map((row, rowIndex) => {
        return (
          <div key={rowIndex} className="flex">
            {row.map((piece, colIndex) => {
              const possibleMoves = getPossibleMoves(rowIndex, colIndex, G);
              return (
                // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                <div
                  key={colIndex}
                  className={`flex justify-center items-center w-12 h-12 ${getSquareColor(
                    rowIndex,
                    colIndex,
                  )}`}
                >
                  {piece && (
                    <button
                      className={`flex justify-center items-center w-4/6 h-4/6 rounded-full ${getPieceInfo(
                        piece,
                        rowIndex,
                        colIndex,
                        G,
                      )} ${getPieceSelected(rowIndex, colIndex, G)} ${getPossibleMoves(
                        rowIndex,
                        colIndex,
                        G,
                      )}`}
                      onClick={() => handleClick(rowIndex, colIndex)}
                    >
                      {(piece === 'WK' || piece === 'BK') && (
                        <FontAwesomeIcon icon={faCrown} color="gray" />
                      )}
                    </button>
                  )}
                  {possibleMoves === 'selectedCell' && (
                    <button
                      className="flex justify-center items-center w-4/6 h-4/6 rounded-full bg-inherit border-4 border-yellow-100 blur-[1px]"
                      onClick={() => onMovePiece(rowIndex, colIndex)}
                    ></button>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

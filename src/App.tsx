// import './App.css';
import { MCTSBot } from 'boardgame.io/ai';
import { Local } from 'boardgame.io/multiplayer';
import { Client } from 'boardgame.io/react';

import { Board } from './components/CheckerTable';
import { Dama } from './Game/Game';

const TicTacToeClient = Client({
  game: Dama,
  board: Board,
  debug: false,
  // multiplayer: Local({
  //   bots: {
  //     1: MCTSBot,
  //   },
  // }),
  multiplayer: Local(),
});

function App() {
  return (
    <div className="flex flex-row justify-center items-center min-w-screen min-h-screen">
      <TicTacToeClient playerID="0" />
      <TicTacToeClient playerID="1" />
    </div>
  );
}

export default App;

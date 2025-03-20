import { Cell } from './components/Cell';
import { useOnlineHasamiShogi } from './hooks/useOnlineHasamiShogi';
import { RoomManager } from './components/RoomManager';
import { GameRoomProvider } from './contexts/GameRoomContext';

function GameContent() {
  const {
    board,
    selectedCell,
    currentPlayer,
    winner,
    error,
    handleCellClick,
    resetGame,
    getPlayerName,
    isMyTurn,
    room,
  } = useOnlineHasamiShogi();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-4 sm:mb-8 text-gray-800 font-japanese">
        はさみ将棋
      </h1>
      
      <RoomManager />
      
      <div className="text-center mb-4 sm:mb-8 p-3 sm:p-4 bg-white rounded-lg shadow-md">
        {winner ? (
          <div className="space-y-3 sm:space-y-4">
            <div className="text-xl sm:text-2xl font-bold text-gray-800">
              {getPlayerName(winner)}（{winner}）の勝利！
            </div>
            <button
              onClick={resetGame}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg
                transition duration-200 ease-in-out transform hover:scale-105 shadow-lg text-sm sm:text-base"
            >
              もう一度プレイ
            </button>
          </div>
        ) : (
          <div className="text-lg sm:text-xl text-gray-700">
            現在の手番: <span className="font-bold">{getPlayerName(currentPlayer)}（{currentPlayer}）</span>
          </div>
        )}
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="text-center mb-4 p-2 bg-red-100 text-red-700 rounded-lg">
          {error.message}
        </div>
      )}

      <div className="flex justify-center">
        <div className="bg-white p-2 sm:p-6 rounded-xl shadow-lg w-full sm:w-auto">
          <div className="grid grid-cols-9 gap-px bg-gray-200">
            {board.map((row, i) =>
              row.map((piece, j) => (
                <Cell
                  key={`${i}-${j}`}
                  piece={piece}
                  onClick={() => handleCellClick(i, j)}
                  isSelected={selectedCell ? selectedCell[0] === i && selectedCell[1] === j : false}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <GameRoomProvider>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 sm:p-8">
        <GameContent />
      </div>
    </GameRoomProvider>
  );
}

export default App;
